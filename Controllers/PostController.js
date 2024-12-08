const sharp = require("sharp");
const Post = require("../Models/PostModel");
const User = require("../Models/UserModel");
const Comment = require("../Models/CommentModel");

const NewPost = async (req, res) => {
    try {
        const userId = req.id;
        const { caption } = req.body;
        const image = req.file;
        if (!image) {
            return res.status(400).json({ message: "image is required" })
        }
        const optimizedImageBuffer = await sharp(image.buffer).resize({ width: 800, height: 800, fit: 'inside' }).toFormat('jpeg', { quality: 80 }).toBuffer();
        const FileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`
        const cloudresponse = await v1.uploader.upload(FileUri)

        const post = new Post({
            caption,
            image: cloudresponse.secure_url,
            author: userId,

        })
        await post.save();
        const user = await User.findById(userId)
        if (user) {
            user.post.push(post._id)
            await user.save();
        }
        await post.populate({ path: 'author', select: '-password' })
        return res.status(201).json({ message: "post added successfully", post })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

const GetAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'name,profilepicture' })
            .pupulate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: { path: 'author', select: 'name,profilepicture' }
            })
        return res.status(200).json({ message: "all post retrived", posts })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

const GetALLPostOfUser = async (req, res) => {
    try {
        const userId = req.id;
        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 }).populate({ path: 'author', selcet: 'name,profilepicture' })
        return res.status(200).json({ message: "all post retrived", posts })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })

    }
}

const LikePost =async(req,res)=>{
    try {
        const userId=req.id;
        const postId=req.params.id
        const post=await Post.findById(postId)
        await post.updateOne({$addToSet:{likes:userId}})
        await post.save()

        //socket.io

        return res.status(201).json({message:"post liked"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"internal server error"})
    }
}

const DisLikePost =async(req,res)=>{
    try {
        const userId=req.id;
        const postId=req.params.id
        const post=await Post.findById(postId)
        await post.updateOne({$pull:{likes:userId}})
        await post.save()

        //socket.io

        return res.status(201).json({message:"post disliked"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"internal server error"})
    }
}


const AddComment=async(req,res)=>{
    try {
        const {text}=req.body;
        const userId=req.id;
        const postId=req.params.id;
        const post= await Post.findById(postId)
        if(!text){
            return res.status(400).json({message:"text is required for comment"});
        }
        const comment = new Comment({
            text,
            author:userId,
            post:postId
        }).populate({path:'author',select:'name,profilepicture'})
        await comment.save();
        post.comments.push(comment._id);
        await post.save();
        return res.status(201).json({message:"comment added"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "internal server error"})
    }
}


const GetAllComment=async(req,res)=>{
    try {
        const postId=req.params.id;
        const comments= await Comment.find({post:postId}).populate({path:'author',select:'name,profilepicture'})
        if(!comments){
            return res.status(400).json({message:'no comments yet'})
        }
        return res.status(200).json({comments})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"internal server error"})
    }
}

const DeleteComment=async(req,res)=>{
    try {
        const userId=req.id
        const postId=req.params.id;
        await Post.findByIdAndDelete({post:postId})
        const user =await User.findById(userId)
        user.post= user.post.filter(id=>id.toString!==postId)
        await user.save();
        await Comment.deleteMany({post:postId});
        return res.status(201).json({message:"post deleted"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"internal server error"})
    }
}

module.exports={NewPost,GetAllPost,GetALLPostOfUser,LikePost,DisLikePost,AddComment,GetAllComment,DeleteComment};