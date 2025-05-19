'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Space, Button, Input, Popconfirm, message, Switch, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UndoOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { IngredientModel } from '@/app/models/ingredient.model';
import { ingredientService } from '@/app/services/ingredient.service';
import { useAuth } from '@/app/contexts/AuthContext';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const IngredientList: React.FC = () => {
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const router = useRouter();
  const { hasRole } = useAuth();
    // Kiểm tra quyền admin, manager hoặc warehouse
  const hasPermission = hasRole(['admin', 'manager', 'warehouse']);

  // Lấy danh sách nguyên liệu
  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ingredientService.getAll(showDeleted);
      setIngredients(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nguyên liệu:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  // Tải danh sách nguyên liệu khi component được mount hoặc khi showDeleted thay đổi
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients, showDeleted]);

  // Xử lý tìm kiếm
  const filteredIngredients = ingredients.filter(
    ingredient => ingredient.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Xử lý thêm mới
  const handleAddIngredient = () => {
    router.push('/admin/ingredients/create');
  };

  // Xử lý chỉnh sửa
  const handleEditIngredient = (id: string) => {
    router.push(`/admin/ingredients/edit/${id}`);
  };
  // Xử lý xóa
  const handleDeleteIngredient = async (id: string) => {
    try {
      await ingredientService.delete(id);
      message.success('Đã xóa nguyên liệu thành công');
      fetchIngredients(); // Làm mới danh sách
    } catch (error) {
      console.error('Lỗi khi xóa nguyên liệu:', error);
      message.error('Không thể xóa nguyên liệu');
    }
  };

  // Xử lý khôi phục
  const handleRestoreIngredient = async (id: string) => {
    try {
      await ingredientService.restore(id);
      message.success('Đã khôi phục nguyên liệu thành công');
      fetchIngredients(); // Làm mới danh sách
    } catch (error) {
      console.error('Lỗi khi khôi phục nguyên liệu:', error);
      message.error('Không thể khôi phục nguyên liệu');
    }
  };
  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'Hình ảnh',
      key: 'image',
      width: 90,
      render: (_: any, record: IngredientModel) => (
        <ImageWithFallback
          src={record.image_url}
          type="ingredients"
          alt={record.name}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: IngredientModel, b: IngredientModel) => a.name.localeCompare(b.name),
      render: (text: string, record: IngredientModel) => (
        <span>
          {text}
          {record.deleted_at && (
            <Tooltip title="Nguyên liệu đã xóa">
              <Tag color="red" style={{ marginLeft: 8 }}>
                Đã xóa
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
      width: 150,
    },
    {
      title: 'Ngưỡng cảnh báo',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 150,
      sorter: (a: IngredientModel, b: IngredientModel) => a.threshold - b.threshold,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: any, record: IngredientModel) => (
        <Space size="middle">
          {hasPermission && (
            <>
              {record.deleted_at ? (
                <Popconfirm
                  title="Khôi phục nguyên liệu?"
                  description="Bạn có chắc chắn muốn khôi phục nguyên liệu này không?"
                  onConfirm={() => handleRestoreIngredient(record.id)}
                  okText="Khôi phục"
                  cancelText="Hủy"
                >
                  <Button type="primary" icon={<UndoOutlined />}>
                    Khôi phục
                  </Button>
                </Popconfirm>
              ) : (
                <>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => handleEditIngredient(record.id)}
                  >
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xác nhận xóa nguyên liệu?"
                    description="Bạn có chắc chắn muốn xóa nguyên liệu này không?"
                    onConfirm={() => handleDeleteIngredient(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button type="primary" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold text-blue-700">
          {showDeleted ? 'Nguyên liệu đã xóa' : 'Quản lý nguyên liệu'}
        </div>
        <div className="flex space-x-4 items-center">
          {hasPermission && (
            <Tooltip title="Hiển thị cả nguyên liệu đã xóa">
              <div className="flex items-center mr-4">
                <Switch 
                  checked={showDeleted} 
                  onChange={setShowDeleted} 
                />
                <span className="ml-2">Hiển thị đã xóa</span>
              </div>
            </Tooltip>
          )}
          <Input
            placeholder="Tìm kiếm nguyên liệu..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          {hasPermission && !showDeleted && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddIngredient}
            >
              Thêm nguyên liệu
            </Button>
          )}
        </div>
      </div>

      {showDeleted && (
        <div className="bg-yellow-50 p-4 mb-4 rounded-md border border-yellow-200 flex items-center">
          <ExclamationCircleOutlined className="text-yellow-500 mr-2" />
          <span>Đây là danh sách nguyên liệu đã bị xóa. Bạn có thể khôi phục chúng nếu cần.</span>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredIngredients}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} nguyên liệu`,
        }}
        rowClassName={(record) => record.deleted_at ? 'bg-gray-100' : ''}
      />
    </div>
  );
};

export default IngredientList;
