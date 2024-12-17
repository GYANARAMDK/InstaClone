const { Server } = require('socket.io');
const http= require('http')
const express= require('express')

const app= express();

const server= http.createServer(app)

const io= new Server(server,
    {
        cors:{
            origin: ["https://message-app-virid.vercel.app/", "http://localhost:5173"],
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
    }
    io.emit('getonlineusers',Object.keys(usersocketmap))
    socket.on('disconnect',()=>{
        if(userid){
             console.log(`user disconnected userid= ${userid} socketid=${socket.id}`)
             delete usersocketmap[userid];
        }
        io.emit('getonlineusers',Object.keys(usersocketmap))
    })
})

module.exports={server,io,app};