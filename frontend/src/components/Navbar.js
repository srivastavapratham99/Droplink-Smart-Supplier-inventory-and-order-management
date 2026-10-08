'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, DEMO_PROFILES } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isSupplier, isAdmin, isUser, loginAsDemo, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Dynamic Navigation Links according to active account role
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { name: 'Marketplace', href: '/' },
        { name: 'Admin Portal', href: '/admin' },
        { name: 'Supplier Inventory', href: '/inventory' },
        { name: 'All Orders', href: '/orders' },
        { name: 'Platform Analytics', href: '/analytics' },
      ];
    }
    if (isSupplier) {
      return [
        { name: 'Marketplace', href: '/' },
        { name: 'My Inventory', href: '/inventory' },
        { name: 'Fulfilled Orders', href: '/orders' },
        { name: 'Supplier Analytics', href: '/analytics' },
      ];
    }
    // Retailer / User Account
    return [
      { name: 'Marketplace', href: '/' },
      { name: 'My Store Sync', href: '/my-store' },
      { name: 'My Orders', href: '/orders' },
      { name: 'Sales Analytics', href: '/analytics' },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (isSupplier) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin Account';
    if (isSupplier) return 'Supplier Account';
    return 'User / Retailer Account';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
            DL
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Droplink
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeColor()}`}>
                {role ? role.toUpperCase() : 'GUEST'}
              </span>
            </span>
            <p className="text-[11px] text-slate-400">Inventory & Order Management</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Quick Demo Account Switcher & Profile */}
        <div className="flex items-center space-x-3 relative">
          {/* Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs transition"
              title="Click to switch account role (Supplier, Admin, Retailer User)"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200 hidden sm:inline">{getRoleLabel()}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Account Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-800 mb-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Switch Active Account</p>
                  <p className="text-[11px] text-slate-500">Test platform features as different users</p>
                </div>

                {/* Account Option: Supplier */}
                <button
                  onClick={() => {
                    loginAsDemo('supplier');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                    isSupplier ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-indigo-300 block">Supplier Account</span>
                    <span className="text-[11px] text-slate-400">Apex Wholesale Ltd.</span>
                  </div>
                  {isSupplier && <span className="text-xs text-indigo-400 font-bold">Active</span>}
                </button>

                {/* Account Option: User / Retailer */}
                <button
                  onClick={() => {
                    loginAsDemo('user');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                    isUser ? 'bg-emerald-600/20 border border-emerald-500/30' : 'hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">User / Retailer Account</span>
                    <span className="text-[11px] text-slate-400">TrendStore Direct</span>
                  </div>
                  {isUser && <span className="text-xs text-emerald-400 font-bold">Active</span>}
                </button>

                {/* Account Option: Admin */}
                <button
                  onClick={() => {
                    loginAsDemo('admin');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                    isAdmin ? 'bg-rose-600/20 border border-rose-500/30' : 'hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-rose-300 block">Admin Account</span>
                    <span className="text-[11px] text-slate-400">Platform Operations HQ</span>
                  </div>
                  {isAdmin && <span className="text-xs text-rose-400 font-bold">Active</span>}
                </button>

                <div className="pt-2 border-t border-slate-800 mt-1 flex justify-between px-2 text-[11px]">
                  <Link href="/login" onClick={() => setShowRoleMenu(false)} className="text-indigo-400 hover:underline">
                    Login with Password
                  </Link>
                  <button onClick={() => { logout(); setShowRoleMenu(false); }} className="text-slate-400 hover:text-red-400">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Summary */}
          <Link href="/login" className="flex items-center space-x-2 bg-slate-950 p-1 pr-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight line-clamp-1">{user?.name || 'Account'}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{user?.email || 'Login'}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950 px-2 py-2 overflow-x-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
