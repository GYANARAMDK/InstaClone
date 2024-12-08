const express=require('express')
const { SendMessage, GetMessage } = require('../Controllers/MessageController');
const Othentication = require('../Middlewares/Outhentication');

const router=express.Router()

router.post('/send/:id',Othentication,SendMessage);

router.post('/get/:id',Othentication,GetMessage);

module.exports=router