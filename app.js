const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user.js');

// Initialize Express app
const app = express();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdn.socket.io"],
        "script-src-attr": ["'self'", "'unsafe-inline'"], // Allow inline event handlers
      },
    },
  })
);

app.use(compression());
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static files (e.g., for serving frontend files)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(userRoutes);

// Database associations
const User = require('./models/usermodel');
const Group = require('./models/groupmodel');
const GroupMember = require('./models/groupmembermodel');
const Message = require('./models/messagemodel');

// Define model associations
Group.hasMany(GroupMember, { foreignKey: 'groupId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(GroupMember, { foreignKey: 'userId' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(Message, { foreignKey: 'groupId' });
Message.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

// Export the app for use in server.js
module.exports = app;
