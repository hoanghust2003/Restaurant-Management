'use client';

import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  AdminLayout, 
  WarehouseLayout, 
  ChefLayout, 
  CashierLayout, 
  WaiterLayout, 
  CustomerLayout 
} from './index';

interface LayoutProviderProps {
  children: ReactNode;
  title?: string;
}

export default function LayoutProvider({ children, title }: LayoutProviderProps) {
  const { user } = useAuth();

  // If no user is authenticated yet, render children without layout
  if (!user) {
    return <>{children}</>;
  }

  // Select layout based on user role
  switch (user.role) {
    case 'admin':
      return <AdminLayout title={title}>{children}</AdminLayout>;
    
    case 'warehouse':
      return <WarehouseLayout title={title}>{children}</WarehouseLayout>;
    
    case 'chef':
      return <ChefLayout title={title}>{children}</ChefLayout>;
    
    case 'cashier':
      return <CashierLayout title={title}>{children}</CashierLayout>;
    
    case 'waiter':
      return <WaiterLayout title={title}>{children}</WaiterLayout>;
    
    case 'customer':
      return <CustomerLayout title={title}>{children}</CustomerLayout>;
    
    default:
      // Fallback to rendering without specific layout
      return <>{children}</>;
  }
}
