const mongoose = require('mongoose')
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const express = require('express');    
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const paypal= require('paypal-rest-sdk')
const dotenv = require('dotenv'); 
const app = express();

dotenv.config();

// Database connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.warn('Warning: MONGO_URI is not set. The server may fail to start without a database connection.');
}
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
    }); //config

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: process.env.SESSION_SECRET || 'thisismysecrctekey',
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

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).send('ok');
});

app.use(function (req, res) {
    res.status(404).render("users/404.ejs");
  });

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, function () {
    console.log(`Server Running on http://${HOST}:${PORT}`);
})
