const ChatModel = require('../models/chat.model');
const MessageModel = require('../models/message.model');


// Create a new chat
async function createChat(req, res) {
    try {
        const { title } = req.body;
        const user = req.user;

        const chat = await ChatModel.create({
            title,
            user: user._id
        });

        res.status(201).json({
            message: "Chat created successfully",
            chat: {
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity,
                user: chat.user
            }
        });
    } catch (error) {
        console.error("Create chat error:", error);
        res.status(500).json({
            message: "Error creating chat",
            error: error.message
        });
    }
}


// Create a new message in a chat
async function createMessage(req, res) {
    try {
        const { chatId, content } = req.body;
        const user = req.user;

        if (!chatId || !content) {
            return res.status(400).json({
                message: "chatId and content are required"
            });
        }

        const message = await MessageModel.create({
            chat: chatId,
            user: user._id,
            content,
            role: "user"
        });

        await ChatModel.findByIdAndUpdate(chatId, {
            lastActivity: new Date()
        });

        res.status(201).json({
            message: "Message created successfully",
            chatMessage: {
                _id: message._id,
                chat: message.chat,
                user: message.user,
                content: message.content,
                role: message.role,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt
            }
        });
    } catch (error) {
        console.error("Create message error:", error);
        res.status(500).json({
            message: "Error creating message",
            error: error.message
        });
    }
}


// Get all chats of logged-in user
async function getChats(req, res) {
    try {
        const user = req.user;

        const chats = await ChatModel.find({ user: user._id });

        res.status(200).json({
            message: "Chats retrieved successfully",
            chats: chats.map(chat => ({
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity,
                user: chat.user
            }))
        });
    } catch (error) {
        console.error("Get chats error:", error);
        res.status(500).json({
            message: "Error retrieving chats",
            error: error.message
        });
    }
}


// Get all messages of a chat
async function getMessages(req, res) {
    try {
        const chatId = req.params.id;

        const messages = await MessageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Messages retrieved successfully",
            messages: messages
        });
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            message: "Error retrieving messages",
            error: error.message
        });
    }
}


module.exports = {
    createChat,
    createMessage,
    getChats,
    getMessages
};
