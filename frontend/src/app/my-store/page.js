'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const IMPORTED_PRODUCTS = [
  {
    id: 'imp-1',
    name: 'Wireless Noise-Canceling Earbuds Pro',
    sku: 'EAR-PRO-01',
    supplier: 'Apex Wholesale Ltd.',
    supplierCost: 1200,
    retailPrice: 2499,
    margin: 1299,
    syncedStore: 'Shopify (TrendStore)',
    stockAvailable: 45,
    status: 'Synced',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'imp-2',
    name: 'Ultra-Slim Mechanical Keyboard RGB',
    sku: 'KB-MECH-02',
    supplier: 'Apex Wholesale Ltd.',
    supplierCost: 1850,
    retailPrice: 3499,
    margin: 1649,
    syncedStore: 'Shopify (TrendStore)',
    stockAvailable: 28,
    status: 'Synced',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'imp-3',
    name: 'Ergonomic Executive Mesh Chair',
    sku: 'CHAIR-ERG-09',
    supplier: 'Vanguard Logistics & Tech',
    supplierCost: 4200,
    retailPrice: 7999,
    margin: 3799,
    syncedStore: 'WooCommerce Store',
    stockAvailable: 12,
    status: 'Sync Pending',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=400&auto=format&fit=crop&q=80',
  },
];

export default function MyStorePage() {
  const { user, isUser, loginAsDemo } = useAuth();
  const [products, setProducts] = useState(IMPORTED_PRODUCTS);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Notice if viewing in non-user mode */}
      {!isUser && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🛍️</span>
            <div>
              <p className="text-xs font-bold">Preview Mode: Retailer / User View</p>
              <p className="text-[11px] text-emerald-300/80">Switch to User / Retailer account to test store integrations.</p>
            </div>
          </div>
          <button
            onClick={() => loginAsDemo('user')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
          >
            Switch to Retailer User
          </button>
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
              <span className="text-slate-400 text-xs">• Connected to {user?.storePlatform || 'Shopify'}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{user?.storeName || 'TrendStore Retail Hub'}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Import products directly from verified suppliers & auto-fulfill orders with zero upfront inventory costs.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/" className="btn-primary text-xs">
              + Browse & Import Products
            </Link>
          </div>
        </div>
      </div>

      {/* Retail Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Store Products</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{products.length} Products</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Auto Sync On
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Linked to 2 Wholesale Suppliers</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimated Retail Margin</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">₹6,747 Avg. Profit</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              52% Avg Margin
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">After supplier wholesale costs</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fulfillment Channel</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">Direct-to-Customer</span>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              24h Dispatch SLA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Suppliers ship directly on your behalf</p>
        </div>
      </div>

      {/* Imported Products List */}
      <div className="content-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Products Synced to Your E-Commerce Store</h2>
            <p className="text-xs text-slate-400">Live prices, inventory stock sync, and supplier fulfillment connections</p>
          </div>
          <button className="btn-secondary text-xs">Force Refresh Sync</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="h-44 bg-slate-950 relative overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    {item.status}
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Supplier: {item.supplier}</div>
                  <h3 className="text-sm font-bold text-white mb-3 line-clamp-1">{item.name}</h3>

                  <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wholesale Cost:</span>
                      <span className="font-semibold text-slate-300">₹{item.supplierCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Your Retail Price:</span>
                      <span className="font-bold text-indigo-400">₹{item.retailPrice}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1.5">
                      <span className="text-emerald-400 font-medium">Your Profit / Sale:</span>
                      <span className="font-extrabold text-emerald-400">+₹{item.margin}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Stock: <strong className="text-white">{item.stockAvailable} units</strong></span>
                <button
                  onClick={() => alert(`Product synced to ${user?.storePlatform || 'Shopify'}`)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
                >
                  Manage Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
