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

axiosInstance.interceptors.request.use(  (config) => {
    const url = config.url || '';
    const isPrefetch = config.headers?.['X-Prefetch'] === 'true';
    
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
    // Only cache GET requests
    if (response.config.method?.toLowerCase() === 'get') {
      const url = response.config.url || '';
      const params = response.config.params ? JSON.stringify(response.config.params) : '';
      const cacheKey = `${url}${params}`;
        // Cache the successful response data
      // Use longer expiry and higher priority for important routes
      const isImportantRoute = url.includes('/tables') || url.includes('/orders');
      const expiry = isImportantRoute ? 60 * 1000 : 30 * 1000; // 60s for important routes, 30s for others
      const priority = isImportantRoute ? 2 : 1; // Higher priority for important routes
      
      requestCache.set(cacheKey, response.data, expiry, priority);
          // Measure and log response time for performance monitoring
      const startTime = requestTimestamps.get(url);
      if (startTime) {
        const responseTime = Date.now() - startTime;
        const isPrefetch = response.config.headers?.['X-Prefetch'] === 'true';
        
        // Only log non-prefetch requests to reduce console noise
        if (!isPrefetch) {
          console.debug(`Response time for ${url}: ${responseTime}ms`);
        }
        
        // Log slow responses regardless of prefetch status
        if (responseTime > 1000) { // More than 1 second is slow
          console.warn(`Slow response: ${url} took ${responseTime.toFixed(2)}ms`);
        }
        
        requestTimestamps.delete(url);
      }
    }
    
    return response;
  },  
  (error) => {
    // Check if this is our "fake" cancellation with cached data
    if (axios.isCancel(error) && error.message) {
      try {
        const { cachedData } = JSON.parse(error.message);
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
    // Handle session expiration (401 Unauthorized) or Forbidden (403)
    else if ((error.response?.status === 401 || error.response?.status === 403) && typeof window !== 'undefined') {
      // Clear local storage and redirect to login if token is invalid/expired or access forbidden
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
      // Use dynamic import for message to avoid SSR issues
      import('antd').then(({ message }) => {
        message.error('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
