const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({

    name: {
        type: String
    },
    offer:{
        type:Number
    },
    usedBy:[{
      type:mongoose.Types.ObjectId,
      ref:'User'
    }],
    used:{
        type:Number,
        default:0
    }


})

module.exports= mongoose.model('Coupon', couponSchema)