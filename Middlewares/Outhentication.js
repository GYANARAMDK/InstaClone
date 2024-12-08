const jwt=require('jsonwebtoken')

const Othentication=async(req,res,next)=>{
    try {
        const token= req.cookies.token;
        if(!token){
            return res.status(401).json({message:'user not authenticated'})
        }
        const decoded= jwt.verify(token,process.env.TOKEN_KEY)
        if(!decoded){
             return res.status(401).json({message:'invalid token'})
        }
        req.id=decoded.userId;
        next();
    } catch (error) {
        console.log(error)
    }
}

module.exports= Othentication;