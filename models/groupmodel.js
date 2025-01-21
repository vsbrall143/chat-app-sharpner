const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const groupmodel = sequelize.define('group', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true, // Primary key for the group
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false, // Group name cannot be null
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

module.exports = groupmodel;
