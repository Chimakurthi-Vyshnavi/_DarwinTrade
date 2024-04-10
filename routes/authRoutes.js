const { Router } = require('express')
const authController = require('../controllers/authControllers')
const { requireAuth } = require('../miiddleware/authMiddleware')
const router = Router()

router.get('/login', authController.getLogin)
router.post('/login', authController.postLogin)
router.get('/logout', requireAuth, authController.getLogout)
router.post('/logout', authController.postLogout)
router.get('/forgotpassword', authController.getForgotPassword)
router.post('/forgotpassword', authController.postForgotPassword)
router.get('/verify', authController.getVerifyOTP)
router.post('/verify', authController.postVerifyOTP)

module.exports = router