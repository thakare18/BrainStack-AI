const mongoose = require("mongoose");


async function connectDb(){
    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!mongoUrl) {
        console.log("MongoDB connection skipped: set MONGO_URI or MONGO_URL in backend/.env");
        return;
    }

    try {
        await mongoose.connect(mongoUrl)
        console.log("Database connected successfully");
    }
    catch (error){
        console.log("Error connecting to database:", error);
    }


}

module.exports = connectDb;