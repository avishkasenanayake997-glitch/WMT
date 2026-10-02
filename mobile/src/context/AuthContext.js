import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state from persistent AsyncStorage on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Verify token validity by fetching profile in background
          try {
            const profileRes = await authService.getMe();
            if (profileRes.success && profileRes.data) {
              setUser(profileRes.data);
              await storage.setUser(profileRes.data);
            }
          } catch (verifyErr) {
            console.log('[AuthContext] Stored token expired or invalid:', verifyErr.message);
            await storage.clearSession();
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.error('[AuthContext] Session restore error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { token: userToken, ...userData } = res.data;
        setToken(userToken);
        setUser(userData);
        await storage.setToken(userToken);
        await storage.setUser(userData);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, isAdmin = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register(name, email, password, isAdmin);
      if (res.success && res.data) {
        const { token: userToken, ...userData } = res.data;
        setToken(userToken);
        setUser(userData);
        await storage.setToken(userToken);
        await storage.setUser(userData);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await storage.clearSession();
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('[AuthContext] Logout error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        await storage.setUser(res.data);
      }
    } catch (e) {
      console.error('[AuthContext] Refresh profile error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!token,
        isAdmin: !!user?.isAdmin,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
