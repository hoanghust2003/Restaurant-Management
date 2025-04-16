"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ShoppingCart, Search, Menu as MenuIcon, X } from "lucide-react";
import { UserRole } from "@/contexts/auth-types";

interface CustomerLayoutProps {
  children: React.ReactNode;
  tableId?: string;
  cartItemCount?: number;
}

export default function CustomerLayout({ 
  children, 
  tableId = "T01", 
  cartItemCount = 0
}: CustomerLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();
  
  // Xác định xem người dùng hiện tại có phải là nhân viên (có thể xem thông tin nhà hàng) không
  const isStaff = user && (
    user.role === UserRole.ADMIN || 
    user.role === UserRole.MANAGER || 
    user.role === UserRole.RECEPTION || 
    user.role === UserRole.WAITER
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/customer" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Nhà hàng ABC</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/customer" className="font-medium hover:text-blue-600">
                Trang chủ
              </Link>
              <Link href="/customer/menu" className="font-medium hover:text-blue-600">
                Thực đơn
              </Link>
              <Link href="/customer/orders" className="font-medium hover:text-blue-600">
                Đơn hàng
              </Link>
              <Link href="/customer/about" className="font-medium hover:text-blue-600">
                Giới thiệu
              </Link>
              
              {/* Hiển thị liên kết đến phân hệ khác nếu là nhân viên */}
              {isStaff && (
                <Link 
                  href={user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER 
                    ? "/admin/dashboard" 
                    : "/reception/dashboard"}
                  className="font-medium text-green-600 hover:text-green-700"
                >
                  Vào hệ thống quản lý
                </Link>
              )}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <Link
                href="/customer/cart"
                className="relative p-2 rounded-md hover:bg-gray-100"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search bar (collapsible) */}
          {isSearchOpen && (
            <div className="mt-3 pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Table information */}
      {tableId && (
        <div className="bg-blue-50 text-blue-800 py-2 px-4">
          <div className="container mx-auto">
            <p className="text-center">
              <span className="font-semibold">Bàn số: {tableId}</span> - Quý khách vui lòng gọi món từ menu
            </p>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsMenuOpen(false)}></div>
          
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="space-y-4">
              <Link href="/customer" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Trang chủ
              </Link>
              <Link href="/customer/menu" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Thực đơn
              </Link>
              <Link href="/customer/orders" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Đơn hàng
              </Link>
              <Link href="/customer/about" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Giới thiệu
              </Link>
              
              {/* Hiển thị liên kết đến phân hệ khác nếu là nhân viên - mobile */}
              {isStaff && (
                <Link 
                  href={user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER 
                    ? "/admin/dashboard" 
                    : "/reception/dashboard"}
                  className="block py-2 text-green-600 hover:text-green-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Vào hệ thống quản lý
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Nhà hàng ABC</h3>
              <p className="text-gray-300">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
              <p className="text-gray-300">Điện thoại: (028) 1234 5678</p>
              <p className="text-gray-300">Email: contact@restaurant.com</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Giờ mở cửa</h3>
              <p className="text-gray-300">Thứ 2 - Thứ 6: 10:00 - 22:00</p>
              <p className="text-gray-300">Thứ 7 - Chủ nhật: 08:00 - 23:00</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Kết nối</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-blue-400">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-blue-400">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-blue-400">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Nhà hàng ABC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}