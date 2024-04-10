const Employee = require('../models/Employee')
const EmployeeCart = require('../models/Cart')
const ProductSchema = require('../models/Product')
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
require('dotenv').config();

const calculateSubtotal = (cartItems) => {
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.quantity * item.price;
    });
    return subtotal;
};

module.exports.getCheckout = async (req, res) => {
    try {
        const employeeId = req.user.id;
        let employeeCart = await EmployeeCart.findOne({ employeeId })
        if(employeeCart) employeeCart = await employeeCart.populate('items.productId');
        res.render('checkout', { cartItems: employeeCart ? employeeCart.items : [], calculateSubtotal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports.getCartItems = async (req, res) => {
    try {
        const employeeId = req.user.id;
        let employeeCart = await EmployeeCart.findOne({ employeeId })
        if (employeeCart) employeeCart = await employeeCart.populate('items.productId');
        res.status(200).json({ cartItems: employeeCart ? employeeCart.items : [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.postCheck = async (req, res) => {
    try {
        const employeeId = req.user.id;
        let cartItems = await EmployeeCart.findOne({ employeeId })
        if (cartItems) cartItems =  await cartItems.populate('items.productId');
        if (!cartItems || cartItems.items.length === 0) {
           
            return res.status(400).json({ error: 'Cart is empty.' });
        }

        const stockStatus = [];

        for (const cartItem of cartItems.items) {
            const productId = cartItem.productId._id;
            const productName = cartItem.productId.title;
            const productStock = cartItem.productId.stock;
            const cartQuantity = cartItem.quantity;

            if (productStock < cartQuantity) {
                stockStatus.push({
                    productId: productId,
                    productName: cartItem.productId.title,
                    stock: productStock,
                    cartQuantity: cartQuantity,
                    status: 'insufficient'
                });
            } else {
                stockStatus.push({
                    productId: productId,
                    productName: cartItem.productId.title,
                    stock: productStock,
                    cartQuantity: cartQuantity,
                    status: 'sufficient'
                });
            }
        }

        res.status(200).json({ stockStatus });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.postMail = async (req, res) => {
    try {
        const { firstName, lastName, streetAddress, city, state, country, postcode, phone, email, cartItems } = req.body;
        const parsedCartItems = JSON.parse(cartItems);
        const employeeId = req.user.id;
        const employee = await Employee.findOne({ _id: employeeId });
        if (!employee) throw new Error('Employee not found');
        const employeeTotalPoints = employee.points;
        let employeeCart = await EmployeeCart.findOne({ employeeId })
        if (employeeCart) employeeCart = await employeeCart.populate('items.productId');
        const total = calculateSubtotal(employeeCart ? employeeCart.items : []);
        if (total > employeeTotalPoints)
            return res.status(400).json({ error: 'Insufficient points', pointsAvailable: employeeTotalPoints });
        else if (!parsedCartItems || parsedCartItems.length === 0)
            return res.status(400).json({ error: 'Cart is empty. Please add items to your cart before placing an order.' });
        else {
            const mailOptions = {
                from: process.env.ID,
                to: email,
                subject: 'Order Confirmation',
                html: `
                <p>Dear ${firstName} ${lastName},</p>
                <p>Thank you for placing your order with us. Your order details are as follows:</p>
                <ul>
                    ${parsedCartItems.map(item => `<li>${item.name} (${item.quantity}) - ${item.quantity * item.price} points</li>`).join('')}
                </ul>
                <p>Total Points: ${calculateSubtotal(parsedCartItems)} points</p>
                <p>Your order will be delivered to the following address:</p>
                <p>${streetAddress}, ${city}, ${state}, ${country}, ${postcode}</p>
                <p>If you have any questions or concerns, feel free to contact us.</p>
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
            employee.points -= total
            await employee.save();
            await Promise.all([
                deleteItemsFromCart(employeeId),
                reduceProductQuantity(parsedCartItems)
            ]);
            await orderHistory(employeeId, parsedCartItems);
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    res.status(400).json({ success: false, error: error.message });
                } else {
                    res.status(200).json({ success: true, message: 'Order confirmation email sent successfully' });
                }
            });
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, error: error.message});
    }
};


async function deleteItemsFromCart(employeeId) {
    try {
        await EmployeeCart.findOneAndDelete({ employeeId });
    } catch (error) {
        throw new Error('Error deleting items from cart: ' + error.message);
    }
}

async function reduceProductQuantity(cartItems) {
    try {
        for (const item of cartItems) {
            const product = await ProductSchema.dummyProduct.findOne({ _id: item.productId });
            if (product) {
                product.quantity -= item.quantity;
                await product.save();
            }
        }
    } catch (error) {
        throw new Error('Error reducing product quantity: ' + error.message);
    }
}

async function orderHistory(employeeId, cartItems) {
    try {
        const orders = cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity
        }));
        await Order.create({
            employeeId: employeeId,
            items: orders,
            placedAt: Date.now() 
        });
    } catch (error) {
        throw new Error('Error adding order to employee: ' + error.message);
    }
}

module.exports.getOrders = async (req, res) => {
    try {
          const employeeId = req.user.id;
          const orders = await Order.find({ employeeId: employeeId });
        res.render('orders', { orders: orders });
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
};
