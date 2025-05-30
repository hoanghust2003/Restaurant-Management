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
    title: "Kho & Nguyên liệu",
    items: [
      {
        href: "/warehouse/ingredients",
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        title: "Nguyên liệu",
        showIfRoles: ["warehouse"],
      },
      {
        href: "/warehouse/suppliers",
        icon: <UsersIcon className="w-5 h-5" />,
        title: "Nhà cung cấp",
        showIfRoles: ["warehouse"],
      },
      {
        href: "/warehouse/batches",
        icon: <TruckIcon className="w-5 h-5" />,
        title: "Lô hàng",
        showIfRoles: ["warehouse"],
      },
    ],
  },
  {
    title: "Nhập xuất kho",
    items: [
      {
        href: "/warehouse/imports",
        icon: <ArrowPathIcon className="w-5 h-5" />,
        title: "Nhập kho",
        showIfRoles: ["warehouse"],
      },
      {
        href: "/warehouse/exports",
        icon: <ArrowPathIcon className="w-5 h-5" />,
        title: "Xuất kho",
        showIfRoles: ["warehouse"],
      },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      {
        href: "/warehouse/reports",
        icon: <ChartBarIcon className="w-5 h-5" />,
        title: "Báo cáo kho",
        showIfRoles: ["warehouse"],
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
