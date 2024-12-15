const jwt=require('jsonwebtoken')

const Othentication=async(req,res,next)=>{
    try {
         const token= req.headers.authorization?.split(' ')[1]
        if(!token){
            console.log(token)
            return res.status(401).json({message:'user not authenticate'})
        }
        const decoded= jwt.verify(token,process.env.TOKEN_KEY)
        if(!decoded){
             return res.status(401).json({message:'invalid token'})
        }
        req.id=decoded.userId;
        next();
    } catch (error) {
        console.error(error)
         res.status(401).json({message:error})
    }
}

module.exports= Othentication;