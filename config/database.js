const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then( () => {console.log("Connected to the database successfully")} )
    .catch(error => {
        console.log("Some error occured while connecting to the database");
        console.log(error);
        process.exit(1);
    });
}