 const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
// const { Op } = require('sequelize');
const sequelize=require('../util/database'); 
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');


const Message = require('../models/message');  

 
async function sendMessage(req, res, next) {
  try {
 
    const { message } = req.body;
    const email = req.user.email;

    if ( !email || !message) {
      return res.status(400).json({ message: 'Please provide username, email, and message.' });
    }

    // Create the new message in the database
    const newMessage = await Message.create({
      email,
      message,
    });

    // Send success response with the newly created message
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error while saving the message:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
}

 

// Controller function to fetch all messages
async function getMessages(req, res, next) {
  try {
    // Fetch all messages from the database
    const messages = await Message.findAll(); // Sequelize method to fetch all messages

    // Send the messages as the response
    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error('Error while fetching messages:', error);
    res.status(500).json({ message: 'Internal server error while fetching messages.' });
  }
}

module.exports = { sendMessage, getMessages }; // Export the function


 
