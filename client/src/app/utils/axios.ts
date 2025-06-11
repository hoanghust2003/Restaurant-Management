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

axiosInstance.interceptors.request.use(
  (config) => {
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
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized error - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
