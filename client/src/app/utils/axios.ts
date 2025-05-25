import axios from 'axios';
import { requestCache } from './requestCache';

// Create a custom axios instance with optimized configs
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Giảm timeout xuống 5 giây để nhanh hơn
  // Tối ưu hiệu năng
  withCredentials: false, // Không gửi cookies trừ khi cần
  responseType: 'json',
  maxRedirects: 2, // Giảm số lần chuyển hướng
});

// Add a request interceptor to include auth token if available
// Tạo một Map để lưu trữ thời gian request trước đó để tránh hiển thị loading quá nhiều lần
const requestTimestamps = new Map();

// Track ETags for conditional requests
const etagsCache = new Map();

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isPrefetch = config.headers?.['X-Prefetch'] === 'true';
    
    // Add If-None-Match header if we have an ETag for this URL
    if (config.method?.toLowerCase() === 'get') {
      const etag = etagsCache.get(url);
      if (etag && config.headers) {
        config.headers['If-None-Match'] = etag;
      }
    }
    
    // Check cache for GET requests when not forced to skip cache
    if (config.method?.toLowerCase() === 'get' && !config.headers?.['x-skip-cache']) {
      const params = config.params ? JSON.stringify(config.params) : '';
      const cacheKey = `${url}${params}`;
      const cachedData = requestCache.get(cacheKey);
      
      // If data is in cache and this is not a prefetch request, return cached data
      if (cachedData && !isPrefetch) {
        // Return cached data by converting this request to a "canceled" one
        // and resolving with cached data
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        setTimeout(() => {
          source.cancel(JSON.stringify({ cachedData }));
        }, 0);
      }
    } else {
      // For non-GET requests or forced fetch, add timestamp to avoid any browser caching
      config.params = {
        ...config.params,
        _t: Date.now() 
      };
    }
    
    // For prefetch requests, apply lower priority and longer timeout
    if (isPrefetch) {
      // Lower priority for prefetch requests to not interfere with user actions
      config.timeout = 10000; // Longer timeout
    }
    
    // Lưu trữ thời gian request để tính toán thời gian phản hồi sau này
    requestTimestamps.set(url, Date.now());

    // Get token from localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Use 'token' instead of 'auth_token' to match AuthContext
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling and caching
axiosInstance.interceptors.response.use(
  (response) => {
    // Save ETag if provided by the server
    if (response.headers.etag) {
      const url = response.config.url || '';
      etagsCache.set(url, response.headers.etag);
    }
    
    // Handle HTTP 304 Not Modified responses
    if (response.status === 304) {
      const url = response.config.url || '';
      const params = response.config.params ? JSON.stringify(response.config.params) : '';
      const cacheKey = `${url}${params}`;
      const cachedData = requestCache.get(cacheKey);
      
      if (cachedData) {
        return {
          ...response,
          data: cachedData,
          status: 200,
          statusText: 'OK (from cache)'
        };
      }
    }
    
    // Only cache GET requests
    if (response.config.method?.toLowerCase() === 'get') {
      const url = response.config.url || '';
      const params = response.config.params ? JSON.stringify(response.config.params) : '';
      const cacheKey = `${url}${params}`;
      
      // Parse Cache-Control header if available
      let expiry = 30 * 1000; // 30 seconds default
      if (response.headers['cache-control']) {
        const maxAgeMatch = response.headers['cache-control'].match(/max-age=(\d+)/);
        if (maxAgeMatch && maxAgeMatch[1]) {
          expiry = parseInt(maxAgeMatch[1], 10) * 1000; // Convert seconds to milliseconds
        }
      }
      
      // Use longer expiry and higher priority for important routes
      const isImportantRoute = url.includes('/tables') || url.includes('/orders');
      const isRestaurantInfo = url.includes('/restaurants/info');
      
      // Restaurant info is often static and can be cached longer
      if (!response.headers['cache-control']) {
        expiry = isRestaurantInfo ? 5 * 60 * 1000 : // 5 minutes for restaurant info
                isImportantRoute ? 60 * 1000 :      // 60s for important routes
                30 * 1000;                          // 30s for others
      }
      
      const priority = isRestaurantInfo ? 3 :           // Highest priority for restaurant info
                      isImportantRoute ? 2 :            // Higher priority for important routes
                      1;
      
      requestCache.set(cacheKey, response.data, expiry, priority);
      
      // Measure and log response time for performance monitoring
      const startTime = requestTimestamps.get(url);
      if (startTime) {
        const responseTime = Date.now() - startTime;
        const isPrefetch = response.config.headers?.['X-Prefetch'] === 'true';
          
        // Only log important or slow responses to reduce console noise and improve performance
        if (responseTime > 1000) { // More than 1 second is slow
          console.warn(`Slow response: ${url} took ${responseTime.toFixed(2)}ms`);
        } else if (!isPrefetch && (isRestaurantInfo || isImportantRoute)) {
          // Only log important routes that aren't prefetch requests
          console.debug(`Response time for ${url}: ${responseTime}ms`);
        }
        
        requestTimestamps.delete(url);
      }
    }
    
    return response;
  },    (error) => {
    // Check if this is our "fake" cancellation with cached data
    if (axios.isCancel(error) && error.message) {
      try {
        const { cachedData } = JSON.parse(error.message || "{}");
        if (cachedData) {
          // Return the cached data as if it came from the network
          return Promise.resolve({ 
            data: cachedData, 
            status: 200, 
            statusText: 'OK',
            headers: {},
            cached: true
          });
        }
      } catch (e) {
        // If error parsing, continue with normal error handling
        console.error('Error handling cached response:', e);
      }
    }
    
    // Check if the error is a network error
    if (!error.response) {
      // Network error (server unreachable, etc.)
      console.error('Network error detected:', error.message);
      if (typeof window !== 'undefined') {
        // Use dynamic import for message to avoid SSR issues
        import('antd').then(({ message }) => {
          message.error('Kết nối đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.');
        });
      }
    } 
    // Handle session expiration (401 Unauthorized) 
    else if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't redirect on API operations that might reasonably return 401
      const isApiOperation = error.config?.url && (
        error.config.url.includes('/delete') ||
        error.config.url.includes('/update') ||
        error.config.method === 'delete' ||
        error.config.method === 'patch' ||
        error.config.method === 'put'
      );
      
      if (!isApiOperation) {
        // Only clear token and redirect for non-API operations
        localStorage.removeItem('token');
        // Use dynamic import for message to avoid SSR issues
        import('antd').then(({ message }) => {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        });
        
        // Use a small timeout to allow the message to be displayed before redirecting
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1000);
      }
    }
    // Handle Forbidden (403) - display message but don't redirect
    else if (error.response?.status === 403 && typeof window !== 'undefined') {
      // Use dynamic import for message to avoid SSR issues
      import('antd').then(({ message }) => {
        message.error('Bạn không có quyền thực hiện thao tác này.');
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
