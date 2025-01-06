 
const signup=require('../models/SignupUser')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
// const { Op } = require('sequelize');
const sequelize=require('../util/database'); 
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');


 
 
 


const { Op, Transaction } = require('sequelize'); // Import Op for comparison operators
 
 

 function generateAccessToken(email){
  return jwt.sign({email:email}, '8hy98h9yu89y98yn89y98y89')
 }

 


 exports.postsignup = async (req, res, next) => {
  try {
    console.log("Handling signup request...");
    console.log(req.body);

    const { username, email, password,phone } = req.body;

    // Check if the email already exists
    const existingUser = await signup.findOne({ where: { email} });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    bcrypt.hash(password,10,async (err,hash) => {     //10 is for salt rounds more making passwo rd more unique
      console.log(err);
      await signup.create({username,email,password:hash,phone})
      res.status(201).json({message:'sucessfully created new user'})
    })

  
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
};


exports.postlogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await signup.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Validate password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(200).json({ success: true, message: "User logged in successfully" ,token:generateAccessToken(user.email)});
    } else {
      return res.status(400).json({ success: false, message: "Password is incorrect" });
    }

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }   
};


