const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to protect routes — verifies JWT from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

/**
 * Middleware to restrict access to admin/supplier roles only.
 * Must be used AFTER `protect`.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
};

/**
 * Middleware to restrict access to suppliers and admins.
 * Must be used AFTER `protect`.
 */
const supplierOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'supplier' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Suppliers or Admins only' });
  }
};

module.exports = { protect, adminOnly, supplierOrAdmin };
