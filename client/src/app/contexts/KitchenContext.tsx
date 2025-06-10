'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { useSocket } from './SocketContext';
import { OrderModel } from '../models/order.model';
import { orderService } from '../services/order.service';
import { OrderStatus, OrderItemStatus } from '../utils/enums';
import { playNotificationSound } from '../utils/sound';

interface KitchenContextType {
  orders: OrderModel[];
  loading: boolean;
  updateItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll({ 
        status: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.READY].join(',') as OrderStatus
      });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit('kitchen:join');      socket.on('order:new', (newOrder: OrderModel) => {
        setOrders(prev => [newOrder, ...prev]);
        message.info(`Có đơn hàng mới: #${newOrder.code}`);
        playNotificationSound();
      });

      socket.on('order:status_update', (data: { orderId: string; status: OrderStatus }) => {
        setOrders(prev =>
          prev.map(order =>
            order.id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
      });

      socket.on('order:item_status_update', 
        (data: { orderId: string; itemId: string; status: OrderItemStatus }) => {
          setOrders(prev =>
            prev.map(order =>
              order.id === data.orderId
                ? {
                    ...order,
                    items: order.items?.map(item =>
                      item.id === data.itemId
                        ? { ...item, status: data.status }
                        : item
                    )
                  }
                : order
            )
          );
        }
      );

      // Auto refresh every minute
      const interval = setInterval(fetchOrders, 60000);

      return () => {
        socket.off('order:new');
        socket.off('order:status_update');
        socket.off('order:item_status_update');
        clearInterval(interval);
      };
    }
  }, [socket]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  const updateItemStatus = async (orderId: string, itemId: string, status: OrderItemStatus) => {
    if (!socket) return;

    try {
      await orderService.updateOrderItem(orderId, itemId, { status });
      socket.emit('kitchen:update_item', { orderId, itemId, status });
      message.success('Đã cập nhật trạng thái món');
    } catch (error) {
      console.error('Error updating item status:', error);
      message.error('Không thể cập nhật trạng thái món');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!socket) return;

    try {
      await orderService.updateOrder(orderId, { status });
      socket.emit('kitchen:update_order', { orderId, status });
      message.success('Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const value = {
    orders,
    loading,
    updateItemStatus,
    updateOrderStatus,
    refreshOrders: fetchOrders
  };

  return (
    <KitchenContext.Provider value={value}>
      {children}
    </KitchenContext.Provider>
  );
};
