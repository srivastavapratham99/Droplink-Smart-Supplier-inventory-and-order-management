'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isSupplier, isAdmin, isUser, isAuthenticated, logout } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Dynamic Navigation Links according to the user's fixed registered account role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', href: '/' },
        { name: 'Marketplace', href: '/marketplace' },
      ];
    }
    if (isAdmin) {
      return [
        { name: 'Home', href: '/' },
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'Admin Portal', href: '/admin' },
        { name: 'Supplier Inventory', href: '/inventory' },
        { name: 'All Orders', href: '/orders' },
        { name: 'Analytics', href: '/analytics' },
      ];
    }
    if (isSupplier) {
      return [
        { name: 'Home', href: '/' },
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'My Inventory', href: '/inventory' },
        { name: 'Fulfilled Orders', href: '/orders' },
        { name: 'Supplier Analytics', href: '/analytics' },
      ];
    }
    // Retailer / User Account
    return [
      { name: 'Home', href: '/' },
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'My Store Sync', href: '/my-store' },
      { name: 'My Orders', href: '/orders' },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleBadgeColor = () => {
    if (!isAuthenticated) return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
    if (isAdmin) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (isSupplier) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const getRoleTitle = () => {
    if (!isAuthenticated) return 'Guest';
    if (isAdmin) return 'Administrator';
    if (isSupplier) return 'Verified Supplier';
    return 'Retailer / User';
  };

  const handleSignOut = () => {
    logout();
    setShowAccountMenu(false);
    router.push('/login');
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
                {isAuthenticated ? role.toUpperCase() : 'GUEST'}
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

        {/* Right Section: User Account Info (Strict Role, No Arbitrary Switching) */}
        <div className="flex items-center space-x-3 relative">
          {isAuthenticated ? (
            <div className="relative">
              {/* Account Profile Button */}
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center space-x-2.5 bg-slate-950 hover:bg-slate-800/80 p-1.5 pr-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition"
              >
                <div className={`h-7 w-7 rounded-lg text-white font-bold flex items-center justify-center text-xs ${
                  isAdmin ? 'bg-rose-600' : isSupplier ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight line-clamp-1">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 leading-tight flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    {getRoleTitle()}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Account Dropdown Menu */}
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Role</span>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${getRoleBadgeColor()}`}>
                        {role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>

                    {user?.companyName && (
                      <p className="text-[11px] text-indigo-300 mt-1 font-medium">🏢 {user.companyName}</p>
                    )}
                    {user?.storeName && (
                      <p className="text-[11px] text-emerald-300 mt-1 font-medium">🛍️ {user.storeName} ({user.storePlatform || 'Shopify'})</p>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 px-3 py-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Role Policy</p>
                    <p className="text-slate-400">This account is registered strictly as <strong className="text-white">{getRoleTitle()}</strong>. To access another role, sign out and log in with that account.</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
            >
              Sign In
            </Link>
          )}
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
