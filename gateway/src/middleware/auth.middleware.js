const jwt = require('jsonwebtoken');

// WHY Gateway pe JWT verify:
// Har service mein alag alag JWT check likhna padta
// Gateway pe ek baar verify karo — phir sab services trust kar sakti hain
// Service ko sirf business logic pe focus karna chahiye

const verifyToken = (req, res, next) => {
  // Authorization header se token nikalo
  // Format hota hai: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Decoded info ko header mein daalo
    // WHY headers: Downstream service ko user info milegi
    // without verifying token again
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-role'] = decoded.role;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please refresh'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Role check karne ke liye — Admin only routes ke liye
const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };