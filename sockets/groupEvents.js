module.exports = (socket) => {
    // Join a specific group room
    socket.on('joinGroup', (groupId) => {
      console.log(`User joined group ${groupId}`);
      socket.join(groupId); // Join the room corresponding to the group ID
    });
  
    // Leave a specific group room
    socket.on('leaveGroup', (groupId) => {
      console.log(`User left group ${groupId}`);
      socket.leave(groupId); // Leave the room
    });
  };
  