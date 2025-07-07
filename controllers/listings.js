const Listing = require("../models/listing.js");
const Review = require("../models/review");

module.exports.index = (async(req,res) =>{

    const { search, category } = req.query; // Get the search term and category from the query parameters

    const allListings = await Listing.find({})
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    allListings.forEach(listing => {
        if (listing.reviews.length > 0) {
         const totalRating = listing.reviews.reduce((acc, review) => acc + review.rating, 0);
            listing.averageRating = totalRating / listing.reviews.length;
        } else {
            listing.averageRating = 0; // Set to 0 if there are no reviews
        }
    });

    allListings.sort((a, b) => b.averageRating - a.averageRating);

    // If a search term is provided, filter the listings
    let filteredListings = allListings;

    if (search && search.trim() !== "") {
        const searchTerm = search; // keep the original case
        filteredListings = filteredListings.filter(listing =>
            listing.title.includes(searchTerm)
          
        );
    }

    if (category && category !== "Choose category") {
        filteredListings = filteredListings.filter(listing => listing.category === category);
    }

    // Check if any listings were found after filtering
    if (filteredListings.length === 0) {
        req.flash("error", "No Blog found matching your search criteria.");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings: filteredListings, search, category });

    
 });

module.exports.renderNewForm = async( req, res) => {
      res.render("listings/new.ejs");
}

module.exports.showListing = ( async(req,res) => {
    let {id} = req.params;
    if (!id) {
        req.flash("error", "Blog ID is required.");
        return res.redirect("/listings");
    }
    const listing = await Listing.findById(id).populate({ path:"reviews", populate: {path: "author"},}).populate("owner");
    if( !listing ) {
      req.flash("error","Blog you requested for does not exist!");
      res.redirect("/listings");  
  }
     console.log(listing);
    res.render("listings/show.ejs", { listing });
});

// module.exports.createListing = async (req, res) => {
    
//     try{  
//         if (!req.file) {
//             req.flash("error", "Please upload an image file");
//             return res.redirect("/listings/new");
//         }
    
//         let url = req.file.path;
//         let filename = req.file.filename;
    
//         const newListing = new Listing(req.body.listing);
//         newListing.owner = req.user._id;
//         newListing.image = { url,filename };
  

//         await newListing.save();
//         req.flash("success", "New Blog Created");
          
//           return res.redirect("/listings");
     
//     } catch(err){
//         console.error("save failed", err);
//         res.status(500).json({ error : "Failed to save data"});
//         res.redirect("/listings/new");
//     }
    

//     // } catch (error) {
//     //     req.flash("error", error.message); // Flash the error message
//     //     return res.redirect("/listings/new"); // Redirect back to the new listing form
//     // }


// };


module.exports.createListing = async (req, res) => {
    try {
        console.log("=== CREATE LISTING START ===");
        console.log("User:", req.user ? req.user._id : "No user");
        console.log("File:", req.file ? "Present" : "Missing");
        console.log("Body:", req.body);

        // Check if file upload was successful
        if (!req.file) {
            console.log("ERROR: No file uploaded");
            req.flash("error", "Please upload an image file");
            return res.redirect("/listings/new");
        }

        let url = req.file.path;
        let filename = req.file.filename;
        
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        console.log("About to save listing...");
        const savedListing = await newListing.save();
        console.log("✅ Listing saved with ID:", savedListing._id);
        
        req.flash("success", "New Blog Created");
        return res.redirect("/listings");
        
    } catch (err) {
        console.error("❌ CREATE LISTING ERROR:");
        console.error("Message:", err.message);
        console.error("Stack:", err.stack);
        
        // FIXED: Proper error response (no more crash!)
        req.flash("error", "Failed to create blog: " + err.message);
        return res.redirect("/listings/new");
    }
}



module.exports.renderEditForm = async (req,res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if ( !listing) {
       req.flash("error", "Blog you request for edit doesn't exist");
        res.redirect("/listings");
   }
      let originalImageUrl = listing.image.url;
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};



module.exports.updateListing = async ( req,res) =>{
    
     
    try {
        // Your existing code for updating a listing
        let { id } = req.params;
        try {
            let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
            
            if (!listing) {
                req.flash("error", "Blog not found");
                return res.redirect("/listings");
            }
            
            if ( req.file ) {
                let url = req.file.path;
                let filename = req.file.filename;
                listing.image = { url, filename };
                await listing.save();
            }
            req.flash("success", "Blog Updated!");
            res.redirect(`/listings/${id}`);
        } catch (error) {
            console.error("Error updating ", error);
          
                req.flash("error", "Could not update ");
                res.redirect(`/listings/${id}/edit`);

        }
    } catch (error) {
        req.flash("error", error.message); // Flash the error message
        return res.redirect(`/listings/${req.params.id}/edit`); // Redirect back to the edit form
    }
    
   
   };

module.exports.deleteListing = async (req,res) =>{
  
    const { id } = req.params;
    try {
        const listing = await Listing.findByIdAndDelete(id);
        if (!listing) {
            req.flash("error", "Blog not found.");
            return res.redirect("/listings");
        }
        req.flash("success", "Blog deleted successfully.");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting Blog:", error);
        if (!res.headersSent) {
            req.flash("error", " Blog delete ");
            res.redirect("/listings");
        }
    }

};   