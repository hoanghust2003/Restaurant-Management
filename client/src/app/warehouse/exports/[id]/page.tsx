'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Table, 
  Space, 
  Button, 
  Tag, 
  Spin, 
  Alert, 
  Badge, 
  Divider 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PrinterOutlined 
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';
import { exportService } from '@/app/services/warehouse.service';
import { ExportModel, ExportItemModel } from '@/app/models/warehouse.model';

const { Title, Text } = Typography;

const ExportDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [exportData, setExportData] = useState<ExportModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<boolean>(false);

  useEffect(() => {
    if (params.id) {
      fetchExport();
    }
  }, [params.id]);

  useEffect(() => {
    // Add event listeners for print
    const beforePrint = () => setPrintMode(true);
    const afterPrint = () => setPrintMode(false);
    
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  const fetchExport = async () => {
    try {
      setLoading(true);
      const data = await exportService.getById(params.id);
      setExportData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching export details:', err);
      setError(err.message || 'Không thể tải thông tin phiếu xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'usage':
        return 'Sử dụng';
      case 'damaged':
        return 'Hư hỏng';
      case 'expired':
        return 'Hết hạn';
      case 'other':
        return 'Khác';
      default:
        return 'Không xác định';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'usage':
        return 'blue';
      case 'damaged':
        return 'volcano';
      case 'expired':
        return 'red';
      case 'other':
        return 'purple';
      default:
        return 'default';
    }
  };  const columns = [
    {
      title: 'Nguyên liệu',
      dataIndex: 'ingredient',
      key: 'ingredient',
      render: (ingredient: any) => {
        if (!ingredient?.id || !ingredient?.name) return 'N/A';
        return (
          <div className="print-friendly">
            <span className="font-medium print-only">{ingredient.name}</span>
            <Button 
              type="link" 
              onClick={() => router.push(`/warehouse/ingredients/${ingredient.id}`)}
              style={{ padding: 0, height: 'auto', fontWeight: 500 }}
              className="print-hidden"
            >
              {ingredient.name}
            </Button>
          </div>
        );
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'ingredient',
      key: 'unit',
      render: (ingredient: any) => ingredient?.unit || 'N/A',
    },
    {
      title: 'Lô hàng',
      dataIndex: 'batch',
      key: 'batch',
      render: (batch: any) => {
        if (!batch?.id) return 'Không có mã lô';
        const lotDisplay = batch.lot_number || `Lô #${batch.id.slice(0, 8)}`;
        return (
          <div className="print-friendly">
            <span className="print-only">{lotDisplay}</span>
            <Button 
              type="link" 
              onClick={() => router.push(`/warehouse/batches/${batch.id}`)}
              style={{ padding: 0, height: 'auto' }}
              className="print-hidden"
            >
              {lotDisplay}
            </Button>
          </div>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => 
        `${quantity.toLocaleString('vi-VN')} ${record.ingredient?.unit || ''}`,
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'batch',
      key: 'expiry_date',
      render: (batch: any) => {
        if (!batch?.expiry_date) return 'N/A';
        
        const expDate = moment(batch.expiry_date);
        const now = moment();
        const isExpired = expDate.isBefore(now, 'day');
        
        return (
          <div className={isExpired ? 'text-red-500 font-medium' : ''}>
            {expDate.format('DD/MM/YYYY')}
            {isExpired && (
              <Tag color="red" className={`ml-2 ${printMode ? 'print-tag' : ''}`}>
                Đã hết hạn
              </Tag>
            )}
          </div>
        );
      },
    },
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <div className="ml-3">Đang tải thông tin phiếu xuất kho...</div>
      </div>
    );
  }

  if (error || !exportData) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy thông tin phiếu xuất kho'}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/warehouse/exports')}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }
  return (
    <div className="p-6">
      {/* Print Header - Only visible when printing */}
      <div className="print-only print-header">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-0">PHIẾU XUẤT KHO</h2>
          <p className="mb-0">Mã phiếu: {exportData?.reference_number}</p>
          <p>Ngày xuất: {exportData ? moment(exportData.export_date).format('DD/MM/YYYY') : ''}</p>
        </div>
        <div className="text-right text-sm mb-2">
          <p>Người in: {exportData?.created_by || 'Admin'}</p>
          <p>Ngày in: {moment().format('DD/MM/YYYY HH:mm')}</p>
        </div>
      </div>
      
      <Card className="shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-6 print-hidden">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/warehouse/exports')}
              className="mr-4"
            >
              Quay lại
            </Button>
            <div>
              <Title level={4} className="mb-0">Chi tiết phiếu xuất kho</Title>
              <Text type="secondary">Mã phiếu: {exportData.reference_number}</Text>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
              type="primary"
              ghost
            >
              In phiếu
            </Button>
          </div>
        </div>        <div className="bg-gray-50 p-4 rounded-md mb-6 export-info-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-sm">Mã phiếu</div>
              <div className="font-medium">{exportData.reference_number}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Ngày xuất kho</div>
              <div className="font-medium">{moment(exportData.export_date).format('DD/MM/YYYY')}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Lý do xuất kho</div>
              <div>
                <Tag color={getReasonColor(exportData.reason)} className="mt-1 print-tag">
                  {getReasonText(exportData.reason)}
                </Tag>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Tổng số lượng</div>
              <div className="font-medium">{exportData.total_quantity}</div>
            </div>
          </div>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
          title={<span className="font-semibold">Thông tin chi tiết</span>}
          className="mb-6"
          size="small"
        >
          <Descriptions.Item label="Mã phiếu" span={2}>
            {exportData.reference_number}
          </Descriptions.Item>
          <Descriptions.Item label="Lý do xuất kho" span={2}>
            <Tag color={getReasonColor(exportData.reason)}>
              {getReasonText(exportData.reason)}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Ngày xuất kho" span={2}>
            {moment(exportData.export_date).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số lượng" span={2}>
            {exportData.total_quantity}
          </Descriptions.Item>
          
          <Descriptions.Item label="Người tạo" span={2}>
            {exportData.created_by || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={2}>
            {moment(exportData.created_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Ghi chú" span={4}>
            {exportData.notes || 'Không có ghi chú'}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">
          <span className="font-semibold">Chi tiết nguyên liệu xuất kho</span>
        </Divider>        <Table 
          columns={columns} 
          dataSource={exportData.items} 
          rowKey="id"
          pagination={false}
          bordered
          className="shadow-sm export-table"
          summary={(pageData) => {
            let totalQuantity = 0;
            
            pageData.forEach(({ quantity }) => {
              totalQuantity += quantity;
            });
            
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Tổng số lượng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{totalQuantity}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />

        {/* Print-only signature section */}
        <div className="print-only signature-section mt-8">
          <div className="grid grid-cols-2 gap-20 text-center">
            <div>
              <p className="font-medium">Người xuất kho</p>
              <p className="mt-20">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-medium">Người nhận hàng</p>
              <p className="mt-20">(Ký, ghi rõ họ tên)</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center print-hidden">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/warehouse/exports')}
          >
            Quay lại danh sách phiếu xuất
          </Button>
        </div>
      </Card>
      
      {/* Print specific styles */}
      <style jsx global>{`
        @media print {
          .ant-layout-header,
          .ant-layout-sider,
          .print-hidden {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .ant-card {
            box-shadow: none !important;
            border: none !important;
          }
          
          .ant-layout-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          body {
            padding: 0;
            margin: 0;
          }
          
          .export-table {
            width: 100% !important;
          }
          
          .export-table th {
            background-color: #f0f0f0 !important;
            color: #000 !important;
          }
          
          .signature-section {
            margin-top: 60px;
            page-break-inside: avoid;
          }
          
          .print-header {
            margin-bottom: 20px;
          }
          
          /* Force a page break before specific elements */
          .page-break-before {
            page-break-before: always;
          }
          
          /* Prevent page breaks inside elements */
          .keep-together {
            page-break-inside: avoid;
          }
        }
        
        /* Hide print-only elements when not printing */
        .print-only {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ExportDetailPage;
