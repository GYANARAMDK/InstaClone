const Message = require('../Models/MessageModel')
const Conversation = require('../Models/ConversationModel');
const { GetReciverSocketId, io } = require('../Socket/Socket');
const SendMessage = async (req, res) => {
    try {

        const senderId = req.id;
        const recieverId = req.params.id;
        const { message } = req.body;

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
        await Promise.all([
            conversation.save(),
            newmessage.save(),
        ])
          console.log(message)
          console.log("hello")
        //implement socket.io for real time

        const reciverSocketId= GetReciverSocketId(recieverId)
        if(reciverSocketId){
            io.to(reciverSocketId).emit('newMessage',newmessage)
        }
        return res.status(201).json({newmessage})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

const GetMessage= async(req,res)=>{
    try {
        const senderId= req.id;
        const recieverId=req.params.id;
        const conversation=await Conversation.find({
            participants:{$all:{senderId,recieverId}}
        })
        if(!conversation) return res.status(200).json({messages:[]})
        return res.status(200).json({messages:conversation?.message})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"internal server error"})
    }
}

module.exports ={SendMessage,GetMessage}