'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('suppliers');

  return (
    <main className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        {/* Glowing background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Next-Gen Smart Supplier & Order Fulfillment Network</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Connecting Wholesale Suppliers directly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">E-Commerce Retailers</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Droplink eliminates dropshipping complexity with real-time stock sync, direct-to-customer 24h order fulfillment, and transparent margin analytics across multi-tenant accounts.
          </p>

          {/* Call-to-action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <span>Explore Product Marketplace</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <span>Sign In / Create Account</span>
            </Link>
          </div>

          {/* Platform Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-white">₹1.8Cr+</div>
              <div className="text-xs text-slate-400 mt-1">Platform GMV Processed</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">1,240+</div>
              <div className="text-xs text-slate-400 mt-1">Active Retail Stores</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">42+</div>
              <div className="text-xs text-slate-400 mt-1">Verified Manufacturers</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">99.98%</div>
              <div className="text-xs text-slate-400 mt-1">Inventory Sync Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM SERVICES & ADVANTAGES SECTION */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
              Comprehensive Platform Services
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Why Suppliers & Retailers Choose Droplink
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Automated end-to-end dropshipping infrastructure built for velocity, margin accuracy, and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="content-card p-6 flex flex-col justify-between hover:border-slate-700 transition group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                  🔄
                </div>
                <h3 className="text-base font-bold text-white mb-2">Automated Inventory Synchronization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time stock level updates every 60 seconds prevent stockouts and overselling across all connected retailer channels (Shopify, WooCommerce, Amazon).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Auto Stock Feeds</span>
                <span className="text-indigo-400 font-semibold">Live Multi-Store</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="content-card p-6 flex flex-col justify-between hover:border-slate-700 transition group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                  📦
                </div>
                <h3 className="text-base font-bold text-white mb-2">Direct Supplier Order Fulfillment</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When a customer orders on a retailer's store, order details are automatically routed to the verified manufacturer for 24-hour dispatch with custom white-label packing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>24h Dispatch SLA</span>
                <span className="text-emerald-400 font-semibold">White-Label Shipping</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="content-card p-6 flex flex-col justify-between hover:border-slate-700 transition group">
              <div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                  📈
                </div>
                <h3 className="text-base font-bold text-white mb-2">Real-Time Margin & Profit Analytics</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Transparent wholesale pricing and automated profit margin calculations per SKU give retailers clear visibility into net returns before pushing products live.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Automated Margins</span>
                <span className="text-purple-400 font-semibold">Instant Audits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS FOR ALL 3 ACCOUNTS */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Multi-Role Platform Workflows
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">How Droplink Works for You</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Select your role below to explore tailored features & workflow step-by-step
            </p>

            {/* Role Tabs */}
            <div className="mt-6 inline-flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-2">
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'suppliers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                For Wholesale Suppliers
              </button>
              <button
                onClick={() => setActiveTab('retailers')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'retailers' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                For Retailers / Dropshippers
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'admins' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                For Platform Admins
              </button>
            </div>
          </div>

          {/* TAB CONTENT: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm mb-4">
                  1
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Upload & Manage SKUs</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  List your manufacturer inventory with wholesale cost rates, minimum order limits, and stock quantities.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm mb-4">
                  2
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Receive Automated Orders</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Orders placed by connected retail stores flow directly into your supplier fulfillment dashboard.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm mb-4">
                  3
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Dispatch & Receive Payouts</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ship orders using automated tracking labels and receive instant wholesale payouts upon delivery.
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: RETAILERS */}
          {activeTab === 'retailers' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-4">
                  1
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Browse Verified Catalog</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search thousands of high-margin products from pre-vetted wholesale manufacturers.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-4">
                  2
                </div>
                <h4 className="text-sm font-bold text-white mb-2">1-Click Push to Store</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sync high-demand products directly to your Shopify or WooCommerce store with your custom retail markup.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-4">
                  3
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Collect Net Retail Profits</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Collect retail payments from your customers while suppliers fulfill orders hands-free.
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ADMINS */}
          {activeTab === 'admins' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-sm mb-4">
                  1
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Supplier SLA Approvals</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review applicant supplier credentials, warehouse capacity, and dispatch speed SLAs before verification.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-sm mb-4">
                  2
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Role & User Governance</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage multi-tenant access controls, audit logs, and account statuses across all network roles.
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-sm mb-4">
                  3
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Platform Health Analytics</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitor network GMV, commission revenues, active order statuses, and API sync uptime.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ROLE PORTALS ACCESS SECTION */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="content-card p-8 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/20 text-center relative overflow-hidden">
            <h3 className="text-2xl font-black text-white">Access Your Droplink Portal</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-xl mx-auto">
              Sign in with your registered account credentials to access your dedicated role portal.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Sign In to Supplier Portal
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Sign In to Retailer Hub
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Administrator Access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
