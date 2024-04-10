const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { Schema } = mongoose

const VendorSchema = new Schema ({
    vendorId: {type: Number, required: true, unique: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    dob: {type: String, required: true},
    email: {type: String, required: true, unique: true, validate:[isEmail]},
    phone: {type: String, required: true, unique: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zip: {type: String, required: true},
    country: {type: String, required: true},
    personalIdentificationNumber: {type: String, required: true},
    frequency: String,
    delay: Number,
    thumbnail: {type: String, required: true},
    vendorAgreement: {
        commissionPercent: Number,
        accountStatus: String,
        recurringCommission: String
    }
}, {collection: "Vendor_Details"});

module.exports = mongoose.model('Vendor_Details',VendorSchema)