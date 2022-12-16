const mongoose = require('mongoose')

const productSchema = mongoose.Schema({

    pname: {
        type: String,

    },
    price: {
        type: Number
    },
    image: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    manufacturer: {
        type: String,
    },
    pdescription: {
        type: String,
    },
    sdescription: {
        type: String,
    },
    information: {
        type: String,
    },
    color: {
        type: String,
    },
    isVerified: {
        type: Number,
    },
    category:{
        type: String,
    }

});

module.exports = mongoose.model('Product', productSchema);