'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Result, Spin, Button, Typography } from 'antd';
import axios from 'axios';

const { Paragraph, Text } = Typography;

interface PaymentResult {
  status: 'success' | 'error';
  message: string;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  paymentTime?: string;
}

export default function VNPayReturn() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!router.isReady) return;
        
        // Recover last payment attempt from session storage
        const lastPayment = sessionStorage.getItem('lastPaymentAttempt');
        const originalOrderId = lastPayment ? JSON.parse(lastPayment).orderId : null;
        
        // Get all query parameters
        const response = await axios.get('/api/payment/vnpay-return', {
          params: {
            ...router.query,
            originalOrderId // Pass the original order ID for verification
          }
        });

        setPaymentResult(response.data);
        setStatus(response.data.status);

        // Clear the payment attempt from session storage
        sessionStorage.removeItem('lastPaymentAttempt');

        if (response.data.status === 'success') {
          // Redirect to order details after 5 seconds
          setTimeout(() => {
            router.push(`/customer/orders/${response.data.orderId}`);
          }, 5000);
        }
      } catch (error: any) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setPaymentResult({
          status: 'error',
          message: error.response?.data?.message || 'Error verifying payment'
        });
      }
    };

    verifyPayment();
  }, [router.isReady, router.query]);

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Verifying payment...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Result
        status={status}
        title={status === 'success' ? 'Payment Successful' : 'Payment Failed'}
        subTitle={paymentResult?.message}
        extra={[
          <Button 
            key="orders" 
            type="primary" 
            onClick={() => router.push('/customer/orders')}
          >
            View Orders
          </Button>,
          status === 'error' && paymentResult?.orderId && (
            <Button 
              key="retry"
              onClick={() => router.push(`/customer/orders/${paymentResult.orderId}`)}
            >
              Return to Order
            </Button>
          )
        ].filter(Boolean)}
      >
        {status === 'success' && paymentResult && (
          <div className="payment-details" style={{ textAlign: 'left', marginTop: '20px' }}>
            <Paragraph>
              <Text strong>Order ID:</Text> {paymentResult.orderId}<br />
              <Text strong>Transaction ID:</Text> {paymentResult.transactionId}<br />
              <Text strong>Amount:</Text> {paymentResult.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}<br />
              <Text strong>Payment Time:</Text> {new Date(paymentResult.paymentTime || '').toLocaleString()}<br />
            </Paragraph>
            <Paragraph type="secondary">
              You will be redirected to your order details in 5 seconds...
            </Paragraph>
          </div>
        )}
      </Result>
    </div>
  );
}
