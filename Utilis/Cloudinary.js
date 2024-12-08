const v1=require('cloudinary')

v1.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.COULDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
module.exports= v1;