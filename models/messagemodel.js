const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const messagemodel = sequelize.define('message', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` for when the message was sent
});

module.exports = messagemodel;
