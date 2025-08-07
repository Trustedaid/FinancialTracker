import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
  context?: Record<string, any>;
  timestamp: string;
  traceId: string;
  correlationId?: string;
}

export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private readonly baseRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: AxiosError) => {
      return !error.response || error.response.status >= 500 || error.response.status === 429;
    }
  };

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupRetryLogic();
    this.loadTokenFromStorage();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add correlation ID for request tracking
        config.headers['X-Correlation-ID'] = this.generateCorrelationId();
        
        // Add auth token
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        // Add request timestamp
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logSuccessfulRequest(response);
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private setupRetryLogic() {
    // Add axios-retry-like functionality
    this.client.interceptors.response.use(undefined, async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { 
        _retry?: boolean; 
        _retryCount?: number;
        _retryConfig?: RetryConfig;
      };

      if (!config || config._retry) {
        return Promise.reject(error);
      }

      const retryConfig = config._retryConfig || this.baseRetryConfig;
      
      if (!this.shouldRetry(error, retryConfig)) {
        return Promise.reject(error);
      }

      config._retryCount = config._retryCount || 0;
      config._retryCount++;

      if (config._retryCount > retryConfig.retries) {
        return Promise.reject(error);
      }

      const delay = this.calculateRetryDelay(config._retryCount, retryConfig.retryDelay);
      
      console.warn(`Retrying request (${config._retryCount}/${retryConfig.retries}) after ${delay}ms:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        error: error.message
      });

      await this.delay(delay);
      
      return this.client(config);
    });
  }

  private async handleResponseError(error: AxiosError): Promise<any> {
    const response = error.response;
    const config = error.config;

    this.logFailedRequest(error);

    // Handle network errors
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } else if (!navigator.onLine) {
        toast.error('You appear to be offline. Please check your connection.');
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (response.status === 401) {
      return this.handleUnauthorized(error);
    }

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers['retry-after'];
      const message = retryAfter 
        ? `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
        : 'Rate limit exceeded. Please try again later.';
      
      toast.error(message, { duration: 6000 });
      return Promise.reject(error);
    }

    // Handle server errors
    if (response.status >= 500) {
      const errorData = response.data as ApiErrorResponse;
      const message = errorData?.detail || 'Server error. Please try again later.';
      
      toast.error(message, { 
        duration: 8000,
        style: {
          background: '#dc2626',
          color: 'white',
        }
      });
      
      // Log server errors for monitoring
      console.error('Server Error:', {
        status: response.status,
        url: config?.url,
        method: config?.method,
        data: errorData,
        correlationId: response.headers['x-correlation-id'],
        timestamp: new Date().toISOString()
      });
    }

    return Promise.reject(error);
  }

  private async handleUnauthorized(error: AxiosError) {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (config._retry) {
      // Already tried to refresh, redirect to login
      this.clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh token
      const newToken = await this.refreshAccessToken();
      
      if (newToken) {
        config._retry = true;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return this.client(config);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }

    // Refresh failed, redirect to login
    this.clearAuth();
    toast.error('Your session has expired. Please log in again.');
    window.location.href = '/login';
    return Promise.reject(error);
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return null;
      }

      const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      this.setToken(accessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  private shouldRetry(error: AxiosError, retryConfig: RetryConfig): boolean {
    return retryConfig.retryCondition ? retryConfig.retryCondition(error) : true;
  }

  private calculateRetryDelay(retryCount: number, baseDelay: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1);
    const jitter = Math.random() * 1000;
    return exponentialDelay + jitter;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logSuccessfulRequest(response: AxiosResponse) {
    const duration = response.config.metadata?.startTime 
      ? new Date().getTime() - response.config.metadata.startTime.getTime()
      : 0;

    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
  }

  private logFailedRequest(error: AxiosError) {
    const config = error.config;
    const response = error.response;
    const duration = config?.metadata?.startTime 
      ? new Date().getTime() - config.metadata.startTime.getTime()
      : 0;

    console.error(`❌ ${config?.method?.toUpperCase()} ${config?.url} - ${response?.status || 'Network Error'} (${duration}ms)`, {
      error: error.message,
      response: response?.data,
      correlationId: response?.headers['x-correlation-id']
    });
  }

  private loadTokenFromStorage() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.setToken(token);
    }
  }

  // Public methods
  public setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  public clearAuth() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  // Method to configure retry for specific requests
  public withRetry(config: Partial<RetryConfig>) {
    return {
      get: <T = any>(url: string, requestConfig?: AxiosRequestConfig) =>
        this.get<T>(url, { ...requestConfig, _retryConfig: { ...this.baseRetryConfig, ...config } }),
      post: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig) =>
        this.post<T>(url, data, { ...requestConfig, _retryConfig: { ...this.baseRetryConfig, ...config } }),
      put: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig) =>
        this.put<T>(url, data, { ...requestConfig, _retryConfig: { ...this.baseRetryConfig, ...config } }),
      patch: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig) =>
        this.patch<T>(url, data, { ...requestConfig, _retryConfig: { ...this.baseRetryConfig, ...config } }),
      delete: <T = any>(url: string, requestConfig?: AxiosRequestConfig) =>
        this.delete<T>(url, { ...requestConfig, _retryConfig: { ...this.baseRetryConfig, ...config } })
    };
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;