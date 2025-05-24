'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, message, Spin, Card, Alert } from 'antd';
import { QrcodeOutlined, PrinterOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { tableService } from '@/app/services/table.service';
import { TableModel } from '@/app/models/table.model';
import { QrCodeErrorBoundary } from './QrCodeErrorBoundary';
import QrCodeImage from './QrCodeImage';

const { Title, Text, Paragraph } = Typography;

interface QrCodeModalProps {
  open: boolean;
  table: TableModel | null;
  onClose: () => void;
}

interface QrCodeData {
  tableId: string;
  tableName: string;
  qrCode: string;
  menuUrl: string;
  metadata?: {
    generatedAt: string;
    expiresAt?: string;
    size: number;
    format: string;
  };
}

export default function QrCodeModal({ open, table, onClose }: QrCodeModalProps) {
  const [qrData, setQrData] = useState<QrCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {    if (open && table) {
      generateQrCode();
    } else {
      setQrData(null);
      setError(null);
    }
  }, [open, table]);

  const generateQrCode = async () => {
    if (!table) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Generating QR code for table:', table.id);
      
      const data = await tableService.generateQrCode(table.id);
      console.log('QR code data received:', data);
      
      // Verify the data has the required fields and format
      if (!data.qrCode) {
        throw new Error('QR code data is missing the qrCode field');
      }
      
      // Validate QR code format (should be a base64 image)
      if (!data.qrCode.startsWith('data:image/png;base64,')) {
        console.warn('QR code data is not in expected format:', data.qrCode.substring(0, 30) + '...');
        throw new Error('QR code data is not in the expected format');
      }
      
      setQrData(data);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      message.error('Không thể tạo mã QR: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData.menuUrl);
      message.success('Đã sao chép URL vào clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      message.error('Không thể sao chép URL');
    }
  };

  const handleDownload = () => {
    if (!qrData) return;

    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `qr-code-${qrData.tableName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã tải xuống mã QR');
  };

  const handlePrint = () => {
    if (!qrData) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${qrData.tableName}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .qr-container {
                border: 2px solid #000;
                padding: 20px;
                margin: 20px auto;
                width: 300px;
              }
              .qr-code {
                max-width: 200px;
                height: auto;
              }
              .table-name {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
              }
              .instructions {
                font-size: 14px;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="table-name">${qrData.tableName}</div>
              <img src="${qrData.qrCode}" alt="QR Code" class="qr-code" />
              <div class="instructions">
                Quét mã QR để xem thực đơn<br>
                và đặt món trực tiếp tại bàn
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Modal
      title={
        <Space>
          <QrcodeOutlined />
          {table ? `Mã QR - ${table.name}` : 'Mã QR'}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">Đang tạo mã QR...</div>
        </div>
      ) : error ? (
        <Alert
          message="Lỗi tạo mã QR"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={generateQrCode}>
              Thử lại
            </Button>
          }
        />
      ) : qrData ? (
        <div className="text-center">
          <Card className="mb-4">
            <Title level={4}>{qrData.tableName}</Title>
            <div className="mb-4">
              <QrCodeErrorBoundary onRetry={generateQrCode}>
                <QrCodeImage
                  qrCode={qrData.qrCode}
                  menuUrl={qrData.menuUrl}
                  alt={`QR Code for ${qrData.tableName}`}
                  size="large"
                  onError={(error) => {
                    console.error('QR code error:', error);
                    message.error('Không thể hiển thị mã QR. Vui lòng thử lại.');
                    setError('Lỗi hiển thị mã QR');
                  }}
                />
              </QrCodeErrorBoundary>
            </div>
            <Paragraph className="text-gray-600">
              Khách hàng có thể quét mã QR này để truy cập thực đơn và đặt món trực tiếp tại bàn
            </Paragraph>
            
            {qrData.metadata && (
              <div className="text-xs text-gray-400 mt-2">
                Tạo lúc: {new Date(qrData.metadata.generatedAt).toLocaleString()}
                {qrData.metadata.expiresAt && (
                  <span> - Hết hạn: {new Date(qrData.metadata.expiresAt).toLocaleString()}</span>
                )}
              </div>
            )}
          </Card>

          <Space wrap className="mb-4">
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
            >
              In QR Code
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
            >
              Tải xuống
            </Button>
            <Button 
              icon={<CopyOutlined />} 
              onClick={handleCopyUrl}
            >
              Sao chép URL
            </Button>
          </Space>

          <div className="text-left bg-gray-50 p-3 rounded text-sm">
            <Text strong>URL trực tiếp:</Text>
            <br />
            <Text copyable code className="text-xs">
              {qrData.menuUrl}
            </Text>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Text>Không thể tạo mã QR</Text>
        </div>
      )}
    </Modal>
  );
}
