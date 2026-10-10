'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '@/lib/api';

// Demo fallback data if backend server is offline
const DEMO_PRODUCTS = [
  {
    _id: '1',
    name: 'Wireless Noise-Canceling Earbuds Pro',
    slug: 'wireless-noise-canceling-earbuds-pro',
    category: 'Electronics',
    basePrice: 2499,
    compareAtPrice: 3999,
    costPrice: 1200,
    stock: 45,
    lowStockThreshold: 10,
    status: 'active',
    isApproved: true,
    supplier: { companyName: 'Apex Electronics Supplies' },
    images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60' }],
    rating: { average: 4.8, count: 124 },
  },
  {
    _id: '2',
    name: 'Ergonomic Mesh Office Chair',
    slug: 'ergonomic-mesh-office-chair',
    category: 'Furniture',
    basePrice: 8999,
    compareAtPrice: 12999,
    costPrice: 4500,
    stock: 8,
    lowStockThreshold: 10,
    status: 'active',
    isApproved: true,
    supplier: { companyName: 'Comfort Living Co.' },
    images: [{ url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=500&auto=format&fit=crop&q=60' }],
    rating: { average: 4.6, count: 89 },
  },
  {
    _id: '3',
    name: 'Smart Fitness Tracker Watch',
    slug: 'smart-fitness-tracker-watch',
    category: 'Wearables',
    basePrice: 1999,
    compareAtPrice: 2999,
    costPrice: 850,
    stock: 0,
    lowStockThreshold: 5,
    status: 'out_of_stock',
    isApproved: true,
    supplier: { companyName: 'PulseTech Wearables' },
    images: [{ url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60' }],
    rating: { average: 4.4, count: 210 },
  },
  {
    _id: '4',
    name: 'Stainless Steel Insulated Water Bottle (1L)',
    slug: 'stainless-steel-water-bottle',
    category: 'Lifestyle',
    basePrice: 799,
    compareAtPrice: 1199,
    costPrice: 300,
    stock: 120,
    lowStockThreshold: 15,
    status: 'active',
    isApproved: true,
    supplier: { companyName: 'EcoVibe Dropship' },
    images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60' }],
    rating: { average: 4.9, count: 350 },
  },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Electronics',
    basePrice: '',
    costPrice: '',
    stock: '',
    imageUrl: '',
    description: '',
  });

  const categories = ['All', 'Electronics', 'Furniture', 'Wearables', 'Lifestyle', 'Fashion'];

  // Fetch products from backend or fallback to demo
  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const res = await productService.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data);
        setIsBackendConnected(true);
      } else {
        setProducts(filterDemoProducts());
        setIsBackendConnected(false);
      }
    } catch (err) {
      setProducts(filterDemoProducts());
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const filterDemoProducts = () => {
    return DEMO_PRODUCTS.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProduct.name,
        category: newProduct.category,
        basePrice: Number(newProduct.basePrice),
        costPrice: Number(newProduct.costPrice),
        stock: Number(newProduct.stock),
        images: newProduct.imageUrl ? [{ url: newProduct.imageUrl }] : [],
        description: newProduct.description,
      };

      const res = await productService.createProduct(payload);
      if (res.success) {
        alert('Product added successfully!');
        setIsModalOpen(false);
        setNewProduct({
          name: '',
          category: 'Electronics',
          basePrice: '',
          costPrice: '',
          stock: '',
          imageUrl: '',
          description: '',
        });
        loadProducts();
      }
    } catch (err) {
      // Offline fallback push
      const demoItem = {
        _id: String(Date.now()),
        name: newProduct.name,
        category: newProduct.category,
        basePrice: Number(newProduct.basePrice),
        costPrice: Number(newProduct.costPrice),
        stock: Number(newProduct.stock),
        images: [{ url: newProduct.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' }],
        supplier: { companyName: 'Apex Electronics Supplies' },
        status: 'active',
      };
      setProducts([demoItem, ...products]);
      setIsModalOpen(false);
      alert('Product created in demo state!');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                PRODUCT MARKETPLACE
              </span>
              <span className="text-slate-400 text-xs">• Direct Supplier SKUs</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Browse Supplier Products & Catalog</h1>
            <p className="text-xs text-slate-400 mt-1">
              Connect verified manufacturer inventory to your dropshipping store with zero upfront stock risk.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Add Supplier Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="content-card p-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  (selectedCategory === cat || (!selectedCategory && cat === 'All'))
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search SKUs, products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="custom-input text-xs py-2 pl-9 pr-4 w-full"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-slate-300 font-bold mb-1">No products found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or selected category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const profitMargin = product.basePrice - (product.costPrice || 0);
            const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product._id}
                className="content-card p-0 overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition"
              >
                <div>
                  {/* Product Image */}
                  <div className="h-48 bg-slate-950 relative overflow-hidden">
                    {product.images && product.images[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-600 text-xs">No Image</div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isOutOfStock ? (
                        <span className="glass-badge bg-rose-500/20 text-rose-300 border-rose-500/30">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="glass-badge bg-amber-500/20 text-amber-300 border-amber-500/30">
                          Low Stock: {product.stock} left
                        </span>
                      ) : (
                        <span className="glass-badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          In Stock ({product.stock})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      {product.category || 'General'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 line-clamp-2 min-h-[40px] leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      By: {product.supplier?.companyName || 'Verified Supplier'}
                    </p>

                    {/* Price and Profit Breakdown */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Retail Base Price</span>
                        <span className="text-lg font-black text-white">₹{product.basePrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Retailer Profit</span>
                        <span className="text-xs font-bold text-emerald-400">+₹{profitMargin}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2">
                  <Link
                    href={`/products/${product._id}`}
                    className="btn-secondary flex-1 justify-center text-xs py-2"
                  >
                    View SKU Details
                  </Link>
                  <button
                    onClick={() => alert(`Imported "${product.name}" to your retail store!`)}
                    className="btn-primary py-2 px-3 text-xs"
                    title="Push product to Shopify/WooCommerce"
                  >
                    Push to Store
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Add New Supplier Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Office Chair"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="custom-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="custom-input text-xs"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="custom-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2499"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                    className="custom-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Wholesale Cost (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1200"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="custom-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="custom-input text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
