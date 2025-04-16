"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { User, UserRole } from "@/contexts/auth-types";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Chuyển hướng về trang dashboard theo role
  const goToDashboard = () => {
    if (user) {
      const dashboardUrl = getDashboardUrlByRole(user);
      router.push(dashboardUrl);
    } else {
      router.push("/");
    }
  };

  // Lấy URL dashboard dựa vào vai trò
  const getDashboardUrlByRole = (user: User): string => {
    switch (user.role) {
      case UserRole.ADMIN:
      case UserRole.MANAGER:
        return "/admin/dashboard";
      case UserRole.CHEF:
        return "/kitchen/dashboard";
      case UserRole.RECEPTION:
        return "/reception/dashboard";
      case UserRole.WAITER:
        return "/reception/tables";
      case UserRole.CUSTOMER:
        return "/customer/menu";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Không có quyền truy cập</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên để được hỗ trợ hoặc quay lại trang dashboard của bạn.
          </p>

          <div className="flex flex-col space-y-3">
            <Button
              variant="primary"
              onClick={goToDashboard}
              className="w-full"
            >
              Quay lại trang chính
            </Button>

            <Button
              variant="outline"
              onClick={logout}
              className="w-full"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}