'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Space, 
  Card, 
  Divider,
  Typography,
  Row,
  Col,
  message,
  Spin,
  Alert,
  InputNumber,
  Table
} from 'antd';
import { 
  MinusCircleOutlined, 
  PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { SupplierModel } from '@/app/models/warehouse.model';
import { IngredientModel } from '@/app/models/ingredient.model';
import { supplierService, importService } from '@/app/services/warehouse.service';
import { ingredientService } from '@/app/services/ingredient.service';
import { CreateImportDto } from '@/app/models/warehouse.model';
import AdminLayout from '@/app/layouts/AdminLayout';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Main component wrapped in Suspense for client-side data fetching
export default function AdminCreateImportPage() {
  return (
    <Suspense fallback={<AdminLayout title="Tạo phiếu nhập kho">
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải..." />
      </div>
    </AdminLayout>}>
      <ImportPageContent />
    </Suspense>
  );
}

// Actual content component that uses client-side data
function ImportPageContent() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIngredientId = searchParams.get('ingredient');
  
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState<boolean>(true);
  const [ingredientsLoading, setIngredientsLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Fetch suppliers and ingredients on mount
  useEffect(() => {
    fetchSuppliers();
    fetchIngredients();
  }, []);

  // Khi form mở lại sau khi thêm nhà cung cấp mới, tự động reload danh sách
  useEffect(() => {
    const handleFocus = () => {
      fetchSuppliers();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    // If ingredient ID is provided in URL, pre-select it
    if (initialIngredientId && ingredients.length > 0) {
      const ingredient = ingredients.find(i => i.id === initialIngredientId);
      if (ingredient) {
        const items = form.getFieldValue('items') || [];
        
        // Only add if not already in the list
        if (!items.some((item: any) => item?.ingredient_id === initialIngredientId)) {
          form.setFieldsValue({ 
            items: [
              ...items, 
              { 
                ingredient_id: initialIngredientId,
                quantity: 1,
                unit_price: 0
              }
            ]
          });
        }
      }
    }
  }, [initialIngredientId, ingredients, form]);

  const fetchSuppliers = async () => {
    try {
      setSuppliersLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
      setError('Không thể tải danh sách nhà cung cấp');
    } finally {
      setSuppliersLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      setIngredientsLoading(true);
      const data = await ingredientService.getAll();
      setIngredients(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching ingredients:', err);
      setError('Không thể tải danh sách nguyên liệu');
    } finally {
      setIngredientsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Validate items
      for (const item of values.items) {
        // Check if expiry date exists
        if (!item.expiry_date) {
          message.error('Vui lòng nhập hạn sử dụng cho tất cả các lô');
          setSubmitting(false);
          return;
        }
        
        // If production date exists, make sure it's before expiry date
        if (item.production_date && item.expiry_date && 
            item.production_date.isAfter(item.expiry_date)) {
          message.error('Ngày sản xuất không thể sau hạn sử dụng');
          setSubmitting(false);
          return;
        }
      }        // Format data
        const importData: CreateImportDto = {
          supplierId: values.supplier_id,
          note: values.notes,
          batches: values.items.map((item: any) => {
            // Generate a meaningful lot identifier if not provided
            const lotId = item.lot_number || 
              `${item.ingredient_id.substring(0, 5)}-${moment().format('YYMMDD')}-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`;
            
            return {
              ingredientId: item.ingredient_id,
              name: `${lotId} ${moment().format('DDMMYYYY')}`,
              quantity: Number(item.quantity),
              price: Number(item.unit_price),
              expiry_date: item.expiry_date.toISOString(),
            };
          }),
      };
      
      // Create import
      await importService.create(importData);
      message.success('Tạo phiếu nhập kho thành công');
      form.resetFields(); // Reset form after submit
      fetchSuppliers(); // Reload suppliers in case new ones were added
      router.push(`/admin/inventory/imports`);
    } catch (err: any) {
      console.error('Error creating import:', err);
      message.error(err.response?.data?.message || 'Không thể tạo phiếu nhập kho');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = (items: any[]) => {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((sum, item) => {
      const quantity = item?.quantity || 0;
      const unitPrice = item?.unit_price || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };
  // Set up a watcher for form changes using Ant Design Form's onValuesChange
  const onFormValuesChange = () => {
    const items = form.getFieldValue('items') || [];
    setTotalAmount(calculateTotal(items));
  };
  
  // Initial calculation when form is ready
  useEffect(() => {
    const initialItems = form.getFieldValue('items') || [];
    setTotalAmount(calculateTotal(initialItems));
  }, [form]);

  if (suppliersLoading || ingredientsLoading) {
    return (
      <AdminLayout title="Tạo phiếu nhập kho">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Tạo phiếu nhập kho">
        <div className="p-6">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tạo phiếu nhập kho">
      <div className="p-6">
        <Card>
          <div className="mb-6">
            <Title level={4}>Tạo phiếu nhập kho mới</Title>
            <Text type="secondary">Nhập thông tin để tạo phiếu nhập kho mới</Text>
          </div>          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={onFormValuesChange}
            initialValues={{
              import_date: moment(),
              items: initialIngredientId ? [{ 
                ingredient_id: initialIngredientId, 
                quantity: 1,
                unit_price: 0,
                expiry_date: moment().add(30, 'days'),
              }] : [],
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="supplier_id"
                  label="Nhà cung cấp"
                  rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                >
                  <Select
                    showSearch
                    placeholder={suppliersLoading ? 'Đang tải...' : (suppliers.length === 0 ? 'Không có nhà cung cấp, hãy thêm mới' : 'Chọn nhà cung cấp')}
                    optionFilterProp="children"
                    loading={suppliersLoading}
                    notFoundContent={suppliersLoading ? <Spin size="small" /> : 'Không có nhà cung cấp'}
                    disabled={suppliersLoading || suppliers.length === 0}
                    style={{ width: '100%' }}
                    dropdownRender={menu => (
                      <>
                        {menu}
                        <div style={{ padding: 8, textAlign: 'center' }}>
                          <Button
                            type="link"
                            onClick={() => router.push('/admin/inventory/suppliers/create')}
                            style={{ padding: 0 }}
                          >
                            + Thêm nhà cung cấp mới
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="reference_number"
                  label="Mã phiếu nhập"
                  help="Để trống để hệ thống tự sinh mã"
                >
                  <Input placeholder="Nhập mã phiếu" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="import_date"
                  label="Ngày nhập"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày nhập"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="notes"
                  label="Ghi chú"
                >
                  <TextArea rows={1} placeholder="Nhập ghi chú (nếu có)" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Danh sách nguyên liệu</Divider>

            <Form.List
              name="items"
              rules={[
                {
                  validator: async (_, items) => {
                    if (!items || items.length === 0) {
                      return Promise.reject(new Error('Vui lòng thêm ít nhất một nguyên liệu'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  <div className="overflow-x-auto">
                    <Table
                      dataSource={fields.map(field => ({
                        ...field,
                        ...form.getFieldValue('items')[field.name],
                        key: field.key,
                      }))}
                      pagination={false}
                      rowKey="key"
                      columns={[
                        {
                          title: 'Nguyên liệu',
                          dataIndex: 'ingredient_id',
                          key: 'ingredient_id',
                          width: '25%',
                          render: (_, record) => (
                            <Form.Item
                              name={[record.name, 'ingredient_id']}
                              rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
                              style={{ margin: 0 }}
                            >
                              <Select
                                placeholder="Chọn nguyên liệu"
                                showSearch
                                optionFilterProp="children"
                                loading={ingredientsLoading}
                              >
                                {ingredients.map(ingredient => (
                                  <Option key={ingredient.id} value={ingredient.id}>
                                    {ingredient.name} ({ingredient.unit})
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          ),
                        },
                        {
                          title: 'Số lượng',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          width: '15%',
                          render: (_, record) => (
                            <Form.Item
                              name={[record.name, 'quantity']}
                              rules={[
                                { required: true, message: 'Vui lòng nhập số lượng' },
                                { type: 'number', min: 0, message: 'Số lượng không được âm' }
                              ]}
                              style={{ margin: 0 }}
                            >
                              <InputNumber
                                placeholder="Nhập số lượng"
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          ),
                        },
                        {
                          title: 'Đơn giá',
                          dataIndex: 'unit_price',
                          key: 'unit_price',
                          width: '15%',
                          render: (_, record) => (
                            <Form.Item
                              name={[record.name, 'unit_price']}
                              rules={[
                                { required: true, message: 'Vui lòng nhập đơn giá' },
                                { type: 'number', min: 0, message: 'Đơn giá không được âm' }
                              ]}
                              style={{ margin: 0 }}
                            >
                              <InputNumber
                                placeholder="Nhập đơn giá"
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          ),
                        },
                        {
                          title: 'Mã lô',
                          dataIndex: 'lot_number',
                          key: 'lot_number',
                          width: '15%',
                          render: (_, record) => (
                            <Form.Item
                              name={[record.name, 'lot_number']}
                              style={{ margin: 0 }}
                            >
                              <Input placeholder="Nhập mã lô" />
                            </Form.Item>
                          ),
                        },
                        {
                          title: 'Ngày sản xuất',
                          dataIndex: 'production_date',
                          key: 'production_date',
                          width: '15%',
                          render: (_, record) => (
                            <Form.Item
                              name={[record.name, 'production_date']}
                              style={{ margin: 0 }}
                            >
                              <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày sản xuất"
                              />
                            </Form.Item>
                          ),
                        },
                        {
                          title: 'Hạn sử dụng',
                          dataIndex: 'expiry_date',
                          key: 'expiry_date',
                          width: '15%',
                          render: (_, record) => (
                            <Form.Item
                              name={[record.name, 'expiry_date']}
                              style={{ margin: 0 }}
                              rules={[
                                { required: true, message: 'Vui lòng chọn hạn sử dụng' }
                              ]}
                            >
                              <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn hạn sử dụng"
                              />
                            </Form.Item>
                          ),
                        },
                        {
                          title: '',
                          key: 'actions',
                          width: '5%',
                          render: (_, record) => (
                            fields.length > 1 ? (
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(record.name)}
                              />
                            ) : null
                          ),
                        },
                      ]}
                    />
                  </div>

                  <Form.Item style={{ marginTop: 16 }}>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      block
                    >
                      Thêm nguyên liệu
                    </Button>
                  </Form.Item>
                  
                  {/* Display total amount */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <Text strong>Tổng giá trị:</Text>
                      <Text strong className="text-xl text-blue-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                      </Text>
                    </div>
                  </div>
                </>
              )}
            </Form.List>

            <Divider />

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Tạo phiếu nhập
                </Button>
                <Button onClick={() => router.push('/admin/inventory/imports')}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
}
