const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require("../utils/ExpressError");
const {listingSchema} = require('../schema');


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

router.get('/', async (req,res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})


router.get('/new', (req,res) => {
    res.render('listings/new.ejs');
})

router.post('/', validateListing, wrapAsync (async (req, res, next) => {
    let newListing = new Listing(req.body.listing);
    console.log(newListing);
    await newListing.save();
    if(newListing) {
        req.flash("success", "new listing added successfully!");
    }
    res.redirect('/listings');
}))

router.get('/:id', wrapAsync (async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    if(!listing) {
        req.flash("failure", "this listing doesn't exists.");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}))

router.get('/:id/edit', wrapAsync (async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
     if(!listing) {
        req.flash("failure", "this listing doesn't exists.");
        res.redirect("/listings");
    }
    res.render('listings/edit.ejs',{listing});
}))

router.put('/:id', validateListing, wrapAsync (async (req,res) => {
    let {id} = req.params;
    let newListing = req.body.listing;
    await Listing.findByIdAndUpdate(id, newListing);
    req.flash("success","listing updated successfully!")
    res.redirect(`/listings/${id}`);
}))

router.delete('/:id', wrapAsync(async (req,res) => {
    let {id} = req.params;
    console.log(id);
    await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted successfully!")
    res.redirect('/listings');
}))


module.exports = router;