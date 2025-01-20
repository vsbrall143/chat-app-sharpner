const http = require('http');
const { Server } = require('socket.io');
const app = require('./app'); // Your Express app
const connectionEvent = require('./sockets/connectionEvent');
const messageEvent = require('./sockets/messageEvents');
const groupEvent = require('./sockets/groupEvents');
const inviteEvent = require('./sockets/inviteEvent');

// Create HTTP server and bind to Express
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Frontend origin
    methods: ['GET', 'POST'],
  },
});

// Middleware to handle socket connections
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Load event handlers
  connectionEvent(socket);
  groupEvent(socket);
  messageEvent(socket, io);
  inviteEvent(socket, io);
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
