const ChatModel = require('../models/chat.model');

async function createChat(req,res){
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
                _id : chat._id,
                title : chat.title,
                lastActivity : chat.lastActivity,
                user: chat.user
            }
        });
    } catch (error) {
        console.error("Create chat error:", error);
        res.status(500).json({message: "Error creating chat", error: error.message});
    }
}

module.exports = {
    createChat
};