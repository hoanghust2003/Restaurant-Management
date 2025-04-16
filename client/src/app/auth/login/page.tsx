"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Nếu đã đăng nhập, chuyển hướng về trang phù hợp
  useEffect(() => {
    if (isAuthenticated && user) {
      // Chuyển hướng dựa vào vai trò người dùng
      switch (user.role) {
        case 'admin':
        case 'manager':
          router.push('/admin/dashboard');
          break;
        case 'chef':
          router.push('/kitchen/dashboard');
          break;
        case 'reception':
          router.push('/reception/dashboard');
          break;
        case 'waiter':
          router.push('/reception/tables');
          break;
        case 'customer':
          router.push('/customer/menu');
          break;
        default:
          router.push('/');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return; // Tránh việc submit khi đang trong quá trình đăng nhập

    setError(null);
    setIsLoggingIn(true);

    try {
      await login(username, password);
      // Không cần chuyển hướng ở đây vì useEffect sẽ tự động chuyển hướng khi isAuthenticated thay đổi
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Đăng nhập
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Nhập thông tin đăng nhập để vào hệ thống
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-gray-700 font-semibold mb-2"
              >
                Tài khoản
              </label>
              <input
                id="username"
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoggingIn}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2"
              isLoading={isLoggingIn}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            
            <div className="mt-4 text-center">
              <Link 
                href="/"
                className="text-blue-600 hover:underline text-sm"
              >
                Quay lại trang chủ
              </Link>
            </div>
          </form>

          {/* Thêm phần demo account để dễ dàng test */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Demo accounts:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <span className="font-medium">Admin:</span> admin / admin123
              </li>
              <li>
                <span className="font-medium">Manager:</span> manager / manager123
              </li>
              <li>
                <span className="font-medium">Chef:</span> chef / chef123
              </li>
              <li>
                <span className="font-medium">Reception:</span> reception / reception123
              </li>
              <li>
                <span className="font-medium">Waiter:</span> waiter / waiter123
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}