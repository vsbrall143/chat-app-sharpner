module.exports = (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  };
  