'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/api';

const AuthContext = createContext(null);

export const DEMO_PROFILES = {
  supplier: {
    _id: 'supplier-demo-01',
    name: 'Apex Wholesale Ltd.',
    email: 'supplier@apex.com',
    role: 'supplier',
    companyName: 'Apex Electronics Supplies',
    phone: '+91 98765 43210',
    rating: 4.9,
    isVerifiedSupplier: true,
    token: 'demo-token-supplier-apex',
  },
  user: {
    _id: 'user-demo-02',
    name: 'TrendStore Direct',
    email: 'user@trendstore.com',
    role: 'user',
    storeName: 'TrendStore Retail Hub',
    storePlatform: 'Shopify',
    importedProductsCount: 14,
    token: 'demo-token-user-trendstore',
  },
  admin: {
    _id: 'admin-demo-03',
    name: 'Platform Operations Admin',
    email: 'admin@droplink.com',
    role: 'admin',
    adminLevel: 'SuperAdmin',
    companyName: 'Droplink HQ Operations',
    token: 'demo-token-admin-droplink',
  },
};

export function AuthProvider({ children }) {
  // Default logged in account is Supplier (Apex Wholesale) for initial preview
  const [user, setUser] = useState(DEMO_PROFILES.supplier);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load account from localStorage if present
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('droplink_user_profile');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(DEMO_PROFILES.supplier);
        }
      } else {
        // Save default demo supplier profile
        localStorage.setItem('droplink_user_profile', JSON.stringify(DEMO_PROFILES.supplier));
      }
    }
    setLoading(false);
  }, []);

  const loginAsDemo = (roleKey) => {
    const profile = DEMO_PROFILES[roleKey] || DEMO_PROFILES.supplier;
    setUser(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('droplink_user_profile', JSON.stringify(profile));
      localStorage.setItem('droplink_token', profile.token);
    }
    return profile;
  };

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        const fullUser = { ...res.user, token: res.token };
        setUser(fullUser);
        localStorage.setItem('droplink_user_profile', JSON.stringify(fullUser));
        localStorage.setItem('droplink_token', res.token);
        return { success: true, user: fullUser };
      }
    } catch (err) {
      // Fallback matching for demo profiles if backend is unreachable
      const lower = email.toLowerCase();
      if (lower.includes('admin')) return { success: true, user: loginAsDemo('admin') };
      if (lower.includes('supplier')) return { success: true, user: loginAsDemo('supplier') };
      if (lower.includes('user') || lower.includes('retailer')) return { success: true, user: loginAsDemo('user') };

      return { success: false, message: err.message || 'Invalid credentials' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.user) {
        const fullUser = { ...res.user, token: res.token };
        setUser(fullUser);
        localStorage.setItem('droplink_user_profile', JSON.stringify(fullUser));
        localStorage.setItem('droplink_token', res.token);
        return { success: true, user: fullUser };
      }
    } catch (err) {
      // Fallback creation for offline demo mode
      const role = userData.role || 'user';
      const demoAccount = {
        _id: 'custom-' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: role === 'retailer' ? 'user' : role,
        companyName: userData.companyName || `${userData.name} Co.`,
        storeName: userData.storeName || `${userData.name} Store`,
        storePlatform: userData.storePlatform || 'Shopify',
        token: 'custom-jwt-' + Date.now(),
      };
      setUser(demoAccount);
      localStorage.setItem('droplink_user_profile', JSON.stringify(demoAccount));
      return { success: true, user: demoAccount };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('droplink_user_profile');
      localStorage.removeItem('droplink_token');
    }
  };

  const isSupplier = user?.role === 'supplier';
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user' || user?.role === 'retailer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'user',
        isSupplier,
        isAdmin,
        isUser,
        loading,
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
