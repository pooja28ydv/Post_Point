const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/blogapp";

main().then(() =>{
     console.log("connected to DB");
}).catch(error =>{
    console.log(error);
})

async function main() {
       try {
              await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
              console.log("connected to DB");
              await initDB(); // Call initDB after successful connection
          } catch (error) {
              console.log(error);
          }
}

const initDB = async (req,res) => {
       // await Listing.deleteMany({});
       // initData.data = initData.data.map((obj) => ({ 
       //        ...obj,
       //         owner: "67ea419a98657ad57668b870"}));
       // await Listing.insertMany(initData.data);
       // console.log("data was initialized");
       try { 
              console.log("Listing model:", Listing);
              await Listing.deleteMany({});
              initData.data = initData.data.map((obj) => ({
                  ...obj,
                  owner: "67ea419a98657ad57668b870"
              }));
              await Listing.insertMany(initData.data);
              console.log("data was initialized");
          } catch (error) {
              console.error("Error initializing database:", error);
          }
};


 initDB();
