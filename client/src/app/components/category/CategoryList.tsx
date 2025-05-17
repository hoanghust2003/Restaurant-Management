'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Space, Button, Input, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { CategoryModel } from '@/app/models/category.model';
import { categoryService } from '@/app/services/category.service';
import { usePerformanceMonitor } from '@/app/utils/performanceMonitoring';
import { useAuth } from '@/app/contexts/AuthContext';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const router = useRouter();
  const { hasRole } = useAuth();
  
  // Kiểm tra quyền admin hoặc warehouse
  const hasPermission = hasRole(['admin', 'warehouse']);

  // Giám sát hiệu suất
  usePerformanceMonitor('CategoryList', [categories, loading, searchText]);

  // Lấy danh sách danh mục
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách danh mục:', error);
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải danh sách danh mục khi component được mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Xử lý tìm kiếm
  const filteredCategories = categories.filter(
    category => category.name.toLowerCase().includes(searchText.toLowerCase()) ||
                (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Xử lý thêm mới
  const handleAddCategory = () => {
    router.push('/admin/categories/create');
  };

  // Xử lý chỉnh sửa
  const handleEditCategory = (id: string) => {
    router.push(`/admin/categories/edit/${id}`);
  };

  // Xử lý xóa
  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.delete(id);
      message.success('Đã xóa danh mục thành công');
      fetchCategories(); // Làm mới danh sách
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      message.error('Không thể xóa danh mục');
    }
  };
  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: CategoryModel, b: CategoryModel) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {      title: 'Hành động',
      key: 'action',
      render: (_: any, record: CategoryModel) => (
        <Space size="middle">
          {hasPermission && (
            <>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => handleEditCategory(record.id)}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xác nhận xóa danh mục?"
                description="Bạn có chắc chắn muốn xóa danh mục này không?"
                onConfirm={() => handleDeleteCategory(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold text-blue-700">Quản lý danh mục món ăn</div>
        <div className="flex space-x-4">          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          {hasPermission && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddCategory}
            >
              Thêm danh mục
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCategories}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} danh mục`,
        }}
      />
    </div>
  );
};

export default CategoryList;
