'use client';

import React from 'react';
import DishForm from '@/app/components/dish/DishForm';
import RoleBasedLayout from '@/app/components/RoleBasedLayout';

const AddDishPage: React.FC = () => {
  return (
    <RoleBasedLayout allowedRoles={['admin', 'manager']}>
      <div className="p-6">
        <DishForm />
      </div>
    </RoleBasedLayout>
  );
};

export default AddDishPage;
