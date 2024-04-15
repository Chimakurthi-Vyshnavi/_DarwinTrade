const Vendor = require('../models/Vendor')
const ProductSchema = require('../models/Product')
const Order = require('../models/Order')
const mongoose = require('mongoose')
const { MongoNetworkError, MongoServerSelectionError } = require('mongodb')
require('dotenv').config();
const { uploadToS3 } = require('../miiddleware/multerConfig');
const bcrypt = require('bcryptjs')

const handleErrors = (error) => {
  console.log(error)
  if (error.message === 'incorrect productId') return 'Product Not Found'
  if (error.message === 'incorrect vendorId') return 'Vendor Not Found'
  if (error.name === 'MongoError' && (error.code === 11000 || error.code === 11001) ) return 'File Already Exists'
  if (error instanceof MongoNetworkError || error instanceof MongoServerSelectionError) return 'Network Error'
  if (error.name === 'ValidationError') return 'Product Validation Failed'
  return error.message
}

module.exports.getProducts = async(req, res)=>{
  try {
    const vendorID = req.user.id
    const products = await ProductSchema.dummyProduct.find({vendorID})
    res.render("productAnalytics", {products})
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}


module.exports.postAddProduct = async(req, res)=>{
  try {
    const vendorID = req.user.id
  
    if(req.files.thumbnail) {
      const thumbnailFile = req.files['thumbnail'][0];
    const imageFiles = req.files['images'];
    const thumbnailUrl = await uploadToS3(thumbnailFile);

    const imageUrls = await Promise.all(imageFiles.map(async (file) => {
      return await uploadToS3(file);
    }))
   
      const date = new Date()
      const count = await ProductSchema.dummyProduct.countDocuments({})
      const mainCategory = await ProductSchema.dummyProductMainCategories.findOne({categories: {$in: req.body.category}})
      console.log(req.body.title)
      const product = await ProductSchema.dummyProduct.create({
          title: req.body.title.trim(), description: req.body.shortdescription.trim(), price: req.body.price.trim(), stock: req.body.stock.trim(), 
          productDescription: req.body.productDescription.trim(), note: req.body.note.trim(), images: imageUrls, thumbnail: thumbnailUrl, vendorID, 
          id: count+1, category:req.body.category, mainCategory: mainCategory._id, brand: req.body.brand.trim(), publishedAt: date.toISOString(), rating:3,
          minStock: req.body.minStock.trim()
        })
     
      
      console.log(`${vendorID} has added the product: ${product}`)  
      res.status(200).json({ success: true })
    } 
    else throw new Error('Images cannot be empty.')
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
} 

module.exports.getEditProduct = async(req, res)=>{
  try {
    const vendorID = req.user.id
    const products = await ProductSchema.dummyProduct.find({vendorID: vendorID})
    const categories = await ProductSchema.dummyProductCategories.find()
    res.render('editProduct', { products, categories }) 
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err}); 
  }
}

