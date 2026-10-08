'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, loginAsDemo } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('supplier'); // 'supplier', 'user', 'admin'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    storeName: '',
    storePlatform: 'Shopify',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'login') {
      const res = await login(formData.email, formData.password);
      if (res?.success) {
        setSuccessMsg(`Logged in successfully as ${res.user.role.toUpperCase()}`);
        setTimeout(() => {
          if (res.user.role === 'admin') router.push('/admin');
          else if (res.user.role === 'supplier') router.push('/inventory');
          else router.push('/my-store');
        }, 600);
      } else {
        setErrorMsg(res?.message || 'Login failed');
      }
    } else {
      const res = await register({
        ...formData,
        role: selectedRole,
      });
      if (res?.success) {
        setSuccessMsg(`Account created for ${selectedRole.toUpperCase()}! Redirecting...`);
        setTimeout(() => {
          if (selectedRole === 'admin') router.push('/admin');
          else if (selectedRole === 'supplier') router.push('/inventory');
          else router.push('/my-store');
        }, 600);
      } else {
        setErrorMsg(res?.message || 'Registration failed');
      }
    }
  };

  const handleFastDemoLogin = (roleKey) => {
    const profile = loginAsDemo(roleKey);
    setSuccessMsg(`Instant demo login active for ${profile.name}`);
    setTimeout(() => {
      if (roleKey === 'admin') router.push('/admin');
      else if (roleKey === 'supplier') router.push('/inventory');
      else router.push('/my-store');
    }, 400);
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <div className="content-card p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center text-white font-black text-xl mb-3 shadow-lg shadow-indigo-500/30">
            DL
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Sign In to Droplink' : 'Create Droplink Account'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Separate portals & permissions for Suppliers, Retailers, and Administrators
          </p>
        </div>

        {/* Mode Toggle (Login vs Register) */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Account Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Account Role Tabs (for Registration & Account Context) */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Account Role Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setSelectedRole('supplier'); setFormData({...formData, email: 'supplier@apex.com'}); }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedRole === 'supplier'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-indigo-400">Supplier</span>
              <span className="text-[10px] text-slate-400 mt-1">Distribute SKUs</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('user'); setFormData({...formData, email: 'user@trendstore.com'}); }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedRole === 'user'
                  ? 'bg-emerald-600/20 border-emerald-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-emerald-400">User / Retailer</span>
              <span className="text-[10px] text-slate-400 mt-1">Dropshipping</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setFormData({...formData, email: 'admin@droplink.com'}); }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedRole === 'admin'
                  ? 'bg-rose-600/20 border-rose-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-rose-400">Admin</span>
              <span className="text-[10px] text-slate-400 mt-1">Governance</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            ✓ {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">Full Name / Primary Contact</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="custom-input text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              className="custom-input text-xs"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1.5">Account Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="custom-input text-xs"
            />
          </div>

          {/* Role specific inputs on registration */}
          {mode === 'register' && selectedRole === 'supplier' && (
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">Supplier / Business Company Name</label>
              <input
                type="text"
                name="companyName"
                placeholder="e.g. Apex Electronics Ltd."
                value={formData.companyName}
                onChange={handleChange}
                className="custom-input text-xs"
              />
            </div>
          )}

          {mode === 'register' && selectedRole === 'user' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Retail Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  placeholder="e.g. TrendStore"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="custom-input text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Store Platform</label>
                <select
                  name="storePlatform"
                  value={formData.storePlatform}
                  onChange={handleChange}
                  className="custom-input text-xs"
                >
                  <option value="Shopify">Shopify</option>
                  <option value="WooCommerce">WooCommerce</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Custom Store">Custom Store</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="w-full btn-primary justify-center py-3 text-xs mt-2">
            {mode === 'login' ? `Sign In as ${selectedRole.toUpperCase()}` : `Create ${selectedRole.toUpperCase()} Account`}
          </button>
        </form>

        {/* Divider & Fast One-Click Demo Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold text-center tracking-wider mb-3">
            Fast One-Click Demo Logins
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleFastDemoLogin('supplier')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-between transition"
            >
              <span>Login as Demo <strong>Supplier</strong> (Apex Wholesale)</span>
              <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-400">⚡ Instant</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastDemoLogin('user')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-between transition"
            >
              <span>Login as Demo <strong>User / Retailer</strong> (TrendStore)</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">⚡ Instant</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastDemoLogin('admin')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between transition"
            >
              <span>Login as Demo <strong>Admin</strong> (Platform Ops)</span>
              <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-400">⚡ Instant</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
