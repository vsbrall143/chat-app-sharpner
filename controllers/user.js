const User=require('../models/User')
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


  