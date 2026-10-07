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
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Supplier Inventory Control</h1>
          <p className="text-xs text-slate-400">Real-time stock monitoring & product catalog management</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center w-fit"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Product
        </button>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1 font-medium">Total Products</p>
            <h2 className="text-2xl font-bold text-white">{items.length} SKUs</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{totalStockCount} total units in stock</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
            📦
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1 font-medium">Low Stock Alerts</p>
            <h2 className="text-2xl font-bold text-amber-400">{lowStockCount} Items</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Below threshold limit</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
            ⚠️
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1 font-medium">Out of Stock</p>
            <h2 className="text-2xl font-bold text-red-400">{outOfStockCount} Items</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Fulfillment paused</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
            🚫
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search by Product Name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex items-center space-x-2">
          {['all', 'active', 'low_stock', 'out_of_stock'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-4 py-4">SKU</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Price (Cost / Selling)</th>
                <th className="px-4 py-4">Stock Level</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Quick Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No matching inventory items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stock <= (item.lowStockThreshold || 10) && item.stock > 0;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                      <td className="px-4 py-4 font-mono text-slate-400">{item.sku || 'N/A'}</td>
                      <td className="px-4 py-4">{item.category}</td>
                      <td className="px-4 py-4">
                        <span className="text-slate-400">₹{item.costPrice || 0}</span> /{' '}
                        <span className="text-indigo-400 font-bold">₹{item.basePrice}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-bold ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleStockChange(item._id, -5)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition text-[11px]"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleStockChange(item._id, -1)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition text-[11px]"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleStockChange(item._id, 1)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition text-[11px]"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleStockChange(item._id, 10)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition text-[11px]"
                          >
                            +10
                          </button>
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Register Inventory SKU</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ELE-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
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
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
                >
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
