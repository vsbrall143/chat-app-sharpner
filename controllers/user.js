const Group = require('../models/groupmodel');
const Message = require('../models/messagemodel');  
const GroupMember = require('../models/groupmembermodel');
const User = require('../models/usermodel');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
// const { Op } = require('sequelize');
const sequelize=require('../util/database'); 
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');
require("dotenv").config();
const { Op, Transaction } = require('sequelize'); // Import Op for comparison operators
 
//  function generateAccessToken(email){
//   return jwt.sign({email:email}, '8hy98h9yu89y98yn89y98y89')
//  }

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Generate a JWT token and include username
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



 

exports.postSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, message: 'User registered successfully', userId: newUser.id });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




exports.inviteUser = async (req, res,next) => {
  try {
    console.log("hello");
    const { email } = req.body;
    const { groupId } = req.params;

    // Find the user to be invited
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the user is already in the group
    const existingMember = await GroupMember.findOne({ where: { groupId, userId: user.id } });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'User already in the group' });
    }

    // Add the user as a group member
    await GroupMember.create({
      groupId,
      userId: user.id,
      role: 'member',
    });

    res.status(200).json({ success: true, message: 'User invited successfully' });
  } catch (err) {
    console.error('Error inviting user:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
