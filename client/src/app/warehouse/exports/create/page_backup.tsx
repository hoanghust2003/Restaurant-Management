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
import { exportService, batchService } from '@/app/services/warehouse.service';
import { ingredientService } from '@/app/services/ingredient.service';
import { CreateExportDto } from '@/app/models/warehouse.model';
import { IngredientModel } from '@/app/models/ingredient.model';
import { BatchModel } from '@/app/models/warehouse.model';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateExportPage: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIngredientId = searchParams.get('ingredient');
  
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [batches, setBatches] = useState<BatchModel[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<{[key: string]: string}>({});
  const [ingredientsLoading, setIngredientsLoading] = useState<boolean>(true);
  const [batchesLoading, setBatchesLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchIngredients();
  }, []);
  
  useEffect(() => {
    // If ingredient ID is provided in URL, pre-select it
    if (initialIngredientId && ingredients.length > 0) {
      const ingredient = ingredients.find(i => i.id === initialIngredientId);
      if (ingredient) {
        // Update the form to add this ingredient
        const items = form.getFieldValue('items') || [];
        if (!items.some((item: any) => item?.ingredient_id === initialIngredientId)) {
          form.setFieldsValue({ 
            items: [
              ...items, 
              { 
                ingredient_id: initialIngredientId,
                quantity: 1
              }
            ]
          });
          
          // Fetch batches for this ingredient
          fetchBatches(initialIngredientId, 0);
        }
      }
    }
  }, [initialIngredientId, ingredients, form]);

  const fetchIngredients = async () => {
    try {
      setIngredientsLoading(true);
      const data = await ingredientService.getAll();
      
      // Filter ingredients that have stock
      const ingredientsWithStock = data.filter(ingredient => 
        (ingredient.current_quantity || 0) > 0
      );
      
      setIngredients(ingredientsWithStock);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching ingredients:', err);
      setError('Không thể tải danh sách nguyên liệu');
    } finally {
      setIngredientsLoading(false);
    }
  };

  const fetchBatches = async (ingredientId: string, fieldIndex: number) => {
    try {
      setBatchesLoading(true);
      
      // Update the selected ingredient for this field index
      setSelectedIngredients(prev => ({
        ...prev,
        [fieldIndex]: ingredientId
      }));
      
      // Clear batch selection when ingredient changes
      const items = form.getFieldValue('items');
      if (items && items[fieldIndex]) {
        items[fieldIndex].batch_id = undefined;
        form.setFieldsValue({ items });
      }
      
      // Fetch available batches for this ingredient
      const data = await batchService.getAll({ 
        ingredient_id: ingredientId,
        status: 'available'
      });
      
      // Only keep batches with remaining quantity > 0
      const availableBatches = data.filter(batch => batch.remaining_quantity > 0);
      
      setBatches(prevBatches => ({
        ...prevBatches,
        [ingredientId]: availableBatches
      }));
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching batches:', err);
      message.error('Không thể tải danh sách lô hàng');
    } finally {
      setBatchesLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Format data
      const exportData: CreateExportDto = {
        reference_number: values.reference_number,
        export_date: values.export_date.toDate(),
        reason: values.reason,
        notes: values.notes,
        items: values.items.map((item: any) => ({
          batch_id: item.batch_id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
        })),
      };
      
      // Create export
      const result = await exportService.create(exportData);
      
      message.success('Tạo phiếu xuất kho thành công');
      
      // Navigate to export details
      router.push(`/warehouse/exports/${result.id}`);
    } catch (err: any) {
      console.error('Error creating export:', err);
      message.error(`Lỗi: ${err.message || 'Không thể tạo phiếu xuất kho'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableBatchesForIngredient = (ingredientId: string) => {
    return batches[ingredientId] || [];
  };

  const loadingContent = (
    <div className="flex justify-center items-center h-64">
      <Spin size="large" tip="Đang tải dữ liệu..." />
    </div>
  );

  if (ingredientsLoading) {
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
            <Button onClick={() => router.push('/warehouse/exports')}>
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
          <Title level={4}>Tạo phiếu xuất kho mới</Title>
          <Text type="secondary">
            Nhập thông tin để tạo phiếu xuất kho mới
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            export_date: moment(),
            reason: 'usage',
            items: initialIngredientId ? [{ ingredient_id: initialIngredientId, quantity: 1 }] : [],
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="reference_number"
                label="Mã phiếu xuất"
                help="Để trống để hệ thống tự sinh mã"
              >
                <Input placeholder="Nhập mã phiếu" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="export_date"
                label="Ngày xuất"
                rules={[{ required: true, message: 'Vui lòng chọn ngày xuất' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày xuất"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="reason"
                label="Lý do xuất kho"
                rules={[{ required: true, message: 'Vui lòng chọn lý do xuất kho' }]}
              >
                <Select placeholder="Chọn lý do xuất kho">
                  <Option value="usage">Sử dụng</Option>
                  <Option value="damaged">Hư hỏng</Option>
                  <Option value="expired">Hết hạn</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea 
              rows={2}
              placeholder="Nhập ghi chú (nếu có)"
            />
          </Form.Item>

          <Divider>Danh sách nguyên liệu xuất kho</Divider>

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
                        width: '30%',
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
                              onChange={(value) => fetchBatches(value, record.name)}
                              loading={ingredientsLoading}
                            >
                              {ingredients.map(ingredient => (
                                <Option key={ingredient.id} value={ingredient.id}>
                                  {ingredient.name} ({ingredient.unit}) - Tồn: {ingredient.current_quantity || 0}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Lô hàng',
                        dataIndex: 'batch_id',
                        key: 'batch_id',
                        width: '30%',
                        render: (_, record) => {
                          const ingredientId = selectedIngredients[record.name];
                          const availableBatches = ingredientId 
                            ? getAvailableBatchesForIngredient(ingredientId) 
                            : [];
                          
                          return (
                            <Form.Item
                              name={[record.name, 'batch_id']}
                              rules={[{ required: true, message: 'Vui lòng chọn lô hàng' }]}
                              style={{ margin: 0 }}
                            >
                              <Select
                                placeholder="Chọn lô hàng"
                                disabled={!ingredientId || batchesLoading}
                                loading={batchesLoading}
                              >
                                {availableBatches.map(batch => (
                                  <Option key={batch.id} value={batch.id}>
                                    {batch.lot_number || 'Lô không mã'} - Còn: {batch.remaining_quantity} 
                                    {batch.expiry_date && ` (HSD: ${moment(batch.expiry_date).format('DD/MM/YYYY')})`}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          );
                        },
                      },
                      {
                        title: 'Số lượng',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: '20%',
                        render: (_, record) => {
                          const ingredientId = selectedIngredients[record.name];
                          const batchId = form.getFieldValue(['items', record.name, 'batch_id']);
                          const selectedBatches = ingredientId 
                            ? getAvailableBatchesForIngredient(ingredientId) 
                            : [];
                          const selectedBatch = selectedBatches.find(b => b.id === batchId);
                          const maxQuantity = selectedBatch?.remaining_quantity || 0;
                          
                          return (
                            <Form.Item
                              name={[record.name, 'quantity']}
                              rules={[
                                { required: true, message: 'Nhập số lượng' },
                                {
                                  validator: (_, value) => {
                                    if (value > maxQuantity) {
                                      return Promise.reject(`Số lượng không thể vượt quá ${maxQuantity}`);
                                    }
                                    return Promise.resolve();
                                  }
                                }
                              ]}
                              style={{ margin: 0 }}
                            >
                              <InputNumber
                                min={0.1}
                                max={maxQuantity}
                                step={0.1}
                                placeholder="Số lượng"
                                style={{ width: '100%' }}
                                disabled={!batchId}
                              />
                            </Form.Item>
                          );
                        },
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
                            onClick={() => {
                              // Also clear the selected ingredient from state
                              setSelectedIngredients(prev => {
                                const newState = { ...prev };
                                delete newState[record.name];
                                return newState;
                              });
                              remove(record.name);
                            }}
                          />
                        ),
                      },
                    ]}
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
                Tạo phiếu xuất
              </Button>
              <Button 
                onClick={() => router.push('/warehouse/exports')}
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

export default CreateExportPage;
