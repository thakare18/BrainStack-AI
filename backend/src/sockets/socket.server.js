const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const {generateResponse} = require("../services/ai.service");
// socket io middleware for authentication
function initSocketServer(httpServer){
    const io = new Server(httpServer,{})


    io.use(async (socket,next)=>{

        const cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {}; //? to handle case when there are no cookies and returns undefined
        if (!cookies.token){
            // Allow connection without authentication for testing
            console.log("authentication error : no token provided");
            return next();
        }

        try{
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await UserModel.findById(decoded._id);
            socket.user = user; // in socket.user we set user data  

            console.log("Authenticated user:", user.email);
            next();
        }catch(err){
            next(new Error("Authentication error: invalid token"));
        }

    })



    io.on("connection",(socket)=>{
        // console.log("New socket connected:", socket.id);

        socket.on("ai-message", async (messagePayload) => {
            console.log("messagePayload received:", messagePayload)

            const response = await generateResponse(messagePayload.content)

            socket.emit("ai-response", {
                content: response,
                chat : messagePayload.chat
            })

        }

        );
    })
}


module.exports = initSocketServer;