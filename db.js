const mongoose = require('mongoose');
const { dummyProduct } = require('./models/Product');
const Vendor = require('./models/Vendor')
const nodemailer = require('nodemailer');
require('dotenv').config();

const mongoDB = async () => {
    try{
         await mongoose.connect(process.env.mongoURI
        ,{
             useNewUrlParser: true,
            // useCreateIndex: true,
            useUnifiedTopology: true
            // useFindAndModify: true
        }
        )
        console.log("connected")
        const stream = await dummyProduct.watch();
        stream.on('change', async (change) => {
            if (change.operationType === 'update') {
                const updatedProduct = await dummyProduct.findById(change.documentKey._id)
                const minStock = updatedProduct.minStock
                if (updatedProduct.stock <= minStock) {
                    const vendor = await Vendor.findById(updatedProduct.vendorID)
                    const mailOptions = {
                        from: process.env.ID,
                        to: vendor.email,
                        subject: 'Minimum Stock Reached',
                        html: `
                            <p>Dear ${vendor.firstName} ${vendor.lastName},</p>
                            <p>Your vendor account has been created successfully.</p>
                            <p>This is to inform you that the stock of a product "${updatedProduct.title}" has reached its minimum threshold.</p>
                            <p>Please take necessary action to replenish the stock.</p>
                            <p>Thank you!</p>
                            <p>DarwinTrade</p>
                        `
                    };
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.ID,
                            pass: process.env.PASSWORD,
                        },
                    });
                    transporter.sendMail(mailOptions, async (error, info) => {
                        console.log(info)
                        if (error) console.error(error.message);
                        else console.log(`Minimum Stock Reached Mail sent to ${vendor.firstName} for the product ${updatedProduct.title}`)
                    });
                }
            }
        });  
    }
    catch(err){
        console.log(err)
    }}

module.exports = mongoDB