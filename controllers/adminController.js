const express = require('express')
const users = require('../models/userModel')
const Product = require('../models/productModel')
const adminRoute = express()
const path = require('path')
const bcrypt = require('bcrypt')
const multer = require('multer')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')

const config = require('../config/config')
const session = require('express-session')
adminRoute.use(session({ secret: config.sessionSecret }))
const { query } = require('express')
const { ordersuccesful } = require('./userController')
const { log } = require('console')

adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin')
adminRoute.use('/', express.static('public'))

const storage = multer.diskStorage({
    destination: './public/productImages',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage
}).single('image');;

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }))

let isLoggedin
isLoggedin = false

const landingPage = async (req, res) => {
    try {
        console.log("22");
        if (isLoggedin) {
            const categoryData = await Category.find()
            let categoryNames = [];
            let categoryCount = [];
            for (let key of categoryData) {
                categoryNames.push(key.categories);
                categoryCount.push('0');
            }
            let orderHistory = [];
            orderDetail = await Order.find()
            for (let key of orderDetail) {
                let populatedDetails = await key.populate('product.productId')
                orderHistory.push(populatedDetails)
            }
            for (let i = 0; i < orderDetail.length; i++) {
                for (let j = 0; j < orderDetail[i].product.length; j++) {
                    let fetchedCategory = orderDetail[i].product[j].productId.category;
                    let isExisting = categoryNames.findIndex(category => {
                        return category === fetchedCategory;
                    })
                    categoryCount[isExisting]++
                }
            }
            console.log(typeof (categoryNames));
            console.log(typeof (categoryCount));
            res.render('adminPanel', { isLoggedin, name: categoryNames, count: categoryCount })
        } else {
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = (req, res) => {
    res.render('adminLogin')
}

const adminLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await users.findOne({ email: email });
    if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
            if (userData.isAdmin === 0) {
                res.render('adminLogin', { message: "Please verify your mail" });
            } else {
                req.session.user_id = userData._id;
                isLoggedin = true;
                res.redirect('/admin/')
            }
        } else {
            res.render('adminLogin', { message: "Login Failed" });
        }
    } else {
        res.render('adminLogin', { message: "Login Failed" })
    }
}

const loadLogout = (req, res) => {
    isLoggedin = false
    res.redirect('/admin/')
}

const manageProduct = (req, res) => {
    res.render('manageProduct')
}

const manageUser = async (req, res) => {
    if (isLoggedin) {
        const userData = await users.find({ isAdmin: 0 })
        console.log(userData[0]._id);
        res.render('manageUser', { users: userData })
    }
    else {
        res.redirect('/')
    }
}

const blockUser = async (req, res) => {
    const id = req.query.id
    console.log(id);
    const userData = await users.findById({ _id: id })
    if (userData.isVerified) {
        await users.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } })
    }
    else {
        await users.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } })
    }
    res.redirect('/admin/manageUser')
}

