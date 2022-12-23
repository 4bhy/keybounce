const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    fname: {
        type: String,
   
    },
    lname: {
        type: String,
    },
    userId:{
        type:mongoose.Types.ObjectId
    },
    address:{
        type:String
    },
    town:{
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
    }

});


module.exports = mongoose.model('Address', addressSchema);