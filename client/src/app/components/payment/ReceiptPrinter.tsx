'use client';

import React from 'react';
import { OrderModel } from '@/app/models/order.model';
import { PaymentModel } from '@/app/models/payment.model';
import { formatPrice, formatDateTime } from '@/app/utils/format';
import { orderStatusText } from '@/app/utils/enums';

interface ReceiptPrinterProps {
  order: OrderModel;
  payment: PaymentModel;
}

const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({ order, payment }) => {
  const printReceipt = () => {
    // Create a new window for the receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Create receipt content
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn #${order.code || order.id.substring(0, 8)}</title>
          <style>
            @media print {
              body { font-family: 'Courier New', monospace; }
              .receipt { width: 80mm; margin: 0 auto; padding: 10px; }
              .header { text-align: center; margin-bottom: 20px; }
              .info { margin-bottom: 15px; }
              .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
              .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin: 10px 0; padding: 10px 0; }
              .item { margin-bottom: 10px; }
              .total { text-align: right; font-weight: bold; margin-top: 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>NHÀ HÀNG ABC</h1>
              <p>123 Đường ABC, Quận XYZ</p>
              <p>SĐT: 0123456789</p>
            </div>
            
            <div class="info">
              <div class="info-row">
                <span>Mã đơn:</span>
                <span>#${order.code || order.id.substring(0, 8)}</span>
              </div>
              <div class="info-row">
                <span>Thời gian:</span>
                <span>${formatDateTime(order.created_at)}</span>
              </div>
              <div class="info-row">
                <span>Bàn:</span>
                <span>${order.table?.name || `Bàn #${order.tableId}`}</span>
              </div>
              <div class="info-row">
                <span>Trạng thái:</span>
                <span>${orderStatusText[order.status]}</span>
              </div>
            </div>
            
            <div class="items">
              ${order.items?.map(item => `
                <div class="item">
                  <div>${item.dish?.name} x${item.quantity}</div>
                  <div>
                    ${formatPrice(item.dish?.price || 0)} x ${item.quantity} = 
                    ${formatPrice((item.dish?.price || 0) * item.quantity)}
                  </div>
                  ${item.note ? `<div>Ghi chú: ${item.note}</div>` : ''}
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <div class="info-row">
                <span>Tổng tiền:</span>
                <span>${formatPrice(order.total_price)}</span>
              </div>
              <div class="info-row">
                <span>Thanh toán:</span>
                <span>${payment.method === 'cash' ? 'Tiền mặt' : 'VNPay'}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              <p>Hẹn gặp lại lần sau!</p>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    // Write content to the window and print
    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

  return (
    <button onClick={printReceipt} style={{ display: 'none' }} id="receipt-printer" />
  );
};

export default ReceiptPrinter;
