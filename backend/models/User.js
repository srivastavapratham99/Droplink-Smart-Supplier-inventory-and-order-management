const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'retailer', 'supplier', 'admin'],
      default: 'user',
    },

    // Supplier specific details
    companyName: {
      type: String,
      default: '',
      trim: true,
    },
    isVerifiedSupplier: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
    },

    // Retailer / User specific details
    storeName: {
      type: String,
      default: '',
    },
    storePlatform: {
      type: String,
      enum: ['Shopify', 'WooCommerce', 'Amazon', 'Custom Store', 'None'],
      default: 'None',
    },
    importedProductsCount: {
      type: Number,
      default: 0,
    },

    // Admin specific details
    adminLevel: {
      type: String,
      enum: ['SuperAdmin', 'Operations', 'Support'],
      default: 'Operations',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending_approval'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
