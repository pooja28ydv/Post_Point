if(process.env.NODE_ENV != "production"){

    require('dotenv').config();
}


const express = require("express");
const app  = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //help us to create a templete includes/partials
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//MongoDb url
 const dbUrl = process.env.MONGO_URL;


 //connection mongoDb
main().then(() =>{
    console.log("connected to DB");
}).catch((error) =>{
    console.log(error);
});

async function main() {
    try{
        await mongoose.connect(dbUrl);  
        console.log("MONGODB connected SUccessFUlly");
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}



app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const store = MongoStore.create({

      mongoUrl : process.env.MONGO_URL,
      crypto: {
           secret: process.env.SECRET  || 'defaultsecret',
      },
      touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in Mongo sesion store",err);
});


const sessionOptions = {
    store : store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 *24 *60 *60  + 1000,
        maxAge: 7 * 24 *60 *60 + 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.messages = req.flash();
    // res.locals.info = req.flash("info");
    next();
});

app.use("/",userRouter);
app.use("/listings", listingRouter)
app.use("/listings", reviewRouter);



// Add this to your app.js BEFORE your existing error handler

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process, just log the error
});

// Enhanced error handler - replace your existing error handler with this
app.use((err, req, res, next) => {
    console.error("=== ERROR HANDLER ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Request URL:", req.url);
    console.error("Request method:", req.method);
    
    let { statusCode = 500, message = "Something went wrong" } = err;
    
    // Don't expose sensitive error details in production
    if (process.env.NODE_ENV === 'production') {
        message = statusCode === 500 ? "Internal Server Error" : message;
    }
    
    // If headers are already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }
    
    // Flash error message and redirect for form submissions
    if (req.method === 'POST' && req.path.includes('/listings')) {
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/listings/new");
    }
    
    // Render error page
    res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
});

app.all("*", (req,res,next) =>{
    
    next( new ExpressError(404, "Click on signup"));
})

app.use((err,req,res,next) =>{
    let {statusCode = 500, message = "Something went wrong "} = err;
     res.status(statusCode).render("error.ejs", { err });       
//   res.send(statusCode).send(message);
 } )



 const port = process.env.PORT || 8080;
app.listen(port,() => {
    console.log("server is listening to port 8080");
})


