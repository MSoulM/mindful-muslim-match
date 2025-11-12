import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';
import PerformanceMonitor from '@/services/PerformanceMonitor';
import { cacheManager } from '@/services/CacheManager';

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.muslimsoulmateai.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Track in-flight refresh requests to prevent duplicate refreshes
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// ============= Request Interceptor =============
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from store
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add performance tracking metadata
    (config as any).metadata = { startTime: performance.now() };

    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// ============= Response Interceptor =============
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Record API performance
    const config = response.config as any;
    if (config.metadata?.startTime) {
      const duration = performance.now() - config.metadata.startTime;
      PerformanceMonitor.recordApiCall(
        `${config.method?.toUpperCase()} ${config.url}`,
        duration,
        { status: response.status }
      );
      
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url} - ${duration.toFixed(0)}ms`);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      metadata?: { startTime: number };
    };

    // Record failed API call
    if (originalRequest?.metadata) {
      const duration = performance.now() - originalRequest.metadata.startTime;
      PerformanceMonitor.recordApiCall(
        `${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
        duration,
        { status: error.response?.status, error: true }
      );
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAuthToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Refresh failed - logout user
        useAuthStore.getState().clearAuth();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = getErrorMessage(error);
    console.error(`[API] Error: ${errorMessage}`, error);

    return Promise.reject(error);
  }
);

// ============= Helper Functions =============

/**
 * Refresh authentication token
 */
async function refreshAuthToken(): Promise<string> {
  try {
    // In a real app, this would call your refresh token endpoint
    const { session } = useAuthStore.getState();
    
    if (!session?.refresh_token) {
      throw new Error('No refresh token available');
    }

    // TODO: Replace with actual refresh token API call
    const response = await axios.post(
      `${API_CONFIG.baseURL}/auth/refresh`,
      { refresh_token: session.refresh_token }
    );

    const newToken = response.data.access_token;
    
    // Update store with new token
    useAuthStore.getState().setAuth(
      useAuthStore.getState().user,
      { ...session, access_token: newToken } as any
    );

    return newToken;
  } catch (error) {
    console.error('[API] Token refresh failed:', error);
    throw error;
  }
}

/**
 * Extract user-friendly error message
 */
function getErrorMessage(error: AxiosError): string {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as any;
    return data?.message || data?.error || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred';
  }
}

// ============= API Client with Caching =============

interface ApiRequestConfig<T = any> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  params?: any;
  cache?: {
    key?: string;
    ttl?: number;
    invalidatePatterns?: string[];
  };
}

/**
 * Make API request with optional caching
 */
export async function apiRequest<T = any>(config: ApiRequestConfig<T>): Promise<T> {
  const { url, method = 'GET', data, params, cache } = config;

  // Check cache for GET requests
  if (method === 'GET' && cache?.key) {
    const cached = cacheManager.get<T>(cache.key);
    if (cached !== null) {
      console.log(`[API] Cache hit: ${cache.key}`);
      return cached;
    }
  }

  // Make request
  const response = await apiClient.request<T>({
    url,
    method,
    data,
    params,
  });

  // Cache successful GET responses
  if (method === 'GET' && cache?.key) {
    cacheManager.set(cache.key, response.data, { ttl: cache.ttl });
  }

  // Invalidate cache patterns for mutations
  if (method !== 'GET' && cache?.invalidatePatterns) {
    cache.invalidatePatterns.forEach((pattern) => {
      // Invalidate all keys that match the pattern
      const stats = cacheManager.getStats();
      // Note: In a full implementation, you'd need to track keys to match patterns
      // For now, we'll just invalidate specific known keys
      cacheManager.invalidate(pattern);
    });
  }

  return response.data;
}

// ============= Typed API Methods =============

export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, params?: any, cacheConfig?: ApiRequestConfig['cache']) =>
    apiRequest<T>({ url, method: 'GET', params, cache: cacheConfig }),

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, invalidatePatterns?: string[]) =>
    apiRequest<T>({ url, method: 'POST', data, cache: { invalidatePatterns } }),

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, invalidatePatterns?: string[]) =>
    apiRequest<T>({ url, method: 'PUT', data, cache: { invalidatePatterns } }),

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, invalidatePatterns?: string[]) =>
    apiRequest<T>({ url, method: 'PATCH', data, cache: { invalidatePatterns } }),

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, invalidatePatterns?: string[]) =>
    apiRequest<T>({ url, method: 'DELETE', cache: { invalidatePatterns } }),
};

export default apiClient;
