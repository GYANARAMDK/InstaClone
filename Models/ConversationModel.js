const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    message: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
})

const Conversation = mongoose.model('Conversation', ConversationSchema)
module.exports=Conversation;