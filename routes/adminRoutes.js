const { Router } = require('express')
const adminControllers = require('../controllers/adminControllers')
const { requireAuth, checkEmployee } = require('../miiddleware/authMiddleware')
const { mulUpload} = require('../miiddleware/multerConfig');
var router = Router()


router.get('/admin', requireAuth, checkEmployee, adminControllers.getAdmin)
router.post('/addVendor', requireAuth, adminControllers.postAddVendor)
router.post('/vendorMail', requireAuth, adminControllers.postVendorMail)
router.get('/adminAccount', requireAuth, checkEmployee, adminControllers.getAdminAccount)
router.post('/adminAccount', requireAuth, mulUpload, adminControllers.postAdminAccount)
router.get('/removeVendor', requireAuth, checkEmployee, adminControllers.getRemoveVendor)
router.post('/getVendor', requireAuth, adminControllers.postVendorDetails)
router.post('/deleteVendor', requireAuth, adminControllers.postRemoveVendor)
router.get('/adminStats', requireAuth, checkEmployee, adminControllers.getAdminStats)

module.exports = router