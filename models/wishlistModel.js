const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema({
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
    }
    
});

module.exports = mongoose.model('Wishlist', wishlistSchema); 