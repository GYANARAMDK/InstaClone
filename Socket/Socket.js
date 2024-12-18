const { Server } = require('socket.io');
const http= require('http')
const express= require('express')

const app= express();

const server= http.createServer(app)

const io= new Server(server,
    {                               //",
        cors:{
            origin: ["http://localhost:5173","https://message-app-virid.vercel.app"],
            methods:['GET','POST']
        }
    }
)
const usersocketmap={}

io.on('connection',(socket)=>{
    const userid= socket.handshake.query.userid;
    
    if(userid){
        console.log(`user connected userid= ${userid} socketid=${socket.id}`)
        usersocketmap[userid] = socket.id;
        console.log('Updated usersocketmap:', usersocketmap);
        console.log("fcfc",usersocketmap[userid])
    }
    io.emit('getonlineusers',Object.keys(usersocketmap))
    socket.on('disconnect',()=>{
        if(userid){
             console.log(`user disconnected userid= ${userid} socketid=${socket.id}`)
           
             delete usersocketmap[userid];
             console.log('Updated usersocketmap2:', usersocketmap);
        }
        io.emit('getonlineusers',Object.keys(usersocketmap))
    })
})
const GetReciverSocketId = (receiverId) => {
    console.log("Checking receiverId:", receiverId);
    console.log("Current usersocketmap:", usersocketmap);
    return usersocketmap?.[receiverId];
};
module.exports={server,io,app,GetReciverSocketId};