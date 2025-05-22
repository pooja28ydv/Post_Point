const User = require("../models/user.js")


module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req ,res) => {
        try {
            let {username, email, password} = req.body;
            const newUser = new User({email, username}); 
            const registeredUser = await User.register(newUser,password);
            console.log(registeredUser);
            req.login(registeredUser, (error) => {

                if(error){
                   return  next(error)
                }
   
               req.flash("success","Welcome to blogger");
               res.redirect("/listings");
            });
    } catch (error){
        req.flash("error", error.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.login =  async(req,res) =>{
    req.flash("success","welcome to Blogger: You are logged in !");
   let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res) => {
    req.logout((error) => {
        if(error){
           return next(error);
        }
        req.flash("success","you are logged out");
        res.redirect("/listings");
       })
};
