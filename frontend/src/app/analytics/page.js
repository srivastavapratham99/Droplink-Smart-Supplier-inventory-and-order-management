'use client';

export default function AnalyticsPage() {
  const metrics = [
    { title: 'Total Revenue', value: '₹1,48,920', change: '+18.4%', isPos: true, subtitle: 'Vs last 30 days', icon: '💰', color: 'emerald' },
    { title: 'Gross Profit Margin', value: '48.2%', change: '+3.1%', isPos: true, subtitle: 'Average across SKUs', icon: '📈', color: 'indigo' },
    { title: 'Orders Fulfilled', value: '342', change: '+12%', isPos: true, subtitle: '99.4% SLA rate', icon: '📦', color: 'blue' },
    { title: 'Inventory Valuation', value: '₹6,40,000', change: '173 SKUs', isPos: true, subtitle: 'Across 3 warehouses', icon: '🏭', color: 'violet' },
  ];

  const topProducts = [
    { name: 'Wireless Noise-Canceling Earbuds Pro', sales: 124, revenue: '₹3,09,876', margin: '52%', marginVal: 52 },
    { name: 'Stainless Steel Insulated Water Bottle', sales: 350, revenue: '₹2,79,650', margin: '62%', marginVal: 62 },
    { name: 'Ergonomic Mesh Office Chair', sales: 89, revenue: '₹8,00,911', margin: '49%', marginVal: 49 },
    { name: 'Smart Fitness Tracker Watch', sales: 210, revenue: '₹4,19,790', margin: '57%', marginVal: 57 },
  ];

  const weeklyRevenue = [
    { day: 'Mon', amount: 18200 },
    { day: 'Tue', amount: 24500 },
    { day: 'Wed', amount: 19800 },
    { day: 'Thu', amount: 32100 },
    { day: 'Fri', amount: 28700 },
    { day: 'Sat', amount: 15400 },
    { day: 'Sun', amount: 10220 },
  ];
  const maxRevenue = Math.max(...weeklyRevenue.map(d => d.amount));

  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'bg-emerald-500/10 border-emerald-500/20' },
    indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400',  icon: 'bg-indigo-500/10 border-indigo-500/20' },
    blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    icon: 'bg-blue-500/10 border-blue-500/20' },
    violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  icon: 'bg-violet-500/10 border-violet-500/20' },
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header - consistent with all pages */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Supplier Performance &amp; Analytics
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Revenue breakdown, product sales velocity, and profit margins across all SKUs
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards - consistent stat-card style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {metrics.map((m, idx) => {
          const c = colorMap[m.color];
          return (
            <div key={idx} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.title}</span>
                <div className={`icon-box ${c.icon} border`} style={{fontSize: '16px'}}>{m.icon}</div>
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

      {/* Charts + Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Revenue Bar Chart */}
        <div className="content-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Revenue</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Current week performance</p>
            </div>
            <span className="badge badge-success">+18.4%</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-36">
            {weeklyRevenue.map((d, i) => {
              const pct = (d.amount / maxRevenue) * 100;
              const isMax = d.amount === maxRevenue;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] text-slate-500 font-medium">
                    {d.amount >= 1000 ? `${(d.amount/1000).toFixed(0)}k` : d.amount}
                  </span>
                  <div className="w-full rounded-t-md relative" style={{ height: '96px', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${isMax ? 'bg-indigo-500' : 'bg-indigo-500/40'}`}
                      style={{ height: `${pct}%`, minHeight: '4px' }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Total this week</span>
              <span className="text-white font-bold">₹{weeklyRevenue.reduce((a,d) => a + d.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Performing Products Table */}
        <div className="lg:col-span-2 content-card">
          <div className="p-5 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-white">Top Performing Dropship Products</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Ranked by total revenue generated</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Units Sold</th>
                  <th>Total Revenue</th>
                  <th>Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td className="text-slate-600 font-bold text-base">{idx + 1}</td>
                    <td className="font-semibold text-white max-w-xs">
                      <span className="line-clamp-1">{p.name}</span>
                    </td>
                    <td className="text-slate-300">{p.sales.toLocaleString()} <span className="text-slate-500">units</span></td>
                    <td className="font-bold text-indigo-400">{p.revenue}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-16">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${p.marginVal}%` }}
                          ></div>
                        </div>
                        <span className="badge badge-success text-[10px]">{p.margin}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Connected Retailer Stores Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="content-card p-6">
          <h3 className="text-sm font-bold text-white mb-1">Connected Retailer Stores</h3>
          <p className="text-xs text-slate-400 mb-5">Active stores syncing inventory from your catalog</p>

          <div className="space-y-3">
            {[
              { name: 'UrbanTech Shopify', products: 14, revenue: '₹3,09,876', status: 'Synced' },
              { name: 'FitPulse Direct', products: 8, revenue: '₹1,94,200', status: 'Synced' },
              { name: 'EcoVibe Store', products: 22, revenue: '₹2,79,650', status: 'Synced' },
            ].map((store, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 hover:border-indigo-500/20 transition">
                <div>
                  <p className="font-semibold text-white text-xs">{store.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{store.products} products · {store.revenue}</p>
                </div>
                <span className="badge badge-success">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {store.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Margin Breakdown */}
        <div className="content-card p-6">
          <h3 className="text-sm font-bold text-white mb-1">Category Margin Breakdown</h3>
          <p className="text-xs text-slate-400 mb-5">Average profit margin by product category</p>

          <div className="space-y-4">
            {[
              { cat: 'Electronics', margin: 52, color: 'bg-indigo-500' },
              { cat: 'Lifestyle', margin: 62, color: 'bg-emerald-500' },
              { cat: 'Furniture', margin: 49, color: 'bg-amber-500' },
              { cat: 'Wearables', margin: 57, color: 'bg-violet-500' },
            ].map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">{c.cat}</span>
                  <span className="text-slate-400 font-bold">{c.margin}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.margin}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="content-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-5">Export and reporting tools</p>

            <div className="space-y-3">
              <button className="w-full btn-primary justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Monthly Report (CSV)
              </button>
              <button className="w-full btn-secondary justify-center" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Full Report
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/60">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Data Freshness</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-slate-300 font-medium">Updated live every 60 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
