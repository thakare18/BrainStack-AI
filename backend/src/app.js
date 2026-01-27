const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");

//middleware
app.use(express.json());




module.exports = app;