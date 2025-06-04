const express = require('express');
const router = express.Router({mergeParams : true});
const {reviewSchema} = require('../schema');
const Review = require('../models/review');
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require("../utils/ExpressError");

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


router.post('/', validateReview, wrapAsync( async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await listing.save();
    await newReview.save();

    req.flash("success", "New review added successfully!");

    res.redirect(`/listings/${listing._id}`);
}))

router.delete('/:reviewId', wrapAsync( async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "review deleted successfully!");

    res.redirect(`/listings/${id}`);
}))

module.exports = router;

