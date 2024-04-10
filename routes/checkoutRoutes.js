const { Router } = require('express')
const checkoutControllers = require('../controllers/checkoutControllers')
const { requireAuth, checkEmployee } = require('../miiddleware/authMiddleware')
const router = Router()

router.get('/checkout', requireAuth,checkEmployee , checkoutControllers.getCheckout)
router.get('/cartProducts', requireAuth, checkEmployee ,checkoutControllers.getCartItems)
router.post('/mail', requireAuth, checkoutControllers.postMail)
router.post('/check', requireAuth, checkoutControllers.postCheck)
router.get('/orders', requireAuth, checkEmployee ,checkoutControllers.getOrders)

module.exports = router