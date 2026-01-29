const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

function initSocketServer(httpServer){
    const io = new Server(httpServer,{})


    io.use(async (socket,next)=>{

        const cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {};

        if (!cookies.token){
            // Allow connection without authentication for testing
            console.log("Socket connected without authentication");
            return next();
        }

        try{
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await UserModel.findById(decoded._id);
            socket.user = user;
            console.log("Authenticated user:", user.email);
            next();
        }catch(err){
            next(new Error("Authentication error"));
        }

    })



    io.on("connection",(socket)=>{
        console.log("New socket connected:", socket.id);
    })
}


module.exports = initSocketServer;