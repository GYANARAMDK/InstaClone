const sharp = require("sharp");
const Post = require("../Models/PostModel");
const User = require("../Models/UserModel");
const Comment = require("../Models/CommentModel");
const cloudinary_js_config = require("../Utilis/Cloudinary");
const { GetReciverSocketId } = require("../Socket/Socket");

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
        const cloudresponse = await cloudinary_js_config.uploader.upload(FileUri)

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
        const populatedPost = await Post.findById(post._id)
            .populate({ path: 'author', select: 'name profilepicture' })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author', select: 'name profilepicture' }
            });
        return res.status(201).json({ message: "post added successfully", populatedPost })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

const GetAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'name profilepicture' })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author', select: 'name profilepicture' }
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

const LikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id
        const post = await Post.findById(postId)
        await post.updateOne({ $addToSet: { likes: userId } })
        await post.save()

        //socket.io
        const user = await User.findById(userId).select('name profilepicture')
        const postownerid = post.author.toString()
        if (postownerid !== userId) {
            const notification = {
                type: 'like',
                userId,
                postId,
                message: 'liked your post',
                userdetails: user
            }
            const postonwerSocketId = GetReciverSocketId(postownerid)
            io.to(postonwerSocketId).emit('notification', notification)
        }

        return res.status(201).json({ message: "post liked" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

const DisLikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id
        const post = await Post.findById(postId)
        await post.updateOne({ $pull: { likes: userId } })
        await post.save()

        //socket.io
        const user = await User.findById(userId).select('name profilepicture')
        const postownerid = post.author.toString()
        if (postownerid !== userId) {
            const notification = {
                type: 'dislike',
                userId,
                postId,
                message: 'liked your post',
                userdetails: user
            }
            const postonwerSocketId = GetReciverSocketId(postownerid)
            io.to(postonwerSocketId).emit('notification', notification)
        }

        return res.status(201).json({ message: "post disliked" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}


const AddComment = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId)
        if (!text) {
            return res.status(400).json({ message: "text is required for comment" });
        }
        const comment = new Comment({
            text,
            author: userId,
            post: postId
        })
        await comment.save();

        await comment.populate({ path: 'author', select: "name profilepicture" })
        post.comments.push(comment._id);
        await post.save();
        return res.status(201).json({ message: "comment added", comment })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}


const GetAllComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).populate({ path: 'author', select: 'name,profilepicture' })
        if (!comments) {
            return res.status(400).json({ message: 'no comments yet' })
        }
        return res.status(200).json({ comments })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

const DeleteComment = async (req, res) => {
    try {
        const userId = req.id
        const postId = req.params.id;
        await Post.findByIdAndDelete({ post: postId })
        const user = await User.findById(userId)
        user.post = user.post.filter(id => id.toString !== postId)
        await user.save();
        await Comment.deleteMany({ post: postId });
        return res.status(201).json({ message: "post deleted" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

module.exports = { NewPost, GetAllPost, GetALLPostOfUser, LikePost, DisLikePost, AddComment, GetAllComment, DeleteComment };