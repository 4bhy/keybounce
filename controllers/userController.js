const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel')
const { findByIdAndDelete, find, findOneAndDelete } = require('../models/userModel'); 
const fast2sms = require('fast-two-sms')
const Category = require('../models/categoryModel')
const Wishlist = require('../models/wishlistModel')
const Coupon = require('../models/couponModel')
const Address = require('../models/addressModel')

const ejs=require('ejs')
const pdf=require('html-pdf')
const fs=require('fs')
const path = require('path')


var userSession;
let randomOTP, USERID

let coupon = {
    name:'none',
    offer:0,
    usedBy:false,
    used:0
}
let couponTotal=0;


const isLoggedin2 = (req, res, next) => {
    if (req.session.userEmail) {
        next()
    }
    else {
        res.redirect('/login')
    }

}

const isLoggedout = (req, res, next) => {
    if (req.session.userEmail) {
        res.redirect('/')
    }
    else {
        next()
    }
}
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const loadIndex = async (req, res) => {
    userSession=req.session;
    if(req.session.coupon){

    }else{
        console.log(coupon);
        req.session.coupon = coupon;
        req.session.couponTotal = couponTotal;
    }
    if (req.query.search) {
       const search = req.query.search;
     

        const productpass = await Product.find({
            $or: [
                { pname: { $regex: '.*' + req.query.search + '.*', $options: 'i' } },
               
            ]
        })

        res.render('index', { product: productpass, isLoggedin:req.session.userEmail })
    }else {
       const productpass = await Product.find()
        res.render('index', { product: productpass, isLoggedin:req.session.userEmail })
    }

}

const loadShop = async (req, res) => {
    const productData = await Product.find()
    const categories = await Category.find()
 
    res.render('shop', { product: productData, isLoggedin:req.session.userEmail, category: categories })

}

const loadDetail = (req, res) => {

    res.render('detail', { isLoggedin:req.session.userEmail })
}

const loadRegister = async (req, res) => {
    res.render('registration', {message:''})
}

const loadLogin = (req, res) => {
    res.render('newerlogin')
}



const postLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await users.findOne({ email: email });
    if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
            if (userData.isVerified === 0) {
                res.render('newerlogin', { message: "Please verify your mail" });
            } else {
                req.session.userID = userData._id
                // userSession = req.session
                req.session.userEmail = userData.email
                res.redirect('/');
            }
        } else {
            res.render('newerlogin', { message: "Login Failed" });
        }
    } else {
        res.render('newerlogin', { message: "Login Failed" })
    }
}


