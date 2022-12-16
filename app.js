const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://abhy1522:changeme12345@keybounce.abkmpmd.mongodb.net/keybounce'); //config
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const express = require('express');    
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const paypal= require('paypal-rest-sdk')
const dotenv = require('dotenv'); 
const app = express();

dotenv.config();

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: 'thisismysecrctekey',
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.set('cache-control', 'no-cache , no-store,must-revalidate,max-stale=0,post-check=0,pre-checked=0');
    next();
}); //middleware

app.use(cookieParser());

userRoute.set('view engine', 'ejs')
userRoute.set('views', './views/users')
userRoute.use('/', express.static('public'))
userRoute.use('/', express.static('public/molla'))
// userRoute.use('/', express.static('public/login'))

app.use('/', userRoute)
app.use('/admin', adminRoute)

app.use(function (req, res) {
    res.status(404).render("users/404.ejs");
  });

app.listen(3000, function () {
    console.log('Server Running');
})
