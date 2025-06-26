'use client';

import React, { Suspense } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import MultiBatchExportForm from './components/MultiBatchExportForm';
import { useSearchParams } from 'next/navigation';

const CreateExportPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const initialIngredientId = searchParams.get('ingredient') || undefined;

  return <MultiBatchExportForm initialIngredientId={initialIngredientId} />;
};

const AdminCreateExportPage: React.FC = () => {
  return (
    <AdminLayout title="Tạo phiếu xuất kho">
      <Suspense fallback={<div className="p-6">Đang tải...</div>}>
        <CreateExportPageContent />
      </Suspense>
    </AdminLayout>
  );
};

export default AdminCreateExportPage;
