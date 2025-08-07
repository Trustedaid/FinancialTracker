import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '../components/ui/Toast';
import apiClient from '../services/api/apiClient';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_WARNING_THRESHOLD = 10 * 60 * 1000; // 10 minutes before expiry
const MAX_RETRY_ATTEMPTS = 3;

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isRefreshing: false,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Load initial auth state from storage
  useEffect(() => {
    loadAuthFromStorage();
  }, []);

  // Set up token refresh timer when tokens change
  useEffect(() => {
    if (state.tokens && state.isAuthenticated) {
      setupTokenRefreshTimer();
      setupSessionWarningTimer();
    } else {
      clearTimers();
    }

    return () => clearTimers();
  }, [state.tokens, state.isAuthenticated]);

  const clearTimers = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  };

  const loadAuthFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedTokens = localStorage.getItem('tokens');

      if (savedUser && savedTokens) {
        const user: User = JSON.parse(savedUser);
        const tokens: AuthTokens = JSON.parse(savedTokens);

        // Check if tokens are still valid
        if (tokens.expiresAt > Date.now()) {
          setState(prev => ({
            ...prev,
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          }));

          // Set token in API client
          apiClient.setToken(tokens.accessToken);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
    }));
  };

  const saveAuthToStorage = (user: User, tokens: AuthTokens) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  };

  const clearAuthFromStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  };

  const setupTokenRefreshTimer = () => {
    if (!state.tokens) return;

    const timeUntilRefresh = state.tokens.expiresAt - Date.now() - TOKEN_REFRESH_THRESHOLD;
    
    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshAccessToken();
      }, timeUntilRefresh);
    } else {
      // Token is already close to expiry, refresh immediately
      refreshAccessToken();
    }
  };

  const setupSessionWarningTimer = () => {
    if (!state.tokens) return;

    const timeUntilWarning = state.tokens.expiresAt - Date.now() - SESSION_WARNING_THRESHOLD;
    
    if (timeUntilWarning > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        toast.withAction(
          'Your session will expire soon. Do you want to extend it?',
          'Extend Session',
          () => refreshAccessToken(),
          'warning'
        );
      }, timeUntilWarning);
    }
  };

  const refreshAccessToken = useCallback(async () => {
    if (state.isRefreshing || !state.tokens?.refreshToken) {
      return false;
    }

    setState(prev => ({ ...prev, isRefreshing: true, error: null }));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: state.tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newTokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || state.tokens.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      setState(prev => ({
        ...prev,
        tokens: newTokens,
        isRefreshing: false,
        error: null,
      }));

      if (state.user) {
        saveAuthToStorage(state.user, newTokens);
      }
      
      apiClient.setToken(newTokens.accessToken);
      retryCountRef.current = 0;

      toast.success('Session refreshed successfully', { duration: 2000 });
      return true;

    } catch (error) {
      console.error('Token refresh failed:', error);
      
      retryCountRef.current++;
      
      if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        // Retry after exponential backoff
        const retryDelay = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(() => refreshAccessToken(), retryDelay);
        
        toast.warning(
          `Session refresh failed. Retrying in ${retryDelay / 1000}s... (${retryCountRef.current}/${MAX_RETRY_ATTEMPTS})`,
          { duration: 3000 }
        );
        
        return false;
      }

      // Max retries exceeded, logout user
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error: 'Session refresh failed',
      }));

      toast.error('Your session has expired. Please log in again.');
      logout();
      return false;
    }
  }, [state.isRefreshing, state.tokens, state.user]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post('/auth/login', credentials);
      const data = response.data;

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      };

      const tokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      setState(prev => ({
        ...prev,
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      saveAuthToStorage(user, tokens);
      apiClient.setToken(tokens.accessToken);

      toast.success(`Welcome back, ${user.firstName || user.email}!`);
      return { success: true };

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post('/auth/register', userData);
      const data = response.data;

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      };

      const tokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      setState(prev => ({
        ...prev,
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      saveAuthToStorage(user, tokens);
      apiClient.setToken(tokens.accessToken);

      toast.success(`Welcome to Financial Tracker, ${user.firstName || user.email}!`);
      return { success: true };

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async (showMessage = true) => {
    // Clear timers
    clearTimers();

    try {
      // Attempt to notify server about logout
      if (state.tokens?.refreshToken) {
        await apiClient.post('/auth/logout', {
          refreshToken: state.tokens.refreshToken,
        });
      }
    } catch (error) {
      // Ignore logout API errors, just log them
      console.warn('Logout API call failed:', error);
    }

    // Clear local state and storage
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isRefreshing: false,
    });

    clearAuthFromStorage();
    apiClient.clearAuth();
    retryCountRef.current = 0;

    if (showMessage) {
      toast.info('You have been logged out successfully');
    }
  }, [state.tokens]);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!state.user || !state.isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await apiClient.put('/auth/profile', updates);
      const updatedUser = { ...state.user, ...response.data };

      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      if (state.tokens) {
        saveAuthToStorage(updatedUser, state.tokens);
      }

      toast.success('Profile updated successfully');
      return { success: true };

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [state.user, state.isAuthenticated, state.tokens]);

  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    if (!state.tokens || !state.isAuthenticated) {
      return false;
    }

    try {
      const response = await apiClient.get('/auth/me');
      const user = response.data;

      setState(prev => ({
        ...prev,
        user,
      }));

      if (state.tokens) {
        saveAuthToStorage(user, state.tokens);
      }

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      logout(false);
      return false;
    }
  }, [state.tokens, state.isAuthenticated, logout]);

  const getTimeUntilExpiry = useCallback((): number => {
    if (!state.tokens) return 0;
    return Math.max(0, state.tokens.expiresAt - Date.now());
  }, [state.tokens]);

  const isTokenExpiringSoon = useCallback((): boolean => {
    return getTimeUntilExpiry() <= TOKEN_REFRESH_THRESHOLD;
  }, [getTimeUntilExpiry]);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    updateProfile,
    checkAuthStatus,

    // Utilities
    getTimeUntilExpiry,
    isTokenExpiringSoon,
  };
};

export default useAuth;