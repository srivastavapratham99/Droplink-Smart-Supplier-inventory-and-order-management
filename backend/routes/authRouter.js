const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'droplink_super_secret_jwt_key_2026';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      companyName: user.companyName,
      storeName: user.storeName,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// DEMO ACCOUNTS SEED DATA
const DEMO_ACCOUNTS = [
  {
    name: 'Apex Wholesale Ltd.',
    email: 'supplier@apex.com',
    password: 'password123',
    role: 'supplier',
    companyName: 'Apex Wholesale Solutions',
    phone: '+91 98765 43210',
    rating: 4.9,
    isVerifiedSupplier: true,
    status: 'active',
  },
  {
    name: 'TrendStore Direct',
    email: 'user@trendstore.com',
    password: 'password123',
    role: 'user',
    storeName: 'TrendStore Retail Hub',
    storePlatform: 'Shopify',
    importedProductsCount: 14,
    status: 'active',
  },
  {
    name: 'Platform Operations Admin',
    email: 'admin@droplink.com',
    password: 'password123',
    role: 'admin',
    adminLevel: 'SuperAdmin',
    companyName: 'Droplink Core HQ',
    status: 'active',
  },
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (User/Retailer, Supplier, or Admin)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user', companyName, storeName, storePlatform, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly. New admins can only be created from the Admin Dashboard.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const validRoles = ['user', 'retailer', 'supplier'];
    const assignedRole = validRoles.includes(role) ? (role === 'retailer' ? 'user' : role) : 'user';

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Note: In production use bcrypt hashing
      role: assignedRole,
      companyName: assignedRole === 'supplier' ? companyName || `${name} Corp` : '',
      isVerifiedSupplier: assignedRole === 'supplier' ? true : false,
      storeName: assignedRole === 'user' ? storeName || `${name}'s Store` : '',
      storePlatform: storePlatform || 'Shopify',
      phone: phone || '',
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: `${assignedRole.toUpperCase()} account created successfully`,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName,
        storeName: newUser.storeName,
        storePlatform: newUser.storePlatform,
        isVerifiedSupplier: newUser.isVerifiedSupplier,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    // Fallback: If DB is empty, check demo credentials
    if (!user) {
      const demoMatch = DEMO_ACCOUNTS.find((acc) => acc.email.toLowerCase() === email.toLowerCase());
      if (demoMatch && password === demoMatch.password) {
        user = await User.create(demoMatch);
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please create an account first.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: `Logged in successfully as ${user.role.toUpperCase()}`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        storeName: user.storeName,
        storePlatform: user.storePlatform,
        isVerifiedSupplier: user.isVerifiedSupplier,
        adminLevel: user.adminLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/auth/demo-accounts
 * @desc    List available demo accounts for testing
 */
router.get('/demo-accounts', (req, res) => {
  res.status(200).json({
    success: true,
    accounts: DEMO_ACCOUNTS.map((acc) => ({
      name: acc.name,
      email: acc.email,
      role: acc.role,
      companyName: acc.companyName,
      storeName: acc.storeName,
      adminLevel: acc.adminLevel,
    })),
  });
});

/**
 * @route   POST /api/auth/seed
 * @desc    Seed initial demo users into database
 */
router.post('/seed', async (req, res) => {
  try {
    for (const acc of DEMO_ACCOUNTS) {
      await User.findOneAndUpdate({ email: acc.email }, acc, { upsert: true, new: true });
    }
    res.status(200).json({ success: true, message: 'Demo accounts seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
