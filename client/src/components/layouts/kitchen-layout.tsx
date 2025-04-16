"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ChefHat, Coffee, CheckSquare, Bell, Menu, X, Clock } from "lucide-react";

interface KitchenLayoutProps {
  children: React.ReactNode;
  pendingOrderCount?: number;
}

export default function KitchenLayout({ 
  children, 
  pendingOrderCount = 0
}: KitchenLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  
  // Lấy thông tin từ user object
  const userName = user?.fullName || "Chef User";
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative w-64 h-full bg-gray-800 text-white transition-transform duration-200 lg:translate-x-0 z-40`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <ChefHat size={24} />
            <h1 className="text-xl font-bold">Kitchen Dashboard</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between p-3 bg-blue-600 rounded-md">
            <div className="flex items-center space-x-2">
              <Bell size={18} />
              <span>Đơn đang chờ</span>
            </div>
            <span className="px-2 py-1 bg-white text-blue-600 rounded-md font-bold">
              {pendingOrderCount}
            </span>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/kitchen/dashboard"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700"
              >
                <Coffee size={18} />
                <span>Tất cả đơn hàng</span>
              </Link>
            </li>
            <li>
              <Link
                href="/kitchen/in-progress"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700"
              >
                <Clock size={18} />
                <span>Đang chế biến</span>
              </Link>
            </li>
            <li>
              <Link
                href="/kitchen/completed"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700"
              >
                <CheckSquare size={18} />
                <span>Hoàn thành</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="font-bold text-white">{userName.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-gray-400">Đầu bếp</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={logout}
              className="block w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-center"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-md py-4 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Giao diện Bếp</h2>
              <p className="text-gray-500">Quản lý đơn hàng và chế biến món ăn</p>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md">
                <span className="font-medium">Trực tuyến</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {new Date().toLocaleDateString("vi-VN", { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <Clock className="text-gray-500" size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}