import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getCurrentUser, 
  loginUser, 
  registerUser, 
  logoutUser, 
  getFavorites, 
  addFavorite, 
  removeFavorite 
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteParkIds, setFavoriteParkIds] = useState(new Set());

  // Load user favorites
  const loadFavorites = useCallback(async () => {
    try {
      const res = await getFavorites();
      if (res && res.success) {
        const idSet = new Set(res.data.map(p => p._id || p.id));
        setFavoriteParkIds(idSet);
      }
    } catch (e) {
      // Ignore favorites load error if not logged in
    }
  }, []);

  // Check current session on application mount
  const checkAuth = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      if (res && res.success && res.user) {
        setUser(res.user);
        await loadFavorites();
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadFavorites]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res && res.success) {
      setUser(res.user);
      await loadFavorites();
    }
    return res;
  };

  // Register handler
  const register = async (formData) => {
    const res = await registerUser(formData);
    if (res && res.success) {
      setUser(res.user);
      await loadFavorites();
    }
    return res;
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setFavoriteParkIds(new Set());
    }
  };

  // Toggle favorite park
  const toggleFavorite = async (parkId) => {
    if (!user) {
      return { success: false, requireAuth: true };
    }

    const isFav = favoriteParkIds.has(parkId);
    try {
      if (isFav) {
        await removeFavorite(parkId);
        setFavoriteParkIds(prev => {
          const next = new Set(prev);
          next.delete(parkId);
          return next;
        });
        return { success: true, isFavorite: false };
      } else {
        await addFavorite(parkId);
        setFavoriteParkIds(prev => new Set(prev).add(parkId));
        return { success: true, isFavorite: true };
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      return { success: false, error: err.message };
    }
  };

  const isParkFavorite = (parkId) => {
    return favoriteParkIds.has(parkId);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
    favoriteParkIds,
    toggleFavorite,
    isParkFavorite,
    loadFavorites
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;