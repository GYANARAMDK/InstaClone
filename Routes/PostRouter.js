const express=require('express');
const Othentication = require('../Middlewares/Outhentication');
const upload = require('../Middlewares/Multer');
const { NewPost, GetAllPost, GetALLPostOfUser, LikePost, DisLikePost, AddComment, GetAllComment, DeleteComment } = require('../Controllers/PostController');

const router=express.Router();


router.post('/addpost',Othentication,upload.single('image'),NewPost);
router.get('/allpost',Othentication,GetAllPost)
router.get('/userpost/all',Othentication,GetALLPostOfUser)
router.get('/:id/like',Othentication,LikePost)
router.get('/:id/dislike',Othentication,DisLikePost)
router.post('/:id/comment/add',Othentication,AddComment)
router.get('/:id/comment/all',Othentication,GetAllComment)
router.post('/:id/comment/delete',Othentication,DeleteComment)

module.exports=router;