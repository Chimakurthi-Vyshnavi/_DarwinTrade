const Employee = require('../models/Employee')
const Vendor = require('../models/Vendor')
const Order = require('../models/Order')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
const { uploadToS3 } = require('../miiddleware/multerConfig');

require('dotenv').config()

const handleErrors = (error) => {
    if (error.message === 'incorrect vendorId') return 'Vendor Not Found'
    if (error.name === 'MongoError' ) return 'File Already Exists'
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') return 'Network Error'
    if (error.name === 'ValidationError') return 'Vendor Validation Failed'
    console.log(error.message)
    return error.message
}

module.exports.getAdmin = async (req, res) => {
    res.render('admin')
}

module.exports.postAddVendor = async (req, res) => {
    try {
        await mongoose.connect(process.env.mongoURI,{
            useNewUrlParser: true,
            // useCreateIndex: true,
            useUnifiedTopology: true
            // useFindAndModify: true
        })
        const password = otpGenerator.generate(8, { digits: true, alphabets: true, upperCase: true, specialChars: false });
        const salt = await bcrypt.genSalt(10)
        let secPassword = await bcrypt.hash(password, salt)
        console.log(password)
        const vendors = await Vendor.find({}).sort({ vendorId: -1 })
        const vendorId = vendors[0].vendorId + 1
        const vendor = await Vendor.create({
            email: req.body.email, password: secPassword, address: req.body.address, city: req.body.city,
            state: req.body.state, dob: req.body.dob, country: req.body.country, zip: req.body.zip, dob: req.body.dob,
            personalIdentificationNumber: req.body.pin, firstName: req.body.firstName, lastName: req.body.lastName,
            frequency: req.body.frequency, delay: req.body.delay, phone: req.body.phone, thumbnail: '/img/icon/user.png',
            vendorAgreement: { commissionPercent: req.body.commission, accountStatus: 'ACTIVE', recurringCommission: req.body.recurringCommission },
            vendorId
        })
        console.log('Admin created new vendor: ',vendor)
        res.status(200).json({ vendor: vendor._id , password})

    } catch (error) {
        const err = handleErrors(error)
        console.log(err)

        res.status(400).json({error: err})
    }
}

module.exports.postVendorMail = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.body.vendor)
        if (vendor) {
            const mailOptions = {
                from: process.env.ID,
                to: vendor.email,
                subject: 'Vendor Account Credentials',
                html: `
                    <p>Dear ${vendor.firstName} ${vendor.lastName},</p>
                    <p>Your vendor account has been created successfully.</p>
                    <p>Here are your login credentials:</p>
                    <p>Email: ${vendor.email}</p>
                    <p>Password: ${req.body.password}</p>
                    <p>You can use the above credentials to log in to your account and change your password.</p>
                    <p>Thank you!</p>
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
                if (error) {
                    res.status(400).json({error: error.message})
                } else {
                    console.log('Sent mail to new Vendor')
                    res.status(200).json({ message: 'Vendor Added Successfully' });
                }
            });
        }
        else throw new Error('incorrect vendorId')
       
    } catch (error) {
        const err = handleErrors(error)
        res.status(400).json({error: err})
    }
}

module.exports.getRemoveVendor = async (req, res) => {
    try {
        const vendors = await Vendor.find()
        res.render('removeVendor', { vendors })
    } catch (error) {
        const err = handleErrors(error)
        res.status(400).json({error: err})
    }
}

module.exports.getAdminStats = async(req, res)=>{
    try {
        const stats = await Order.aggregate([
            { '$unwind': { 'path': '$items' } }, 
            { '$lookup': { 'from': 'Product_Details', 'localField': 'items.productId', 'foreignField': '_id', 'as': 'product' }}, 
            { '$unwind': { 'path': '$product' } }, 
            { '$lookup': { 'from': 'Product_Main_Categories', 'localField': 'product.mainCategory', 'foreignField': '_id', 'as': 'mainCategory' }},
            { '$unwind': { 'path': '$mainCategory' }}, 
            { '$group': { '_id': { 'mainCategory': '$mainCategory.mainCategory', 'categories': '$product.category'}, 'quantity': { '$sum': '$items.quantity'}}},
            { '$group': { '_id': '$_id.mainCategory', 'categories': { '$push': { 'category': '$_id.categories', 'quantity': '$quantity'}},
              'quantity': { '$sum': '$quantity' }}}
          ])
        console.log(`Stats:`,stats)
        res.render('adminStats', { stats: JSON.stringify(stats) })
    } catch (error) {
        const err = handleErrors(error)
        res.status(400).json({error: err})
    }
}

module.exports.getAdminAccount = async (req, res) => {
    res.render('adminAccount')
}

module.exports.postAdminAccount = async (req, res) => {
    try {
        const id = req.user.id
        
            var updated_data = { 
                address: { street: req.body.address, city: req.body.city, zip: req.body.zip, state: req.body.state },
                phones: {type: "office", number: req.body.Office},
            }
    
        if(req.files.thumbnail) {
        
            const thumbnail = req.files.thumbnail[0];
            const thumbnailUrl = await uploadToS3(thumbnail);
            updated_data['thumbnail'] = thumbnailUrl
        }
        const admin = await Employee.findByIdAndUpdate(id, updated_data)
        console.log(id, ' has updated his profile', admin)
        res.status(200).json({ message: 'Account Updated Successfully' })
    } catch (error) {
        const err = handleErrors(error)
        res.status(400).json({error: err})
    }
}
module.exports.postVendorDetails = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ vendorId: req.body.vendor })
        res.status(200).json(vendor)
    } catch (error) {
        const err = handleErrors(error)
        res.status(400).json({error: err})
    }
}

module.exports.postRemoveVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ vendorId: req.body.vendor })
        if (vendor) {
            const mailOptions = {
                from: process.env.ID,
                to: vendor.email,
                subject: 'Vendor Account Deleted',
                html: ` <p>Dear ${vendor.firstName} ${vendor.lastName},</p>
                <p>Your vendor account with DarwinTrade has been deleted.</p>
                <p>If you have any questions or concerns, please contact us at <a href="contactdarwintrade@gmail.com">contactdarwintrade@gmail.com</a>.</p>
                <p>Thank you for your cooperation.</p>
                <p>Sincerely,<br>DarwinTrade</p>
                `
            };
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.ID,
                    pass: process.env.PASSWORD,
                },
            });
            await Vendor.deleteOne({ vendorId: req.body.vendor })
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log(error)
                    res.status(400).json({error: error.message})
                } else {
                    console.log('Vendor Deleted and Mail Sent')
                    res.status(200).json({ message: 'Vendor Removed Successfully' });
                }
            });
        }
        else throw new Error('incorrect vendorId')

    } catch (error) {
        const err = handleErrors(error)
        res.status(400).json({error: err})
    }
}