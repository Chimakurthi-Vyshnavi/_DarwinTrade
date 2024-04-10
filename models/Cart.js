const mongoose = require('mongoose');

const EmployeeCartSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee_Details',
        required: true,
        unique:true
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product_Details',required: true},
        name: { type: String, required: true},
        price: { type: Number, required: true},
        imageUrl: { type: String, required: true},
        quantity: { type: Number, required: true}
    }]
}, { collection: 'Employee_Cart' });

module.exports = mongoose.model('Employee_Cart', EmployeeCartSchema);;

