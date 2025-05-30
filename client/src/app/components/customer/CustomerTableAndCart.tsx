'use client';

import React from 'react';
import { Card, Button, Space, Tag } from 'antd';
import { TableOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { formatPrice } from '@/app/utils/format';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';

interface CustomerTableAndCartProps {
  selectedTable?: {
    id: string;
    name: string;
    capacity: number;
  };
  onSubmitOrder: () => void;
}

const CustomerTableAndCart: React.FC<CustomerTableAndCartProps> = ({
  selectedTable,
  onSubmitOrder
}) => {
  const { totalItems, totalPrice } = useShoppingCart();

  if (!selectedTable) return null;

  return (
    <Card className="mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <TableOutlined className="mr-2" />
          <div>
            <div className="font-medium">{selectedTable.name}</div>
            <div className="text-sm text-gray-500">
              Sức chứa: {selectedTable.capacity} người
            </div>
          </div>
        </div>
        
        <Space>
          <div className="text-right">
            <div className="font-medium">{totalItems} món</div>
            <div className="text-lg font-bold text-primary">
              {formatPrice(totalPrice)}
            </div>
          </div>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={onSubmitOrder}
            disabled={totalItems === 0}
          >
            Gửi đơn
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default CustomerTableAndCart;
