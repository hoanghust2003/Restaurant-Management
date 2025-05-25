'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import BatchesList from '@/app/warehouse/batches/page';

export default function AdminBatchesPage() {
  return (
    <AdminLayout title="Quản lý lô hàng">
      <BatchesList />
    </AdminLayout>
  );
}
