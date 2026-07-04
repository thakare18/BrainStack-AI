const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");


// socket io middleware for authentication
function initSocketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {

        const cookies = socket.handshake.headers.cookie
            ? cookie.parse(socket.handshake.headers.cookie)
            : {};

        if (!cookies.token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await userModel.findById(decoded.id);
            socket.user = user; // in socket.user we set user data

            console.log("Authenticated user:", user.email);
            next();
        } catch (err) {
            next(new Error("Authentication error: invalid token"));
        }
    });

    io.on("connection", (socket) => {

        socket.on("ai-message", async (messagePayload) => {
            try {
                console.log("messagePayload received:", messagePayload);

                // optimization for message save in db and vector generation
                // we can do parallely using promise.all
                const [message, vectors] = await Promise.all([
                    messageModel.create({
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        content: messagePayload.content,
                        role: "user"
                    }),
                    aiService.generateVector(messagePayload.content)
                ]);

                try {
                    await createMemory({
                        vectors,
                        messageId: message._id,
                        metadata: {
                            chat: messagePayload.chat,
                            user: socket.user._id,
                            text: messagePayload.content
                        }
                    });
                } catch (memoryError) {
                    console.error("Failed to store user memory in Pinecone:", memoryError);
                }

                // memory retrieval functionality
                const chatHistory = await messageModel.find({
                    chat: messagePayload.chat
                })
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean()
                    .then(messages => messages.reverse());

                let memory = [];

                try {
                    memory = await queryMemory({
                        queryVector: vectors,
                        limit: 3,
                        metadata: {
                            user: socket.user._id
                        }
                    });
                } catch (memoryError) {
                    console.error("Failed to query Pinecone memory:", memoryError);
                }

                const stm = chatHistory.map(item => {
                    return {
                        role: item.role === "model" ? "model" : "user",
                        parts: [{ text: item.content }]
                    };
                });

                const memoryContext = memory.map(item => item.metadata.text).join("\n");
                const prompt = [
                    {
                        role: "user",
                        parts: [{
                            text: `Use the previous chat context below if relevant.\n\n${memoryContext}`
                        }]
                    },
                    ...stm
                ];

                const response = await aiService.generateResponse(prompt);

                socket.emit("ai-response", {
                    content: response,
                    chat: messagePayload.chat
                });

                // optimization for response message save in db and vector generation
                // we can do parallely using promise.all
                const [responseMessage, responseVectors] = await Promise.all([
                    messageModel.create({
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        content: response,
                        role: "model"
                    }),
                    aiService.generateVector(response)
                ]);

                try {
                    await createMemory({
                        vectors: responseVectors,
                        messageId: responseMessage._id,
                        metadata: {
                            chat: messagePayload.chat,
                            user: socket.user._id,
                            text: response
                        }
                    });
                } catch (memoryError) {
                    console.error("Failed to store model memory in Pinecone:", memoryError);
                }
            } catch (error) {
                console.error("AI message handling failed:", error);
                socket.emit("ai-error", {
                    chat: messagePayload.chat,
                    message: error.message || "AI response failed"
                });
            }
        });
    });
}

module.exports = initSocketServer;


// todays class we finish how to store memory in vector database
// and how to retrieve.
