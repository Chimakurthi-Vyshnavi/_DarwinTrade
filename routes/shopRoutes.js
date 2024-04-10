const { Router } = require('express')
const shopControllers = require('../controllers/shopControllers')
const { requireAuth, checkEmployee } = require('../miiddleware/authMiddleware')
const router = Router()

router.get('/shop', requireAuth, checkEmployee, shopControllers.getShop)
router.get("/products/sort/:option", requireAuth, checkEmployee, shopControllers.getProducts)
router.get("/products/brand/:brand_name/sort/:option", requireAuth, checkEmployee, shopControllers.getBrandProducts)
router.get("/products/category/:category_name/sort/:option", requireAuth, checkEmployee, shopControllers.getCategoryProducts)
router.get("/products/category/:category_name/brand/:brand_name/sort/:option", requireAuth, checkEmployee, shopControllers.getCategoryBrandProducts)
router.get("/products/tag/:tag_name/sort/:option", requireAuth, checkEmployee, shopControllers.getTagProducts)
router.get("/products/:id", requireAuth, checkEmployee, shopControllers.getProductDetails)
router.post("/search", requireAuth, checkEmployee, shopControllers.postSearch)
router.get("/wishlist", requireAuth, checkEmployee, shopControllers.getWishlist)
router.get('/wishlist/check/:productId', requireAuth, shopControllers.checkProductInWishlist);
router.post("/wishlistadd", requireAuth, shopControllers.postWishlistAdd)
router.post("/wishlistremove", requireAuth, shopControllers.postWishlistRemove)

module.exports = router