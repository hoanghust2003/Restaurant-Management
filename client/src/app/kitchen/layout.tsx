"use client";

import React from "react";
import KitchenLayout from "@/components/layouts/kitchen-layout";

export default function KitchenRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Giả lập số đơn đang chờ để hiển thị trong layout
  const pendingOrderCount = 5;
  
  return <KitchenLayout pendingOrderCount={pendingOrderCount}>{children}</KitchenLayout>;
}