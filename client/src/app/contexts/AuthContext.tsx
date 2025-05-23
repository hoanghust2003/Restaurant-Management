'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

// Định nghĩa các vai trò người dùng khớp với backend
export type UserRole = 'admin' | 'staff' | 'chef' | 'warehouse' | 'customer';

// Định nghĩa kiểu dữ liệu cho người dùng
export interface User {
  id: string;
  email: string;
  name: string; // Backend sử dụng name thay vì firstName và lastName
  role: UserRole;
  avatar_url?: string;
}

// Định nghĩa kiểu dữ liệu cho JWT payload
interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  // name không tồn tại trong token
}

// Định nghĩa kiểu dữ liệu cho Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  updateUserProfile: () => Promise<void>;
}

// Kiểu dữ liệu cho form đăng ký
export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

// API endpoint cơ sở
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Thiết lập axios interceptor để thêm token vào header
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Interceptor để xử lý lỗi 401 (Unauthorized)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Chỉ xử lý lỗi 401 khi không phải đang đăng nhập/đăng ký
        if (error.response?.status === 401 && 
            !error.config.url.includes('/auth/login') && 
            !error.config.url.includes('/auth/register')) {
          logout();
          router.push('/auth/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Giải mã token để lấy thông tin người dùng
          const decoded = jwtDecode<JwtPayload>(token);
          
          // Kiểm tra xem token còn hạn không
          const currentTime = Date.now() / 1000;
          
          // Check if token will expire soon (within 5 minutes)
          const tokenExpiringTime = 300; // 5 minutes
          
          if (decoded.exp < currentTime) {
            // Token đã hết hạn
            console.log('Token hết hạn, đăng xuất.');
            localStorage.removeItem('token');
            setUser(null);
            axios.defaults.headers.common['Authorization'] = '';
          } else if ((decoded.exp - currentTime) < tokenExpiringTime) {
            console.log('Token sắp hết hạn, thử làm mới token');
            // Token sắp hết hạn, thử làm mới token nếu server hỗ trợ
            try {
              const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (refreshResponse.data?.accessToken) {
                // Cập nhật token mới
                localStorage.setItem('token', refreshResponse.data.accessToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
                console.log('Đã làm mới token thành công');
              }
            } catch (refreshError) {
              console.log('Không thể làm mới token:', refreshError);
              // Vẫn sử dụng token hiện tại nếu không làm mới được
            }
          } else {
            // Token còn hiệu lực - cần lấy thêm thông tin người dùng từ API
            try {
              // Gọi API để lấy thông tin user đầy đủ
              const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              setUser({
                id: decoded.sub,
                email: decoded.email,
                name: response.data.name,
                role: decoded.role,
                avatar_url: response.data.avatar_url
              });
            } catch (apiError) {
              console.error('Error fetching user info:', apiError);
              // Vẫn set thông tin cơ bản từ token nếu API lỗi
              setUser({
                id: decoded.sub,
                email: decoded.email,
                name: decoded.email.split('@')[0], // Fallback nếu không có name
                role: decoded.role,
                avatar_url: undefined
              });
            }
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Đăng nhập
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      const { accessToken, user } = response.data;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', accessToken);
      
      // Thiết lập token cho các request sau này
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Giải mã token để lấy thông tin cơ bản
      const decoded = jwtDecode<JwtPayload>(accessToken);
      
      // Sử dụng thông tin user từ response thay vì từ token
      setUser({
        id: decoded.sub, // id từ token
        email: decoded.email, // email từ token
        name: user.name, // name từ user object trong response
        role: decoded.role, // role từ token
        avatar_url: user.avatar_url // avatar từ user object
      });
      
      toast.success('Đăng nhập thành công!');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData: RegisterFormData) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email: userData.email,
        password: userData.password,
        name: userData.name
      });
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    axios.defaults.headers.common['Authorization'] = '';
    toast.info('Đã đăng xuất');
    router.push('/auth/login');
  };
  // Cập nhật thông tin người dùng từ API
  const updateUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Log the response data to see what we're getting from the server
        console.log('Auth ME response data:', response.data);
        
        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: response.data.name,
          role: decoded.role,
          avatar_url: response.data.avatar_url
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  // Kiểm tra người dùng có role được yêu cầu không
  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        hasRole,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;