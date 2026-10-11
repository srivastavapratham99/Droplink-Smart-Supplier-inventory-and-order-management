const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, supplierOrAdmin, adminOnly } = require('../middleware');

/**
 * @route   GET /api/products
 * @desc    Get all products from database (supports filtering by status, category, etc.)
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
    const { page = 1, limit = 100, status, search } = req.query;
    const supplierId = req.user._id || req.user.id;

    // Strict multi-tenant isolation:
    // Supplier account strictly gets their own products.
    // Admin account can view all or filter by ?supplier=<id>
    const query = {};
    if (req.user.role === 'admin') {
      if (req.query.supplier && req.query.supplier !== 'all') {
        query.supplier = req.query.supplier;
      }
    } else {
      query.supplier = supplierId;
    }

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('supplier', 'name email companyName rating')
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
 * @route   POST /api/products
 * @desc    Create a new product strictly owned by the authenticated supplier
 * @access  Private (Supplier / Admin)
 */
router.post('/', protect, supplierOrAdmin, async (req, res) => {
  try {
    const supplierId = req.user._id || req.user.id;
    if (!supplierId) {
      return res.status(401).json({ success: false, message: 'Supplier authentication required' });
    }

    const sku = req.body.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;
    const productData = {
      ...req.body,
      sku,
      supplier: supplierId, // Strictly binds product to this specific supplier
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
 * @desc    Update a product by ID (Owner Supplier or Admin only)
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
      (product.supplier && product.supplier.toString() === userId);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this product' });
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
 * @desc    Update inventory stock level (Owner Supplier or Admin only)
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
      (product.supplier && product.supplier.toString() === userId);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this product' });
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
 * @desc    Delete a product (Owner Supplier or Admin only)
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
      (product.supplier && product.supplier.toString() === userId);

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this product' });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
