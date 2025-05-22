const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {Review} = require("./review.js");

const listingSchema = new mongoose.Schema({
       title:{
           type: String,
           required: true,
       },

       description: {
         type:String,
         required: true,
        },
       image: {
         url:String,
         filename: String,
    },
    category: {
         type: String,
         required: true,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref : "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

listingSchema.post("findOneAndDelete", async (listing) =>{
    if(listing){
        console.log("Deleting reviews for listing:", listing._id);
        console.log("Review model:", Review); // Check if Review is defined
        await Review.deleteMany({ _id: { $in: listing.reviews }});
    }  
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