const postProduct = async (req, res) => {
    try {
        const product = Product({
            pname: req.body.pname,
            price: req.body.price,
            description: req.body.description,
            quantity: req.body.quantity,
            type: req.body.type,
            manufacturer: req.body.manufacturer,
            color: req.body.color,
            pdescription: req.body.pdescription,
            sdescription: req.body.sdescription,
            information: req.body.information,
            image: req.file.filename
        })
        console.log(product)
        const productData = await product.save()
        if (productData) {
            res.render('manageProduct', { message: "Your registration was successfull." })
        } else {
            res.render('manageProduct', { message: "Your registration was a failure" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const viewProducts = async (req, res) => {
    var search = '';
    if (req.query.search) {
        search = req.query.search;
    }

    var page = 1;
    if (req.query.page) {
        page = req.query.page;
    }

    const limit = 20;

    productpass = await Product.find({
        $or: [
            { pname: { $regex: '.*' + search + '.*', $options: 'i' } },
            { type: { $regex: '.*' + search + '.*', $options: 'i' } },
            { manufacturer: { $regex: '.*' + search + '.*', $options: 'i' } },

        ]
    }).limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await Product.find({
        $or: [
            { pname: { $regex: '.*' + search + '.*', $options: 'i' } },
            { type: { $regex: '.*' + search + '.*', $options: 'i' } },
            { manufacturer: { $regex: '.*' + search + '.*', $options: 'i' } },

        ]
    }).countDocuments();


    res.render('viewProducts', {
        product: productpass,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    })
}

const editProduct = async (req, res) => {
    const id = req.query.id;
    const productdata = await Product.findById({ _id: id });
    if (productdata) {
        res.render('editProduct', { product: productdata })
    }
}

const posteditProduct = async (req, res) => {
    console.log(req.body);
    const editedproduct = await Product.findByIdAndUpdate({ _id: req.body.id }, { $set: { pname: req.body.pname, price: req.body.price, pdescription: req.body.pdesdescription, sdescription: req.body.sdescription, information: req.body.information, manufacturer: req.body.manufacturer, type: req.body.type, color: req.body.color, quantity: req.body.quantity, image: req.file.filename } })
    res.redirect('/admin/viewProducts')
}

const deleteProduct = async (req, res) => {
    const id = req.query.id;
    console.log(req.body.id);
    const deletedProduct = await Product.deleteOne({ _id: id })
    res.redirect('/admin/viewProducts')
}

const addCategory = async (req, res) => {
    console.log(req.body.category);
    const category = new Category({
        categories: req.body.category
    })
    const saved = await category.save()
    if (saved) {
        res.redirect('/admin/managecategory')
    }

}


const manageCategory = async (req, res) => {
    const categories = await Category.find()
    res.render('manageCategory', { category: categories })
}

const deleteCategory = async (req, res) => {
    await Category.findByIdAndDelete({ _id: req.query.id })
    res.redirect('/admin/managecategory')
}

const orderManager = async (req, res) => {

    try {
        const qstatus = req.query.id
        const Orders = await Order.find()
        console.log(Orders);
        res.render('orderManager', { orders: Orders, orderStatus: qstatus })
    } catch (error) {
        console.error(message);
    }


}

const confirmOrder = async (req, res) => {
    const id = req.query.id
    const orderData = await Order.findById({ _id: id })
    console.log(orderData.status);
    orderData.status = "confirmed"
    await orderData.save();
    res.redirect('/admin/ordermanager')
}

const deliverOrder = async (req, res) => {
    const id = req.query.id
    const orderData = await Order.findById({ _id: id })
    console.log(orderData.status);
    orderData.status = "delivered"
    await orderData.save();
    res.redirect('/admin/ordermanager')
}

const deleteOrder = async (req, res) => {

    await Order.findByIdAndDelete({ _id: req.query.id })
    res.redirect('/admin/ordermanager')

}


const manageCoupon = async (req, res) => {
    const couponData = await Coupon.find()
    console.log(couponData);
    res.render('manageCoupons', { coupon: couponData })
}

const addCoupons = (req, res) => {
    res.render('addCoupons')
}

const addCoupon = async (req, res) => {
    try {
        const coupon = new Coupon({
            coupon: req.body.coupon,
            discount: req.body.discount
        });
        const added = await coupon.save();
        if (added) {
            res.redirect('/admin/manage-coupon')
        }
    } catch (error) {
        console.log(error.message);
    }


}

const getCarousel = (req, res) => {
    res.render('manageCarousel')
}

const addCarousel = async (req, res) => {
    try {
        const carousel = Carousel({
            pname: req.body.pname,
            price: req.body.price,
            description: req.body.description,
            quantity: req.body.quantity,
            type: req.body.type,
            manufacturer: req.body.manufacturer,
            color: req.body.color,
            pdescription: req.body.pdescription,
            sdescription: req.body.sdescription,
            information: req.body.information,
            image: req.file.filename
        })
        console.log(product)
        const carouselData = await carousel.save()
        if (carouselData) {
            res.render('manageProduct', { message: "Your registration was successfull." })
        } else {
            res.render('manageProduct', { message: "Your registration was a failure" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    landingPage,
    adminLogin,
    manageProduct,
    manageUser,
    blockUser,
    postProduct,
    upload,
    viewProducts,
    loadLogout,
    editProduct,
    posteditProduct,
    deleteProduct,
    addCategory,
    manageCategory,
    deleteCategory,
    orderManager,
    confirmOrder,
    deliverOrder,
    deleteOrder,
    manageCoupon,
    addCoupon,
    addCoupons,
    getCarousel,
    addCarousel

}