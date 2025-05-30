'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Spin, 
  message, 
  Space, 
  Divider,
  Table,
  Tag,
  Input,
  Modal,
  Row,
  Col
} from 'antd';
import { 
  QrcodeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SearchOutlined,
  TableOutlined
} from '@ant-design/icons';
import { tableService } from '@/app/services/table.service';
import { TableModel } from '@/app/models/table.model';
import BatchQrCodeModal from '@/app/components/BatchQrCodeModal';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

export default function QrCodeManagementPage() {
  const [tables, setTables] = useState<TableModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [batchQrModalVisible, setBatchQrModalVisible] = useState<boolean>(false);
  const router = useRouter();
  
  // Load all tables when component mounts
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const tableData = await tableService.getAll();
      setTables(tableData);
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleShowBatchQrModal = () => {
    setBatchQrModalVisible(true);
  };

  const handleViewTableManagement = () => {
    router.push('/admin/tables');
  };

  const handleTestQrCode = (table: TableModel) => {
    const customerMenuUrl = `${window.location.origin}/customer/menu?tableId=${table.id}`;
    window.open(customerMenuUrl, '_blank');
  };

  // Filter tables based on search text
  const filteredTables = tables.filter(table => 
    searchText ? table.name.toLowerCase().includes(searchText.toLowerCase()) : true
  );

  // Configure table columns
  const columns = [
    {
      title: 'Tên bàn',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => `${capacity} người`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'OCCUPIED') {
          color = 'volcano';
        } else if (status === 'RESERVED') {
          color = 'geekblue';
        } else if (status === 'UNAVAILABLE') {
          color = 'gray';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: TableModel) => (
        <Space size="small">
          <Button 
            icon={<QrcodeOutlined />}
            size="small"
            onClick={() => handleGenerateQr(record)}
          >
            Tạo QR
          </Button>
          <Button 
            size="small"
            onClick={() => handleTestQrCode(record)}
          >
            Kiểm tra
          </Button>
        </Space>
      ),
    },
  ];

  const handleGenerateQr = async (table: TableModel) => {
    try {
      const qrData = await tableService.generateQrCode(table.id);
      Modal.info({
        title: `Mã QR cho bàn ${table.name}`,
        centered: true,
        width: 500,
        content: (
          <div className="text-center py-4">
            <div className="mb-4">
              <img 
                src={qrData.qrCode} 
                alt={`QR code for ${table.name}`}
                className="max-w-xs mx-auto"
              />
            </div>
            <Paragraph>
              Quét mã QR này để truy cập thực đơn cho bàn {table.name}
            </Paragraph>
            <Space className="mt-2">
              <Button 
                icon={<PrinterOutlined />}
                onClick={() => handlePrintQr(qrData)}
              >
                In
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadQr(qrData, table.name)}
              >
                Tải xuống
              </Button>
            </Space>
            <div className="mt-4 pt-2 border-t border-gray-200">
              <Text type="secondary" copyable={{ text: qrData.menuUrl }}>
                URL: {qrData.menuUrl}
              </Text>
            </div>
          </div>
        ),
        onOk() {},
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      message.error('Không thể tạo mã QR cho bàn này');
    }
  };

  const handlePrintQr = (qrData: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code</title>
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
                max-width: 300px;
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
              <div class="table-name">${qrData.table.name}</div>
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

  const handleDownloadQr = (qrData: any, tableName: string) => {
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `qr-code-${tableName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã tải xuống mã QR');
  };

  return (
    <div className="p-6">
      <Card>
        <Title level={2}>Quản lý mã QR</Title>
        <Paragraph>
          Tạo và quản lý mã QR cho từng bàn. Khách hàng có thể quét mã QR để truy cập thực đơn và đặt món trực tiếp tại bàn.
        </Paragraph>
        
        <Divider />
        
        <Row className="mb-4">
          <Col span={16}>
            <Space>
              <Button 
                type="primary" 
                icon={<QrcodeOutlined />}
                onClick={handleShowBatchQrModal}
              >
                Tạo QR cho tất cả bàn
              </Button>
              <Button onClick={handleViewTableManagement}>
                Quản lý bàn
              </Button>
              <Button onClick={loadTables}>
                Làm mới
              </Button>
            </Space>
          </Col>
          <Col span={8} className="text-right">
            <Input
              placeholder="Tìm kiếm bàn..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </Col>
        </Row>
        
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">Đang tải danh sách bàn...</div>
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredTables}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
      
      {/* Batch QR Code Modal */}
      <BatchQrCodeModal 
        visible={batchQrModalVisible} 
        tables={tables}
        onClose={() => setBatchQrModalVisible(false)}
      />
    </div>
  );
}
