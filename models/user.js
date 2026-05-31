
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
       email: {
           type: String,
           required: true
        },
       bio: {
           type: String,
           default: "Hey there! I am a blogger at PostPoint."
       },
       profileImage: {
           url: {
               type: String,
               default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
           },
           filename: {
               type: String,
               default: "default-avatar"
           }
       }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
