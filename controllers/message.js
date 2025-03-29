 const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
// const { Op } = require('sequelize');
const sequelize=require('../util/database'); 
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');
const { Op } = require('sequelize'); 
const User = require('../models/usermodel');
const Message = require('../models/messagemodel');  

  // Route: POST /groups/:groupId/messages
exports.sendMessage = async (req, res) => {
  try {
      const { groupId } = req.params;
      const { message } = req.body;
      const userId = req.user.id; // Assume user ID is set by the `auth` middleware

      // Create the message in the database
      const newMessage = await Message.create({ groupId, userId, message });

      res.status(201).json({ message: 'Message sent', data: newMessage });
  } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
  }
};

 // Route: GET /groups/:groupId/messages
exports.getMessages = async (req, res) => {
  try {
      const { groupId } = req.params;
      const userId = req.user.id;
      // Fetch messages for the group
      const messages = await Message.findAll({
          where: { groupId },
          include: [{ model: User, attributes: ['username'] }], // Include sender's username
          order: [['createdAt', 'ASC']] // Sort by oldest first
      });

      res.status(200).json({ messages,userId });
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
  }
};


 
