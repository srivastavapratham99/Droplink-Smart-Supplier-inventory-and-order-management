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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dropship Product Catalog</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isBackendConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isBackendConnected ? 'Live API' : 'Demo Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Discover high-margin verified products ready to import into your Shopify, WooCommerce, or custom storefronts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>List New Product</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                (cat === 'All' && !selectedCategory) || selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
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
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-pulse">
              <div className="h-44 bg-slate-800 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">No products match your filter options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isLow = product.stock <= (product.lowStockThreshold || 10) && product.stock > 0;
            const isOut = product.stock === 0;

            return (
              <div
                key={product._id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition duration-200 overflow-hidden flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-48 bg-slate-800 overflow-hidden">
                    {product.images && product.images[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-xs">No Image Available</div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur rounded-lg text-[10px] font-bold text-slate-300 border border-slate-700">
                        {product.category}
                      </span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isOut ? (
                        <span className="px-2.5 py-1 bg-red-500/90 text-white rounded-lg text-[10px] font-bold shadow">Out of Stock</span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 bg-amber-500/90 text-white rounded-lg text-[10px] font-bold shadow">Low Stock</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/90 text-white rounded-lg text-[10px] font-bold shadow">In Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] font-medium text-slate-400 mb-1">{product.supplier?.companyName || 'Supplier Direct'}</p>
                    <a
                      href={`/products/${product._id}`}
                      className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-indigo-400 transition block"
                    >
                      {product.name}
                    </a>

                    <div className="flex items-baseline space-x-2 my-2">
                      <span className="text-lg font-bold text-indigo-400">₹{product.basePrice}</span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-slate-500 line-through">₹{product.compareAtPrice}</span>
                      )}
                    </div>

                    {product.costPrice > 0 && (
                      <div className="text-[11px] text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg inline-block border border-slate-800/80">
                        Profit Margin: <span className="text-emerald-400 font-bold">₹{product.basePrice - product.costPrice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stock Controls Footer */}
                <div className="p-4 pt-0 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Supplier Stock</span>
                    <span className="font-bold text-white text-xs">{product.stock} units</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleStockUpdate(product._id, -1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center font-bold text-xs transition"
                      title="Decrease Stock"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleStockUpdate(product._id, 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center font-bold text-xs transition"
                      title="Increase Stock"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-white">Add Product to Dropship Catalog</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Keyboard"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="50"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="2499"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1200"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
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
