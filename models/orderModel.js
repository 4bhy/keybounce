const mongoose= require('mongoose')

const orderSchema= mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    fname:{
        type:String
    },
    lname:{
        type:String
    },
    email:{
        type:String
    },
    mno:{
        type:String
    },
    payment:{
        type:String
    },
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
    status:{
        type:String,
        deafult:'pending'
    },
    createdAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
    },
    product:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:'Product'
        },
        price:{
            type:Number
        },
        quantity:{
            type:Number,
        }
    }],
    totalprice:{
        type:Number
    }
})

module.exports= mongoose.model('Order', orderSchema);