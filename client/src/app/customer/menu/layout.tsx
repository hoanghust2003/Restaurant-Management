'use client';

import { ReactNode } from 'react';
import { CustomerLayout } from '@/app/layouts';
import { Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';
import { formatPrice } from '@/app/utils/format';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerMenuLayout({ children }: CustomerLayoutProps) {
  const { totalItems, totalPrice } = useShoppingCart();
  const router = useRouter();
  
  return (
    <>
      {totalItems > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => router.push('/customer/cart')}
            className="shadow-lg flex items-center"
          >
            <span className="mr-2">{totalItems} món</span>
            <span>{formatPrice(totalPrice)}</span>
          </Button>
        </div>
      )}
      {children}
    </>
  );
}
