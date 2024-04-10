const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
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
        imageUrl: { type: String, required: true}
        
    }]
}, {collection: "Wishlist"});

module.exports = mongoose.model('Wishlist', WishlistSchema);