const mongoose = require('mongoose');
const { isEmail } = require('validator');
const {Schema} = mongoose

const EmployeeSchema = new Schema ({
    employeeID: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {
        first: {type: String, required: true},
        last: {type: String, required: true}
    },
    ssn: {type: String, required: true},
    dob: {type: String, required: true},
    hiredOn: {type: String, required: true},
    terminatedOn: String,
    email: {type: String, required: true, unique: true, validate:[isEmail]},
    phones: [{
        type: {
            type: String,
            required: true
        },
        number: {
            type: String,
            required: true
        }
    }],
    address: {
        street: {type: String, required: true},
        city: {type: String, required: true},
        state: {type: String, required: true},
        zip: {type: String, required: true},
    },  
    roles: [{type: String, required: true}],
    department: {type: String, required: true},
    gender: {type: String, required: true},
    portrait: String,
    thumbnail: {type: String, required: true},
    points: {type: String, required: true}
}, {collection: "Employee_Details"});

module.exports = mongoose.model('Employee_Details',EmployeeSchema)