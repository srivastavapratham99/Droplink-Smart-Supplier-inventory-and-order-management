'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/api';

const MOCK_USERS = [
  {
    _id: 'u1',
    name: 'Apex Wholesale Ltd.',
    email: 'supplier@apex.com',
    role: 'supplier',
    companyName: 'Apex Electronics Supplies',
    isVerifiedSupplier: true,
    status: 'active',
    rating: 4.9,
    createdAt: '2026-01-15',
  },
  {
    _id: 'u2',
    name: 'TrendStore Direct',
    email: 'user@trendstore.com',
    role: 'user',
    storeName: 'TrendStore Retail Hub',
    storePlatform: 'Shopify',
    isVerifiedSupplier: false,
    status: 'active',
    createdAt: '2026-02-10',
  },
  {
    _id: 'u3',
    name: 'Vanguard Tech Logistics',
    email: 'supplier@vanguard.com',
    role: 'supplier',
    companyName: 'Vanguard Logistics & Tech',
    isVerifiedSupplier: false,
    status: 'pending_approval',
    rating: 4.7,
    createdAt: '2026-03-01',
  },
  {
    _id: 'u4',
    name: 'Global Dropship Retail LLC',
    email: 'ops@globaldropship.com',
    role: 'user',
    storeName: 'Global Dropship Store',
    storePlatform: 'WooCommerce',
    isVerifiedSupplier: false,
    status: 'active',
    createdAt: '2026-03-18',
  },
  {
    _id: 'u5',
    name: 'Platform Operations Admin',
    email: 'admin@droplink.com',
    role: 'admin',
    adminLevel: 'SuperAdmin',
    isVerifiedSupplier: true,
    status: 'active',
    createdAt: '2026-01-01',
  },
];

export default function AdminPage() {
  const { isAdmin, loginAsDemo } = useAuth();
  const [users, setUsers] = useState(MOCK_USERS);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const res = await adminService.getUsers(filterRole === 'all' ? '' : filterRole);
        if (res.success && res.users && res.users.length > 0) {
          setUsers(res.users);
        }
      } catch (err) {
        // Fallback mock data
      } finally {
        setLoading(false);
      }
    }
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, filterRole]);

  const handleToggleVerification = (id, currentVal) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, isVerifiedSupplier: !currentVal, status: !currentVal ? 'active' : 'pending_approval' } : u))
    );
  };

  const handleRoleChange = (id, newRole) => {
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Non-admin Notice */}
      {!isAdmin && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-xs font-bold">Preview Mode: Viewing as non-Admin</p>
              <p className="text-[11px] text-amber-300/80">Switch account to test Admin privileges.</p>
            </div>
          </div>
          <button
            onClick={() => loginAsDemo('admin')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition"
          >
            Switch to Admin Account
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 uppercase">
                Admin Operations
              </span>
              <span className="text-slate-400 text-xs">• Governance & Role Control</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Admin Command Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage multi-tenant accounts (Suppliers, Retailer Users, Admins) & monitor platform health.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary text-xs">Export Audit Log</button>
            <button className="btn-primary text-xs">+ Invite User / Supplier</button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Suppliers</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">42 Active</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              98% Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Managing 480+ SKUs across network</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Retailer Users</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">1,240 Stores</span>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              +14% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Shopify, WooCommerce, Amazon</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending Approvals</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">1 Supplier</span>
            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Needs SLA Check
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Vanguard Tech Logistics</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">System Health</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">99.98%</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              All API Online
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Inventory Sync Frequency: 60s</p>
        </div>
      </div>

      {/* Account Management Table Section */}
      <div className="content-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Account Roles & User Management</h2>
            <p className="text-xs text-slate-400">View and update permissions for Suppliers, Retailers, and Admins</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search account by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="custom-input text-xs py-2 pl-9 pr-4 w-64"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['all', 'supplier', 'user', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    filterRole === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r === 'user' ? 'Retailers' : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Account / Entity</th>
                <th className="px-4 py-3">Role Type</th>
                <th className="px-4 py-3">Business Entity / Store</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="supplier">SUPPLIER</option>
                      <option value="user">RETAILER USER</option>
                      <option value="admin">ADMINISTRATOR</option>
                    </select>
                  </td>

                  <td className="px-4 py-3.5">
                    {u.role === 'supplier' && (
                      <span className="text-indigo-400 font-medium">{u.companyName || 'Supplier Business'}</span>
                    )}
                    {u.role === 'user' && (
                      <span className="text-emerald-400 font-medium">{u.storeName || 'Shopify Store'}</span>
                    )}
                    {u.role === 'admin' && (
                      <span className="text-rose-400 font-medium">{u.adminLevel || 'SuperAdmin'}</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {u.role === 'supplier' ? (
                      u.isVerifiedSupplier ? (
                        <span className="glass-badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          ✓ Verified Supplier
                        </span>
                      ) : (
                        <span className="glass-badge bg-amber-500/10 text-amber-400 border-amber-500/20">
                          Pending Approval
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500 text-[11px]">N/A</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`h-2 w-2 rounded-full inline-block mr-1.5 ${u.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span className="capitalize font-medium">{u.status.replace('_', ' ')}</span>
                  </td>

                  <td className="px-4 py-3.5 text-right space-x-2">
                    {u.role === 'supplier' && (
                      <button
                        onClick={() => handleToggleVerification(u._id, u.isVerifiedSupplier)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                          u.isVerifiedSupplier
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {u.isVerifiedSupplier ? 'Revoke Verification' : 'Approve Supplier'}
                      </button>
                    )}
                    <button
                      onClick={() => alert(`Viewing details for ${u.name}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px]"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
