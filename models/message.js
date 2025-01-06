const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const message = sequelize.define('message', {

   email: {
     type: Sequelize.STRING,
     allowNull: false,
 
   },

  message: {
    type: Sequelize.STRING,
    allowNull: false,
},
 
 
});

module.exports = message;
