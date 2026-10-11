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
  // Start with null so we don't assume any role until checking localStorage
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('droplink_user_profile');
        const token = localStorage.getItem('droplink_token');
        const hasExplicitlyLoggedOut = localStorage.getItem('droplink_logged_out') === 'true';

        if (stored && !hasExplicitlyLoggedOut) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);

            // Try validating with backend if it's a real JWT token
            if (token && !token.startsWith('demo-token-')) {
              try {
                const res = await authService.getProfile();
                if (res.success && res.user) {
                  const fullUser = { ...res.user, token };
                  setUser(fullUser);
                  localStorage.setItem('droplink_user_profile', JSON.stringify(fullUser));
                }
              } catch (err) {
                // Token invalid or backend offline, keep parsed profile
              }
            }
          } catch (e) {
            setUser(null);
            localStorage.removeItem('droplink_user_profile');
            localStorage.removeItem('droplink_token');
          }
        } else {
          // If no profile found and never logged out before, default to demo supplier for initial first-time preview
          if (!hasExplicitlyLoggedOut) {
            setUser(DEMO_PROFILES.supplier);
            localStorage.setItem('droplink_user_profile', JSON.stringify(DEMO_PROFILES.supplier));
            localStorage.setItem('droplink_token', DEMO_PROFILES.supplier.token);
          } else {
            setUser(null);
          }
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const loginAsDemo = (roleKey) => {
    const profile = DEMO_PROFILES[roleKey] || DEMO_PROFILES.supplier;
    setUser(profile);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('droplink_logged_out');
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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('droplink_logged_out');
          localStorage.setItem('droplink_user_profile', JSON.stringify(fullUser));
          localStorage.setItem('droplink_token', res.token);
        }
        return { success: true, user: fullUser };
      }
    } catch (err) {
      // Check if user previously registered this email locally
      if (typeof window !== 'undefined') {
        const localAccounts = JSON.parse(localStorage.getItem('droplink_registered_accounts') || '[]');
        const found = localAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
        if (found) {
          if (!found.password || found.password === password) {
            setUser(found);
            localStorage.removeItem('droplink_logged_out');
            localStorage.setItem('droplink_user_profile', JSON.stringify(found));
            localStorage.setItem('droplink_token', found.token);
            return { success: true, user: found };
          } else {
            return { success: false, message: 'Invalid password. Please check your credentials.' };
          }
        }
      }

      // Check predefined demo accounts
      const lower = email.toLowerCase();
      if (lower === 'admin@droplink.com') return { success: true, user: loginAsDemo('admin') };
      if (lower === 'supplier@apex.com') return { success: true, user: loginAsDemo('supplier') };
      if (lower === 'user@trendstore.com') return { success: true, user: loginAsDemo('user') };

      // Clean, user-friendly error message
      const displayMsg = err.message && !err.message.includes('matchPassword')
        ? err.message
        : 'No account found with this email. Please click "Create New Account" to register first.';

      return { success: false, message: displayMsg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.success && res.user) {
        const fullUser = { ...res.user, token: res.token };
        setUser(fullUser);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('droplink_logged_out');
          localStorage.setItem('droplink_user_profile', JSON.stringify(fullUser));
          localStorage.setItem('droplink_token', res.token);
          const existing = JSON.parse(localStorage.getItem('droplink_registered_accounts') || '[]');
          existing.push({ ...fullUser, password: userData.password });
          localStorage.setItem('droplink_registered_accounts', JSON.stringify(existing));
        }
        return { success: true, user: fullUser };
      }
    } catch (err) {
      const role = userData.role || 'user';
      const demoAccount = {
        _id: 'custom-' + Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: role === 'retailer' ? 'user' : role,
        companyName: userData.companyName || `${userData.name} Co.`,
        storeName: userData.storeName || `${userData.name} Store`,
        storePlatform: userData.storePlatform || 'Shopify',
        token: 'custom-jwt-' + Date.now(),
      };
      setUser(demoAccount);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('droplink_logged_out');
        localStorage.setItem('droplink_user_profile', JSON.stringify(demoAccount));
        localStorage.setItem('droplink_token', demoAccount.token);
        const existing = JSON.parse(localStorage.getItem('droplink_registered_accounts') || '[]');
        existing.push(demoAccount);
        localStorage.setItem('droplink_registered_accounts', JSON.stringify(existing));
      }
      return { success: true, user: demoAccount };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('droplink_logged_out', 'true');
      localStorage.removeItem('droplink_user_profile');
      localStorage.removeItem('droplink_token');
    }
  };

  const isSupplier = !!user && user.role === 'supplier';
  const isAdmin = !!user && user.role === 'admin';
  const isUser = !!user && (user.role === 'user' || user.role === 'retailer');
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? (user.role === 'retailer' ? 'user' : user.role) : 'guest',
        isSupplier,
        isAdmin,
        isUser,
        isAuthenticated,
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
