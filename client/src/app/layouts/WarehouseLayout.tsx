"use client";

import { ReactNode } from "react";
import { UserRole } from "../utils/enums";
import BaseLayout from "./BaseLayout";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  UserIcon,
  Cog6ToothIcon,
  UsersIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const warehouseMenuSections = [
  {
    title: "Tổng quan",
    items: [
      {
        href: "/warehouse/dashboard",
        icon: <HomeIcon className="w-5 h-5" />,
        title: "Bảng điều khiển",
        showIfRoles: ["warehouse", "admin", "manager"],
      },
    ],
  },
  {
    title: "Quản lý kho",
    items: [
      {
        href: "#",
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        title: "Quản lý tồn kho",
        showIfRoles: ["warehouse", "admin", "manager"],
        subItems: [
          {
            href: "/warehouse/ingredients",
            title: "Nguyên liệu",
            showIfRoles: ["warehouse", "admin", "manager"],
          },
          {
            href: "/warehouse/categories",
            title: "Danh mục",
            showIfRoles: ["warehouse", "admin", "manager"],
          },
          {
            href: "/warehouse/locations",
            title: "Vị trí kho",
            showIfRoles: ["warehouse", "admin", "manager"],
          },
        ],
      },
    ],
  },
  {
    title: "Nhập xuất kho",
    items: [
      {
        href: "/warehouse/imports",
        icon: <ArrowPathIcon className="w-5 h-5" />,
        title: "Lịch sử nhập kho",
        showIfRoles: ["warehouse", "admin", "manager"],
      },
      {
        href: "/warehouse/exports",
        icon: <ArrowPathIcon className="w-5 h-5" />,
        title: "Lịch sử xuất kho",
        showIfRoles: ["warehouse", "admin", "manager"],
      },
      {
        href: "/warehouse/suppliers",
        icon: <UsersIcon className="w-5 h-5" />,
        title: "Quản lý nhà cung cấp",
        showIfRoles: ["warehouse", "admin", "manager"],
      },
      {
        href: "/warehouse/batches",
        icon: <TruckIcon className="w-5 h-5" />,
        title: "Quản lý lô hàng",
        showIfRoles: ["warehouse", "admin", "manager"],
      },
    ],
  },
  {
    title: "Quản lý yêu cầu",
    items: [
      {
        href: "/warehouse/requests",
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        title: "Yêu cầu từ bếp",
        showIfRoles: ["warehouse", "admin", "manager", "chef"],
      },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      {
        href: "#",
        icon: <ChartBarIcon className="w-5 h-5" />,
        title: "Báo cáo kho",
        showIfRoles: ["warehouse", "admin", "manager"],
        subItems: [
          {
            href: "/warehouse/reports/inventory",
            title: "Báo cáo tồn kho",
            showIfRoles: ["warehouse", "admin", "manager"],
          },
          {
            href: "/warehouse/reports/imports",
            title: "Báo cáo nhập kho",
            showIfRoles: ["warehouse", "admin", "manager"],
          },
          {
            href: "/warehouse/reports/exports",
            title: "Báo cáo xuất kho",
            showIfRoles: ["warehouse", "admin", "manager"],
          },
        ],
      },
    ],
  },
  {
    title: "Cài đặt",
    items: [
      {
        href: "/warehouse/profile",
        icon: <UserIcon className="w-5 h-5" />,
        title: "Thông tin cá nhân",
        showIfRoles: ["warehouse", "admin", "manager"],
      },
      {
        href: "/warehouse/settings",
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        title: "Cài đặt kho",
        showIfRoles: ["warehouse", "admin", "manager"],
      },
    ],
  },
];

interface WarehouseLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function WarehouseLayout({
  children,
  title,
}: WarehouseLayoutProps) {
  return (
    <BaseLayout
      title={title}
      sidebarSections={warehouseMenuSections}
      userRole={UserRole.WAREHOUSE}
    >
      {children}
    </BaseLayout>
  );
}
