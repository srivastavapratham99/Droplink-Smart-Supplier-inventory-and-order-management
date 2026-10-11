'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/lib/api';

export default function MyStorePage() {
  const router = useRouter();
  const { user, isUser, isAuthenticated, logout, loginAsDemo, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const loadStoreProducts = async () => {
    if (!isUser) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await productService.getProducts({ all: 'true', limit: 50 });
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreProducts();
  }, []);

  const handleForceSync = () => {
    setSyncStatusMsg('Syncing catalog inventory with e-commerce channels...');
    setTimeout(() => {
      loadStoreProducts();
      setSyncStatusMsg('✓ Store channel catalog up-to-date with supplier database');
      setTimeout(() => setSyncStatusMsg(''), 3500);
    }, 800);
  };

  // Compute live metrics from database products
  const totalProductsCount = products.length;
  const avgMargin =
    products.length > 0
      ? Math.round(
          products.reduce((acc, p) => {
            const cost = Number(p.costPrice) || 0;
            const sell = Number(p.basePrice) || 0;
            return acc + (sell > 0 ? ((sell - cost) / sell) * 100 : 0);
          }, 0) / products.length
        )
      : 0;

  const totalEstimatedProfit = products.reduce((acc, p) => {
    const cost = Number(p.costPrice) || 0;
    const sell = Number(p.basePrice) || 0;
    return acc + Math.max(0, sell - cost);
  }, 0);

  if (authLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Verifying retailer store authorization...</p>
      </main>
    );
  }

  // Strict Retailer Access Guard - Unauthenticated
  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-emerald-500/5">
            🔒
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 inline-block">
            Authentication Required
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Retailer Store Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
            Store sync and e-commerce channel integration are exclusively available for registered Retailer accounts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 text-center"
            >
              Sign In to Retailer Account
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

  // Strict Retailer Access Guard - Non-Retailer Forbidden
  if (!isUser) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-amber-500/10">
            ⚠️
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4 inline-block">
            Access Restricted (403)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Retailer Store Hub Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-2">
            You cannot open retailer store pages because your account is registered as a <strong className="text-indigo-300 font-bold">{user?.role ? user.role.toUpperCase() : 'SUPPLIER'}</strong>.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Store sync is reserved for retailers connecting storefronts. As a Supplier, you can manage your warehouse inventory and list wholesale SKUs in My Inventory.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/inventory"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 text-center"
            >
              Go to My Inventory
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition text-center"
            >
              View Marketplace
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
      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-between text-xs font-semibold">
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase">
                Retailer Store Hub
              </span>
              <span className="text-slate-400 text-xs">• Connected Channel: {user?.storePlatform || 'Shopify'}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user?.storeName || 'TrendStore Retail Hub'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage synced products from the live supplier database with zero inventory risk.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/marketplace" className="btn-primary text-xs flex items-center gap-1.5">
              <span>+</span> Browse Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Retail Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Catalog Products
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalProductsCount} Products</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Database
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Sourced directly from verified suppliers</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Estimated Retail Margin
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">
              ₹{totalEstimatedProfit.toLocaleString()} Avg. Unit Profit
            </span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {avgMargin}% Avg Margin
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">After supplier wholesale costs</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Fulfillment Channel
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">Direct Dropship</span>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Automated
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Supplier ships directly to your buyer</p>
        </div>
      </div>

      {/* Imported Products List */}
      <div className="content-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Products Synced from Database</h2>
            <p className="text-xs text-slate-400">
              Live wholesale costs, selling prices, and supplier stock levels from MongoDB
            </p>
          </div>
          <button onClick={handleForceSync} className="btn-secondary text-xs flex items-center gap-1.5">
            <span>🔄</span> Force Refresh Sync
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-slate-400">Loading store products from database...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-800">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-slate-200 font-bold text-base">No products synced to your store yet</p>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto mb-4">
              Browse the wholesale catalog to import products directly into your e-commerce channels.
            </p>
            <Link href="/marketplace" className="btn-primary text-xs">
              Explore Wholesale Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => {
              const cost = Number(item.costPrice) || 0;
              const sell = Number(item.basePrice) || 0;
              const margin = Math.max(0, sell - cost);
              const marginPercent = sell > 0 ? Math.round((margin / sell) * 100) : 0;
              const supplierName = item.supplier?.companyName || item.supplier?.name || 'Verified Supplier';
              const imageUrl =
                item.images && item.images[0]?.url
                  ? item.images[0].url
                  : 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80';

              return (
                <div
                  key={item._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="h-44 bg-slate-950 relative overflow-hidden">
                      <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        {item.status === 'out_of_stock' ? 'Out of Stock' : 'Synced'}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Supplier: {supplierName}
                      </div>
                      <h3 className="text-sm font-bold text-white mb-3 line-clamp-1" title={item.name}>
                        {item.name}
                      </h3>

                      <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Wholesale Cost:</span>
                          <span className="font-semibold text-slate-300">₹{cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Retail Price:</span>
                          <span className="font-bold text-indigo-400">₹{sell.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1.5">
                          <span className="text-emerald-400 font-medium">Your Profit / Sale:</span>
                          <span className="font-extrabold text-emerald-400">
                            +₹{margin.toLocaleString()} ({marginPercent}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Stock: <strong className="text-white">{item.stock || 0} units</strong>
                    </span>
                    <Link
                      href={`/products/${item._id}`}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
