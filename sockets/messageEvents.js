const Message = require('../models/messagemodel'); // Import your Message model

module.exports = (socket, io) => {
  // Listen for "sendMessage" event
  socket.on('sendMessage', async (data) => {
    try {
      const { groupId, userId, message } = data;

      // Save the message to the database
      const newMessage = await Message.create({ groupId, userId, message });

      // Emit the message to all members of the group
      io.to(groupId).emit('receiveMessage', {
        groupId,
        userId,
        message: newMessage.message,
        createdAt: newMessage.createdAt,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message.' });
    }
  });
};
