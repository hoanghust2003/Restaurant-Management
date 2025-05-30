'use client';

import { ReactNode } from "react";
import { WarehouseProvider } from "@/app/contexts/WarehouseContext";
import { WarehouseLayout } from "@/app/layouts";

export default function WarehouseRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WarehouseProvider>
      <WarehouseLayout title="Kho">
        {children}
      </WarehouseLayout>
    </WarehouseProvider>
  );
}
