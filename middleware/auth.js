const jwt = require('jsonwebtoken');
const User = require('../models/SignupUser');

 
const au = (req, res, next) => {
    try{
        const token=req.header('Authorization');
        console.log(token);
        const user=jwt.verify(token,'8hy98h9yu89y98yn89y98y89');
        console.log('userID >>>',user.email)
        User.findByPk(user.email).then(user=>{
            console.log(user);
            req.user=user;
            next();
        })
    }catch(err){
        console.log(err);
        return res.status(401).json({sucess:false});

    }
}

module.exports = {au};
