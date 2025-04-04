const jwt = require('jsonwebtoken');
const Guard = require('../models/Guard');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'دسترسی غیرمجاز. لطفا وارد سیستم شوید'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user with the token
    req.user = await Guard.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'دسترسی غیرمجاز. لطفا وارد سیستم شوید'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `نقش ${req.user.role} اجازه دسترسی به این منبع را ندارد`
      });
    }
    next();
  };
}; 