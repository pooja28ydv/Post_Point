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
            listing.title.includes(searchTerm) ||
            listing.description.includes(searchTerm)
        );
    }

    if (category && category !== "Choose category") {
        filteredListings = filteredListings.filter(listing => listing.category === category);
    }

    // Check if any listings were found after filtering
    if (filteredListings.length === 0) {
        req.flash("error", "No listings found matching your search criteria.");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings: filteredListings, search, category });

    
 });

module.exports.renderNewForm = async( req, res) => {
      res.render("listings/new.ejs");
}

module.exports.showListing = (async(req,res) => {
    let {id} = req.params;
    if (!id) {
        req.flash("error", "Listing ID is required.");
        return res.redirect("/listings");
    }
    const listing = await Listing.findById(id).populate({ path:"reviews", populate: {path: "author"},}).populate("owner");
    if( !listing ) {
      req.flash("error","Listing you requested for does not exist!");
      res.redirect("/listings");  
  }
     console.log(listing);
    res.render("listings/show.ejs", { listing });
});

module.exports.createListing = async (req, res) => {
    const allowedCategories = [
        "Animal", "Travel", "Food", "Education", "Art",
        "Lifestyle", "Entertainment", "Sport", "Technology"
    ];
    const { listing } = req.body;
    try {
        // Validate category BEFORE save
        // if (!listing || !listing.category || !allowedCategories.includes(listing.category)) {
        //     // Re-render form with error and previously entered data
        //     return res.status(400).redirect('/listings/new.ejs', {
        //         errorMessage: 'Category is required and must be one of: ' + allowedCategories.join(', '),
        //         listing // send back entered data to refill form
        //     });
        // }
        
        // // Continue with your image upload validation if any
        // if (!req.file) {
        //     return res.status(400).redirect('/listings/new.ejs', {
        //         errorMessage: 'Image file is required.',
        //         listing
        //     });
        // }
        
        if (!listing || !listing.category || !allowedCategories.includes(listing.category)) {
            req.flash('error', 'Category is required and must be one of: ' + allowedCategories.join(', '));
             res.redirect('/listings/new.ejs');
        }
        if (!req.file) {
            req.flash('error', 'Image file is required.');
            res.redirect('/listings/new.ejs');
        }

        // Your existing code for creating a listing
        let url = req.file.path;
        let filename = req.file.filename;
    
        const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image = { url,filename };
    //   newListing.category = req.body.listing.category;
      await newListing.save();
      req.flash("success", "New Listing Created");
      res.redirect("/listings");
    

    } catch (error) {
        req.flash("error", error.message); // Flash the error message
        return res.redirect("/listings/new"); // Redirect back to the new listing form
    }

   
    //   let url = req.file.path;
    //   let filename = req.file.filename;
    //   //console.log(url,"...",filename);
    // const newListing = new Listing(req.body.listing);
    // newListing.owner = req.user._id;
    // newListing.image = { url , filename };
    // await newListing.save();
    // req.flash("success", "New Listing Created");
    // res.redirect("/listings");
};



module.exports.renderEditForm = async (req,res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if ( !listing) {
       req.flash("error", "Listing you request for edit doesn't exist");
        res.redirect("/listings");
   }
      let originalImageUrl = listing.image.url;
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};



module.exports.updateListing = async ( req,res) =>{
    // let { id } = req.params;
    // // let listing = await Listing.findById(id);
    // let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    // if(typeof req.file !== "undefined"){
    //     let url = req.file.path;
    //      let filename = req.file.filename;
    //     listing.image = { url , filename };
    //     await listing.save();
    // };
    // req.flash("success"," Listing Updated!");
    // res.redirect(`/listings/${id}`);
     
    try {
        // Your existing code for updating a listing
        let { id } = req.params;
        try {
            let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
            if (typeof req.file !== "undefined") {
                let url = req.file.path;
                let filename = req.file.filename;
                listing.image = { url, filename };
                await listing.save();
            }
            req.flash("success", "Listing Updated!");
            res.redirect(`/listings/${id}`);
        } catch (error) {
            console.error("Error updating listing:", error);
            if (!res.headersSent) {
                req.flash("error", "Could not update listing.");
                res.redirect(`/listings/${id}/edit`);
            }
        }
    } catch (error) {
        req.flash("error", error.message); // Flash the error message
        return res.redirect(`/listings/${req.params.id}/edit`); // Redirect back to the edit form
    }
    
   
   };

module.exports.deleteListing = async (req,res) =>{
    //  let { id } = req.params;
    //  let deletedListing = await Listing.findByIdAndDelete(id);
    //  console.log(deletedListing);
    //  req.flash("success", "Listing Deleted!");
    // res.redirect("/listings");
    const { id } = req.params;
    try {
        const listing = await Listing.findByIdAndDelete(id);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }
        req.flash("success", "Listing deleted successfully.");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting listing:", error);
        if (!res.headersSent) {
            req.flash("error", " listing delete ");
            res.redirect("/listings");
        }
    }

};   