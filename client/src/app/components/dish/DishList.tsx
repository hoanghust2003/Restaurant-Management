'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Input, Typography, Tag, Select, Modal, Form, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FilterOutlined, TagsOutlined } from '@ant-design/icons';
import { dishService } from '@/app/services/dish.service';
import { categoryService } from '@/app/services/category.service';
import { DishModel } from '@/app/models/dish.model';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePerformanceMonitor } from '@/app/utils/performanceMonitoring';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title } = Typography;
const { Search } = Input;

/**
 * Component to display the list of dishes
 */
const DishList: React.FC = () => {
  const [dishes, setDishes] = useState<DishModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { user, hasRole } = useAuth();
  const router = useRouter();

  // Check if user has admin rights
  const canManageDishes = hasRole(['admin', 'chef']);

  // Monitor component performance
  usePerformanceMonitor('DishList', [dishes, loading, searchText]);

  // Fetch dishes
  const fetchDishes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dishService.getAll();
      setDishes(data);
    } catch (error) {
      console.error('Error loading dish list:', error);
      message.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dishes when component mounts
  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);
  // Handle search filtering
  // const filteredDishes = dishes.filter(
  //   dish => dish.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //   dish.description.toLowerCase().includes(searchText.toLowerCase()) ||
  //   (dish.category?.name && dish.category.name.toLowerCase().includes(searchText.toLowerCase()))
  // );

  // Handle navigate to add dish page
  const handleAddDish = () => {
    router.push('/admin/dishes/add');
  };

  // Handle navigate to edit dish page
  const handleEditDish = (id: string) => {
    router.push(`/admin/dishes/edit/${id}`);
  };

  // Handle navigate to view dish page
  const handleViewDish = (id: string) => {
    router.push(`/admin/dishes/view/${id}`);
  };

  // Handle dish deletion
  const handleDeleteDish = async (id: string) => {
    try {
      await dishService.delete(id);
      message.success('Xóa món ăn thành công');
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      message.error('Không thể xóa món ăn');
    }
  };  // Format price to VND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Table columns
  const columns = [
    {      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,      render: (imageUrl: string) => (
        <ImageWithFallback
          src={imageUrl}
          type="dishes"
          alt="Dish"
          width={80}
          height={80}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DishModel, b: DishModel) => a.name.localeCompare(b.name),
    },    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (_: any, record: DishModel) => (
        record.category ? 
        <Tag color="blue">{record.category.name}</Tag> : 
        <Tag color="default">Chưa phân loại</Tag>
      ),
      sorter: (a: DishModel, b: DishModel) => 
        (a.category?.name || '').localeCompare(b.category?.name || ''),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
      sorter: (a: DishModel, b: DishModel) => a.price - b.price,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: DishModel) => (
        <Space>
          {record.available ? (
            <Tag color="green">Có sẵn</Tag>
          ) : (
            <Tag color="red">Hết hàng</Tag>
          )}
          {record.is_preparable ? (
            <Tag color="blue">Cần chế biến</Tag>
          ) : (
            <Tag color="orange">Không cần chế biến</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Thời gian chế biến',
      dataIndex: 'preparation_time',
      key: 'preparation_time',
      render: (time: number) => `${time} phút`,
      sorter: (a: DishModel, b: DishModel) => a.preparation_time - b.preparation_time,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: DishModel) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDish(record.id)}
          />
          {canManageDishes && (
            <>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditDish(record.id)}
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa món ăn này?"
                onConfirm={() => handleDeleteDish(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string, name: string, description: string }[]>([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Fetch categories for filtering and management
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Category Modal Functions
  const showCategoryModal = () => {
    setCategoryModalVisible(true);
  };

  const handleCategoryCancel = () => {
    setCategoryModalVisible(false);
    categoryForm.resetFields();
    setEditingCategoryId(null);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.id);
    categoryForm.setFieldsValue({
      name: category.name,
      description: category.description
    });
  };

  const handleCreateOrUpdateCategory = async () => {
    try {
      setCategoryLoading(true);
      const values = await categoryForm.validateFields();
      
      if (editingCategoryId) {
        await categoryService.update(editingCategoryId, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.create(values);
        message.success('Tạo danh mục thành công');
      }
      
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      setEditingCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error('Error with category:', error);
      message.error('Không thể lưu danh mục');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.delete(id);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Không thể xóa danh mục');
    }
  };

  // Apply both search text and category filtering
  const getFilteredDishes = useCallback(() => {
    return dishes.filter(dish => {
      const matchesSearch = 
        dish.name.toLowerCase().includes(searchText.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (dish.category?.name && dish.category.name.toLowerCase().includes(searchText.toLowerCase()));
      
      const matchesCategory = !selectedCategory || dish.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [dishes, searchText, selectedCategory]);
  
  const filteredDishes = getFilteredDishes();

  return (
    <div className="dish-list">
      <div className="dish-list-header" style={{ marginBottom: 20 }}>
        <Title level={2}>Quản lý món ăn</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Search
              placeholder="Tìm kiếm món ăn"
              onSearch={value => setSearchText(value)}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setSelectedCategory(value)}
              options={[
                ...categories.map(category => ({
                  value: category.id,
                  label: category.name
                }))
              ]}
            />
            {canManageDishes && (
              <Button 
                icon={<TagsOutlined />} 
                onClick={showCategoryModal}
              >
                Quản lý danh mục
              </Button>
            )}
          </div>
          {canManageDishes && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddDish}
            >
              Thêm món ăn
            </Button>
          )}
        </div>
      </div>
      <Table
        dataSource={filteredDishes}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} món ăn`,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />      <Modal
        title="Quản lý danh mục"
        open={isCategoryModalVisible}
        onCancel={handleCategoryCancel}
        footer={null}
        width={600}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCreateOrUpdateCategory}
          initialValues={{}}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả cho danh mục" />
          </Form.Item>
          <Divider />
          <Form.Item>
            <Space>
              <Button onClick={handleCategoryCancel}>
                Huỷ
              </Button>
              <Button type="primary" htmlType="submit" loading={categoryLoading}>
                {editingCategoryId ? 'Cập nhật danh mục' : 'Tạo danh mục'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <Divider />
        <Table
          dataSource={categories}
          rowKey="id"
          pagination={false}
          loading={loading}
          columns={[
            {
              title: 'Tên danh mục',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'Mô tả',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: 'Thao tác',
              key: 'action',
              render: (_: any, record: any) => (
                <Space size="middle">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => handleEditCategory(record)}
                  />
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa danh mục này?"
                    onConfirm={() => handleDeleteCategory(record.id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default DishList;
