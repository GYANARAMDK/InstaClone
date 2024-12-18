const mongoose=require('mongoose')


const MessageSchema= new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    reciverId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    message:{type:String,require:true},
})
const Message= mongoose.model('Message',MessageSchema);
module.exports=Message;