module.exports.getProductDetails = async(req, res)=>{
  try {
    const product = await ProductSchema.dummyProduct.find({id: req.params.id})
    if (!product) throw new Error('incorrect productId')
    res.status(200).json(product)
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}

module.exports.postEditProduct = async(req, res)=>{
  try {
    const vendorID = req.user.id
    var updated_data = { shortdescription: req.body.shortdescription.trim(), productDescription: req.body.productDescription.trim(), 
                          note: req.body.note.trim(), stock: req.body.stock, minStock: req.body.minStock }
    if (req.files.thumbnail) {
      const thumbnail = req.files.thumbnail[0];
      const thumbnailUrl = await uploadToS3(thumbnail);
      console.log(thumbnailUrl)
      updated_data['thumbnail'] = thumbnailUrl
    }
    if (req.files.images) {
      const images = req.files.images
      const imageUrls = await Promise.all(images.map(async (file) => {
          return await uploadToS3(file);
      }))
      console.log(imageUrls)
      updated_data['images'] = imageUrls
    }
    const product = await ProductSchema.dummyProduct.findByIdAndUpdate(req.params.id, updated_data)
    if(!product) throw new Error('incorrect productId')
    console.log(`${vendorID} has changed the product details: ${product}`)
    res.status(200).json({ success: true })
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}

module.exports.getOrderDetails = async(req, res)=>{
  try {
    const product = await ProductSchema.dummyProduct.findOne({id:req.params.id})
    if(!product) throw new Error('incorrect productId')
    const orders = await Order.aggregate([
      {$unwind: "$items"},
      {$match: {"items.productId":product._id}},
      {$group: {_id: {$dateToString: {format: "%Y-%m-%d", date: "$placedAt"}}, quantity: {$sum: "$items.quantity"}}}
      // {$project: {placedAt:1, quantity:"$items.quantity", _id:0}}
    ])
    console.log('Order Analytics:',orders)
    res.status(200).json({orders})
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}

module.exports.getAnalytics = async(req, res)=>{
  try {
    const product = await ProductSchema.dummyProduct.findOne({id:req.params.id})
    if (!product) throw new Error('incorrect productId')
    res.render('viewAnalytics', {id: req.params.id, product})
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}

module.exports.getStats = async(req, res)=>{
  try {
    const vendor = req.user.id
    const stats = await Order.aggregate([
      { '$unwind': { 'path': '$items' } }, 
      { '$lookup': { 'from': 'Product_Details', 'localField': 'items.productId', 'foreignField': '_id', 'as': 'product' }}, 
      { '$unwind': { 'path': '$product' } }, 
      { '$match': { 'product.vendorID': new mongoose.Types.ObjectId(vendor) }},
      { '$lookup': { 'from': 'Product_Main_Categories', 'localField': 'product.mainCategory', 'foreignField': '_id', 'as': 'mainCategory' }},
      { '$unwind': { 'path': '$mainCategory' }}, 
      { '$group': { '_id': '$mainCategory.mainCategory', 'quantity': { '$sum': '$items.quantity' }}}
    ])
    console.log(`Stats for ${vendor}`,stats)
    res.render('statistics', {stats: JSON.stringify(stats)})
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}

module.exports.getAccount = async(req, res)=>{
  try {
    const vendorId = req.user.id
    const vendor = await Vendor.findOne({_id: vendorId})
    if(!vendor) throw new Error('incorrect vendorId')
    res.render('account', {vendor})
    
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}


module.exports.getVendorCP = async (req, res) => {
  res.render('vendorCP');
}

module.exports.postVendorCP = async (req, res) => {

  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;
    const vendor = await Vendor.findOne({ email : email});
    if (!vendor) {
      throw new Error('incorrect vendorId');
    }
    const isPasswordMatch = await bcrypt.compare(currentPassword, vendor.password);
    if (!isPasswordMatch) {
      throw new Error('incorrect current password');
    }
    if (newPassword !== confirmPassword) {
      throw new Error("passwords don't match")
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await Vendor.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } });

    console.log(`Password has been updated for ${email}`);
    res.status(200).json({ success: true });
} catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message || 'Failed to change password' });
}
}


module.exports.postProfile = async(req, res)=>{
  try {
    const vendorID = req.user.id
      var updated_data = {  address: req.body.address, state: req.body.state,
                              zip: req.body.zip, phone: req.body.phone, country: req.body.country}
      if(req.files.thumbnail) {
        const thumbnail = req.files.thumbnail[0];
        const thumbnailUrl = await uploadToS3(thumbnail);
        updated_data['thumbnail'] = thumbnailUrl
    }
    const vendor = await Vendor.findByIdAndUpdate(vendorID, updated_data)
    if(!vendor) throw new Error('incorrect vendorId')
    console.log(vendorID,' has updated his profile',vendor)
    res.status(200).json({ success: true })
  } catch (error) {
    const err = handleErrors(error)
    res.status(400).json({ error: err }); 
  }
}