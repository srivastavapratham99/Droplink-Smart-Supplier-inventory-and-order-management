'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/lib/api';

export default function AnalyticsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);
      try {
        const res = await productService.getProducts({ all: 'true', limit: 100 });
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
    }
    loadAnalyticsData();
  }, []);

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
