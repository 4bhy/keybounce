const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    product:[{
        productId: {
            type: mongoose.Types.ObjectId,
            ref: 'Product'
        },
        price:{ 
            type:Number
        },
        quantity: {
            type: Number,
            
        }
    }],
    totalprice:{
        type:Number
    },
    coupon:[{
        type:String
    }]
    
});

module.exports = mongoose.model('Cart', cartSchema); 