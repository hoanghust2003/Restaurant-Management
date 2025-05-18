'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Input, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { menuService } from '@/app/services/menu.service';
import { MenuModel } from '@/app/models/menu.model';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePerformanceMonitor } from '@/app/utils/performanceMonitoring';

const { Title } = Typography;

/**
 * Component to display the list of menus
 */
const MenuList: React.FC = () => {
  const [menus, setMenus] = useState<MenuModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { user, hasRole } = useAuth();
  const router = useRouter();

  // Check if user has admin rights
  const canManageMenus = hasRole(['admin', 'chef']);

  // Monitor component performance
  usePerformanceMonitor('MenuList', [menus, loading, searchText]);

  // Fetch menus
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await menuService.getAll();
      setMenus(data);
    } catch (error) {
      console.error('Error loading menu list:', error);
      message.error('Không thể tải danh sách thực đơn');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load menus when component mounts
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Handle search filtering
  const filteredMenus = menus.filter(
    menu => menu.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (menu.description && menu.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Handle add menu
  const handleAddMenu = () => {
    router.push('/admin/menus/add');
  };

  // Handle view menu
  const handleViewMenu = (id: string) => {
    router.push(`/admin/menus/view/${id}`);
  };

  // Handle edit menu
  const handleEditMenu = (id: string) => {
    router.push(`/admin/menus/edit/${id}`);
  };

  // Handle delete menu
  const handleDeleteMenu = async (id: string) => {
    try {
      await menuService.delete(id);
      message.success('Đã xóa thực đơn thành công');
      fetchMenus(); // Refresh the list
    } catch (error) {
      console.error('Error deleting menu:', error);
      message.error('Không thể xóa thực đơn');
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'Tên thực đơn',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: MenuModel, b: MenuModel) => a.name.localeCompare(b.name),
      render: (text: string, record: MenuModel) => (
        <a 
          onClick={(e) => {
            e.preventDefault();
            handleViewMenu(record.id);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số lượng món',
      key: 'dishCount',
      render: (text: string, record: MenuModel) => (
        <span>{record.dishes ? record.dishes.length : 0}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (text: string, record: MenuModel) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewMenu(record.id)}
          />
          {canManageMenus && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditMenu(record.id)}
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa thực đơn này?"
                onConfirm={() => handleDeleteMenu(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
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
        <div className="text-2xl font-bold text-blue-700">Quản lý thực đơn</div>
        <div className="flex space-x-4">
          <Input
            placeholder="Tìm kiếm thực đơn..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          {canManageMenus && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddMenu}
            >
              Thêm thực đơn
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMenus}
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

export default MenuList;
