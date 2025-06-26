'use client';

import React, { Suspense } from 'react';
import MultiBatchExportForm from './components/MultiBatchExportForm';
import { useSearchParams } from 'next/navigation';

const CreateExportPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const initialIngredientId = searchParams.get('ingredient') || undefined;

  return <MultiBatchExportForm initialIngredientId={initialIngredientId} />;
};

const CreateExportPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <CreateExportPageContent />
    </Suspense>
  );
};

export default CreateExportPage;
