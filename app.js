const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user.js');
 

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(compression());

app.use(cors());
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200); // Respond with HTTP 200 for preflight requests
});


// app.use(cors({
//   origin: '*', // Replace with your frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
// }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static files (e.g., for serving frontend files)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(userRoutes);
 

// Database associations
const User = require('./models/usermodel');
const Group = require('./models/groupmodel');
const GroupMember = require('./models/groupMembermodel');
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
