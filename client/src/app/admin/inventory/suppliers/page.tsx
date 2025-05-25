'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import SuppliersList from '@/app/warehouse/suppliers/page';

export default function AdminSuppliersPage() {
  return (
    <AdminLayout title="Quản lý nhà cung cấp">
      <SuppliersList />
    </AdminLayout>
  );
}
