const express=require('express')
const { registerationcontroller, logincontroller, logoutcontroller, getprofile, updatecontroller, GetSuggestedUser, Followers } = require('../Controllers/UserController')
const  Othentication  = require('../Middlewares/Outhentication')
const  upload  = require('../Middlewares/Multer')

const router=express.Router()

router.post('/register',registerationcontroller)
router.post('/login',logincontroller)
router.get('/logout',logoutcontroller)
router.get('/profile/:id',Othentication,getprofile)
router.post('/profile/edit',Othentication,upload.single('profilepicture'),updatecontroller)
router.get('/suggested',Othentication,GetSuggestedUser)
router.post('/follow/:id',Othentication,Followers)

module.exports= router;