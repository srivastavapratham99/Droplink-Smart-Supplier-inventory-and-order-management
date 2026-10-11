'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isSupplier, isAdmin, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalyticsData() {
      if (authLoading) return;
      if (!isSupplier && !isAdmin) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let res;
        if (isSupplier) {
          res = await productService.getMyProducts({ all: 'true', limit: 100 });
        } else {
          res = await productService.getProducts({ all: 'true', limit: 100 });
        }

        if (res && res.success && res.data) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadAnalyticsData();
  }, [user?._id, user?.id, isSupplier, isAdmin, authLoading]);

  const totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalValuation = products.reduce(
    (acc, p) => acc + (Number(p.stock) || 0) * (Number(p.costPrice) || Number(p.basePrice) * 0.5),
    0
  );

  const avgMargin =
    products.length > 0
      ? Math.round(
          products.reduce((acc, p) => {
            const cost = Number(p.costPrice) || 0;
            const base = Number(p.basePrice) || 0;
            return acc + (base > 0 && cost > 0 ? ((base - cost) / base) * 100 : 45);
          }, 0) / products.length
        )
      : 0;

  const lowStockCount = products.filter(
    (p) => (Number(p.stock) || 0) <= (Number(p.lowStockThreshold) || 10) && (Number(p.stock) || 0) > 0
  ).length;

  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) === 0).length;

  const metrics = [
    {
      title: 'Warehouse Capital',
      value: `₹${Math.round(totalValuation).toLocaleString()}`,
      change: `${totalStock.toLocaleString()} units`,
      isPos: true,
      subtitle: 'Live stock inventory valuation',
      icon: '💰',
      color: 'emerald',
    },
    {
      title: 'Avg Gross Margin',
      value: `${avgMargin}%`,
      change: 'Catalog Average',
      isPos: true,
      subtitle: 'Wholesale vs retail spread',
      icon: '📈',
      color: 'indigo',
    },
    {
      title: 'Active SKUs in DB',
      value: `${products.length} SKUs`,
      change: `${products.filter((p) => p.status === 'active').length} Active`,
      isPos: true,
      subtitle: 'Verified database listings',
      icon: '📦',
      color: 'blue',
    },
    {
      title: 'Fulfillment Risk',
      value: `${outOfStockCount} Out`,
      change: `${lowStockCount} Low Stock`,
      isPos: outOfStockCount === 0,
      subtitle: 'SKUs needing replenishment',
      icon: '⚠️',
      color: 'violet',
    },
  ];

  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'bg-emerald-500/10 border-emerald-500/20' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', icon: 'bg-indigo-500/10 border-indigo-500/20' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/10 border-blue-500/20' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', icon: 'bg-violet-500/10 border-violet-500/20' },
  };

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
            Supplier Analytics Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
            Supplier Performance and Warehouse SKU Analytics are exclusively reserved for verified Supplier accounts.
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
            Supplier Performance and Warehouse SKU Analytics are restricted to Supplier accounts. Retailers can view their imported listings and shop performance in My Store.
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
      {/* Page Header */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Supplier Performance &amp; Analytics
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live database metrics, SKU margins, and inventory distribution from MongoDB
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {metrics.map((m, idx) => {
          const c = colorMap[m.color];
          return (
            <div key={idx} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.title}</span>
                <div className={`icon-box ${c.icon} border`} style={{ fontSize: '16px' }}>
                  {m.icon}
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-extrabold text-white">{m.value}</h2>
                <span className={`badge ${m.isPos ? 'badge-success' : 'badge-danger'}`}>{m.change}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">{m.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Database SKUs Performance Breakdown */}
      <div className="content-card p-6">
        <h2 className="text-base font-bold text-white mb-1">Live Database SKU Performance</h2>
        <p className="text-xs text-slate-400 mb-6">Real-time inventory levels, wholesale costs, and retail spreads</p>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Computing live metrics...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="font-semibold text-slate-300">No products found in database</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product SKU &amp; Name</th>
                  <th>Category</th>
                  <th>Wholesale Cost</th>
                  <th>Retail Price</th>
                  <th>Stock on Hand</th>
                  <th>Margin Spread</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cost = Number(p.costPrice) || 0;
                  const base = Number(p.basePrice) || 0;
                  const marginSpread = base > 0 && cost > 0 ? Math.round(((base - cost) / base) * 100) : 0;

                  return (
                    <tr key={p._id}>
                      <td className="font-semibold text-white">
                        <div>
                          <div>{p.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">{p.sku || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{p.category}</span>
                      </td>
                      <td className="text-slate-300">₹{cost.toLocaleString()}</td>
                      <td className="font-bold text-indigo-400">₹{base.toLocaleString()}</td>
                      <td>
                        <span
                          className={`font-bold text-xs ${
                            p.stock === 0 ? 'text-red-400' : p.stock <= 10 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td>
                        <span className="text-emerald-400 font-bold text-xs">{marginSpread}%</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === 'out_of_stock'
                              ? 'badge-danger'
                              : p.stock <= 10
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {p.status === 'out_of_stock' ? 'Out of Stock' : p.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
