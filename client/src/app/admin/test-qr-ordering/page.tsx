'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Space, Typography, message, Divider, Spin } from 'antd';
import { tableService } from '@/app/services/table.service';
import Link from 'next/link';
import { QrcodeOutlined, PlusOutlined } from '@ant-design/icons';
import { TableModel } from '@/app/models/table.model';
import QrCodeModal from '@/app/components/QrCodeModal';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

export default function TestQrCodeOrderingPage() {
  const [tables, setTables] = useState<TableModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creatingTable, setCreatingTable] = useState<boolean>(false);
  const [tableName, setTableName] = useState<string>('');
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const router = useRouter();

  // Load all tables when the component mounts
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const tablesData = await tableService.getAll();
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading tables:', error);
      message.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  // Create a new test table
  const createTestTable = async () => {
    if (!tableName.trim()) {
      message.error('Please enter a table name');
      return;
    }

    try {
      setCreatingTable(true);
      const newTable = await tableService.create({
        name: tableName,
        capacity: 4
      });
      
      message.success(`Test table "${newTable.name}" created successfully`);
      setTableName('');
      await loadTables();
    } catch (error) {
      console.error('Error creating test table:', error);
      message.error('Failed to create test table');
    } finally {
      setCreatingTable(false);
    }
  };

  // Show QR code for a table
  const showQrCode = (table: TableModel) => {
    setSelectedTable(table);
    setQrModalVisible(true);
  };

  // Simulate scanning QR code
  const simulateScan = (table: TableModel) => {
    router.push(`/customer/menu?tableId=${table.id}`);
  };

  return (
    <div className="p-6">
      <Title level={2}>QR Code Ordering Flow Test</Title>
      <Paragraph>
        This page helps you test the QR code ordering flow. You can create test tables,
        generate QR codes for them, and simulate scanning the QR codes.
      </Paragraph>

      <Divider />
      
      {/* Create test table */}
      <Card title="Create Test Table" className="mb-6">
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            placeholder="Enter table name (e.g. Test Table 1)" 
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            onPressEnter={createTestTable}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={createTestTable}
            loading={creatingTable}
          >
            Create
          </Button>
        </Space.Compact>
      </Card>
      
      {/* Table list */}
      <Card title="Test Tables" className="mb-6">
        {loading ? (
          <div className="text-center py-10">
            <Spin />
            <div className="mt-2">Loading tables...</div>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-10">
            <Text type="secondary">No tables found. Create a test table to get started.</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map(table => (
              <Card 
                key={table.id} 
                title={table.name}
                size="small"
                className="shadow-sm"
                extra={
                  <Text type="secondary" className="text-xs">
                    Status: {table.status}
                  </Text>
                }
                actions={[
                  <Button 
                    key="qr"
                    type="text"
                    icon={<QrcodeOutlined />}
                    onClick={() => showQrCode(table)}
                  >
                    Show QR Code
                  </Button>,
                  <Button 
                    key="scan"
                    type="link"
                    onClick={() => simulateScan(table)}
                  >
                    Simulate Scan
                  </Button>,
                ]}
              >
                <p>Capacity: {table.capacity}</p>
                <p>ID: <Text code copyable>{table.id}</Text></p>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Test instructions */}
      <Card title="Test Instructions">
        <ol className="list-decimal list-inside space-y-2">
          <li>Create a test table using the form above</li>
          <li>Click "Show QR Code" to view the QR code for the table</li>
          <li>Click "Simulate Scan" to simulate scanning the QR code (opens the menu page with the table ID)</li>
          <li>On the menu page, add some items to the cart</li>
          <li>Go to checkout and verify that the table ID is automatically selected</li>
          <li>Complete the order and verify that you are redirected to the menu page with a success message</li>
          <li>Check the orders in the admin/waiter panel to confirm the order was placed with the correct table ID</li>
        </ol>
      </Card>

      {/* QR Code Modal */}      <QrCodeModal
        open={qrModalVisible}
        table={selectedTable}
        onClose={() => setQrModalVisible(false)}
      />
    </div>
  );
}
