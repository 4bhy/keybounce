const express = require('express')
const adminController = require('../controllers/adminController')
const adminRoute = express()
const config = require('../config/config')
const session = require('express-session')
adminRoute.use(session({ secret: config.sessionSecret }))


adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin')
adminRoute.use('/', express.static('public'))

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }))


adminRoute.get('/', adminController.landingPage)



adminRoute.post('/login', adminController.adminLogin)

adminRoute.get('/login', adminController.loadLogin)

adminRoute.get('/logout', adminController.loadLogout)

adminRoute.get('/manageProduct', adminController.manageProduct)

adminRoute.get('/manageUser', adminController.manageUser)

adminRoute.get('/block-user', adminController.blockUser)

adminRoute.post('/manageProduct', adminController.upload, adminController.postProduct)

adminRoute.get('/viewProducts', adminController.viewProducts)

adminRoute.get('/editProduct', adminController.editProduct)

adminRoute.post('/editProduct', adminController.upload, adminController.posteditProduct)

adminRoute.get('/deleteProduct', adminController.deleteProduct)

adminRoute.post('/addcategory', adminController.addCategory)

adminRoute.get('/managecategory', adminController.manageCategory)

adminRoute.get('/managecarousel', adminController.getCarousel)

adminRoute.post('/managecarousel',adminController.upload, adminController.addCarousel)

adminRoute.post('/delcategory', adminController.deleteCategory)

adminRoute.get('/ordermanager', adminController.orderManager)

adminRoute.post('/confirm-order', adminController.confirmOrder)

adminRoute.post('/delete-order', adminController.deleteOrder)

adminRoute.post('/deliver-order', adminController.deliverOrder)

adminRoute.get('/cat-sel', adminController.orderManager)

adminRoute.get('/manage-coupon', adminController.manageCoupon)

adminRoute.get('/add-coupon', adminController.addCoupons)

adminRoute.post('/add-coupon', adminController.addCoupon)



module.exports = adminRoute
