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
        const searchTerm = search.toLowerCase();
        filteredListings = filteredListings.filter(listing =>
            (listing.title && listing.title.toLowerCase().includes(searchTerm)) ||
            (listing.description && listing.description.toLowerCase().includes(searchTerm)) ||
            (listing.category && listing.category.toLowerCase().includes(searchTerm))
        );
    }

    if (category && category !== "Choose category" && category !== "choose category") {
        filteredListings = filteredListings.filter(listing => 
            listing.category && listing.category.toLowerCase() === category.toLowerCase()
        );
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
        console.log("AI Image URL:", req.body.ai_image_url ? "Present (length: " + req.body.ai_image_url.length + ")" : "Missing");

        if (!req.user) {
            req.flash("error", "Please log in to create a blog");
            return res.redirect("/login");
        }

        if (!req.body.listing) {
            req.flash("error", "Please fill in all required fields");
            return res.redirect("/listings/new");
        }

        const { title, description, category } = req.body.listing;
        if (!title || !description || !category) {
            req.flash("error", "Please fill in all required fields");
            return res.redirect("/listings/new");
        }

        // ─── Determine image source ─────────────────────────────────────────
        let imageData = null;
        const cloudinary = require("cloudinary").v2;

        if (req.file) {
            // ✅ Normal file upload via Multer → Cloudinary
            imageData = { url: req.file.path, filename: req.file.filename };
            console.log("Using uploaded file:", imageData.url);

        } else if (req.body.ai_image_url && req.body.ai_image_url.trim()) {
            const aiUrl = req.body.ai_image_url.trim();
            console.log("Uploading AI image to Cloudinary...");
            try {
                // Cloudinary accepts both external URLs and base64 data URIs natively
                const uploaded = await cloudinary.uploader.upload(aiUrl, {
                    folder: "Blog_App",
                    resource_type: "image",
                    transformation: [{ width: 800, height: 450, crop: "fill", quality: "auto" }]
                });
                imageData = { url: uploaded.secure_url, filename: uploaded.public_id };
                console.log("✅ AI image uploaded to Cloudinary:", imageData.url);
            } catch (uploadErr) {
                console.error("Cloudinary AI upload failed:", uploadErr.message);
                // Use URL directly as fallback (works for Pollinations.ai)
                imageData = { url: aiUrl, filename: "ai-generated" };
                console.log("Using AI URL directly as fallback");
            }
        } else {
            req.flash("error", "Please upload an image or generate one with AI");
            return res.redirect("/listings/new");
        }

        // ─── Create and save listing ────────────────────────────────────────
        const listingData = {
            title: title.trim(),
            description: description.trim(),
            category: category,
            image: imageData,
            owner: req.user._id
        };

        console.log("Creating listing with data:", { ...listingData, image: { url: listingData.image.url.substring(0, 80) + "..." } });

        const newListing = new Listing(listingData);
        const savedListing = await newListing.save();

        console.log("✅ Listing saved successfully with ID:", savedListing._id);
        req.flash("success", "New Blog Created Successfully!");
        return res.redirect("/listings");

    } catch (err) {
        console.error("❌ CREATE LISTING ERROR:", err.name, err.message);

        let errorMessage = "Failed to create blog. Please try again.";
        if (err.name === 'ValidationError') {
            errorMessage = "Validation failed: " + Object.values(err.errors).map(e => e.message).join(", ");
        } else if (err.code === 11000) {
            errorMessage = "A blog with similar content already exists";
        } else if (err.message.includes('cloudinary')) {
            errorMessage = "Image upload failed. Please try again.";
        }

        req.flash("error", errorMessage);
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



module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    try {
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        if (!listing) {
            req.flash("error", "Blog not found");
            return res.redirect("/listings");
        }

        if (req.file) {
            // ✅ Manual file upload
            listing.image = { url: req.file.path, filename: req.file.filename };
            await listing.save();

        } else if (req.body.ai_image_url && req.body.ai_image_url.trim()) {
            // ✅ AI-generated image — upload to Cloudinary automatically
            const cloudinary = require("cloudinary").v2;
            const aiUrl = req.body.ai_image_url.trim();
            try {
                const uploaded = await cloudinary.uploader.upload(aiUrl, {
                    folder: "Blog_App",
                    resource_type: "image",
                    transformation: [{ width: 800, height: 450, crop: "fill", quality: "auto" }]
                });
                listing.image = { url: uploaded.secure_url, filename: uploaded.public_id };
                await listing.save();
                console.log("✅ AI image saved:", uploaded.secure_url);
            } catch (uploadErr) {
                console.error("Cloudinary AI upload error:", uploadErr.message);
                listing.image = { url: aiUrl, filename: "ai-generated" };
                await listing.save();
            }
        }
        // If no file and no AI URL → keep existing image unchanged

        req.flash("success", "Blog Updated!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        req.flash("error", "Could not update blog");
        res.redirect(`/listings/${id}/edit`);
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