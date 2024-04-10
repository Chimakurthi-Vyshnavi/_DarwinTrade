const ProductSchema = require('../models/Product')
const Wishlist = require('../models/Wishlist')
const Vendor = require('../models/Vendor')
const mongoose = require('mongoose')

module.exports.getShop = async (req, res) => {
  try {
    const mainCategories = await ProductSchema.dummyProductMainCategories.find()
    const brands = await ProductSchema.dummyProduct.aggregate([
      { $group: { _id: '$brand', categories: { $addToSet: '$category' } } }
    ])
    const tags = await ProductSchema.dummyProductTags.find()
    res.render('shop', { mainCategories, brands, tags })
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' })
  }}

module.exports.getProducts = async (req, res) => {
  try {
    if (req.params.option != 0) { var products = await ProductSchema.dummyProduct.find().sort({ price: parseInt(req.params.option) }) }
    else { var products = await ProductSchema.dummyProduct.find().sort({ publishedAt: -1 }) }
    res.status(200).json(products)
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' })
  }
}

module.exports.getBrandProducts = async (req, res) => {
  try {
    if (req.params.option != 0) {
      var brand_products = await ProductSchema.dummyProduct.find({ brand: req.params.brand_name })
        .sort({ price: parseInt(req.params.option) })
    }
    else { var brand_products = await ProductSchema.dummyProduct.find({ brand: req.params.brand_name }).sort({ publishedAt: -1 }) }
    res.status(200).json(brand_products)
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' })
  }
}

module.exports.getCategoryProducts = async (req, res) => {
  try {
    if (req.params.option != 0) {
      var category_products = await ProductSchema.dummyProduct.find({ category: req.params.category_name })
        .sort({ price: parseInt(req.params.option) })
    }
    else { var category_products = await ProductSchema.dummyProduct.find({ category: req.params.category_name }).sort({ publishedAt: -1 }) }
    res.status(200).json(category_products)
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' })
  }
}

module.exports.getCategoryBrandProducts = async (req, res) => {
  try {
    if (req.params.option != 0) {
      var category_brand_products = await ProductSchema.dummyProduct
        .find({ category: req.params.category_name, brand: req.params.brand_name })
        .sort({ price: parseInt(req.params.option) })
    }
    else {
      var category_brand_products = await ProductSchema.dummyProduct.find({ category: req.params.category_name, brand: req.params.brand_name })
        .sort({ publishedAt: -1 })
    }
    res.status(200).json(category_brand_products)

  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' })
  }
}

module.exports.getTagProducts = async (req, res) => {
  try {
    const [{ categories }] = await ProductSchema.dummyProductTags.aggregate([
      { $match: { tag: req.params.tag_name } },
      { $project: { categories: 1, _id: 0 } }])
    if (req.params.option != 0) {
      var tag_products = await ProductSchema.dummyProduct.find({ category: { $in: categories } })
        .sort({ price: parseInt(req.params.option) })
    }
    else { var tag_products = await ProductSchema.dummyProduct.find({ category: { $in: categories } }).sort({ publishedAt: -1 }) }
    res.status(200).json(tag_products)
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' })
  }
}

module.exports.getProductDetails = async (req, res) => {
  try {
    const product = await ProductSchema.dummyProduct.find({ id: req.params.id })
    if (!product) throw new Error('Product Not Found')
    res.render('product', { product })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}


module.exports.postSearch = async (req, res) => {
  try {
    const id = req.user.id
    const vendor = await Vendor.findById(id)
    const agg = [{
      $search: {
        "compound": {
          "should": [
            { "autocomplete": { "query": req.body.search, "path": "title", "score": { "boost": { "value": 2 } } } },
            { "autocomplete": { "query": req.body.search, "path": "brand" } }
          ],
          "minimumShouldMatch": 1
        }
      }
    }]
    if(vendor) agg.push({$match: {vendorID:  new mongoose.Types.ObjectId(vendor._id)}})
    const search_products = await ProductSchema.dummyProduct.aggregate(agg)
    console.log(`Searched for ${req.body.search}. The results: ${search_products.length}`)
    res.status(200).json(search_products)
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' })  }
}

module.exports.getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ employeeId: req.user.id });
    res.render('wishlist', { wishlistItems });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports.checkProductInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ employeeId: req.user.id });
    if (!wishlist) return res.status(200).json({ exists: false });
    const exists = wishlist.items.some(item => item.productId.toString() === productId);
    res.status(200).json({ exists });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: 'Internal Server Error' });
  }
};

module.exports.postWishlistAdd = async (req, res) => {
  const { productId, name, price, imageUrl } = req.body;
  const employeeId = req.user.id;
  try {
    let wishlist = await Wishlist.findOne({ employeeId });
    if (!wishlist) wishlist = new Wishlist({ employeeId, items: [] });
    const existingItem = wishlist.items.find(item => item.productId.toString() === productId);
    if (existingItem) return res.status(400).json({ message: 'Product already exists in the wishlist' });
    wishlist.items.push({ productId, name, price, imageUrl });
    await wishlist.save();
    console.log(employeeId, 'updated wishlist', wishlist)
    res.status(200).json({ success:true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message: 'Failed to add product to wishlist' });
  }
};

module.exports.postWishlistRemove = async (req, res) => {
  const { productId } = req.body;
  const employeeId = req.user.id;
  try {
    const wishlist = await Wishlist.findOne({ employeeId });
    if (!wishlist) return res.status(400).json({ message: 'Wishlist not found' });
    const indexToRemove = wishlist.items.findIndex(item => item.productId.toString() === productId);
    if (indexToRemove === -1) return res.status(400).json({ message: 'Product not found in the wishlist' });
    wishlist.items.splice(indexToRemove, 1);
    await wishlist.save();
    console.log(employeeId, 'updated wishlist', wishlist)
    return res.status(200).json({ success:true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success:false, message: 'Failed to remove product from wishlist' });
  }
};