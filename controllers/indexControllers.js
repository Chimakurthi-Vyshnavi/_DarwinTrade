const ProductSchema = require('../models/Product')   

module.exports.getLogin= async(req, res) => {
    await res.redirect('/login')
}

module.exports.getHome = async(req, res) => {
    const newArrivals = await ProductSchema.dummyProduct.find().sort({ publishedAt: -1 }).limit(4)
    const hotsales = await ProductSchema.dummyProduct.find().sort({ rating: -1 }).limit(4)
    res.render("home", {newArrivals, hotsales}) 
}

module.exports.getAbout = async(req, res) => {
    res.render('about')
}

module.exports.getContact = async(req, res) => {
    res.render('contact')
}

module.exports.getVendor = async(req, res) => {
    const categories = await ProductSchema.dummyProductCategories.find()
    res.render('vendor', {categories})
}

module.exports.getPageNotFound = async(req, res) => {
    res.render('pageNotFound')
}