const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listing');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require("./utils/ExpressError");
const {listingSchema, reviewSchema} = require('./schema');
const Review = require('./models/review');

app.use(express.static(path.join(__dirname,'/public')));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

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

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map(err => err.message).join(",");
        throw new ExpressError(400, errMsg);
    } 
    else {
        next();
    }
}


const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map(err => err.message).join(",");
        throw new ExpressError(400, errMsg);
    } 
    else {
        next();
    }
}

app.get('/listings', async (req,res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})


app.get('/listings/new', (req,res) => {
    res.render('listings/new.ejs');
})

app.post('/listings', validateListing, wrapAsync (async (req, res, next) => {
    let newListing = new Listing(req.body.listing);
    console.log(newListing);
    await newListing.save();
    res.redirect('/listings');
}))

app.get('/listings/:id', wrapAsync (async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}))

app.get('/listings/:id/edit', wrapAsync (async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render('listings/edit.ejs',{listing});
}))

app.put('/listings/:id', validateListing, wrapAsync (async (req,res) => {
    let {id} = req.params;
    let newListing = req.body.listing;
    await Listing.findByIdAndUpdate(id, newListing);
    res.redirect(`/listings/${id}`);
}))

app.delete('/listings/:id', wrapAsync(async (req,res) => {
    let {id} = req.params;
    console.log(id);
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}))

app.post('/listings/:id/reviews', validateReview, wrapAsync( async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await listing.save();
    await newReview.save();

    res.redirect(`/listings/${listing._id}`);
}))

// app.get('/listing', async (req,res) => {
//     let sampleListing = new Listing({
//         title: "umbrella villa",
//         description: "2BHK",
//         Image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjiR3aGKbe2Jr-si36rhxyHsggbwaczhiLwMYOywnQ0MpP_wAr1uoZzovY4eahQ_-NIgj9XrYSs6NQQcs5D4xZ9yB6ZljpG9wtTu18AbtvwEeJAkP2214MY4sVrIoDTPU2OiGjb7WeTv4xJsqX0oMvxiG1v_6xPWNVKLa8AAKlu9P19L-h1K4l58nX1/s1600/modern-single-floor-house.jpg",
//         price: 20000,
//         location: "Pune",
//         country: "India"
//     })

//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("working");
// })
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