const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const {createMemory, queryMemory} = require("../services/vector.service");



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
2
        socket.on("ai-message", async (messagePayload) => {
            console.log("messagePayload received:", messagePayload)




            

            // await messageModel.create({ // saving user message to database
            //     chat : messagePayload.chat,
            //     content : messagePayload.content,
            //     user : socket.user._id,
            //     role : "user"
            // })


           
 
            const vectors = await aiService.generateVector(messagePayload.content)
             console.log("Generated vectors",vectors)  

            const ChatHistory = await messageModel.find({
                chat : messagePayload.chat
            }).sort({createdAt : -1}).limit(20).lean().reverse()//20 most rrecent messages

            

            const response = await aiService.generateResponse(ChatHistory.map(item => {
                return {
                   role : item.role,
                   parts : [{text: item.content }]
                }
            }))

            //  await messageModel.create({ // saving AI response in the database
            //     chat : messagePayload.chat,
            //     content : response,
            //     user : socket.user._id,
            //     role : "model"
            // })

            socket.emit("ai-response", {
                content: response,
                chat : messagePayload.chat
            })

        }

        );
    })
}


module.exports = initSocketServer;