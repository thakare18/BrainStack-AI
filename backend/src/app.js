const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

//routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

//middleware
app.use(express.json());
app.use(cookieParser());

//using routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
