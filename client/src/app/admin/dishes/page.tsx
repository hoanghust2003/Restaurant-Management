'use client';

import React from 'react';
import RoleBasedLayout from '@/app/components/RoleBasedLayout';
import DishList from '@/app/components/dish/DishList';

const DishesPage: React.FC = () => {
  return (
    <RoleBasedLayout allowedRoles={['admin', 'chef', 'manager']}>
      <div className="p-6">
        <DishList />
      </div>
    </RoleBasedLayout>
  );
};

export default DishesPage;
