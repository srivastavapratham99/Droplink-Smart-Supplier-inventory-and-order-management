'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, logout, loginAsDemo, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSuppliers: 0,
    totalAdmins: 0,
    pendingSuppliers: 0,
    totalProducts: 0,
  });
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Add Admin modal state
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminLevel: 'Operations',
  });
  const [createAdminMsg, setCreateAdminMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.allSettled([
        adminService.getUsers(filterRole === 'all' ? '' : filterRole),
        adminService.getStats(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value?.success && usersRes.value?.users) {
        setUsers(usersRes.value.users);
      } else {
        setUsers([]);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value?.stats) {
        setStats(statsRes.value.stats);
      }
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, filterRole]);

  const handleToggleVerification = async (id, currentVal) => {
    setActionLoading(`verify-${id}`);
    const newVal = !currentVal;
    const newStatus = newVal ? 'active' : 'pending_approval';

    try {
      await adminService.verifySupplier(id, newVal, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isVerifiedSupplier: newVal, status: newStatus } : u))
      );
      showToast(`Supplier verification updated: ${newVal ? 'Verified' : 'Pending'}`);
    } catch (err) {
      showToast(`Verification update failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setActionLoading(`role-${id}`);
    try {
      await adminService.updateRole(id, newRole);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
      showToast(`User role updated to ${newRole.toUpperCase()}`);
    } catch (err) {
      showToast(`Role update failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setCreateAdminMsg('');

    try {
      const res = await adminService.createAdmin(adminFormData);
      if (res.success && res.admin) {
        setUsers((prev) => [res.admin, ...prev]);
        setCreateAdminMsg(`✓ Admin account created for ${res.admin.name}`);
        showToast(`Admin account created for ${res.admin.name}`);
        setTimeout(() => {
          setIsCreateAdminOpen(false);
          setCreateAdminMsg('');
          setAdminFormData({ name: '', email: '', password: '', adminLevel: 'Operations' });
          loadAdminData();
        }, 1000);
      }
    } catch (err) {
      setCreateAdminMsg(`Error: ${err.message || 'Failed to create admin'}`);
    }
  };

  const supplierCount = stats.totalSuppliers || users.filter((u) => u.role === 'supplier').length;
  const userCount = stats.totalUsers || users.filter((u) => u.role === 'user').length;
  const adminCount = stats.totalAdmins || users.filter((u) => u.role === 'admin').length;
  const productCount = stats.totalProducts || 0;

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.storeName && u.storeName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });


  if (authLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Verifying platform administrator authorization...</p>
      </main>
    );
  }

  // Strict Admin Access Guard - Unauthenticated
  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-rose-500/5">
            🔒
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4 inline-block">
            Administrator Access Required
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Admin Portal Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
            Platform governance and user management controls are strictly restricted to authorized Administrator accounts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30 text-center"
            >
              Sign In to Admin Account
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition text-center"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Strict Admin Access Guard - Non-Admin Forbidden
  if (!isAdmin) {
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
            Admin Portal Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-2">
            You cannot open the admin portal because your account is registered as a <strong className="text-amber-300 font-bold">{user?.role ? user.role.toUpperCase() : 'USER'}</strong>.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Platform governance and verification tools are strictly reserved for platform administrators. Registered accounts cannot switch to administrator privileges.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 text-center"
            >
              Go to Marketplace
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
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-white shadow-2xl backdrop-blur-xl animate-fade-in">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-xs font-semibold">{toastMsg}</span>
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
              <span className="text-slate-400 text-xs">• Live Database Governance</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Admin Command Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage live multi-tenant accounts (Suppliers, Retailers, Admins) directly connected to MongoDB.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={loadAdminData} className="btn-secondary text-xs flex items-center gap-1.5">
              <span>🔄</span> Refresh Database
            </button>
            <button
              onClick={() => setIsCreateAdminOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
            >
              <span>+ Add New Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Registered Suppliers</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{supplierCount} Registered</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live DB
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Verified wholesale distributors</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Retailer Stores</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{userCount} Stores</span>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Active Users
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Connecting to Shopify &amp; WooCommerce</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Platform Admins</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400">{adminCount} Admins</span>
            <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Governance
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">SuperAdmin &amp; Operations Team</p>
        </div>

        <div className="content-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Catalog SKUs in DB</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{productCount} SKUs</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Synchronized
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Verified supplier product listings</p>
        </div>
      </div>

      {/* Account Management Table Section */}
      <div className="content-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Database Accounts &amp; Permissions</h2>
            <p className="text-xs text-slate-400">Manage real user accounts directly loaded from MongoDB</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search account name or email..."
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading database accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <div className="text-3xl mb-2">👤</div>
                    <p className="font-semibold text-slate-300">No accounts found in database</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing your search filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                          {u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}
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
                        disabled={actionLoading === `role-${u._id}`}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="supplier">SUPPLIER</option>
                        <option value="user">RETAILER USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      {u.role === 'supplier' ? (
                        <span className="text-indigo-300 font-medium">{u.companyName || 'Supplier Entity'}</span>
                      ) : u.role === 'user' ? (
                        <span className="text-emerald-300 font-medium">
                          {u.storeName || 'Online Store'} ({u.storePlatform || 'Shopify'})
                        </span>
                      ) : (
                        <span className="text-rose-300 font-medium">Platform HQ ({u.adminLevel || 'Operations'})</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {u.role === 'supplier' ? (
                        <button
                          onClick={() => handleToggleVerification(u._id, u.isVerifiedSupplier)}
                          disabled={actionLoading === `verify-${u._id}`}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                            u.isVerifiedSupplier
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {u.isVerifiedSupplier ? '✓ Verified' : '⏳ Pending Approval'}
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">N/A</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : u.status === 'suspended'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {u.role === 'supplier' && !u.isVerifiedSupplier && (
                          <button
                            onClick={() => handleToggleVerification(u._id, false)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition"
                          >
                            Approve
                          </button>
                        )}
                        <span className="text-slate-500 text-[10px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Account Modal */}
      {isCreateAdminOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Create New Admin Account</h3>
                <p className="text-xs text-slate-400 mt-0.5">Authorizes new administrator with platform governance permissions</p>
              </div>
              <button
                onClick={() => {
                  setIsCreateAdminOpen(false);
                  setCreateAdminMsg('');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition text-lg"
              >
                ✕
              </button>
            </div>

            {createAdminMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
                  createAdminMsg.startsWith('✓')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {createAdminMsg}
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Operations Director"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  className="form-input"
                  placeholder="admin.name@droplink.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  className="form-input"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Level</label>
                <select
                  value={adminFormData.adminLevel}
                  onChange={(e) => setAdminFormData({ ...adminFormData, adminLevel: e.target.value })}
                  className="form-input"
                >
                  <option value="Operations">Operations Admin</option>
                  <option value="Finance">Finance &amp; Audit Admin</option>
                  <option value="SuperAdmin">SuperAdmin (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition">
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
