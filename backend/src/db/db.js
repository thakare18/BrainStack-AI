const mongoose = require("mongoose");


async function connectDb(){

    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Database connected successfully");
    }
    catch (error){
        console.log("Error connecting to database:", error);
    }


}

module.exports = connectDb;