const express = require("express");
const router = express.Router({ mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController =  require("../controllers/reviews.js");



//Reviews
router.post("/:id/reviews", isLoggedIn ,validateReview,wrapAsync(reviewController.createReview));

// Edit Review Route
router.get("/:listingId/reviews/:reviewId/edit",
isLoggedIn,isReviewAuthor,wrapAsync(reviewController.editReview));

// Update Review 

router.put('/:listingId/reviews/:reviewId', isLoggedIn, isReviewAuthor, validateReview,(reviewController.updateReview))
//Delete Review
router.delete("/:listingId/reviews/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;