'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Input, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryService } from '@/app/services/category.service';
import { CategoryModel } from '@/app/models/category.model';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

const { Title } = Typography;

/**
 * Component hiển thị danh sách các danh mục món ăn
 */
const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { user, hasRole } = useAuth();
  const router = useRouter();

  // Kiểm tra quyền admin
  const isAdmin = hasRole(['admin']);

  // Hàm lấy danh sách danh mục
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API khi component được tạo
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Hàm xử lý xóa danh mục
  const handleDelete = async (id: string) => {
    try {
      await categoryService.delete(id);
      message.success('Xóa danh mục thành công');
      fetchCategories(); // Tải lại danh sách
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Không thể xóa danh mục');
    }
  };
  // Hàm chuyển đến trang chỉnh sửa
  const handleEdit = (id: string) => {
    router.push(`/admin/categories/edit/${id}`);
  };

  // Hàm chuyển đến trang tạo mới
  const handleCreate = () => {
    router.push('/admin/categories/create');
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',      render: (text: string, record: CategoryModel) => (
        <a 
          href={`/admin/categories/edit/${record.id}`}
          onClick={(e) => {
            e.preventDefault();
            router.push(`/admin/categories/edit/${record.id}`);
          }}
        >
          {text}
        </a>
      ),      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: CategoryModel) =>
        record.name.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || 'Không có mô tả',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: CategoryModel) => (
        <Space size="middle">
          {isAdmin && (
            <>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record.id)}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa danh mục này không?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Lọc danh sách khi tìm kiếm
  const filteredCategories = searchText
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : categories;
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ color: '#1890ff' }}>Danh sách danh mục món ăn</Title>
        <div className="flex space-x-4">
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          {isAdmin && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreate}
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
        }}
      />
    </div>
  );
};

export default CategoryList;
