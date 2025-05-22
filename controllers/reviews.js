const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


module.exports.createReview = async(req,res) =>{
     let listing = await Listing.findById(req.params.id);
     let newReview = new Review( req.body.review);
     newReview.author = req.user._id; 
     listing.reviews.push(newReview);
     console.log(newReview);
      await newReview.save();
      await listing.save();
     req.flash("success","New Review Created");
    res.redirect(`/listings/${listing._id}`);
    };


module.exports.editReview = async (req, res) => {
     const { listingId,reviewId } = req.params;
     const review = await Review.findById(reviewId).populate('author');
     if (!review) {
         req.flash("error", "Review not found");
         return res.redirect(`/listings/${listingId}`);
     }
     res.render("reviews/edit", { review, listingId ,reviewId });
 };
 
module.exports.updateReview =  async (req, res) => {
    const { listingId, reviewId } = req.params;
    const { comment,rating } = req.body.review;
    try {
        const review = await Review.findByIdAndUpdate(reviewId, { comment,rating }, { new: true });
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${ listingId }`);
        }
        req.flash("success", "Review updated successfully");
        res.redirect(`/listings/${ listingId }`);
    } catch (err) {
        req.flash("error", "An error occurred while updating the review");
        res.redirect(`/listings/${ listingId }`);
    }
};

module.exports.deleteReview = async(req,res)=>{
    //  let { id, reviewId} = req.params;

    //  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
    //  await Review.findByIdAndDelete(reviewId);
    //  req.flash("success","Review Deleted");
    //  res.redirect(`/listings/${id}`);
    const { reviewId } = req.params;
    try {
        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) {
            req.flash("error", "Review not found.");
            return res.redirect("/listings");
        }

        await Listing.updateMany(
            { reviews: reviewId },
            { $pull: { reviews: reviewId } }
        );

        req.flash("success", "Review deleted successfully.");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting review:", error);
        req.flash("error", "Could not delete review.");
        res.redirect("/listings");
    }
};

// module.exports.renderEditForm = async (req,res) =>{
//      let { id } = req.params;
//      const listing = await Listing.findById(id);
//      if ( !listing) {
//         req.flash("error", "Listing you request for edit doesn't exist");
//          res.redirect("/listings");
//     }
//        let originalImageUrl = listing.image.url;
//        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
//      res.render("listings/edit.ejs", { listing, originalImageUrl });
//  };