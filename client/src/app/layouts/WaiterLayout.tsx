"use client";

import { ReactNode } from "react";
import { UserRole } from "../utils/enums";
import BaseLayout from "./BaseLayout";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import {
  Squares2X2Icon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  QueueListIcon,
  CakeIcon,
  ArrowPathIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface WaiterLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function WaiterLayout({ children, title }: WaiterLayoutProps) {
  const { user } = useAuth();

  const sections = [
    {
      title: "Tổng quan",
      items: [
        {
          href: "/",
          icon: <Squares2X2Icon className="w-5 h-5" />,
          title: "Dashboard",
          showIfRoles: ["staff", "admin"],
        },
      ],
    },
    {
      title: "Quản lý bàn",
      items: [
        {
          href: "#",
          icon: <BuildingStorefrontIcon className="w-5 h-5" />,
          title: "Quản lý bàn",
          showIfRoles: ["staff", "admin"],
          subItems: [
            {
              href: "/tables",
              title: "Danh sách bàn",
              showIfRoles: ["staff", "admin"],
            },
            {
              href: "/tables/status",
              title: "Trạng thái bàn",
              showIfRoles: ["staff", "admin"],
            },
          ],
        },
      ],
    },
    {
      title: "Quản lý đơn hàng",
      items: [
        {
          href: "/orders/create",
          icon: <PencilSquareIcon className="w-5 h-5" />,
          title: "Gọi món mới",
          showIfRoles: ["staff", "admin"],
        },
        {
          href: "/orders",
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          title: "Đơn hàng hiện tại",
          showIfRoles: ["staff", "admin"],
        },
        {
          href: "/orders/history",
          icon: <ArrowPathIcon className="w-5 h-5" />,
          title: "Lịch sử đơn hàng",
          showIfRoles: ["staff", "admin"],
        },
      ],
    },
    {
      title: "Thông tin khác",
      items: [
        {
          href: "/menu",
          icon: <CakeIcon className="w-5 h-5" />,
          title: "Xem thực đơn",
          showIfRoles: ["staff", "admin"],
        },
        {
          href: "/kitchen/status",
          icon: <QueueListIcon className="w-5 h-5" />,
          title: "Trạng thái bếp",
          showIfRoles: ["staff", "admin"],
        },
        {
          href: "/profile",
          icon: <UserIcon className="w-5 h-5" />,
          title: "Thông tin cá nhân",
          showIfRoles: ["staff", "admin"],
        },
      ],
    },
  ];

  return (
    <BaseLayout
      title={title}
      sidebar={<Sidebar sections={sections} userRole={user?.role} />}
    >
      {children}
    </BaseLayout>
  );
}
