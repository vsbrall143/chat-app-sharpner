const GroupMember = require('../models/groupmembermodel'); // Import your GroupMember model

module.exports = (socket, io) => {
  // Listen for "sendInvite" event
  socket.on('sendInvite', async (data) => {
    try {
      const { groupId, invitedUserId } = data;

      // Save the invitation to the database (if needed)
      await GroupMember.create({ groupId, userId: invitedUserId, role: 'pending' });

      // Notify the invited user (if they're online)
      io.to(invitedUserId).emit('receiveInvite', { groupId });
    } catch (error) {
      console.error('Error sending invite:', error);
      socket.emit('error', { message: 'Failed to send invite.' });
    }
  });

  // Accept or decline invite logic can also be implemented here if needed
};
