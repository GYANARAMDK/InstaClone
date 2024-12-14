const mongoose=require('mongoose')

const PostSchema= new mongoose.Schema({
      caption:{type:String,default:''},
      image:{type:String,require:true},
      author:{type:mongoose.Schema.Types.ObjectId, ref:'User',require:true},
      likes: [{type:mongoose.Schema.Types.ObjectId,ref:'User',}],
      comments:[{type:mongoose.Schema.Types.ObjectId,ref:'Comment'}],
      createdAt: {type: Date,default: Date.now,},
})
const Post=mongoose.model('Post',PostSchema);
module.exports=Post;