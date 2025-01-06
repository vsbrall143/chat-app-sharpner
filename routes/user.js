const path = require('path');

const express = require('express');

const adminController = require('../controllers/user');
 

const router = express.Router();
 
const auth= require('../middleware/auth')

 

 
router.post('/user/signup', adminController.postsignup)

router.post('/user/login', adminController.postlogin)



module.exports = router;
