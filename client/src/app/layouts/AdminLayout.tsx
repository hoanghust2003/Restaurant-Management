"use client";

import { ReactNode } from "react";
import { UserRole } from "../utils/enums";
import BaseLayout from "./BaseLayout";
import {
  HomeIcon,
  UsersIcon,
  TableCellsIcon,
  ClipboardDocumentListIcon,
  CakeIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const adminMenuSections = [
  {
    title: "Tổng quan",
    items: [
      {
        href: "/admin/dashboard",
        icon: <HomeIcon className="w-5 h-5" />,
        title: "Bảng điều khiển",
        showIfRoles: ["admin"],
      },
      {
        href: "/admin/users",
        icon: <UsersIcon className="w-5 h-5" />,
        title: "Quản lý người dùng",
        showIfRoles: ["admin"],
      },
    ],
  },
  {
    title: "Quản lý nhà hàng",
    items: [
      {
        href: "/admin/tables",
        icon: <TableCellsIcon className="w-5 h-5" />,
        title: "Quản lý bàn",
        showIfRoles: ["admin"],
      },
      {
        href: "#",
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        title: "Quản lý đơn hàng",
        showIfRoles: ["admin"],
        subItems: [
          {
            href: "/admin/orders/active",
            title: "Đơn hiện tại",
            showIfRoles: ["admin"],
          },
          {
            href: "/admin/orders/history",
            title: "Lịch sử đơn hàng",
            showIfRoles: ["admin"],
          },
        ],
      },
      {
        href: "#",
        icon: <CakeIcon className="w-5 h-5" />,
        title: "Quản lý thực đơn",
        showIfRoles: ["admin", "chef"],
        subItems: [
          {
            href: "/admin/dishes",
            title: "Món ăn",
            showIfRoles: ["admin", "chef"],
          },
          {
            href: "/admin/menus",
            title: "Thực đơn",
            showIfRoles: ["admin", "chef"],
          },
          {
            href: "/admin/categories",
            title: "Danh mục",
            showIfRoles: ["admin"],
          },
        ],
      },
      {
        href: "#",
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        title: "Quản lý kho",
        showIfRoles: ["admin", "warehouse"],
        subItems: [
          {
            href: "/admin/inventory/ingredients",
            title: "Nguyên liệu",
            showIfRoles: ["admin", "warehouse"],
          },
          {
            href: "/admin/inventory/imports",
            title: "Nhập kho",
            showIfRoles: ["admin", "warehouse"],
          },
          {
            href: "/admin/inventory/exports",
            title: "Xuất kho",
            showIfRoles: ["admin", "warehouse"],
          },
        ],
      },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      {
        href: "#",
        icon: <ChartBarIcon className="w-5 h-5" />,
        title: "Báo cáo & Thống kê",
        showIfRoles: ["admin"],
        subItems: [
          {
            href: "/admin/reports/sales",
            title: "Báo cáo doanh thu",
            showIfRoles: ["admin"],
          },
          {
            href: "/admin/reports/inventory",
            title: "Báo cáo kho",
            showIfRoles: ["admin"],
          },
          {
            href: "/admin/reports/staff",
            title: "Báo cáo nhân viên",
            showIfRoles: ["admin"],
          },
        ],
      },
    ],
  },
  {
    title: "Cài đặt",
    items: [
      {
        href: "/admin/settings",
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        title: "Cài đặt hệ thống",
        showIfRoles: ["admin"],
      },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <BaseLayout
      title={title}
      sidebarSections={adminMenuSections}
      userRole={UserRole.ADMIN}
    >
      {children}
    </BaseLayout>
  );
}
