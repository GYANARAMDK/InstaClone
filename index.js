
const dotenv=require('dotenv')
dotenv.config();
const express= require('express')
const cors=require('cors')
const cookieparser=require('cookie-parser')
const config=require('./Utilis/Config');
const userrouter = require('./Routes/UserRouter');
const postrouter = require('./Routes/PostRouter')
const messagerouter= require('./Routes/MessageRouter')
const PORT=3000;
const {app,server} =require('./Socket/Socket')


//middlewares
app.use(express.json())
const corsOptions = {
    origin:[ 'http://localhost:5173',  // Frontend ka URL
    'https://message-app-virid.vercel.app'],
    credentials: true,  // Allow cookies to be sent
  };
  
  app.use(cors(corsOptions));
app.use(cookieparser());

app.get('/',(req,res)=>{
     return res.status(200).json({message:"server is running successfully"})
})

app.use('/api/v1/user',userrouter)
app.use('/api/v1/post',postrouter)
app.use('/api/v1/message',messagerouter)


server.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`)
})