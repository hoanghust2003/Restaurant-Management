'use client';

import React from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import LayoutProvider from '@/app/layouts/LayoutProvider';
import DishList from '@/app/components/dish/DishList';

const DishesPage: React.FC = () => {
  return (    <AuthGuard allowedRoles={['admin', 'chef']}>
      <LayoutProvider>
        <div className="p-6">
          <DishList />
        </div>
      </LayoutProvider>
    </AuthGuard>
  );
};

export default DishesPage;
