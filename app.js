const fs=require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const sequelize=require('./util/database'); 
 
 
const User=require('./models/SignupUser')
 
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
 
app.use(cors())
 
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(userroutes);

 

 

sequelize
.sync()
.then((result) => {
  // console.log(result);
  console.log(process.env.DB_PORT);
  console.log("conndected");
  app.listen(process.env.DB_PORT);
})
.catch((err) => {
  console.log(err);
});

 