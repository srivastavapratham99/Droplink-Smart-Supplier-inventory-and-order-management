'use client';

export default function AnalyticsPage() {
  const metrics = [
    { title: 'Total Revenue', value: '₹1,48,920', change: '+18.4%', isPos: true, subtitle: 'Vs last 30 days' },
    { title: 'Gross Profit Margin', value: '48.2%', change: '+3.1%', isPos: true, subtitle: 'Average across SKUs' },
    { title: 'Orders Fulfilled', value: '342', change: '+12%', isPos: true, subtitle: '99.4% SLA rate' },
    { title: 'Inventory Valuation', value: '₹6,40,000', change: '173 SKUs', isPos: true, subtitle: 'Across 3 warehouses' },
  ];

  const topProducts = [
    { name: 'Wireless Noise-Canceling Earbuds Pro', sales: 124, revenue: '₹3,09,876', margin: '52%' },
    { name: 'Stainless Steel Insulated Water Bottle', sales: 350, revenue: '₹2,79,650', margin: '62%' },
    { name: 'Ergonomic Mesh Office Chair', sales: 89, revenue: '₹8,00,911', margin: '49%' },
    { name: 'Smart Fitness Tracker Watch', sales: 210, revenue: '₹4,19,790', margin: '57%' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Supplier Performance & Analytics</h1>
        <p className="text-xs text-slate-400">Revenue breakdown, product sales velocity, and profit margins</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 block mb-2">{m.title}</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-extrabold text-white">{m.value}</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${m.isPos ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400'}`}>
                {m.change}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">{m.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Analytics Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Products Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Top Performing Dropship Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Units Sold</th>
                  <th className="px-4 py-3">Total Revenue</th>
                  <th className="px-4 py-3">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                    <td className="px-4 py-3 text-slate-300">{p.sales} units</td>
                    <td className="px-4 py-3 font-bold text-indigo-400">{p.revenue}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {p.margin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Connection Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2">Connected Retailer Stores</h3>
            <p className="text-xs text-slate-400 mb-6">Active stores syncing inventory from your catalog</p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <div>
                  <p className="font-semibold text-white">UrbanTech Shopify</p>
                  <p className="text-[10px] text-slate-400">14 Active Products</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">Synced</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <div>
                  <p className="font-semibold text-white">FitPulse Direct</p>
                  <p className="text-[10px] text-slate-400">8 Active Products</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">Synced</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <div>
                  <p className="font-semibold text-white">EcoVibe Store</p>
                  <p className="text-[10px] text-slate-400">22 Active Products</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">Synced</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6">
            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow">
              Export Monthly Report (CSV)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
