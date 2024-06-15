// controllers/userController.js
const User = require('../models/User'); 
// Assuming you have a User model
const { verifyToken } = require('../utils/jwtUtils');

const getCurrentUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = verifyToken(token);

    const user = await User.findById(decodedToken.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User found', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCurrentUserInfo };
