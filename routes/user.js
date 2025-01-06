const path = require('path');

const express = require('express');

const adminController = require('../controllers/user');
const { sendMessage ,  getMessages} = require('../controllers/message')

const router = express.Router();
 
const auth= require('../middleware/auth')

 

 
router.post('/user/signup', adminController.postsignup)

router.post('/user/login', adminController.postlogin)

router.post('/messages', auth.au, sendMessage)
router.get('/messages', auth.au, getMessages)

module.exports = router;
