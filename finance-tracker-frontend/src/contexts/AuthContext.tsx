import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthContextType, User, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services';

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to decode JWT token (basic parsing)
  const decodeToken = (token: string): User | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        return null; // Token expired
      }
      
      // Extract user info from token claims
      return {
        id: parseInt(decoded.sub || decoded.id || '0'),
        email: decoded.email || '',
        firstName: decoded.given_name || decoded.firstName || '',
        lastName: decoded.family_name || decoded.lastName || '',
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = authService.getToken();
      
      if (storedToken) {
        const userData = decodeToken(storedToken);
        if (userData) {
          setToken(storedToken);
          setUser(userData);
        } else {
          // Token is invalid or expired
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      const authResponse = await authService.login(credentials);
      
      setToken(authResponse.token);
      setUser(authResponse.user);
    } catch (error) {
      // Re-throw the error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      const authResponse = await authService.register(userData);
      
      setToken(authResponse.token);
      setUser(authResponse.user);
    } catch (error) {
      // Re-throw the error so components can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  // Computed values
  const isAuthenticated = !!token && !!user;

  // Context value
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};