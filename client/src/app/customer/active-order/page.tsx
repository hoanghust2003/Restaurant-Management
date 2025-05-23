import { useEffect, useState } from 'react';
import { useSocketService } from '@/app/services/socket.service';
import { OrderStatus, OrderItemStatus } from '@/app/models/order.model';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';

export default function ActiveOrderPage() {
  const [activeOrder, setActiveOrder] = useState(null);
  const socketService = useSocketService();

  useEffect(() => {
    socketService.initializeSocket();
    
    // Subscribe to order status changes
    socketService.onOrderStatusChange((updatedOrder) => {
      setActiveOrder(updatedOrder);
    });

    socketService.onOrderItemStatusChange((updatedOrder) => {
      setActiveOrder(updatedOrder);
    });

    // Clean up
    return () => {
      socketService.disconnect();
    };
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'default';
      case OrderStatus.IN_PROGRESS:
        return 'info';
      case OrderStatus.READY:
        return 'success';
      case OrderStatus.SERVED:
        return 'primary';
      case OrderStatus.COMPLETED:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getItemStatusColor = (status: OrderItemStatus) => {
    switch (status) {
      case OrderItemStatus.WAITING:
        return 'default';
      case OrderItemStatus.PREPARING:
        return 'warning';
      case OrderItemStatus.DONE:
        return 'success';
      case OrderItemStatus.FAILED:
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateProgress = (order) => {
    if (!order || !order.items || order.items.length === 0) return 0;
    const doneItems = order.items.filter(item => item.status === OrderItemStatus.DONE).length;
    return (doneItems / order.items.length) * 100;
  };

  if (!activeOrder) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Không có đơn hàng đang hoạt động</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Đơn hàng của bạn
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Đơn hàng #{activeOrder.id}
            </Typography>
            <Chip 
              label={activeOrder.status}
              color={getStatusColor(activeOrder.status)}
              variant="outlined"
            />
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress(activeOrder)} 
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Các món ăn:
          </Typography>
          
          {activeOrder.items.map((item) => (
            <Box 
              key={item.id} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1 
              }}
            >
              <Typography>
                {item.quantity}x {item.dishName}
              </Typography>
              <Chip 
                label={item.status}
                color={getItemStatusColor(item.status)}
                size="small"
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
