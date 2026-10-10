const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // If stored password starts with $2a$ or $2b$, use bcrypt compare
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  // Fallback direct match for development seeds
  return enteredPassword === this.password;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
