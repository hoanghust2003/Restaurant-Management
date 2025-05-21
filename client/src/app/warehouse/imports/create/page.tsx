'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  InputNumber, 
  Table, 
  Space, 
  Card, 
  Typography, 
  Divider,
  Row,
  Col,
  message,
  Spin,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import moment from 'moment';
import { supplierService, importService } from '@/app/services/warehouse.service';
import { ingredientService } from '@/app/services/ingredient.service';
import { CreateImportDto } from '@/app/models/warehouse.model';
import { IngredientModel } from '@/app/models/ingredient.model';
import { SupplierModel } from '@/app/models/warehouse.model';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateImportPage: React.FC = () => {
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
      setSuppliers(data);
      setError(null);
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
      
      // Format data
      const importData: CreateImportDto = {
        supplier_id: values.supplier_id,
        reference_number: values.reference_number,
        import_date: values.import_date.toDate(),
        notes: values.notes,
        items: values.items.map((item: any) => ({
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          production_date: item.production_date ? item.production_date.toDate() : undefined,
          expiry_date: item.expiry_date ? item.expiry_date.toDate() : undefined,
          lot_number: item.lot_number,
        })),
      };
      
      // Create import
      const result = await importService.create(importData);
      
      message.success('Tạo phiếu nhập kho thành công');
      
      // Navigate to import details
      router.push(`/warehouse/imports/${result.id}`);
    } catch (err: any) {
      console.error('Error creating import:', err);
      message.error(`Lỗi: ${err.message || 'Không thể tạo phiếu nhập kho'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => {
      const quantity = item?.quantity || 0;
      const unitPrice = item?.unit_price || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  const loadingContent = (
    <div className="flex justify-center items-center h-64">
      <Spin size="large" tip="Đang tải dữ liệu..." />
    </div>
  );

  if (suppliersLoading || ingredientsLoading) {
    return loadingContent;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/warehouse/imports')}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Title level={4}>Tạo phiếu nhập kho mới</Title>
          <Text type="secondary">
            Nhập thông tin để tạo phiếu nhập kho mới
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            import_date: moment(),
            items: initialIngredientId ? [{ ingredient_id: initialIngredientId, quantity: 1 }] : [],
          }}
          onValuesChange={(_, allValues) => {
            // This will re-render the component when values change
            // useful for calculating total
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
                >
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>{supplier.name}</Option>
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
                <TextArea 
                  rows={1}
                  placeholder="Nhập ghi chú (nếu có)"
                />
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
                            rules={[{ required: true, message: 'Nhập số lượng' }]}
                            style={{ margin: 0 }}
                          >
                            <InputNumber
                              min={0.1}
                              step={0.1}
                              placeholder="Số lượng"
                              style={{ width: '100%' }}
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
                            rules={[{ required: true, message: 'Nhập đơn giá' }]}
                            style={{ margin: 0 }}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Đơn giá"
                              style={{ width: '100%' }}
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                              addonAfter="VND"
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
                          >
                            <DatePicker
                              placeholder="Chọn hạn sử dụng"
                              style={{ width: '100%' }}
                              format="DD/MM/YYYY"
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
                        title: 'Thao tác',
                        key: 'action',
                        width: '10%',
                        render: (_, record) => (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(record.name)}
                          />
                        ),
                      },
                    ]}
                    summary={() => {
                      const items = form.getFieldValue('items') || [];
                      const total = calculateTotal(items);
                      return (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={2}>
                            <strong>Tổng cộng</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} colSpan={4}>
                            <strong>{total.toLocaleString('vi-VN')} VND</strong>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      );
                    }}
                  />
                </div>
                
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16, marginBottom: 16 }}
                  block
                >
                  Thêm nguyên liệu
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SaveOutlined />}
              >
                Tạo phiếu nhập
              </Button>
              <Button 
                onClick={() => router.push('/warehouse/imports')}
                icon={<ArrowLeftOutlined />}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateImportPage;
