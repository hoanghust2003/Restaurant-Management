"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { 
  ChevronDown, 
  LayoutDashboard, 
  Users, 
  ChefHat, 
  Coffee, 
  ShoppingBasket, 
  BarChartHorizontal,
  LogOut,
  Settings,
  Menu,
  X
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  hasSubmenu?: boolean;
  submenuItems?: Array<{
    href: string;
    label: string;
  }>;
}

const NavItem = ({ href, icon, label, isActive = false, hasSubmenu = false, submenuItems = [] }: NavItemProps) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  return (
    <div className="mb-1">
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
        }`}
        onClick={hasSubmenu ? (e) => {
          e.preventDefault();
          setIsSubmenuOpen(!isSubmenuOpen);
        } : undefined}
      >
        {icon}
        <span className="flex-1">{label}</span>
        {hasSubmenu && (
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isSubmenuOpen ? "transform rotate-180" : ""}`}
          />
        )}
      </Link>

      {hasSubmenu && isSubmenuOpen && (
        <div className="pl-10 mt-1 space-y-1">
          {submenuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block py-1.5 px-2 text-sm rounded hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Kiểm tra pathname hiện tại để đánh dấu menu active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname?.startsWith(path);
  };
  
  // Lấy thông tin từ user object thay vì hardcode
  const userRole = user?.role || "Admin";
  const userName = user?.fullName || "Admin User";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 w-64 h-full border-r bg-white z-40 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Restaurant Management</h1>
            <p className="text-sm text-gray-500">System Admin</p>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <NavItem 
              href="/admin/dashboard" 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              isActive={isActive("/admin/dashboard")}
            />
            <NavItem 
              href="/admin/users" 
              icon={<Users size={18} />} 
              label="Người dùng" 
              isActive={isActive("/admin/users")}
            />
            <NavItem 
              href="/admin/kitchen" 
              icon={<ChefHat size={18} />} 
              label="Quản lý bếp" 
              isActive={isActive("/admin/kitchen")}
            />
            <NavItem 
              href="/admin/menu-items" 
              icon={<Coffee size={18} />} 
              label="Quản lý món" 
              isActive={isActive("/admin/menu-items")}
              hasSubmenu
              submenuItems={[
                { href: "/admin/menu-items", label: "Danh sách món" },
                { href: "/admin/menu-items/categories", label: "Danh mục" },
                { href: "/admin/menu-items/new", label: "Thêm món mới" },
              ]}
            />
            <NavItem 
              href="/admin/inventory" 
              icon={<ShoppingBasket size={18} />} 
              label="Quản lý kho" 
              isActive={isActive("/admin/inventory")}
              hasSubmenu
              submenuItems={[
                { href: "/admin/inventory", label: "Tồn kho" },
                { href: "/admin/inventory/transactions", label: "Giao dịch" },
                { href: "/admin/inventory/low-stock", label: "Cảnh báo" },
              ]}
            />
            <NavItem 
              href="/admin/analytics" 
              icon={<BarChartHorizontal size={18} />} 
              label="Thống kê" 
              isActive={isActive("/admin/analytics")}
            />

            <div className="mt-6 border-t pt-4">
              <NavItem 
                href="/admin/settings" 
                icon={<Settings size={18} />} 
                label="Cài đặt" 
                isActive={isActive("/admin/settings")}
              />
              <div className="mb-1">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left hover:bg-gray-100"
                >
                  <LogOut size={18} />
                  <span className="flex-1">Đăng xuất</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}