'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Input, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/layouts/AdminLayout';
import { UserModel } from '@/app/models/user.model';
import { userService } from '@/app/services/user.service';

const { Search } = Input;

const UserList = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
        message.error('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // Role badge color mapping
  const roleColors: { [key: string]: string } = {
    admin: 'red',
    manager: 'blue',
    chef: 'orange',
    waiter: 'green',
    cashier: 'purple',
    customer: 'default',
  };

  // Define table columns
  const columns = [
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: UserModel) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          {text}
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role.toLowerCase()]}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'error' : 'success'}>
          {isActive ? 'Đã khóa' : 'Hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (text: string, record: UserModel) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/users/edit/${record.id}`)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDeleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      message.success('Xóa người dùng thành công');
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Không thể xóa người dùng');
    }
  };

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <Search
              placeholder="Tìm kiếm theo tên hoặc email..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/users/create')}
          >
            Thêm người dùng
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default UserList;
