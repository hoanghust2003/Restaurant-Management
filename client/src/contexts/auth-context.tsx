"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole, hasPermission } from './auth-types';

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Tạo AuthContext với giá trị mặc định
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Helper function để an toàn khi truy cập localStorage (tránh lỗi when SSR)
const getFromLocalStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setToLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeFromLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// Provider component để cung cấp AuthContext cho toàn bộ ứng dụng
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Kiểm tra có token được lưu trong localStorage không
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getFromLocalStorage('token');
        
        if (token) {
          // Trong thực tế, bạn sẽ gọi API để xác thực token và lấy thông tin người dùng
          // Ở đây chúng ta sẽ giả lập
          const userDataString = getFromLocalStorage('user');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        removeFromLocalStorage('token');
        removeFromLocalStorage('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Kiểm tra quyền truy cập route khi pathname thay đổi
  useEffect(() => {
    if (!isLoading) {
      // Bỏ qua kiểm tra cho trang đăng nhập và trang chủ
      if (pathname === '/' || pathname?.startsWith('/auth') || pathname === '/customer/menu') {
        return;
      }
      
      // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      // Nếu đã đăng nhập nhưng không có quyền truy cập, chuyển đến trang không có quyền
      if (pathname && !hasPermission(user, pathname)) {
        router.push('/unauthorized');
      }
    }
  }, [pathname, user, isLoading, router]);

  // Hàm đăng nhập
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Trong thực tế, bạn sẽ gọi API để đăng nhập và lấy token
      // Ở đây chúng ta sẽ giả lập

      // Giả lập gọi API đăng nhập
      const response = await simulateApiLogin(username, password);
      
      // Lưu token vào localStorage
      setToLocalStorage('token', response.token);
      
      // Lưu thông tin người dùng
      setToLocalStorage('user', JSON.stringify(response.user));
      
      // Cập nhật trạng thái
      setUser(response.user);
      
      // Chuyển hướng dựa vào vai trò
      redirectBasedOnRole(response.user.role);
      
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    removeFromLocalStorage('token');
    removeFromLocalStorage('user');
    setUser(null);
    router.push('/auth/login');
  };

  // Giả lập gọi API đăng nhập
  const simulateApiLogin = async (username: string, password: string) => {
    // Trong thực tế, đây sẽ là API call thực tế
    const users: Record<string, { user: User; token: string }> = {
      'admin': {
        user: {
          id: 1,
          username: 'admin',
          fullName: 'Admin User',
          email: 'admin@restaurant.com',
          role: UserRole.ADMIN,
          isActive: true
        },
        token: 'admin-fake-token'
      },
      'manager': {
        user: {
          id: 2,
          username: 'manager',
          fullName: 'Restaurant Manager',
          email: 'manager@restaurant.com',
          role: UserRole.MANAGER,
          isActive: true
        },
        token: 'manager-fake-token'
      },
      'chef': {
        user: {
          id: 3,
          username: 'chef',
          fullName: 'Chef Master',
          email: 'chef@restaurant.com',
          role: UserRole.CHEF,
          isActive: true
        },
        token: 'chef-fake-token'
      },
      'reception': {
        user: {
          id: 4,
          username: 'reception',
          fullName: 'Front Desk',
          email: 'reception@restaurant.com',
          role: UserRole.RECEPTION,
          isActive: true
        },
        token: 'reception-fake-token'
      },
      'waiter': {
        user: {
          id: 5,
          username: 'waiter',
          fullName: 'Service Staff',
          email: 'waiter@restaurant.com',
          role: UserRole.WAITER,
          isActive: true
        },
        token: 'waiter-fake-token'
      }
    };

    // Dừng 500ms để giả lập độ trễ mạng
    await new Promise(resolve => setTimeout(resolve, 500));

    if (users[username] && password === `${username}123`) {
      return users[username];
    }
    
    throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
  };

  // Chuyển hướng dựa vào vai trò
  const redirectBasedOnRole = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
      case UserRole.MANAGER:
        router.push('/admin/dashboard');
        break;
      case UserRole.CHEF:
        router.push('/kitchen/dashboard');
        break;
      case UserRole.RECEPTION:
        router.push('/reception/dashboard');
        break;
      case UserRole.WAITER:
        router.push('/reception/tables');
        break;
      case UserRole.CUSTOMER:
        router.push('/customer/menu');
        break;
      default:
        router.push('/');
        break;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}