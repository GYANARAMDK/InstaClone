const Message = require('../Models/MessageModel')
const Conversation = require('../Models/ConversationModel');
const { GetReciverSocketId, io } = require('../Socket/Socket');
const SendMessage = async (req, res) => {
    try {

        const senderId = req.id;
        const recieverId = req.params.id;
        const { message } = req.body;
        console.log(message)
        console.log("hello")
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recieverId] }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recieverId]
            })
        }
        const newmessage = await Message.create({
            senderId: senderId,
            reciverId: recieverId,
            message: message,
        })
        if (newmessage) conversation.message.push(newmessage._id)
        await conversation.save(),
        await newmessage.save(),
        
         console.log("new message", newmessage)
        //implement socket.io for real time

        const reciverSocketId= GetReciverSocketId(recieverId)
        if(reciverSocketId){
            io.to(reciverSocketId).emit('newMessage',newmessage)
        }
        console.log("reciversocketid",reciverSocketId)
        return res.status(201).json({newmessage})
    } catch (error) {
        console.log(error.stack);
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

const GetMessage= async(req,res)=>{
    try {
        const senderId= req.id;
        const recieverId=req.params.id;
        const conversation=await Conversation.findOne({
            participants:{$all:[senderId,recieverId]}
        }).populate('message') 
        if(!conversation) return res.status(200).json({message:[]})
            console.log("conversation",conversation)
        return res.status(200).json({message:conversation?.message})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"internal server error"})
    }
}

module.exports ={SendMessage,GetMessage}