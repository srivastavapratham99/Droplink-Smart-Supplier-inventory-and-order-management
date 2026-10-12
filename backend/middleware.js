const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'droplink_super_secret_jwt_key_2026';

/**
 * Middleware to protect routes — verifies JWT from Authorization header.
 * Decodes payload and verifies user account.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        _id: '6acb3a8b36d2cc715ef11fce',
        id: '6acb3a8b36d2cc715ef11fce',
        email: 'supplier@apex.com',
        role: 'supplier',
        name: 'Apex Wholesale Ltd.',
        companyName: 'Apex Wholesale Ltd.',
      };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Not authorized: No token provided' });
  }

  // If token is a demo token, resolve to user directly
  if (token.startsWith('demo-token-')) {
    const role = token.includes('admin') ? 'admin' : token.includes('supplier') ? 'supplier' : 'user';
    const email = role === 'admin' ? 'admin@droplink.com' : role === 'supplier' ? 'supplier@apex.com' : 'user@trendstore.com';
    try {
      let demoUser = await User.findOne({ email });
      if (!demoUser) {
        demoUser = await User.create({
          name: role === 'admin' ? 'Predefined Admin' : role === 'supplier' ? 'Apex Wholesale Ltd.' : 'TrendStore Retail Hub',
          email,
          password: 'password123',
          role,
          companyName: role === 'supplier' ? 'Apex Wholesale Ltd.' : 'Droplink HQ Operations',
          isVerifiedSupplier: role === 'supplier',
          status: 'active',
        });
      }
      req.user = demoUser;
      return next();
    } catch (e) {
      req.user = {
        _id: '6acb3a8b36d2cc715ef11fce',
        id: '6acb3a8b36d2cc715ef11fce',
        email,
        role,
        name: `Demo ${role.toUpperCase()}`,
      };
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Try finding fresh user in DB if real token
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      user = null;
    }

    if (!user) {
      req.user = decoded; // Fallback to token payload if offline mode
    } else {
      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Account suspended. Contact administration.' });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized: Invalid or expired token' });
  }
};

/**
 * Middleware to restrict access to specific roles.
 * Usage: authorize('admin'), authorize('supplier', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userRole = req.user.role === 'retailer' ? 'user' : req.user.role;
    if (!roles.includes(userRole) && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires one of [${roles.join(', ')}] privileges.`,
      });
    }
    next();
  };
};

const adminOnly = authorize('admin');
const supplierOrAdmin = authorize('supplier', 'admin');

module.exports = { protect, authorize, adminOnly, supplierOrAdmin };
