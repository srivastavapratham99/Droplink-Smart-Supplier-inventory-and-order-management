const mongoose = require('mongoose');

/**
 * ProductSchema — Mongoose schema for a dropshipping product.
 *
 * Key features:
 * - `supplier`: References User model (supplier who provides the product).
 * - `variants`: Supports size/color/SKU combinations.
 * - `images`: Primary image and gallery support.
 * - `pricing`: basePrice, costPrice (supplier cost for profit margin calculation), compareAtPrice.
 * - `inventory`: stock, lowStockThreshold, SKU.
 * - `status` & `isApproved`: Product lifecycle management.
 * - Full-text search index on name, description, tags.
 */

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Variant name is required (e.g. "Red / XL")'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required for each variant'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, 'Compare-at price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    // ─── Core Info ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      default: '',
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },

    // ─── Categorization ──────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      default: '',
      trim: true,
    },

    // ─── Supplier ────────────────────────────────────────────────────────────
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier reference is required'],
    },
    supplierProductCode: {
      type: String,
      default: '',
      trim: true,
    },

    // ─── Pricing ─────────────────────────────────────────────────────────────
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, 'Compare-at price cannot be negative'],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      maxlength: 3,
    },

    // ─── Inventory ───────────────────────────────────────────────────────────
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    manageStock: {
      type: Boolean,
      default: true,
    },

    // ─── Variants ────────────────────────────────────────────────────────────
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },

    // ─── Media ───────────────────────────────────────────────────────────────
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          altText: { type: String, default: '' },
          isPrimary: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    // ─── Shipping ────────────────────────────────────────────────────────────
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      unit: { type: String, default: 'cm' },
    },
    shippingClass: {
      type: String,
      default: 'standard',
      enum: ['standard', 'express', 'fragile', 'bulky', 'digital'],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },

    // ─── Status & Visibility ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'],
      default: 'draft',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ─── SEO ─────────────────────────────────────────────────────────────────
    seo: {
      metaTitle: { type: String, default: '', maxlength: 70 },
      metaDescription: { type: String, default: '', maxlength: 160 },
      metaKeywords: { type: [String], default: [] },
    },

    // ─── Analytics ───────────────────────────────────────────────────────────
    viewCount: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
productSchema.virtual('isLowStock').get(function () {
  return this.manageStock && this.stock <= this.lowStockThreshold;
});

productSchema.virtual('discountPercent').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.basePrice) {
    return Math.round(((this.compareAtPrice - this.basePrice) / this.compareAtPrice) * 100);
  }
  return 0;
});

productSchema.virtual('profitMargin').get(function () {
  if (this.costPrice > 0) {
    return Math.round(((this.basePrice - this.costPrice) / this.basePrice) * 100);
  }
  return null;
});

// Indexes
productSchema.index({ supplier: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1, isApproved: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto slug and image sync pre-save
productSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now();
  }

  // Ensure imageUrl and images are synchronized
  if (this.images && this.images.length > 0 && this.images[0]?.url) {
    this.imageUrl = this.images[0].url;
  } else if (this.imageUrl && (!this.images || this.images.length === 0)) {
    this.images = [{ url: this.imageUrl, isPrimary: true, altText: this.name || '' }];
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
