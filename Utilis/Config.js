const mongoose=require('mongoose')
const connetiton=mongoose.connect(process.env.MONGO_URL);
if(connetiton){
    console.log( "we are connedted to mongodb")
}