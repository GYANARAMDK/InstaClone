const GetDataUri = require('../Utilis/DataUri');
const v1 = require('../Utilis/Cloudinary');
const User = require('../Models/UserModel')
const Post= require('../Models/PostModel')
const cryptojs = require('crypto-js')
const jwt = require('jsonwebtoken');
const registerationcontroller = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(401).json({ message: "something is missing" })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(404).json({ message: "user already registered with email" })
        }
        const encryptedpassword = cryptojs.AES.encrypt(password, process.env.PASSWORD_SECRET_KEY)
        const newuser = new User({
            name,
            email,
            password: encryptedpassword
        })
        await newuser.save();
        return res.status(201).json({ message: "account created successfully" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const logincontroller = async (req, res) => {
    try {
        const { email, Password } = req.body;
        if (!email || !Password) {
            return res.status(401).json({ message: "something is missing" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(402).json({ message: "account not exist" })
        }
        const decryptedpassword = cryptojs.AES.decrypt(user.password, process.env.PASSWORD_SECRET_KEY).toString(cryptojs.enc.Utf8)
        if (decryptedpassword !== Password) {
            return res.status(401).json({ message: "invalid credential" })
        }
        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY)
        return res.status(200).json({ message: "account login successfully", token, user });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const logoutcontroller = async (req, res) => {
    try {
        return res.status(200).cookie('token', "", { maxAge: 0 }).json({ message: "logout successfully" })
    } catch (error) {
        return res.status(500).json({ message: "internal server error" })
    }
}
const getprofile = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId).populate({path:'post',createAt:-1}).populate({path:'bookmark'}).select("-password")
        return res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal server error" });
    }
}

const updatecontroller = async (req, res) => {
    try {
        const  userId  = req.id;
        const { bio, gender } = req.body;
        const profilepicture  = req.file;
        let cloudresponse;
       
        if (profilepicture) {
            const FileUri = GetDataUri(profilepicture)
            cloudresponse = await v1.uploader.upload(FileUri);
        }

        const user = await User.findById(userId).select("-password")

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilepicture) user.profilepicture = cloudresponse.secure_url;
        await user.save();
        // await user.populate({path:'post',createAt:-1}).populate({path:'bookmark'}).select('-password')
        return res.status(200).json({ message: "profile updated successfully", user })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}
const GetSuggestedUser = async (req, res) => {
    try {
   
        const suggestedusers = await User.find({ _id: { $ne: req.id } }).select("-password")
        if (suggestedusers.length===0) {
            return res.status(400).json({ message: "currently do not  have any user " })
        }
        return res.status(200).json({ suggestedusers })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "something internal error" })
    }
}

const Followers = async (req, res) => {
    try {
        const userthatfollow = req.id;
        const userthatfollowed = req.params.id;
        if (!userthatfollow || !userthatfollowed) {
            return res.status(400).json({ message: "user not found" })
        }
        const user = await User.findById(userthatfollow)
        const targetuser = await User.findById(userthatfollowed);

        const isfollowing = user.following.includes(userthatfollowed);
        if (isfollowing) {
            await Promise.all([
                User.updateOne({ _id:userthatfollow }, { $pull: { following: userthatfollowed } }),
                User.updateOne({ _id:userthatfollowed }, { $pull: { follower: userthatfollow } })
            ])
            return res.status(201).json({ message: `${targetuser.name} removed from following` })
        } else {
            await Promise.all([
                User.updateOne({ _id: userthatfollow }, { $push: { following: userthatfollowed } }),
                User.updateOne({ _id: userthatfollowed }, { $push: { follower: userthatfollow } })
            ])
            return res.status(201).json({ message: `${targetuser.name} added to your following ` })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }
}

module.exports = {
    registerationcontroller,
    logincontroller,
    logoutcontroller,
    getprofile,
    updatecontroller,
    GetSuggestedUser,
    Followers,
};