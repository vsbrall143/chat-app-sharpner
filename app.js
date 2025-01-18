const fs=require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const sequelize=require('./util/database'); 

const userroutes = require('./routes/user');
const compression=require('compression')
const helmet=require('helmet');
// const morgan=require('morgan');
const app = express();
var cors = require('cors');

const accessLogStream=fs.createWriteStream(
  path.join(__dirname,'access.log'),
  {flags:'a'}
);

// app.use(morgan('combined',{stream:accessLogStream}));
app.use(helmet());
app.use(compression());
 
app.use( 
  cors({
    // origin:'http://127.0.0.1:5501',
    methods:["GET","POST","DELETE"],
    credentials:true
  })
)
 
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(userroutes);





 
const User = require('./models/user');
const Group = require('./models/group');
const GroupMember = require('./models/groupMember');
const Message = require('./models/message');

 

// Define associations between models
Group.hasMany(GroupMember, { foreignKey: 'groupId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(GroupMember, { foreignKey: 'userId' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(Message, { foreignKey: 'groupId' });
Message.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });



sequelize
.sync()
.then((result) => {
  // console.log(result);
 
  console.log("conndected");
  app.listen(3000);
})
.catch((err) => {
  console.log(err);
});

 