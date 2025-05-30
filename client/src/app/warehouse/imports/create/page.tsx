'use client';

import React, { useState, useEffect } from 'react';
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
import WarehouseLayout from '@/app/layouts/WarehouseLayout';
import NumberInput from '@/app/components/NumberInput';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ImportFormValues {
  supplier_id: string;
  reference_number?: string;
  import_date: moment.Moment;
  notes?: string;
  items: Array<{
    ingredient_id: string;
    quantity: number;
    unit_price: number;
    lot_number?: string;
    production_date?: moment.Moment;
    expiry_date: moment.Moment;
  }>;
}

interface ImportItemFormValue {
  ingredient_id: string;
  quantity: number;
  unit_price: number;
  lot_number?: string;
  production_date?: moment.Moment;
  expiry_date: moment.Moment;
}

export default function CreateImportPage() {
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

  useEffect(() => {
    fetchSuppliers();
    fetchIngredients();
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
      const activeSuppliers = data.filter(supplier => supplier.active);
      setSuppliers(activeSuppliers);
      
      // Check for supplier in URL params
      const supplierIdFromUrl = searchParams.get('supplier');
      if (supplierIdFromUrl) {
        const supplierExists = activeSuppliers.some(s => s.id === supplierIdFromUrl);
        if (supplierExists) {
          form.setFieldsValue({ supplier_id: supplierIdFromUrl });
        }
      }
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);  
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

      const validationError = validateFormData(values);
      if (validationError) {
        message.error(validationError);
        return;
      }

      // Format data for API
      const importData: CreateImportDto = {
        supplierId: values.supplier_id,
        note: values.notes,
        batches: values.items.map((item: any) => {
          const lotId = item.lot_number || 
            `${item.ingredient_id.substring(0, 5)}-${moment().format('YYMMDD')}-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`;
          
          return {
            ingredientId: item.ingredient_id,
            name: `${lotId} ${moment().format('DDMMYYYY')}`,
            quantity: Number(item.quantity),
            price: Number(item.unit_price),
            expiry_date: item.expiry_date.toISOString(),
            production_date: item.production_date?.toISOString()
          };
        })
      };

      // Create import
      const result = await importService.create(importData);
      message.success('Tạo phiếu nhập kho thành công');
      router.push(`/warehouse/imports/${result.id}`);
    } catch (err: any) {
      console.error('Error creating import:', err);
      message.error('Có lỗi xảy ra khi tạo phiếu nhập kho: ' + (err.response?.data?.message || err.message));
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

  const onFormValuesChange = (changedValues: any, allValues: any) => {
    const items = allValues.items || [];
    setTotalAmount(calculateTotal(items));
  };
  
  // Initial calculation when form is ready
  useEffect(() => {
    const initialItems = form.getFieldValue('items') || [];
    setTotalAmount(calculateTotal(initialItems));
  }, [form]);

  const validateFormData = (values: any): string | null => {
    if (!values.supplier_id) {
      return 'Vui lòng chọn nhà cung cấp';
    }

    if (!values.items || values.items.length === 0) {
      return 'Vui lòng thêm ít nhất một nguyên liệu';
    }

    for (const item of values.items) {
      if (!item.ingredient_id) {
        return 'Vui lòng chọn nguyên liệu cho tất cả các lô';
      }

      if (!item.quantity || item.quantity <= 0) {
        return 'Số lượng phải lớn hơn 0 cho tất cả các nguyên liệu';
      }

      if (!item.unit_price || item.unit_price < 0) {
        return 'Đơn giá không được âm';
      }

      if (!item.expiry_date) {
        return 'Vui lòng nhập hạn sử dụng cho tất cả các lô';
      }

      if (item.production_date && item.expiry_date && 
          moment(item.production_date).isAfter(item.expiry_date)) {
        return 'Ngày sản xuất không thể sau hạn sử dụng';
      }
    }

    return null;
  };

  if (suppliersLoading || ingredientsLoading) {
    return (
      <WarehouseLayout title="Tạo phiếu nhập kho">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </WarehouseLayout>
    );
  }

  if (error) {
    return (
      <WarehouseLayout title="Tạo phiếu nhập kho">
        <div className="p-6">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
          />
        </div>
      </WarehouseLayout>
    );
  }

  return (
    <WarehouseLayout title="Tạo phiếu nhập kho">
      <div className="p-6">
        <Card>
          <div className="mb-6">
            <Title level={4}>Tạo phiếu nhập kho mới</Title>
            <Text type="secondary">Nhập thông tin để tạo phiếu nhập kho mới</Text>
          </div>

          <Form
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
                    placeholder="Chọn nhà cung cấp"
                    showSearch
                    optionFilterProp="children"
                    loading={suppliersLoading}
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
                          render: (_, record) => (                              <Form.Item
                              name={[record.name, 'quantity']}
                              rules={[
                                { required: true, message: 'Vui lòng nhập số lượng' },
                                { type: 'number', min: 0, message: 'Số lượng không được âm' }
                              ]}
                              style={{ margin: 0 }}
                            >
                              <NumberInput placeholder="Nhập số lượng" allowDecimals={true} />
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
                              <NumberInput placeholder="Nhập đơn giá" allowDecimals={true} />
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
                <Button onClick={() => router.push('/warehouse/imports')}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </WarehouseLayout>
  );
}
