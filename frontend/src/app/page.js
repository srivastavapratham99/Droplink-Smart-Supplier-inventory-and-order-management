'use client';

import { useState, useEffect } from 'react';
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

export default function Home() {
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
      }
    } catch (err) {
      setIsBackendConnected(false);
      let filtered = [...DEMO_PRODUCTS];
      if (search) {
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (selectedCategory && selectedCategory !== 'All') {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: newProduct.name,
      category: newProduct.category,
      basePrice: Number(newProduct.basePrice),
      costPrice: Number(newProduct.costPrice || 0),
      stock: Number(newProduct.stock),
      description: newProduct.description,
      images: newProduct.imageUrl ? [{ url: newProduct.imageUrl, isPrimary: true }] : [],
    };

    try {
      if (isBackendConnected) {
        await productService.createProduct(payload);
        loadProducts();
      } else {
        const localProduct = {
          _id: String(Date.now()),
          ...payload,
          status: 'active',
          isApproved: true,
          supplier: { companyName: 'Demo Supplier' },
          rating: { average: 5.0, count: 1 },
        };
        setProducts([localProduct, ...products]);
      }
      setIsModalOpen(false);
      setNewProduct({ name: '', category: 'Electronics', basePrice: '', costPrice: '', stock: '', imageUrl: '', description: '' });
    } catch (err) {
      alert('Error creating product: ' + err.message);
    }
  };

  const handleStockUpdate = async (id, delta) => {
    try {
      if (isBackendConnected) {
        await productService.updateStock(id, Math.abs(delta), delta > 0 ? 'add' : 'subtract');
        loadProducts();
      } else {
        setProducts(
          products.map((p) => {
            if (p._id === id) {
              const updatedStock = Math.max(0, p.stock + delta);
              return {
                ...p,
                stock: updatedStock,
                status: updatedStock === 0 ? 'out_of_stock' : 'active',
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      alert('Stock update failed: ' + err.message);
    }
  };

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0).length;
  const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0).length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Header Card - consistent style */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dropship Product Catalog</h1>
              <span className={`badge ${isBackendConnected ? 'badge-success' : 'badge-warning'}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isBackendConnected ? 'Live API' : 'Demo Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Discover high-margin verified products ready to import into your Shopify, WooCommerce, or custom storefronts.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4 mt-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-white">{totalProducts}</span>
                <span className="text-xs text-slate-400">Total Products</span>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-emerald-400">{inStockProducts}</span>
                <span className="text-xs text-slate-400">In Stock</span>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-amber-400">{lowStockProducts}</span>
                <span className="text-xs text-slate-400">Low Stock Alerts</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            List New Product
          </button>
        </div>
      </div>

      {/* Search & Filter Bar - consistent style */}
      <div className="filter-bar flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              className={`filter-pill ${
                (cat === 'All' && !selectedCategory) || selectedCategory === cat ? 'active' : 'inactive'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="skeleton h-44 rounded-xl mb-4"></div>
              <div className="skeleton h-4 rounded w-3/4 mb-2"></div>
              <div className="skeleton h-3 rounded w-1/2 mb-3"></div>
              <div className="skeleton h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 content-card">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-slate-300 font-semibold text-sm mb-1">No products found</p>
          <p className="text-slate-500 text-xs">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isLow = product.stock <= (product.lowStockThreshold || 10) && product.stock > 0;
            const isOut = product.stock === 0;
            const margin = product.costPrice > 0 ? product.basePrice - product.costPrice : null;

            return (
              <div
                key={product._id}
                className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 bg-slate-800 overflow-hidden">
                    {product.images && product.images[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-xs bg-gradient-to-br from-slate-800 to-slate-900">
                        <span className="text-3xl">📦</span>
                      </div>
                    )}

                    {/* Badges overlay */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-300 border border-slate-700/60">
                        {product.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      {isOut ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : isLow ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-[11px] font-medium text-slate-500 mb-1">{product.supplier?.companyName || 'Supplier Direct'}</p>
                    <a
                      href={`/products/${product._id}`}
                      className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3 group-hover:text-indigo-400 transition-colors block"
                    >
                      {product.name}
                    </a>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-extrabold text-indigo-400">₹{product.basePrice.toLocaleString()}</span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-slate-500 line-through">₹{product.compareAtPrice.toLocaleString()}</span>
                      )}
                    </div>

                    {margin !== null && (
                      <div className="flex items-center gap-1.5 text-[11px] bg-emerald-500/8 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/15 w-fit">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                        ₹{margin.toLocaleString()} margin
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Controls Footer */}
                <div className="px-4 pb-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Stock</span>
                    <span className={`font-bold text-xs ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}`}>{product.stock} units</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStockUpdate(product._id, -1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center font-bold text-sm transition"
                    >−</button>
                    <button
                      onClick={() => handleStockUpdate(product._id, 1)}
                      className="w-7 h-7 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm transition"
                    >+</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-white">List New Product</h2>
                <p className="text-xs text-slate-400 mt-0.5">Add to your dropship catalog</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition text-lg"
              >✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Title</label>
                <input
                  type="text" required
                  placeholder="e.g. Ergonomic Wireless Keyboard"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="form-input"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Stock</label>
                  <input type="number" required min="0" placeholder="50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selling Price (₹)</label>
                  <input type="number" required min="0" placeholder="2499"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Supplier Cost (₹)</label>
                  <input type="number" min="0" placeholder="1200"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Image URL</label>
                <input type="url" placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
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
