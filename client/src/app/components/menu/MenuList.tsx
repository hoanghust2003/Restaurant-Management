'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Input, Typography, Switch, Tooltip, Badge, Modal, Card } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { menuService } from '@/app/services/menu.service';
import { MenuModel } from '@/app/models/menu.model';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePerformanceMonitor } from '@/app/utils/performanceMonitoring';
import { StarFilled } from '@ant-design/icons';

const { Title } = Typography;

/**
 * Component to display the list of menus
 */
export const MenuList: React.FC = () => {
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

  // Handle set main menu 
  const handleSetMainMenu = async (record: MenuModel, checked: boolean) => {
    // Store current state for rollback
    const previousMenus = [...menus];
    
    try {
      // Optimistic update
      const updatedMenus = menus.map(menu => ({
        ...menu,
        is_main: menu.id === record.id ? checked : false
      }));
      setMenus(updatedMenus);

      // Save to server
      if (checked) {
        await menuService.update(record.id, { is_main: true });
        message.success('Đã đặt làm menu chính');
      } else {
        await menuService.update(record.id, { is_main: false });
        message.success('Đã bỏ menu chính');
      }
      
      // Fetch latest data to ensure consistency
      await fetchMenus();
    } catch (error) {
      console.error('Error setting main menu:', error);
      // Rollback to previous state
      setMenus(previousMenus);
      message.error('Không thể cập nhật trạng thái menu chính');
    }
  };

  // Define table columns
  const columns = [
    {      title: 'Tên thực đơn', 
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MenuModel) => (
        <Button type="link" onClick={() => handleViewMenu(record.id)}>
          {text}
        </Button>
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
        <span>{record.dishes?.length || 0} món</span>
      ),
    },
    {
      title: 'Menu chính',
      dataIndex: 'is_main',
      key: 'is_main',
      align: 'center' as const,
      render: (_: any, record: MenuModel) => (
        <Switch
          checked={record.is_main || false}
          onChange={(checked) => handleSetMainMenu(record, checked)}
          disabled={!canManageMenus}
        />
      ),
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (text: string, record: MenuModel) => (
        <Space size="middle">
          <Button type="primary" ghost onClick={() => handleViewMenu(record.id)}>
            Xem
          </Button>
          {canManageMenus && (
            <>
              <Button onClick={() => handleEditMenu(record.id)}>Sửa</Button>
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa menu này?"
                onConfirm={() => handleDeleteMenu(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button danger>Xóa</Button>
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
        <Title level={2}>Danh sách thực đơn</Title>
        {canManageMenus && (
          <Button type="primary" onClick={handleAddMenu}>
            Thêm thực đơn
          </Button>
        )}
      </div>
      
      <Card>
        <div className="mb-4">
          <Input.Search
            placeholder="Tìm kiếm thực đơn..."
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredMenus}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default MenuList;
