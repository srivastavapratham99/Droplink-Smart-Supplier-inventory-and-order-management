'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/lib/api';

const MOCK_INVENTORY = [
  {
    _id: '1',
    name: 'Wireless Noise-Canceling Earbuds Pro',
    sku: 'EAR-PRO-01',
    category: 'Electronics',
    basePrice: 2499,
    costPrice: 1200,
    stock: 45,
    lowStockThreshold: 10,
    status: 'active',
    isApproved: true,
  },
  {
    _id: '2',
    name: 'Ergonomic Mesh Office Chair',
    sku: 'CHR-MESH-02',
    category: 'Furniture',
    basePrice: 8999,
    costPrice: 4500,
    stock: 8,
    lowStockThreshold: 10,
    status: 'active',
    isApproved: true,
  },
  {
    _id: '3',
    name: 'Smart Fitness Tracker Watch',
    sku: 'WTC-FIT-03',
    category: 'Wearables',
    basePrice: 1999,
    costPrice: 850,
    stock: 0,
    lowStockThreshold: 5,
    status: 'out_of_stock',
    isApproved: true,
  },
  {
    _id: '4',
    name: 'Stainless Steel Insulated Water Bottle (1L)',
    sku: 'BTL-STL-04',
    category: 'Lifestyle',
    basePrice: 799,
    costPrice: 300,
    stock: 120,
    lowStockThreshold: 15,
    status: 'active',
    isApproved: true,
  },
];

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    basePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '10',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      setItems(MOCK_INVENTORY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockChange = async (id, delta) => {
    try {
      await productService.updateStock(id, Math.abs(delta), delta > 0 ? 'add' : 'subtract');
      loadData();
    } catch (err) {
      setItems((prev) =>
        prev.map((item) => {
          if (item._id === id) {
            const updatedStock = Math.max(0, item.stock + delta);
            return {
              ...item,
              stock: updatedStock,
              status: updatedStock === 0 ? 'out_of_stock' : 'active',
            };
          }
          return item;
        })
      );
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      sku: formData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      category: formData.category,
      basePrice: Number(formData.basePrice),
      costPrice: Number(formData.costPrice || 0),
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold || 10),
      description: formData.description,
      status: 'active',
      isApproved: true,
    };

    try {
      await productService.createProduct(payload);
      loadData();
    } catch (err) {
      const newEntry = { _id: String(Date.now()), ...payload };
      setItems([newEntry, ...items]);
    }
    setIsModalOpen(false);
    setFormData({ name: '', sku: '', category: 'Electronics', basePrice: '', costPrice: '', stock: '', lowStockThreshold: '10', description: '' });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'low_stock'
        ? item.stock <= (item.lowStockThreshold || 10) && item.stock > 0
        : item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalStockCount = items.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const lowStockCount = items.filter((item) => item.stock <= (item.lowStockThreshold || 10) && item.stock > 0).length;
  const outOfStockCount = items.filter((item) => item.stock === 0).length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header - consistent with all pages */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Supplier Inventory Control
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time stock monitoring &amp; product catalog management across all SKUs
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </button>
        </div>
      </div>

      {/* Stat Cards - consistent style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Total Products</p>
            <h2 className="text-2xl font-extrabold text-white">{items.length} <span className="text-base font-semibold text-slate-400">SKUs</span></h2>
            <p className="text-[11px] text-slate-500 mt-1">{totalStockCount.toLocaleString()} total units in stock</p>
          </div>
          <div className="icon-box bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 ml-4">📦</div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Low Stock Alerts</p>
            <h2 className="text-2xl font-extrabold text-amber-400">{lowStockCount} <span className="text-base font-semibold text-slate-400">Items</span></h2>
            <p className="text-[11px] text-slate-500 mt-1">Below threshold limit</p>
          </div>
          <div className="icon-box bg-amber-500/10 border border-amber-500/20 text-amber-400 ml-4">⚠️</div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Out of Stock</p>
            <h2 className="text-2xl font-extrabold text-red-400">{outOfStockCount} <span className="text-base font-semibold text-slate-400">Items</span></h2>
            <p className="text-[11px] text-slate-500 mt-1">Fulfillment paused</p>
          </div>
          <div className="icon-box bg-red-500/10 border border-red-500/20 text-red-400 ml-4">🚫</div>
        </div>
      </div>

      {/* Filter Bar - consistent style */}
      <div className="filter-bar flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'active', 'low_stock', 'out_of_stock'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`filter-pill ${selectedStatus === st ? 'active' : 'inactive'}`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="content-card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price (Cost / Selling)</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th className="text-right">Quick Stock Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading inventory data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-slate-300 font-semibold text-sm">No items found</p>
                    <p className="text-slate-500 text-xs mt-1">Try adjusting your search or filter</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stock <= (item.lowStockThreshold || 10) && item.stock > 0;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item._id}>
                      <td className="font-semibold text-white">{item.name}</td>
                      <td className="font-mono text-slate-400 text-[11px]">{item.sku || 'N/A'}</td>
                      <td>
                        <span className="badge badge-info">{item.category}</span>
                      </td>
                      <td>
                        <span className="text-slate-400">₹{(item.costPrice || 0).toLocaleString()}</span>
                        <span className="text-slate-600 mx-1">/</span>
                        <span className="text-indigo-400 font-bold">₹{item.basePrice.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={`font-bold text-sm ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.stock} <span className="text-xs font-normal text-slate-500">units</span>
                        </span>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStockChange(item._id, -5)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition text-[11px] border border-slate-700/50"
                          >-5</button>
                          <button
                            onClick={() => handleStockChange(item._id, -1)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition text-[11px] border border-slate-700/50"
                          >-1</button>
                          <button
                            onClick={() => handleStockChange(item._id, 1)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition text-[11px] border border-slate-700/50"
                          >+1</button>
                          <button
                            onClick={() => handleStockChange(item._id, 10)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition text-[11px] shadow shadow-indigo-600/20"
                          >+10</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Register Inventory SKU</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add a new product to your catalog</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition text-lg"
              >✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Title</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input" placeholder="e.g. Wireless Keyboard Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">SKU Code</label>
                  <input type="text" placeholder="e.g. ELE-001" value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stock Units</label>
                  <input type="number" required min="0" value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="form-input" placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selling (₹)</label>
                  <input type="number" required min="0" value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="form-input" placeholder="2499"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cost (₹)</label>
                  <input type="number" min="0" value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="form-input" placeholder="1200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
