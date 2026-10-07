'use client';

import { useState } from 'react';

const INITIAL_ORDERS = [
  {
    id: 'ORD-8921',
    customerName: 'Aarav Sharma',
    retailerStore: 'UrbanTech Store (Shopify)',
    items: [{ name: 'Wireless Noise-Canceling Earbuds Pro', qty: 2, price: 2499 }],
    totalAmount: 4998,
    shippingAddress: '42 MG Road, Indiranagar, Bengaluru, KA',
    status: 'Pending',
    date: '2026-10-07 14:30',
    trackingNumber: '',
  },
  {
    id: 'ORD-8920',
    customerName: 'Priya Verma',
    retailerStore: 'Nordic Home Living',
    items: [{ name: 'Ergonomic Mesh Office Chair', qty: 1, price: 8999 }],
    totalAmount: 8999,
    shippingAddress: '15 Park Street, Flat 3B, Kolkata, WB',
    status: 'Processing',
    date: '2026-10-07 11:15',
    trackingNumber: 'DTDC-8819230',
  },
  {
    id: 'ORD-8919',
    customerName: 'Rohan Gupta',
    retailerStore: 'FitPulse Direct',
    items: [{ name: 'Smart Fitness Tracker Watch', qty: 3, price: 1999 }],
    totalAmount: 5997,
    shippingAddress: '88 Cyber City, Sector 24, Gurugram, HR',
    status: 'Shipped',
    date: '2026-10-06 18:45',
    trackingNumber: 'BLUEDART-9921041',
  },
  {
    id: 'ORD-8918',
    customerName: 'Sneha Patel',
    retailerStore: 'EcoVibe Essentials',
    items: [{ name: 'Stainless Steel Insulated Water Bottle', qty: 5, price: 799 }],
    totalAmount: 3995,
    shippingAddress: '23 CG Road, Navrangpura, Ahmedabad, GJ',
    status: 'Delivered',
    date: '2026-10-05 09:20',
    trackingNumber: 'DELHIVERY-7721839',
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const handleUpdateStatus = (id, newStatus, tracking = '') => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === id) {
          return {
            ...ord,
            status: newStatus,
            trackingNumber: tracking || ord.trackingNumber,
          };
        }
        return ord;
      })
    );
    setSelectedOrder(null);
    setTrackingInput('');
  };

  const filteredOrders = filterStatus === 'All' ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dropshipping Orders & Fulfillment</h1>
          <p className="text-xs text-slate-400">Incoming orders synced from connected retailer storefronts</p>
        </div>

        <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            No orders found under "{filterStatus}".
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusColors = {
              Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              Shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
              Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            };

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white text-base">{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Store: <span className="text-indigo-400 font-medium">{order.retailerStore}</span> • Placed: {order.date}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-extrabold text-emerald-400">Total: ₹{order.totalAmount}</span>
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow"
                      >
                        Fulfill & Ship Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Items Ordered</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-slate-300">
                        <span>{item.name} × {item.qty}</span>
                        <span className="font-semibold text-white">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Shipping Destination</p>
                    <p className="text-slate-300 font-medium">{order.customerName}</p>
                    <p className="text-slate-400">{order.shippingAddress}</p>

                    {order.trackingNumber && (
                      <div className="mt-2 text-[11px] text-slate-400">
                        Tracking ID: <span className="font-mono text-indigo-400 font-bold">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fulfillment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Fulfill Order {selectedOrder.id}</h3>
            <p className="text-xs text-slate-400 mb-4">Enter courier tracking number to notify retailer and customer.</p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Courier Tracking Number</label>
              <input
                type="text"
                placeholder="e.g. BLUEDART-9921820"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-2 bg-slate-800 text-slate-400 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped', trackingInput || 'TRACK-99120')}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
