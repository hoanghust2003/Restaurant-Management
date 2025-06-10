'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, message, Spin, Card, Checkbox, Row, Col } from 'antd';
import { 
  QrcodeOutlined, 
  PrinterOutlined, 
  DownloadOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { tableService } from '@/app/services/table.service';
import { TableModel } from '@/app/models/table.model';

const { Title, Text, Paragraph } = Typography;

interface BatchQrCodeModalProps {
  open: boolean;
  tables: TableModel[];
  onClose: () => void;
}

interface QrCodeData {
  tableId: string;
  tableName: string;
  qrCode: string;
  menuUrl: string;
}

export default function BatchQrCodeModal({ open, tables, onClose }: BatchQrCodeModalProps) {
  const [qrCodes, setQrCodes] = useState<Map<string, QrCodeData>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && tables.length > 0) {
      // Initialize selected tables to include all tables
      const allTableIds = new Set(tables.map(table => table.id));
      setSelectedTableIds(allTableIds);
      
      // Generate QR codes for all tables
      generateQrCodes();
    } else {
      // Clear data when modal is closed
      setQrCodes(new Map());
      setSelectedTableIds(new Set());
    }
  }, [open, tables]);

  const generateQrCodes = async () => {
    if (tables.length === 0) return;

    try {
      setLoading(true);
      
      // Create a new map to store the QR codes
      const qrCodeMap = new Map<string, QrCodeData>();
      
      // Generate QR codes for all tables
      await Promise.all(tables.map(async (table) => {
        try {
          const data = await tableService.generateQrCode(table.id);
          qrCodeMap.set(table.id, data);
        } catch (error) {
          console.error(`Error generating QR code for table ${table.id}:`, error);
          // Continue with other tables even if one fails
        }
      }));
      
      setQrCodes(qrCodeMap);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      message.error('Không thể tạo mã QR cho một số bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTableSelection = (tableId: string) => {
    setSelectedTableIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tableId)) {
        newSelection.delete(tableId);
      } else {
        newSelection.add(tableId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedTableIds(new Set(tables.map(table => table.id)));
  };

  const handleDeselectAll = () => {
    setSelectedTableIds(new Set());
  };

  const handlePrint = () => {
    const selectedTables = tables.filter(table => selectedTableIds.has(table.id));
    
    if (selectedTables.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bàn để in');
      return;
    }
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình duyệt.');
      return;
    }
    
    // Write HTML content to the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes for Tables</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-gap: 20px;
              page-break-inside: avoid;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              text-align: center;
              page-break-inside: avoid;
            }
            .table-name {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .qr-code {
              max-width: 200px;
              height: auto;
            }
            .instructions {
              font-size: 14px;
              margin-top: 10px;
            }
            @media print {
              .qr-container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-grid">
            ${selectedTables.map(table => {
              const qrData = qrCodes.get(table.id);
              return qrData ? `
                <div class="qr-container">
                  <div class="table-name">${table.name}</div>
                  <img src="${qrData.qrCode}" alt="QR Code for ${table.name}" class="qr-code" />
                  <div class="instructions">
                    Quét mã QR để xem thực đơn<br>
                    và đặt món trực tiếp tại bàn
                  </div>
                </div>
              ` : '';
            }).join('')}
          </div>
        </body>
      </html>
    `);
    
    // Trigger print and close the window when done
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleDownloadAll = () => {
    const selectedTables = tables.filter(table => selectedTableIds.has(table.id));
    
    if (selectedTables.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bàn để tải xuống');
      return;
    }
    
    // For simplicity, we'll download the first selected table's QR code
    // In a real implementation, consider creating a zip file with all QR codes
    const firstTable = selectedTables[0];
    const qrData = qrCodes.get(firstTable.id);
    
    if (qrData) {
      const link = document.createElement('a');
      link.href = qrData.qrCode;
      link.download = `qr-code-${qrData.tableName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (selectedTables.length > 1) {
        message.info('Chỉ tải xuống mã QR của bàn đầu tiên. Để tải nhiều mã, hãy in và lưu dưới dạng PDF.');
      } else {
        message.success('Đã tải xuống mã QR');
      }
    }
  };

  return (
    <Modal
      title={
        <Space>
          <QrcodeOutlined />
          Quản lý mã QR cho các bàn
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
    >
      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">Đang tạo mã QR...</div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <Space>
              <Button type="primary" onClick={handleSelectAll}>Chọn tất cả</Button>
              <Button onClick={handleDeselectAll}>Bỏ chọn tất cả</Button>
              <Button 
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                disabled={selectedTableIds.size === 0}
              >
                In mã QR đã chọn
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadAll}
                disabled={selectedTableIds.size === 0}
              >
                Tải xuống
              </Button>
            </Space>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <Row gutter={[16, 16]}>
              {tables.map(table => {
                const qrData = qrCodes.get(table.id);
                const isSelected = selectedTableIds.has(table.id);
                
                return (
                  <Col span={8} key={table.id}>
                    <Card
                      hoverable
                      className={isSelected ? 'border-2 border-blue-500' : ''}
                      cover={                        qrData ? (
                          <div className="p-4 text-center">
                            {qrData.qrCode ? (
                              <img 
                                src={qrData.qrCode} 
                                alt={`QR Code for ${table.name}`}
                                className="max-w-full mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(qrData.menuUrl, '_blank')}
                                title="Click to open this QR code URL"
                                onError={(e) => {
                                  console.error('Failed to load QR code image');
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="p-4 bg-gray-100 rounded">
                                <Text type="danger">QR code không khả dụng</Text>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 text-center">
                            <Spin />
                            <div className="mt-2">Đang tải...</div>
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={
                          <div className="flex items-center justify-between">
                            <span>{table.name}</span>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleTableSelection(table.id)}
                            />
                          </div>
                        }
                        description={
                          <Text type="secondary" className="text-xs">
                            {qrData ? `URL: ${qrData.menuUrl}` : 'Đang tải thông tin URL...'}
                          </Text>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
          
          <div className="mt-4 bg-gray-50 p-3 rounded">
            <Text type="secondary">
              Gợi ý: Để in nhiều mã QR, chọn các bàn bạn muốn in và nhấn nút "In mã QR đã chọn".
              Trong cửa sổ in, bạn có thể chọn "Lưu dưới dạng PDF" để tạo tệp PDF chứa tất cả mã QR.
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
}
