const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const groupmembermodel = sequelize.define('groupMember', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: Sequelize.INTEGER, // Foreign key to User
    groupId: Sequelize.INTEGER, // Foreign key to Group
    role: {
        type: Sequelize.STRING,
        defaultValue: 'member', // Can be 'admin' or 'member'
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'pending', // 'pending', 'accepted', or 'declined'
    },
});

module.exports = groupmembermodel;
