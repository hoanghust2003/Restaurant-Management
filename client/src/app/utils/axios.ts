import axios from 'axios';

// Create a custom axios instance with default configs
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
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

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,  (error) => {
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
