const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema ({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    chat : {
        type : mongoose.Schema.Types.ObjectId,// means each message is linked to a specific 
        ref: 'Chat'
    },
    content : {
        type: String,
        required : true
    },
    role : {
        type : String,
        enum : ["user", "model","system"],
        default : "user"
    },
    
}
,
{
    timestamps: true
})



const MessageModel = mongoose.model("message", messageSchema);
module.exports = MessageModel;