const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError");
const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');
const session = require('express-session');
const flash = require('connect-flash');

app.use(express.static(path.join(__dirname,'/public')));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const sesionObject = {
    secret : "supersecretmode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        path : '/',
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

app.use(session(sesionObject));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("failure");
    next();
})

main()
    .then(() => {
        console.log('connected to DB');
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
}

app.use('/listings',listings);
app.use('/listings/:id/reviews',reviews);

app.all('*', (req, res, next) => {
    next(new ExpressError(404, "page not found"));
})

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
})

app.listen(3000, () => {
    console.log("listening on port : 3000");
})