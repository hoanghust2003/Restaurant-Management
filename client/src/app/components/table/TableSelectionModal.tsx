'use client';

import React from 'react';
import { Modal, Form, Card, Row, Col, Tag, Empty, Input } from 'antd';
import { TableModel } from '@/app/models/table.model';

interface TableSelectionModalProps {
  open: boolean;
  tables: TableModel[];
  loading: boolean;
  onTableSelect: (tableId: string) => void;
  onSearch?: (text: string) => void;
}

export default function TableSelectionModal({ 
  open, 
  tables, 
  loading, 
  onTableSelect,
  onSearch 
}: TableSelectionModalProps) {
  return (
    <Modal 
      title="Chọn bàn"
      open={open}
      footer={null}
      width={800}
      closable={false}
    >
      <div className="mb-4">
        <Input.Search 
          placeholder="Tìm bàn..." 
          onChange={e => onSearch && onSearch(e.target.value)}
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {tables.length > 0 ? (
          <Row gutter={[16, 16]}>
            {tables.map(table => (
              <Col key={table.id} xs={24} sm={12}>
                <Card 
                  hoverable 
                  onClick={() => onTableSelect(table.id)}
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
        ) : (
          <Empty
            description={loading ? 'Đang tải...' : 'Không có bàn trống'}
          />
        )}
      </div>
    </Modal>
  );
}
