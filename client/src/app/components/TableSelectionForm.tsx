'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, Card, Button, message, Row, Col, Tag } from 'antd';
import { tableService } from '@/app/services/table.service';
import { TableModel } from '@/app/models/table.model';
import { TableStatus } from '@/app/utils/enums';

interface TableSelectionFormProps {
  onTableSelect: (tableId: string) => void;
}

const TableSelectionForm: React.FC<TableSelectionFormProps> = ({ onTableSelect }) => {
  const [form] = Form.useForm();
  const [tables, setTables] = useState<TableModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getAll();
      // Only show available tables
      const availableTables = data.filter(table => table.status === TableStatus.AVAILABLE);
      setTables(availableTables);
    } catch (error) {
      console.error('Error loading tables:', error);
      message.error('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values: { tableId: string }) => {
    onTableSelect(values.tableId);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <h3 className="text-lg font-medium mb-4">Chọn bàn</h3>
      <Row gutter={[16, 16]}>
        {tables.map(table => (
          <Col key={table.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              onClick={() => {
                form.setFieldsValue({ tableId: table.id });
                handleSubmit({ tableId: table.id });
              }}
              className="cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{table.name}</div>
                  <div className="text-sm text-gray-500">
                    Sức chứa: {table.capacity} người
                  </div>
                </div>
                <Tag color="green">Trống</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Form.Item name="tableId" hidden>
        <Select />
      </Form.Item>
    </Form>
  );
};

export default TableSelectionForm;
