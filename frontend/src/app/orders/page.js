'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function OrdersPage() {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrders = JSON.parse(localStorage.getItem('droplink_orders') || '[]');
      setOrders(savedOrders);
    }
  }, []);

  const handleUpdateStatus = (id, newStatus, tracking = '') => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === id) {
          return {
            ...ord,
            status: newStatus,
            trackingNumber: tracking || ord.trackingNumber,
          };
        }
        return ord;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('droplink_orders', JSON.stringify(updated));
      }
      return updated;
    });
    setSelectedOrder(null);
    setTrackingInput('');
  };

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Auth Notice */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🔒</span>
            <div>
              <p className="text-xs font-bold">You are currently signed out</p>
              <p className="text-[11px] text-amber-300/80">Sign in to track live customer orders and update dispatch tracking.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loginAsDemo('supplier')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
            >
              Demo Login
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Page Header - consistent with all pages */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Dropshipping Orders &amp; Fulfillment
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Incoming orders synced from connected retailer storefronts
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4 mt-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-white">{orders.length}</span>
                <span className="text-xs text-slate-400">Total Orders</span>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-amber-400">{pendingCount}</span>
                <span className="text-xs text-slate-400">Pending</span>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-indigo-400">{shippedCount}</span>
                <span className="text-xs text-slate-400">In Transit</span>
              </div>
              <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-emerald-400">₹{totalRevenue.toLocaleString()}</span>
                <span className="text-xs text-slate-400">Total Revenue</span>
              </div>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 items-start">
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`filter-pill ${filterStatus === st ? 'active' : 'inactive'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="content-card p-14 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-300 font-semibold text-sm">No orders found</p>
            <p className="text-slate-500 text-xs mt-1">No orders under &quot;{filterStatus}&quot; status yet.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = {
              Pending:    { cls: 'badge-warning', dot: 'bg-amber-400' },
              Processing: { cls: 'badge-blue',    dot: 'bg-blue-400' },
              Shipped:    { cls: 'badge-info',     dot: 'bg-indigo-400' },
              Delivered:  { cls: 'badge-success',  dot: 'bg-emerald-400' },
            };
            const sc = statusConfig[order.status] || statusConfig.Pending;

            return (
              <div
                key={order.id}
                className="content-card p-6 hover:border-slate-600 transition-all duration-200"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-white text-base">{order.id}</span>
                      <span className={`badge ${sc.cls}`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`}></span>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      Store: <span className="text-indigo-400 font-semibold">{order.retailerStore}</span>
                      <span className="mx-1.5 text-slate-700">•</span>
                      Placed: <span className="text-slate-400">{order.date}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Order Total</span>
                      <span className="text-lg font-extrabold text-emerald-400">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn-primary"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Fulfill &amp; Ship
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Items Ordered</p>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1.5 px-3 bg-slate-800/40 rounded-lg text-slate-300">
                          <span>{item.name} <span className="text-slate-500">× {item.qty}</span></span>
                          <span className="font-semibold text-white">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Shipping Destination</p>
                    <div className="bg-slate-800/40 rounded-lg p-3">
                      <p className="text-slate-200 font-semibold">{order.customerName}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{order.shippingAddress}</p>
                      {order.trackingNumber && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50">
                          <span className="text-slate-500 text-[10px]">Tracking: </span>
                          <span className="font-mono text-indigo-400 font-bold text-[11px]">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fulfillment Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Fulfill Order {selectedOrder.id}</h3>
                <p className="text-xs text-slate-400 mt-1">Enter tracking number to mark as shipped and notify the retailer.</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition text-lg ml-4"
              >✕</button>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-4 mb-5 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Order Items</p>
              {selectedOrder.items.map((item, i) => (
                <p key={i} className="text-xs text-slate-300">{item.name} × {item.qty}</p>
              ))}
              <p className="text-xs text-slate-400 mt-2">Ship to: <span className="text-slate-200 font-medium">{selectedOrder.customerName}</span></p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Courier Tracking Number</label>
              <input
                type="text"
                placeholder="e.g. BLUEDART-9921820"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped', trackingInput || 'TRACK-99120')}
                className="btn-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
