'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productService, getImageUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['All Categories', 'Electronics', 'Furniture', 'Wearables', 'Lifestyle', 'Fashion'];

export default function InventoryPage() {
  const router = useRouter();
  const { user, isSupplier, isAdmin, isAuthenticated, loginAsDemo, logout, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false); // false | 'add' | 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [toast, setToast] = useState(null);

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    basePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '10',
    description: '',
    imageUrl: '',
  });

  // Edit Product Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    basePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '10',
    status: 'active',
    description: '',
    imageUrl: '',
  });

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    if (!isSupplier && !isAdmin) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isSupplier) {
        // Multi-tenant: strictly load this supplier's own products
        res = await productService.getMyProducts({ all: 'true', limit: 100 });
      } else if (isAdmin) {
        // Admin: can inspect all platform inventory
        res = await productService.getProducts({ all: 'true', status: 'all', limit: 100 });
      }

      if (res && res.success && res.data) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user?._id, user?.id, isSupplier, isAdmin, authLoading]);

  // Handle Escape key to close open modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setEditingItem(null);
        setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick Stock Adjustment
  const handleStockChange = async (id, delta) => {
    setActionLoading(`stock-${id}`);
    try {
      await productService.updateStock(id, Math.abs(delta), delta > 0 ? 'add' : 'subtract');
      setItems((prev) =>
        prev.map((item) => {
          if (item._id === id) {
            const updatedStock = Math.max(0, (Number(item.stock) || 0) + delta);
            return {
              ...item,
              stock: updatedStock,
              status: updatedStock === 0 ? 'out_of_stock' : 'active',
            };
          }
          return item;
        })
      );
      showToast(`Stock updated (${delta > 0 ? '+' : ''}${delta} units)`);
    } catch (err) {
      showToast(`Failed to update stock: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (e, formType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, GIF)', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB', 'error');
      return;
    }

    setUploadingImage(formType);
    try {
      const res = await productService.uploadImage(file);
      if (res && res.success && res.url) {
        if (formType === 'add') {
          setAddFormData((prev) => ({ ...prev, imageUrl: res.url }));
        } else {
          setEditFormData((prev) => ({ ...prev, imageUrl: res.url }));
        }
        showToast('Product image uploaded successfully');
      } else {
        showToast(res?.message || 'Failed to upload image', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
      if (e?.target) {
        e.target.value = '';
      }
    }
  };

  // Create Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setActionLoading('add');

    const payload = {
      name: addFormData.name,
      sku: addFormData.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      category: addFormData.category,
      basePrice: Number(addFormData.basePrice) || 0,
      costPrice: Number(addFormData.costPrice) || 0,
      stock: Number(addFormData.stock) || 0,
      lowStockThreshold: Number(addFormData.lowStockThreshold) || 10,
      description: addFormData.description,
      imageUrl: addFormData.imageUrl || undefined,
      images: addFormData.imageUrl ? [{ url: addFormData.imageUrl, isPrimary: true, altText: addFormData.name }] : [],
      status: Number(addFormData.stock) === 0 ? 'out_of_stock' : 'active',
      isApproved: true,
    };

    try {
      const res = await productService.createProduct(payload);
      if (res.success && res.data) {
        setItems((prev) => [res.data, ...prev]);
        showToast(`Product "${payload.name}" saved to database`);
        setIsAddModalOpen(false);
        setAddFormData({
          name: '',
          sku: '',
          category: 'Electronics',
          basePrice: '',
          costPrice: '',
          stock: '',
          lowStockThreshold: '10',
          description: '',
          imageUrl: '',
        });
      } else {
        showToast(res.message || 'Failed to create product', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save product to database', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    const existingImg = (item.images && item.images[0]?.url) || item.imageUrl || '';
    setEditingItem(item);
    setEditFormData({
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || 'Electronics',
      basePrice: item.basePrice || '',
      costPrice: item.costPrice || '',
      stock: item.stock !== undefined ? item.stock : '',
      lowStockThreshold: item.lowStockThreshold || 10,
      status: item.status || 'active',
      description: item.description || '',
      imageUrl: existingImg,
    });
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setActionLoading('edit');

    const updatedData = {
      name: editFormData.name,
      sku: editFormData.sku,
      category: editFormData.category,
      basePrice: Number(editFormData.basePrice),
      costPrice: Number(editFormData.costPrice || 0),
      stock: Number(editFormData.stock),
      lowStockThreshold: Number(editFormData.lowStockThreshold || 10),
      status: Number(editFormData.stock) === 0 ? 'out_of_stock' : editFormData.status,
      description: editFormData.description,
      imageUrl: editFormData.imageUrl,
      images: editFormData.imageUrl ? [{ url: editFormData.imageUrl, isPrimary: true, altText: editFormData.name }] : [],
    };

    try {
      const res = await productService.updateProduct(editingItem._id, updatedData);
      if (res.success && res.data) {
        setItems((prev) =>
          prev.map((item) => (item._id === editingItem._id ? res.data : item))
        );
        showToast(`Product "${updatedData.name}" updated successfully`);
        setIsEditModalOpen(false);
        setEditingItem(null);
      } else {
        showToast(res.message || 'Failed to update product', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating product on server', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    setActionLoading(`delete-${id}`);
    try {
      const res = await productService.deleteProduct(id);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        showToast('Product removed from database catalog');
      } else {
        showToast(res.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting product from database', 'error');
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };


  // Filtering
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

    const matchesCategory =
      selectedCategory === 'All Categories' ? true : item.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Metrics
  const totalStockCount = items.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const lowStockCount = items.filter(
    (item) => item.stock <= (item.lowStockThreshold || 10) && item.stock > 0
  ).length;
  const outOfStockCount = items.filter((item) => Number(item.stock) === 0).length;
  const totalValuation = items.reduce(
    (acc, curr) => acc + (Number(curr.stock) || 0) * (Number(curr.costPrice) || Number(curr.basePrice) * 0.6),
    0
  );

  if (authLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Verifying supplier portal authorization...</p>
      </main>
    );
  }

  // Strict Supplier Access Guard - Unauthenticated
  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-indigo-500/5">
            🔒
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 inline-block">
            Authentication Required
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Supplier Portal Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
            Supplier Inventory Control and SKU warehouse operations are strictly restricted to verified Supplier accounts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 text-center"
            >
              Sign In to Supplier Account
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition text-center"
            >
              Browse Public Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Strict Supplier Access Guard - Retailer / User Account Forbidden
  if (!isSupplier && !isAdmin) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-rose-500/10">
            🚫
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-4 inline-block">
            Access Forbidden (403)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Supplier Pages Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-2">
            You cannot open supplier pages because your account is registered as a <strong className="text-amber-300 font-bold">{user?.role ? user.role.toUpperCase() : 'USER / RETAILER'}</strong>.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Supplier Inventory and SKU Management are restricted to Supplier accounts. Retailers can browse available products on the Marketplace and manage imported items in My Store.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 text-center"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/my-store"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition text-center"
            >
              Go to My Store
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 text-slate-400 font-semibold text-xs border border-slate-700 transition text-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-white shadow-2xl backdrop-blur-xl animate-fade-in">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Supplier Operations
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-slate-400 font-medium">SKU Warehouse Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Supplier Inventory Control
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time stock monitoring, SKU creation, cost margins, and fulfillment pause toggles.
            </p>
            {user && (
              <div className="mt-2.5 inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {isAdmin ? (
                    <>Admin Mode: <strong className="text-white">Viewing All Platform SKUs</strong></>
                  ) : (
                    <>Supplier Catalog: <strong className="text-white">{user.companyName || user.name}</strong> <span className="text-slate-400">({user.email})</span></>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-secondary text-xs flex items-center space-x-1.5"
              title="Refresh inventory from database"
            >
              <span>🔄</span>
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary shrink-0 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Total SKUs</p>
            <h2 className="text-2xl font-extrabold text-white">
              {items.length} <span className="text-base font-semibold text-slate-400">Products</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">{totalStockCount.toLocaleString()} total units on hand</p>
          </div>
          <div className="icon-box bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 ml-4">📦</div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Low Stock Alerts</p>
            <h2 className="text-2xl font-extrabold text-amber-400">
              {lowStockCount} <span className="text-base font-semibold text-slate-400">SKUs</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Below safety threshold</p>
          </div>
          <div className="icon-box bg-amber-500/10 border border-amber-500/20 text-amber-400 ml-4">⚠️</div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Out of Stock</p>
            <h2 className="text-2xl font-extrabold text-red-400">
              {outOfStockCount} <span className="text-base font-semibold text-slate-400">SKUs</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Fulfillment paused</p>
          </div>
          <div className="icon-box bg-red-500/10 border border-red-500/20 text-red-400 ml-4">🚫</div>
        </div>

        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Inventory Value</p>
            <h2 className="text-2xl font-extrabold text-emerald-400">
              ₹{Math.round(totalValuation).toLocaleString()}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Estimated warehouse capital</p>
          </div>
          <div className="icon-box bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 ml-4">💰</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by SKU or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input sm:w-44 text-xs font-semibold"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'active', label: 'Active' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`filter-pill ${selectedStatus === st.id ? 'active' : 'inactive'}`}
            >
              {st.label}
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
                <th>Product Details</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Pricing &amp; Margins</th>
                <th>Stock Units</th>
                <th>Status</th>
                <th className="text-center">Quick Stock Adjust</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-semibold text-slate-400">Loading live inventory catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-slate-200 font-bold text-base">No inventory items matched</p>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                      {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'All Categories'
                        ? 'Try clearing your search query or selecting a different category filter.'
                        : 'Your inventory list is currently empty. Click "Add New Product" to register your first SKU.'}
                    </p>
                    {(searchTerm || selectedStatus !== 'all' || selectedCategory !== 'All Categories') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('all');
                          setSelectedCategory('All Categories');
                        }}
                        className="mt-4 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const stockNum = Number(item.stock) || 0;
                  const threshold = Number(item.lowStockThreshold) || 10;
                  const isLow = stockNum <= threshold && stockNum > 0;
                  const isOut = stockNum === 0;

                  const cost = Number(item.costPrice) || 0;
                  const base = Number(item.basePrice) || 0;
                  const marginPercent = base > 0 && cost > 0 ? Math.round(((base - cost) / base) * 100) : null;

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition">
                      {/* Product Name */}
                      <td className="max-w-xs">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                            {item.images && item.images[0]?.url ? (
                              <img src={getImageUrl(item.images[0].url)} alt={item.name} className="w-full h-full object-cover" />
                            ) : item.imageUrl ? (
                              <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate" title={item.name}>
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td>
                        <span className="font-mono text-indigo-300 text-xs bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                          {item.sku || 'N/A'}
                        </span>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge badge-info">{item.category}</span>
                      </td>

                      {/* Price & Margin */}
                      <td>
                        <div className="space-y-0.5">
                          <div className="text-xs">
                            <span className="text-slate-400 font-medium">Cost: ₹{cost.toLocaleString()}</span>
                            <span className="text-slate-600 mx-1.5">/</span>
                            <span className="text-emerald-400 font-bold">Sell: ₹{base.toLocaleString()}</span>
                          </div>
                          {marginPercent !== null && (
                            <span className="inline-block text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                              {marginPercent}% Margin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-black text-sm ${
                                isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {stockNum}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">units</span>
                          </div>
                          <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (stockNum / (threshold * 3)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {isOut ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">Low Stock ({threshold} min)</span>
                        ) : (
                          <span className="badge badge-success">Active SKU</span>
                        )}
                      </td>

                      {/* Quick Stock Action Buttons */}
                      <td className="text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => handleStockChange(item._id, -5)}
                            disabled={actionLoading === `stock-${item._id}`}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition text-[11px] disabled:opacity-50"
                            title="Subtract 5 units"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleStockChange(item._id, -1)}
                            disabled={actionLoading === `stock-${item._id}`}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition text-[11px] disabled:opacity-50"
                            title="Subtract 1 unit"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleStockChange(item._id, 1)}
                            disabled={actionLoading === `stock-${item._id}`}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition text-[11px] disabled:opacity-50"
                            title="Add 1 unit"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleStockChange(item._id, 10)}
                            disabled={actionLoading === `stock-${item._id}`}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition text-[11px] shadow shadow-indigo-600/30 disabled:opacity-50"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 rounded-xl transition border border-slate-700/50 hover:border-indigo-500/30 text-xs"
                            title="Edit Product Details"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl transition border border-slate-700/50 hover:border-red-500/30 text-xs"
                            title="Delete SKU"
                          >
                            🗑️
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="modal-box">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Register Inventory SKU</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add a new product to your supplier catalog</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Title</label>
                <input
                  type="text"
                  required
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Ergonomic Bluetooth Mouse"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MSE-BT-09 (auto if empty)"
                    value={addFormData.sku}
                    onChange={(e) => setAddFormData({ ...addFormData, sku: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                    className="form-input"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Units</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={addFormData.stock}
                    onChange={(e) => setAddFormData({ ...addFormData, stock: e.target.value })}
                    className="form-input"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={addFormData.basePrice}
                    onChange={(e) => setAddFormData({ ...addFormData, basePrice: e.target.value })}
                    className="form-input"
                    placeholder="2499"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.costPrice}
                    onChange={(e) => setAddFormData({ ...addFormData, costPrice: e.target.value })}
                    className="form-input"
                    placeholder="1200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={addFormData.lowStockThreshold}
                  onChange={(e) => setAddFormData({ ...addFormData, lowStockThreshold: e.target.value })}
                  className="form-input"
                  placeholder="10"
                />
              </div>

              {/* Product Image Section */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>🖼️ Product Image</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Upload file or paste URL</span>
                </div>

                <div className="flex items-start gap-3">
                  {/* Thumbnail Preview */}
                  <label
                    htmlFor="add-product-image-upload"
                    className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer hover:border-indigo-500 transition"
                    title="Click to select image file"
                  >
                    {addFormData.imageUrl ? (
                      <>
                        <img
                          src={getImageUrl(addFormData.imageUrl)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div style={{ display: 'none' }} className="w-full h-full items-center justify-center text-[10px] text-slate-500 font-medium text-center p-1">
                          No Preview
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-400 transition">
                        <span className="text-xl">📷</span>
                        <span className="text-[9px] mt-0.5 font-medium">Browse</span>
                      </div>
                    )}
                  </label>

                  {/* Upload Controls & URL */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="add-product-image-upload"
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
                          uploadingImage === 'add'
                            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        <input
                          id="add-product-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'add')}
                          disabled={uploadingImage === 'add'}
                        />
                        {uploadingImage === 'add' ? (
                          <>
                            <div className="w-3 h-3 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading File...</span>
                          </>
                        ) : (
                          <>
                            <span>⬆️ Upload File</span>
                          </>
                        )}
                      </label>
                      {addFormData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setAddFormData({ ...addFormData, imageUrl: '' })}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs transition font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={addFormData.imageUrl}
                        onChange={(e) => setAddFormData({ ...addFormData, imageUrl: e.target.value })}
                        placeholder="Or paste image URL (https://...)"
                        className="form-input text-xs py-1.5 w-full font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Description</label>
                <textarea
                  rows="2"
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  className="form-input resize-none"
                  placeholder="Key features, specifications, and warranty info..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'add'}
                  className="btn-primary text-xs"
                >
                  {actionLoading === 'add' ? 'Saving SKU...' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingItem && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditModalOpen(false);
              setEditingItem(null);
            }
          }}
        >
          <div className="modal-box">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Edit Product SKU</h3>
                <p className="text-xs text-slate-400 mt-0.5">Update specifications and stock configuration</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={editFormData.sku}
                    onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="form-input"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stock Units</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editFormData.basePrice}
                    onChange={(e) => setEditFormData({ ...editFormData, basePrice: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.costPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, costPrice: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.lowStockThreshold}
                    onChange={(e) => setEditFormData({ ...editFormData, lowStockThreshold: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="draft">Draft / Hidden</option>
                  </select>
                </div>
              </div>

              {/* Product Image Section */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>🖼️ Product Image</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Upload file or paste URL</span>
                </div>

                <div className="flex items-start gap-3">
                  {/* Thumbnail Preview */}
                  <label
                    htmlFor="edit-product-image-upload"
                    className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer hover:border-indigo-500 transition"
                    title="Click to select image file"
                  >
                    {editFormData.imageUrl ? (
                      <>
                        <img
                          src={getImageUrl(editFormData.imageUrl)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div style={{ display: 'none' }} className="w-full h-full items-center justify-center text-[10px] text-slate-500 font-medium text-center p-1">
                          No Preview
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-400 transition">
                        <span className="text-xl">📷</span>
                        <span className="text-[9px] mt-0.5 font-medium">Browse</span>
                      </div>
                    )}
                  </label>

                  {/* Upload Controls & URL */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="edit-product-image-upload"
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
                          uploadingImage === 'edit'
                            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        <input
                          id="edit-product-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'edit')}
                          disabled={uploadingImage === 'edit'}
                        />
                        {uploadingImage === 'edit' ? (
                          <>
                            <div className="w-3 h-3 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading File...</span>
                          </>
                        ) : (
                          <>
                            <span>⬆️ Upload File</span>
                          </>
                        )}
                      </label>
                      {editFormData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, imageUrl: '' })}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs transition font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={editFormData.imageUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                        placeholder="Or paste image URL (https://...)"
                        className="form-input text-xs py-1.5 w-full font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows="2"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="form-input resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'edit'}
                  className="btn-primary text-xs"
                >
                  {actionLoading === 'edit' ? 'Updating SKU...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="modal-box max-w-md">
            <div className="text-center p-2">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-2xl mx-auto mb-4">
                🗑️
              </div>
              <h3 className="text-base font-bold text-white mb-2">Delete Product SKU?</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Are you sure you want to remove <span className="text-white font-bold">{deleteTarget.name}</span> ({deleteTarget.sku})? This will unpublish the SKU from the retailer marketplace.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="btn-secondary text-xs"
                >
                  Keep Product
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteTarget._id)}
                  disabled={actionLoading === `delete-${deleteTarget._id}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-red-600/30"
                >
                  {actionLoading === `delete-${deleteTarget._id}` ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
