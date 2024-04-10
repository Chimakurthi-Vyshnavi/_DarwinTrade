const mongoose = require('mongoose');
const { Schema } = mongoose

const ProductSchema3 = new Schema ({
   id : {type: Number, required: true, unique: true},
   title: {type: String, required: true},
   description: {type: String, required: true},
   price: {type: Number, required: true},
   discountedPercentage: {type: Number},
   rating: {type: Number},
   stock: {type: Number, required: true},
   brand: {type: String, required: true},
   category: {type: String, required: true},
   thumbnail: {type: String, required: true},
   images: [{type: String, required: true}],
   publishedAt: {type: Date, default: Date.now()},
   productDescription: {type:String, required:true},
   vendorID: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor_Details', required: true},
   minStock : {type: Number, required: true},
   note: {type:String},
   mainCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'Product_Main_Categories', required: true},
}, {collection: 'Product_Details'})

const ProductCategoriesSchema = new Schema({
    category: {type: String, required: true, unique:true},
 }, {collection: 'Product_Categories'})

const ProductMainCategoriesSchema = new Schema({
    mainCategory: {type: String, required: true, unique:true},
    categories: [{type: String, required: true}]
}, {collection: 'Product_Main_Categories'})

const ProductTagSchema = new Schema({
    tag: {type: String, required: true, unique: true},
    categories: [{type: String, required: true}]
}, {collection:'Product_Tags'})
 

module.exports.dummyProduct = mongoose.model('Product_Details', ProductSchema3)
module.exports.dummyProductCategories = mongoose.model('Product_Categories', ProductCategoriesSchema)
module.exports.dummyProductTags = mongoose.model('Product_Tags', ProductTagSchema)
module.exports.dummyProductMainCategories = mongoose.model('Product_Main_Categories', ProductMainCategoriesSchema)
