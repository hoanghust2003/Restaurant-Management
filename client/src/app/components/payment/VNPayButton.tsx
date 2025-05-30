import { Button, message } from 'antd';
import axios from 'axios';
import { useState } from 'react';

interface VNPayButtonProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export const VNPayButton = ({ orderId, amount, onSuccess, onError, disabled }: VNPayButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!orderId) {
      message.error('Invalid order ID');
      return;
    }

    try {
      setLoading(true);
      // Check order status before proceeding
      const orderStatus = await axios.get(`/api/orders/${orderId}/status`);
      if (orderStatus.data.isPaid) {
        message.info('This order has already been paid');
        return;
      }

      const response = await axios.post('/api/payment/create-payment', {
        orderId,
        amount: orderStatus.data.totalAmount,
      });

      if (response.data.paymentUrl) {
        // Save payment attempt in session storage for return handling
        sessionStorage.setItem(
          'lastPaymentAttempt',
          JSON.stringify({
            orderId,
            timestamp: new Date().toISOString(),
          }),
        );
        // Redirect to VNPay payment page
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      let errorMessage = 'Could not initialize payment';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      message.error(errorMessage);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      onClick={handlePayment}
      loading={loading}
      disabled={disabled}
      style={{ backgroundColor: '#0071bc', borderColor: '#0071bc' }}
    >
      Pay with VNPay
    </Button>
  );
};
