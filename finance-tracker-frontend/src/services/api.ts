import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiError, ApiResponse } from '../types/api';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5270/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const TOKEN_KEY = 'finance_tracker_token';

export const tokenStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    console.log('API Request - Token:', token ? 'Present' : 'Missing');
    console.log('API Request - URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      tokenStorage.removeToken();
      // Redirect to login page
      window.location.href = '/login';
    }

    // Transform the error to our standard format
    const apiError: ApiError = {
      message: 'Bir hata oluştu. Lütfen tekrar deneyiniz.',
      errors: undefined,
    };

    if (error.response?.data) {
      const errorData = error.response.data as any;
      
      // Handle validation errors from FluentValidation
      if (errorData.errors && typeof errorData.errors === 'object') {
        apiError.errors = errorData.errors;
        apiError.message = 'Lütfen formdaki hataları düzeltin.';
      } else if (errorData.message) {
        apiError.message = errorData.message;
      }
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyiniz.';
    } else if (error.message === 'Network Error') {
      apiError.message = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
    }

    return Promise.reject(apiError);
  }
);

// Generic API call wrapper
export const apiCall = async <T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<ApiResponse<T>> => {
  try {
    const response = await request();
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const apiError = error as ApiError;
    return {
      error: apiError,
      status: 500,
    };
  }
};

export default api;