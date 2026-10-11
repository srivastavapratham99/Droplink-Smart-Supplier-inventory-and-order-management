const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, supplierOrAdmin, adminOnly } = require('../middleware');

const SEED_PRODUCTS = [
  {
    name: 'Wireless Noise-Canceling Earbuds Pro',
    sku: 'EAR-PRO-01',
    category: 'Electronics',
    basePrice: 2499,
    compareAtPrice: 3999,
    costPrice: 1200,
    stock: 45,
    lowStockThreshold: 10,
    status: 'active',
    isApproved: true,
    description: 'High-fidelity audio with active noise cancellation, Bluetooth 5.3, and 32h battery life.',
    images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
  },
  {
    name: 'Ergonomic Mesh Office Chair',
    sku: 'CHR-MESH-02',
    category: 'Furniture',
    basePrice: 8999,
    compareAtPrice: 12999,
    costPrice: 4500,
    stock: 8,
    lowStockThreshold: 10,
    status: 'active',
    isApproved: true,
    description: 'Breathable mesh back with lumbar support, adjustable armrests, and 360-degree silent swivel wheels.',
    images: [{ url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
  },
  {
    name: 'Smart Fitness Tracker Watch',
    sku: 'WTC-FIT-03',
    category: 'Wearables',
    basePrice: 1999,
    compareAtPrice: 2999,
    costPrice: 850,
    stock: 0,
    lowStockThreshold: 5,
    status: 'out_of_stock',
    isApproved: true,
    description: 'AMOLED display, 24/7 heart rate and SpO2 tracking, 5ATM water resistance, and 14-day battery life.',
    images: [{ url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
  },
  {
    name: 'Stainless Steel Insulated Water Bottle (1L)',
    sku: 'BTL-STL-04',
    category: 'Lifestyle',
    basePrice: 799,
    compareAtPrice: 1199,
    costPrice: 300,
    stock: 120,
    lowStockThreshold: 15,
    status: 'active',
    isApproved: true,
    description: 'Double-wall vacuum insulation keeps liquids cold for 24h or hot for 12h. BPA free and leakproof.',
    images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
  },
  {
    name: 'RGB Mechanical Gaming Keyboard',
    sku: 'KBD-RGB-05',
    category: 'Electronics',
    basePrice: 3499,
    compareAtPrice: 4999,
    costPrice: 1800,
    stock: 24,
    lowStockThreshold: 8,
    status: 'active',
    isApproved: true,
    description: 'Hot-swappable tactile switches, per-key RGB backlighting, sound-dampening foam, and braided USB-C cable.',
    images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
  },
  {
    name: 'Organic Cotton Oversized Streetwear Hoodie',
    sku: 'APP-HOD-06',
    category: 'Fashion',
    basePrice: 1699,
    compareAtPrice: 2499,
    costPrice: 650,
    stock: 65,
    lowStockThreshold: 12,
    status: 'active',
    isApproved: true,
    description: 'Heavyweight 400 GSM brushed fleece organic cotton, kangaroo pocket, and relaxed streetwear fit.',
    images: [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
  },
];

async function ensureSeededProducts() {
  try {
    let supplier = await User.findOne({ role: 'supplier' });
    if (!supplier) {
      supplier = await User.create({
        name: 'Apex Wholesale Ltd.',
        email: 'supplier@apex.com',
        password: 'password123',
        role: 'supplier',
        companyName: 'Apex Electronics Supplies',
        isVerifiedSupplier: true,
        status: 'active',
      });
    }

    for (const item of SEED_PRODUCTS) {
      const exists = await Product.findOne({ sku: item.sku });
      if (!exists) {
        await Product.create({
          ...item,
          supplier: supplier._id,
        });
      }
    }
  } catch (err) {
    console.error('ensureSeededProducts error:', err.message);
  }
}

/**
 * @route   GET /api/products
 * @desc    Get all products (supports filtering by status, category, etc.)
 * @access  Public
 * @query   search, category, subcategory, minPrice, maxPrice, supplier, tag, status, page, limit, sort
 */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      supplier,
      tag,
      status,
      all,
      page = 1,
      limit = 50,
      sort = '-createdAt',
    } = req.query;

    let totalCheck = await Product.countDocuments();
    if (totalCheck === 0) {
      await ensureSeededProducts();
    }

    const query = {};

    // Filter by status (allow 'all' to show active, low_stock, out_of_stock)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by approval: if all=true or isApproved=all, show all
    if (req.query.isApproved === 'all' || all === 'true') {
      // do not restrict approval
    } else if (req.query.isApproved !== undefined) {
      query.isApproved = req.query.isApproved === 'true';
    } else if (!status || status === 'active') {
      // default public view shows approved products
      query.isApproved = true;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category / Subcategory
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    // Supplier
    if (supplier) query.supplier = supplier;

    // Tag
    if (tag) query.tags = tag;

    // Price range
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('supplier', 'name email companyName rating')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products/supplier/my-products
 * @desc    Get all products created by the logged-in supplier
 * @access  Private (Supplier / Admin)
 */
router.get('/supplier/my-products', protect, supplierOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = { supplier: req.user.id };

    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/products/:idOrSlug
 * @desc    Get single product by ID or Slug
 * @access  Public
 */
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const product = await Product.findOne(query).populate('supplier', 'name email companyName rating');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment view count asynchronously
    Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).exec();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/products/seed
 * @desc    Seed default catalog products
 * @access  Public
 */
router.post('/seed', async (req, res) => {
  try {
    await ensureSeededProducts();
    const count = await Product.countDocuments();
    res.status(200).json({ success: true, message: 'Products seeded successfully', count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Supplier / Admin)
 */
router.post('/', protect, supplierOrAdmin, async (req, res) => {
  try {
    let supplierId = req.user._id || req.user.id;
    if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
      const defaultSupplier = await User.findOne({ role: 'supplier' });
      supplierId = defaultSupplier ? defaultSupplier._id : undefined;
    }

    const sku = req.body.sku || `SKU-${Date.now().toString().slice(-6)}`;
    const productData = {
      ...req.body,
      sku,
      supplier: supplierId,
      isApproved: true,
      status: req.body.status || 'active',
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product by ID
 * @access  Private (Owner Supplier / Admin)
 */
router.put('/:id', protect, supplierOrAdmin, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const userId = (req.user._id || req.user.id || '').toString();
    const isOwner =
      req.user.role === 'admin' ||
      req.user.role === 'supplier' ||
      !product.supplier ||
      product.supplier.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update inventory stock level
 * @access  Private (Owner Supplier / Admin)
 */
router.patch('/:id/stock', protect, supplierOrAdmin, async (req, res) => {
  try {
    const { stock, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({ success: false, message: 'Valid stock value is required' });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const userId = (req.user._id || req.user.id || '').toString();
    const isOwner =
      req.user.role === 'admin' ||
      req.user.role === 'supplier' ||
      !product.supplier ||
      product.supplier.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let newStock = Number(product.stock) || 0;
    if (operation === 'set') newStock = Number(stock);
    else if (operation === 'add') newStock += Number(stock);
    else if (operation === 'subtract') newStock = Math.max(0, newStock - Number(stock));

    product.stock = newStock;
    if (newStock === 0) product.status = 'out_of_stock';
    else if (product.status === 'out_of_stock' && newStock > 0) product.status = 'active';

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: { stock: product.stock, status: product.status },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/products/:id/approval
 * @desc    Approve or reject a product
 * @access  Private (Admin Only)
 */
router.patch('/:id/approval', protect, adminOnly, async (req, res) => {
  try {
    const { isApproved } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved, status: isApproved ? 'active' : 'draft' },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: `Product ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Owner Supplier / Admin)
 */
router.delete('/:id', protect, supplierOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const userId = (req.user._id || req.user.id || '').toString();
    const isOwner =
      req.user.role === 'admin' ||
      req.user.role === 'supplier' ||
      !product.supplier ||
      product.supplier.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
