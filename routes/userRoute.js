const express = require('express')
const userController = require('../controllers/userController')
const userRoute = express()


userRoute.get('/', userController.loadIndex)

userRoute.get('/shop', userController.loadShop)

userRoute.get('/detail', userController.loadDetail)

userRoute.get('/register', userController.isLoggedout, userController.loadRegister)

userRoute.get('/login', userController.isLoggedout, userController.loadLogin)

userRoute.post('/login', userController.postLogin)

userRoute.post('/register', userController.postRegister)

userRoute.get('/home', userController.loadHome)

userRoute.get('/logout',userController.isLoggedin2, userController.userLogout)

userRoute.get('/contact', userController.loadContact)

userRoute.get('/cart', userController.loadCart)

userRoute.get('/addtoCart',userController.isLoggedin2 ,userController.addToCart)//midleware

userRoute.get('/viewDetails', userController.viewDetails)

userRoute.post('/deleteCart', userController.deleteCart)

userRoute.post('/updateQuantity', userController.updateQuantity)

userRoute.post('/checkout', userController.checkout)

userRoute.post('/orderplaced', userController.checkoutFinal)

userRoute.get('/ordersuccessful', userController.ordersuccesful) //camelcase

userRoute.get('/paypal', userController.paypal)

userRoute.get('/dashboard',userController.isLoggedin2, userController.dashboard)

userRoute.post('/orderdetails', userController.orderDetails)

userRoute.post('/otp-validation', userController.otpValidation)

userRoute.get('/sel-categories', userController.selCategories)

userRoute.get('/wishlist', userController.loadWishlist)

userRoute.get('/checkout-address', userController.checkout)

userRoute.get('/add-wishlist',userController.isLoggedin2, userController.addToWishlist)

userRoute.post('/delete-wishlist', userController.deleteWishlist)

userRoute.post('/move-to-cart', userController.moveToCart)

userRoute.post('/apply-coupon', userController.applyCoupon)

userRoute.post('/add-address', userController.addAddress)

userRoute.post('/export-to-pdf', userController.exportToPdf)


module.exports = userRoute