const postRegister = async (req, res) => {
    try {
        const checkEmail = await users.findOne({ email: req.body.email })

        if (checkEmail != null) {
            res.render('registration', { message: "THIS EMAIL ALREADY EXISTS!!" })
        } else {

            if (req.body.password === req.body.cpassword) {
                const password = req.body.password;
                const passwordHash = await bcrypt.hash(password, 10);
                const user = new users({
                    fname: req.body.fname,
                    lname: req.body.lname,
                    email: req.body.email,
                    mobile: req.body.mno,
                    password: passwordHash,
                    isAdmin: 0
                });
                const userData = await user.save();
                USERID = userData._id
                if (userData) {
                    const otp = sendMessage(req.body.mno)
                    res.render('otp')
                }
                else {
                    res.render('registration', { message: "REGISTRATION FAILED" })
                }
            } else {
                res.render('registration', { message: "PASSWORD DOES'NT MATCH" })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const otpValidation = async (req, res) => {
    try {
        userSession = req.session;
        const otp = req.body.otp;
        if (otp == randomOTP) {
            const validatedUser = await users.findById({ _id: USERID })
            validatedUser.isVerified = 1
            const test = await validatedUser.save();
            if (test) {
              
                res.redirect('/login')
            } else {
                res.render('otp', { message: "Incorrect OTP" })
            }
        }
    } catch (error) {
        console.log(error.message);
    }

}

const sendMessage = function (mobile, res) {
    randomOTP = Math.floor(Math.random() * 10000)
    var options = {
        authorization: 'MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq',
        message: `Your OTP verification code is ${randomOTP}`,
        numbers: [mobile]
    }

    fast2sms.sendMessage(options)
        .then((response) => {
            console.log("OTP sent succcessfully")
        }).catch((error) => {
            console.log(error)
        })
    return randomOTP;
}


const loadHome = (req, res) => {
    res.redirect('/')
}

const userLogout = (req, res) => {
    try {
        req.session.userEmail = ''
        req.session.userID =
            res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }

}


const addToCart = async (req, res) => {
    
    userSession = req.session;
    const p_id = req.query.id;

    const isExisting = await Cart.findOne({ userId: req.session.userID })
    const productData = await Product.findById({ _id: p_id })
    if (isExisting != null) {
        const smProduct = await Cart.findOne({ userId: req.session.userID, 'product.productId': p_id })
        if (smProduct != null) {
            const incCart = await Cart.updateOne({ userId:  req.session.userID, 'product.productId': p_id },
                { $inc: { 'product.$.quantity': 1 } })
            // res.redirect('/')
            res.json({ status: true });
        } else {
            const updateCart = await Cart.updateMany({ userId:  req.session.userID },
                { $push: { product: { "productId": p_id, "quantity": 1, "price": productData.price } } })
            // res.redirect('/')
            res.json({ status: true });
        }

    } else {
        const cart = new Cart({
            userId:  req.session.userID,
            product: [
                {
                    productId: p_id,
                    price: productData.price,
                    quantity: 1
                }
            ],
            totalprice: 0

        })
        const cartData = await cart.save();
        // res.redirect('/')
        res.json({ status: true });

    }

}
    



const deleteCart = async (req, res) => {
    const foundId = req.query.id;
    const userCart = await Cart.findOne({ userId:  req.session.userID })
    const isExisting = await userCart.product.findIndex(ObjInItems => ObjInItems._id == foundId)
  
    userCart.product.splice(isExisting, 1)
    await userCart.save()
    res.redirect('/cart')

}

const viewDetails = async (req, res) => {
    const productId = req.query.id;
    const productData = await Product.findById({ _id: productId })
    const productList = await Product.find()
    const categories = await Category.find()
    res.render('detail', { product: productData, isLoggedin:req.session.userEmail, productCarousel: productList, category:categories })
}

const loadCart = async (req, res) => {
    userSession = req.session;
    const cartFetch = await Cart.findOne({ userId: req.session.userID }).populate('product.productId')
    const categories = await Category.find()

    if (cartFetch) {
        const productData = await Cart.findOne({ userId: req.session.userID }).populate('product.productId')
        const totalPrice = productData.product.reduce((acc, curr) => {
            return acc + (curr.productId.price * curr.quantity)
        }, 0)
        productData.totalprice = totalPrice
        await productData.save()
        
        if (req.session.couponTotal < productData.totalprice && req.session.couponTotal != 0 && req.session.coupon.used == 1) {
            req.session.coupon.used = 0;
            res.render('cart', { isLoggedin:req.session.userEmail, cart: cartFetch.product, totalPrice: req.session.couponTotal, category: categories })
        } else if (req.session.couponTotal == 0) {


            req.session.couponTotal = productData.totalprice;


            res.render('cart', { isLoggedin:req.session.userEmail, cart: cartFetch.product, totalPrice: req.session.couponTotal, category: categories })
        } else {


            req.session.couponTotal = productData.totalprice;

            res.render('cart', { cart: cartFetch.product, totalPrice: req.session.couponTotal, isLoggedin:req.session.userEmail, category: categories })

        }


    } else {
        res.render('cart', { cart: '', totalPrice: '', isLoggedin:req.session.userEmail, category: categories })
    }

}


const updateQuantity = async (req, res) => {
    userSession = req.session
    const p_id = req.query.id;
    const productData = await Cart.findOne({ userId: req.session.userID}).populate('product.productId')
    const index = await productData.product.findIndex(cartItems => cartItems._id == p_id)
    productData.product[index].quantity = req.body.qty
    await productData.save()

    res.redirect('/cart')

}

//try catch //env
const checkout = async (req, res) => {

    const cartData = await Cart.findOne({ userId: req.session.userID }).populate('product.productId')
    const forTotal = await Cart.findOne({ userId: req.session.userID })
    const userData = await users.findOne({ _id: req.session.userID })
    const address = await Address.find({ userId: req.session.userID })
    const categories = await Category.find()

    if (req.query.id) {

        const selAddress = await Address.findById({ _id: req.query.id })

        res.render('checkout', { cart: cartData.product, totalPrice: req.session.couponTotal, isLoggedin: req.session.userEmail, user: userData, category: categories, address: address, saddress: selAddress })
    } else {

        res.render('checkout', { cart: cartData.product, totalPrice: req.session.couponTotal, isLoggedin: req.session.userEmail, user: userData, category: categories, address: address, saddress: '' })
    }

}


const checkoutFinal = async (req, res) => {
    userSession = req.session
    const cartData = await Cart.findOne({ userId: req.session.userID })
    const orders = new Order({
        userId:  req.session.userID,
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        mno: req.body.mno,
        addressl1: req.body.addressl1,
        addressl2: req.body.addressl2,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        payment: req.body.payment,
        product: cartData.product,
        totalprice: req.session.couponTotal

    })
    await orders.save()
    const userCoupon= await Coupon.updateOne({name:req.session.coupon.name}, {$push:{usedBy:req.session.userID}})

    if (req.body.payment == 'cod') {
        await Order.findOneAndUpdate({ userId: req.session.userID }, { status: 'build' })
        const orderData = await Order.findOne({ userId:  req.session.userID }).populate('product.productId')
        const forTotal = await Order.findOne({ userId:  req.session.userID })
        res.redirect('/ordersuccessful')
    
    } else if (req.body.payment == 'paypal') {
        res.redirect('/paypal')

    }
}

const paypal = async (req, res) => {
    const orderData = await Order.findOne({ userId:  req.session.userID })
    res.render('paypal', { total: req.session.couponTotal })
}

const ordersuccesful = async (req, res) => {
    await Order.findOneAndUpdate({ userId:  req.session.userID }, { status: 'build' })
    const orderData = await Order.findOne({ userId: req.session.userID }).populate('product.productId')
    const forTotal = await Order.findOne({ userId:  req.session.userID }) //helpers for data fetch
    const categories = await Category.find()
    await Cart.findOneAndDelete({ userId: req.session.userID})

    res.render('orderPlaced', { cart: orderData.product, totalprice:req.session.couponTotal, isLoggedin:req.session.userEmail, category:categories })
}

const dashboard = async (req, res) => {
    userSession = req.session;
    const userData = await users.findOne({ _id:  req.session.userID })
    const usersData = await users.findOne({ _id:  req.session.userID })
    const address=await Address.findOne({userId:req.session.userID})
    const orderData = await Order.find({ userId:  req.session.userID })
    console.log(address);
    if(address!=null){

        res.render('dashboard', { orders: orderData, users: usersData, user: userData, saddress:address })
        console.log("44");
    }else {
        res.render('dashboard', { orders: orderData, users: usersData, user: userData, saddress:null })
    }
  
}

const orderDetails = async (req, res) => {
    const id = req.query.id
    const orderData = await Order.findById({ _id: id }).populate('product.productId')
    const forTotal = await Order.findById({ _id: id }) //helpers for data fetch
    res.render('orderDetails', { cart: orderData.product, totalprice: forTotal })
}

const addCategory = async (req, res) => {
    const category = new Category({
        categories: req.body.category
    })
    const saved = await category.save()
    if (saved) {
        res.render('admin/manageProduct')
    }

}

const selCategories = async (req, res) => {
    const productData = await Product.find({ category: req.query.id })
    const categories = await Category.find()
    res.render('shop', { product: productData, isLoggedin:req.session.userEmail, category: categories })
}

const loadContact= async(req,res)=>{
    const categories = await Category.find()
    res.render('contact', {isLoggedin:req.session.userEmail,category: categories })
}

const addToWishlist = async (req, res) => {
  

   
    userSession = req.session;
    const p_id = req.query.id;

    const isExisting = await Wishlist.findOne({ userId:  req.session.userID })
    const productData = await Product.findById({ _id: p_id })
    if (isExisting != null) {
      
        const smProduct = await Wishlist.findOne({ userId: req.session.userID, 'product.productId': p_id })
     
        if (smProduct != null) {
         
            const incCart = await Wishlist.updateOne({ userId:  req.session.userID, 'product.productId': p_id },
                { $inc: { 'product.$.quantity': 1 } })
            // res.redirect('/')
            res.json({ status: true });
        } else {
           
            const updateCart = await Wishlist.updateMany({ userId:  req.session.userID },
                { $push: { product: { "productId": p_id, "quantity": 1, "price": productData.price } } })
            // res.redirect('/')
            res.json({ status: true });
        }

    } else {
        const wishlist = new Wishlist({
            userId: req.session.userID,
            product: [
                {
                    productId: p_id,
                    price: productData.price,
                    quantity: 1
                }
            ],
            totalprice: 0

        })
        const wishlistData = await wishlist.save();
        // res.redirect('/')
        res.json({ status: true });

    }

}

const loadWishlist = async (req, res) => {
    userSession = req.session;
    const categories = await Category.find()
    const userList = await Wishlist.findOne({ userId:  req.session.userID }).populate('product.productId')
    try {
        if (userList) {
            res.render('wishlist', { list: userList.product, isLoggedin:req.session.userEmail, category:categories })
        } else {
            res.render('wishlist', {list: '', isLoggedin:req.session.userEmail, category:'' })
        }
    } catch (error) {
        console.log(error.message);
    }


}

const moveToCart = async (req, res) => {
    try {
        userSession = req.session;
        const p_id = req.query.id;

        const isExisting = await Cart.findOne({ userId:  req.session.userID })
        const productData = await Product.findById({ _id: p_id })
        if (isExisting != null) {
           
            const smProduct = await Cart.findOne({ userId:  req.session.userID, 'product.productId': p_id })
       
            if (smProduct != null) {
             
                const incCart = await Cart.updateOne({ userId:  req.session.userID, 'product.productId': p_id },
                    { $inc: { 'product.$.quantity': 1 } })
                if (incCart != null) {
                    const foundId = req.query.id;
                   
                    const userList = await Wishlist.findOne({ userId:  req.session.userID })
                    const isExisting = await userList.product.findIndex(ObjInItems => ObjInItems.productId == foundId)

                    userList.product.splice(isExisting, 1)
                    const did = await userList.save()
                    if (did) {
                        res.redirect('/wishlist')
                    }

                }

            } else {
               
                const updateCart = await Cart.updateMany({ userId:  req.session.userID },
                    { $push: { product: { "productId": p_id, "quantity": 1, "price": productData.price } } })
                if (updateCart != null) {
                    const foundId = req.query.id;
                    const userList = await Wishlist.findOne({ userId:  req.session.userID })
                    const isExisting = await userList.product.findIndex(ObjInItems => ObjInItems._id == foundId)
                   
                    userList.product.splice(isExisting, 1)
                    const did = await userList.save()
                    if (did) {
                        res.redirect('/wishlist')
                    }

                }
            }

        } else {
            const cart = new Cart({
                userId:  req.session.userID,
                product: [
                    {
                        productId: p_id,
                        price: productData.price,
                        quantity: 1
                    }
                ],
                totalprice: 0

            })
            const cartData = await cart.save();
            if (cartData != null) {
                const foundId = req.query.id;
                const userList = await Wishlist.findOne({ userId:  req.session.userID })
                const isExisting = await userList.product.findIndex(ObjInItems => ObjInItems._id == foundId)
              
                userList.product.splice(isExisting, 1)
                const did = await userList.save()
                if (did) {
                    res.redirect('/wishlist')
                }

            }

        }
    } catch (error) {
        console.log(error.message);
    }

}

const deleteWishlist= async(req,res)=>{
   
    const foundId = req.query.id;
    const userList = await Wishlist.findOne({ userId: req.session.userID })
    const isExisting = await userList.product.findIndex(ObjInItems => ObjInItems._id == foundId)
   
    userList.product.splice(isExisting, 1)
    await userList.save()
    res.redirect('/wishlist')
}

const applyCoupon = async(req,res)=>{
    try {
        userSession=req.session;

       
        couponApplied = req.body.coupon;

        if(req.session.userID){
            userData = await users.findById({_id:req.session.userID});
            offerData = await Coupon.findOne({coupon:couponApplied});
            
            if(offerData){
                if(offerData.usedBy != req.session.userID){

                  
                    req.session.coupon.offer = offerData.offer; 
                  
                    req.session.coupon.name = offerData.name;

                    req.session.coupon.used = 1;
                    fetchCart = await Cart.findOne({userId:req.session.userID});
                    const updatedPrice = fetchCart.totalprice-((fetchCart.totalprice*req.session.coupon.offer)/100);
                    req.session.couponTotal = updatedPrice;
                   
                    res.redirect('/cart')
                }else{
                    req.session.coupon.usedBy = true;
                    res.redirect('/cart');
                }
            }else{
                res.redirect('/cart')
            }
        }else{
            res.redirect('/cart')
        }
    } catch (error) {
        console.log(error.message);
    }

}

const addAddress = async (req, res) => {
    const address= new Address({
        userId:req.session.userID,
        address:req.body.address,
        town:req.body.town,
        city:req.body.city,
        state:req.body.state,
        country:req.body.country,
        zip:req.body.zip
    })
    const saved = await address.save()
    if (saved) {
        res.redirect('/dashboard')
    }
}



const exportToPdf = async (req, res) => {
    try {
        const id = req.query.id;
        const orderData = await Order.findById({ _id: id }).populate('product.productId')
        const forTotal = await Order.findById({ _id: id }) //helpers for data fetch

        const data = {
            cart: orderData.product,
            totalprice: forTotal
        }

        const filePathName = path.resolve(__dirname, '../views/users/orderDetailsPDF.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        let option = {
            format: 'Letter'
        }
        const ejsData = ejs.render(htmlString, data);
        pdf.create(ejsData, option).toFile('order-details.pdf', (err, response) => {
            if (err) {
                console.log(err);
            }
            console.log('file-generated');
            res.redirect('/dashboard')

        });

    } catch (error) {
        console.log(error.message);

    }
}

const selectAddress= async(req,res)=>{
    const selAddress= await Address.findById({_id:req.query.id})
    const cartData = await Cart.findOne({ userId:  req.session.userID }).populate('product.productId')
    const forTotal = await Cart.findOne({ userId:  req.session.userID })
    const userData = await users.findOne({ _id: req.session.userID })
    const address=await Address.find({userId:req.session.userID})
    const categories = await Category.find()
    res.render('checkout-add', { cart: cartData.product, totalPrice: req.session.couponTotal, isLoggedin:req.session.userEmail, user: userData, category:categories, address:address, selAddress:selAddress })
  
}

module.exports = {
    securePassword,
    securePassword,
    securePassword,
    loadIndex,
    loadShop,
    loadDetail,
    loadRegister,
    postLogin,
    postRegister,
    loadHome,
    userLogout,
    loadLogin,
    viewDetails,
    addToCart,
    isLoggedout,
    isLoggedin2,
    loadCart,
    deleteCart,
    updateQuantity,
    checkout,
    checkoutFinal,
    paypal,
    ordersuccesful,
    dashboard,
    orderDetails,
    otpValidation,
    addCategory,
    selCategories,
    loadWishlist,
    addToWishlist,
    moveToCart,
    applyCoupon,
    addAddress,
    exportToPdf,
    loadContact,
    deleteWishlist,
    selectAddress
   

}





