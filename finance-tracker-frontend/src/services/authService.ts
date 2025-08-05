import api, { apiCall, tokenStorage } from './api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>(() =>
      api.post('/auth/login', credentials)
    );

    if (response.error) {
      throw response.error;
    }

    if (response.data) {
      // Store token in localStorage
      tokenStorage.setToken(response.data.token);
      return response.data;
    }

    throw new Error('Invalid response from server');
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>(() =>
      api.post('/auth/register', userData)
    );

    if (response.error) {
      throw response.error;
    }

    if (response.data) {
      // Store token in localStorage
      tokenStorage.setToken(response.data.token);
      return response.data;
    }

    throw new Error('Invalid response from server');
  },

  // Logout user
  logout: (): void => {
    tokenStorage.removeToken();
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    const token = tokenStorage.getToken();
    return !!token;
  },

  // Get current token
  getToken: (): string | null => {
    return tokenStorage.getToken();
  },
};