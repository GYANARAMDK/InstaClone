const mongoose=require('mongoose')

const UserSchema= new mongoose.Schema({
    name:{type:String,require:true,unique:true},
    email:{type:String,require:true,unique:true},
    password:{ type:String,require:true},
    profilepicture:{type:String,default:''},
    bio:{type:String,default:''},
    gender:{type:String, enum:['male','female']},
    follower:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    post:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    bookmark:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}]

},{timestamps:true})

const User=mongoose.model('User',UserSchema)
module.exports=User;
