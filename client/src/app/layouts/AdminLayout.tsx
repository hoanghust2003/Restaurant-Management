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
        showIfRoles: ["admin", "manager"],
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
        showIfRoles: ["admin", "manager"],
      },
      {
        href: "#",
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        title: "Quản lý đơn hàng",
        showIfRoles: ["admin", "manager"],
        subItems: [
          {
            href: "/admin/orders/active",
            title: "Đơn hiện tại",
            showIfRoles: ["admin", "manager"],
          },
          {
            href: "/admin/orders/history",
            title: "Lịch sử đơn hàng",
            showIfRoles: ["admin", "manager"],
          },
        ],
      },
      {
        href: "#",
        icon: <CakeIcon className="w-5 h-5" />,
        title: "Quản lý thực đơn",
        showIfRoles: ["admin", "manager", "chef"],
        subItems: [
          {
            href: "/admin/dishes",
            title: "Món ăn",
            showIfRoles: ["admin", "manager", "chef"],
          },
          {
            href: "/admin/menus",
            title: "Thực đơn",
            showIfRoles: ["admin", "manager", "chef"],
          },
          {
            href: "/admin/categories",
            title: "Danh mục",
            showIfRoles: ["admin", "manager"],
          },
        ],
      },
      {
        href: "#",
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        title: "Quản lý kho",
        showIfRoles: ["admin", "manager", "warehouse"],
        subItems: [
          {
            href: "/admin/inventory/ingredients",
            title: "Nguyên liệu",
            showIfRoles: ["admin", "manager", "warehouse"],
          },
          {
            href: "/admin/inventory/imports",
            title: "Nhập kho",
            showIfRoles: ["admin", "manager", "warehouse"],
          },
          {
            href: "/admin/inventory/exports",
            title: "Xuất kho",
            showIfRoles: ["admin", "manager", "warehouse"],
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
        showIfRoles: ["admin", "manager"],
        subItems: [
          {
            href: "/admin/reports/sales",
            title: "Báo cáo doanh thu",
            showIfRoles: ["admin", "manager"],
          },
          {
            href: "/admin/reports/inventory",
            title: "Báo cáo kho",
            showIfRoles: ["admin", "manager"],
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
