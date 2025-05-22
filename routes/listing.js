const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
 //const upload = multer({ storage });
 const { CloudinaryStorage } = require("multer-storage-cloudinary");
 const cloudinary = require("cloudinary").v2;
 const path = require("path"); // Import path for file extension checking

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Set up multer storage with Cloudinary
const Storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Blog_App",
        allowedFormats: ["png", "jpg", "jpeg", "gif"], // Only allow these formats
    },
});

// Set up multer with file filter
const upload = multer({
    storage: Storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            req.fileValidationError = 'Error: File upload only supports the following filetypes - jpeg, jpg, png, gif';
            return cb(null, false); // Prevent the upload
            // req.flash('error', 'Error: File upload only supports the following filetypes - jpeg, jpg, png, gif');
            //  return cb(new Error('Unsupported file type'), false); 
            // cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
        }
    }
});


router.route("/")
     .get( isLoggedIn,wrapAsync (listingController.index))
     .post(
          isLoggedIn,
          upload.single('listing[image]'), 
          validateListing,
          wrapAsync(async (req, res, next) => {
            // Check if there was an error during the upload
            if (req.fileValidationError) {
                req.flash('error', req.fileValidationError);
                return res.redirect("/listings/new"); // Redirect back to the new listing page
            }
            // Proceed to create the listing if no errors
            await listingController.createListing(req, res, next);
        })
      //     wrapAsync (listingController.createListing)
);
    
 
//NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
      .get( isLoggedIn,wrapAsync (listingController.showListing))
      .put(
            isLoggedIn ,
            isOwner ,
            upload.single('listing[image]'), 
            validateListing,
            wrapAsync(async (req, res, next) => {
                  // Check if there was an error during the upload
                  if (req.fileValidationError) {
                      req.flash('error', req.fileValidationError);
                      return res.redirect(`/listings/${req.params.id}/edit`); // Redirect back to the edit page
                  }
                  // Proceed to update the listing if no errors
                  await listingController.updateListing(req, res, next);
              })
      
            //  wrapAsync( listingController.updateListing)

            )   
      .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))


//Edit Route
router.get("/:id/edit",isLoggedIn, isOwner ,wrapAsync( listingController.renderEditForm)
);


module.exports = router;