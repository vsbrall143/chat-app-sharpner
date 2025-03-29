const jwt = require('jsonwebtoken');
const User = require('../models/usermodel.js');

const au = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token not provided' });
    }

    console.log(`Token received: ${token}`);

    // Verify the token
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    console.log('Decoded User:', decodedUser);

    // Fetch the user from the database using email
    const user = await User.findOne({ where: { email: decodedUser.email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token: User not found' });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication Error:', err);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = { au };
