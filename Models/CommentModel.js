const mongoose=require('mongoose')

const CommentSchema= new mongoose.Schema({
     text:{type:String,require:true},
     author:{type:mongoose.Schema.Types.ObjectId,ref:'User',require:true},
     post:{type:mongoose.Schema.Types.ObjectId,ref:'Post',require:true}
})

 const Comment =mongoose.model('Comment',CommentSchema);
 module.exports=Comment;