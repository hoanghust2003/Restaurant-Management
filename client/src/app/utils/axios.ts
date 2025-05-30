import axios, { AxiosError, AxiosHeaders } from 'axios';
import { requestCache } from './requestCache';

import { message } from 'antd';

// Create a custom axios instance with optimized configs
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
  withCredentials: false,
  responseType: 'json',
  maxRedirects: 2,
});

// Add a request interceptor to include auth token if available
const requestTimestamps = new Map();

axiosInstance.interceptors.request.use((config) => {
    const url = config.url || '';
    const isPrefetch = config.headers?.['X-Prefetch'] === 'true';

    // Initialize headers if undefined
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    // Add auth token to all requests if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Check cache for GET requests when not forced to skip cache
    if (config.method?.toLowerCase() === 'get' && !config.headers?.['x-skip-cache']) {
      const params = config.params ? JSON.stringify(config.params) : '';
      const cacheKey = `${url}${params}`;
      const cachedData = requestCache.get(cacheKey);
      
      // If data is in cache and this is not a prefetch request, return cached data
      if (cachedData && !isPrefetch) {
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        setTimeout(() => {
          source.cancel(JSON.stringify({ cachedData }));
        }, 0);
      }
    } else {
      // For non-GET requests or forced fetch, add timestamp to avoid browser caching
      config.params = {
        ...config.params,
        _t: Date.now() 
      };
    }
    
    // For prefetch requests, apply lower priority and longer timeout
    if (isPrefetch) {
      config.timeout = 10000;
    }
    
    requestTimestamps.set(url, Date.now());
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling and caching
axiosInstance.interceptors.response.use(
  (response) => {
    // Only cache GET requests
    if (response.config.method?.toLowerCase() === 'get') {
      const url = response.config.url || '';
      const params = response.config.params ? JSON.stringify(response.config.params) : '';
      const cacheKey = `${url}${params}`;

      // Cache the successful response data with priority
      const isImportantRoute = url.includes('/tables') || url.includes('/orders');
      const expiry = isImportantRoute ? 60 * 1000 : 30 * 1000;
      const priority = isImportantRoute ? 2 : 1;
      
      requestCache.set(cacheKey, response.data, expiry, priority);

      // Measure and log response time for performance monitoring
      const startTime = requestTimestamps.get(url);
      if (startTime) {
        const responseTime = Date.now() - startTime;
        const isPrefetch = response.config.headers?.['X-Prefetch'] === 'true';
        
        if (!isPrefetch) {
          console.debug(`Response time for ${url}: ${responseTime}ms`);
        }
        
        if (responseTime > 1000) {
          console.warn(`Slow response: ${url} took ${responseTime.toFixed(2)}ms`);
        }
        
        requestTimestamps.delete(url);
      }
    }
    
    return response;
  },  
  async (error: AxiosError) => {
    // Check if this is our "fake" cancellation with cached data
    if (axios.isCancel(error) && error.message) {
      try {
        const { cachedData } = JSON.parse(error.message);
        if (cachedData) {
          return {
            data: cachedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            cached: true
          };
        }
      } catch (e) {
        console.error('Error handling cached response:', e);
      }
    }

    // Handle different error scenarios
    if (!error.response) {
      // Network error
      console.error('Network error detected:', error.message);
      message.error('Kết nối đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.');
    } 
    // Handle session expiration (401 Unauthorized)
    else if (error.response?.status === 401) {
      // Don't redirect on API operations that might reasonably return 401
      const isApiOperation = error.config?.url && (
        error.config.url.includes('/delete') ||
        error.config.url.includes('/update') ||
        error.config.method === 'delete' ||
        error.config.method === 'patch' ||
        error.config.method === 'put'
      );
      
      if (!isApiOperation && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        
        // Use a small timeout to allow the message to be displayed before redirecting
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1000);
      }
    }
    // Handle Forbidden (403)
    else if (error.response?.status === 403) {
      message.error('Bạn không có quyền thực hiện thao tác này.');
    }
    // Handle other error cases
    else {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
