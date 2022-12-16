const Product = ('../models/productModel')
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    image: {
        type: String,
        //required:true     
    },
    address: {
        type: String,
        //required:true     
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        required: true
    },
    isVerified: {
        type: Number,
        default: 0
    },
    coupon:[{
        type:String
    }],
    addressl1:{
        type:String
    },
    addressl2:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    country:{
        type:String
    },
    zip:{
        type:Number
    },
    otp:{
        type:Number
    }
});


module.exports = mongoose.model('User', userSchema);