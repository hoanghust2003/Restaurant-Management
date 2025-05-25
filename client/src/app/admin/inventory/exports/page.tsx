'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import ExportsList from '@/app/warehouse/exports/page';

export default function AdminExportsPage() {
  return (
    <AdminLayout title="Quản lý xuất kho">
      <ExportsList />
    </AdminLayout>
  );
}
