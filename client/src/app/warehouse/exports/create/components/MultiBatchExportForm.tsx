import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Select,
  InputNumber,
  Card,
  Space,
  message,
  Typography,
  Tag,
  Alert,
  Divider,
  Row,
  Col,
  DatePicker,
  Input,
  Collapse,
  Table,
} from 'antd';
import { useRouter } from 'next/navigation';
import { 
  MinusCircleOutlined, 
  PlusOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ingredientService } from '@/app/services/ingredient.service';
import { exportService, batchService } from '@/app/services/warehouse.service';
import { IngredientModel } from '@/app/models/ingredient.model';
import { BatchModel, CreateExportDto } from '@/app/models/warehouse.model';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

interface MultiBatchExportFormProps {
  initialIngredientId?: string;
}

interface IngredientExportItem {
  ingredient_id: string;
  ingredient?: IngredientModel;
  batches: {
    [batchId: string]: {
      batch: BatchModel;
      quantity: number;
    };
  };
  totalQuantity: number;
}

const MultiBatchExportForm: React.FC<MultiBatchExportFormProps> = ({
  initialIngredientId
}) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [availableBatches, setAvailableBatches] = useState<{ [ingredientId: string]: BatchModel[] }>({});
  const [exportItems, setExportItems] = useState<IngredientExportItem[]>([]);
  const [loading, setLoading] = useState({
    ingredients: true,
    batches: false,
    submitting: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (initialIngredientId && ingredients.length > 0) {
      addIngredientToExport(initialIngredientId);
    }
  }, [initialIngredientId, ingredients]);

  const fetchIngredients = async () => {
    try {
      setLoading(prev => ({ ...prev, ingredients: true }));
      const data = await ingredientService.getAll();
      
      // Filter ingredients that have available stock
      const availableIngredients = data.filter(ing => (ing.current_quantity || 0) > 0);
      setIngredients(availableIngredients);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching ingredients:', err);
      setError('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(prev => ({ ...prev, ingredients: false }));
    }
  };

  const fetchBatches = async (ingredientId: string) => {
    try {
      setLoading(prev => ({ ...prev, batches: true }));
      
      const data = await batchService.getAll({ 
        ingredient_id: ingredientId,
        status: 'available'
      });
      
      // Only keep batches with remaining quantity > 0
      const validBatches = data.filter(batch => batch.remaining_quantity > 0);
      
      setAvailableBatches(prev => ({
        ...prev,
        [ingredientId]: validBatches
      }));
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching batches:', err);
      message.error('Không thể tải danh sách lô hàng');
    } finally {
      setLoading(prev => ({ ...prev, batches: false }));
    }
  };

  const addIngredientToExport = async (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    // Check if ingredient is already added
    if (exportItems.find(item => item.ingredient_id === ingredientId)) {
      message.warning('Nguyên liệu này đã được thêm vào danh sách xuất');
      return;
    }

    // Fetch batches for this ingredient
    await fetchBatches(ingredientId);

    const newItem: IngredientExportItem = {
      ingredient_id: ingredientId,
      ingredient,
      batches: {},
      totalQuantity: 0,
    };

    setExportItems(prev => [...prev, newItem]);
  };

  const removeIngredientFromExport = (ingredientId: string) => {
    setExportItems(prev => prev.filter(item => item.ingredient_id !== ingredientId));
  };

  const updateBatchQuantity = (ingredientId: string, batchId: string, quantity: number) => {
    setExportItems(prev => 
      prev.map(item => {
        if (item.ingredient_id !== ingredientId) return item;

        const batch = availableBatches[ingredientId]?.find(b => b.id === batchId);
        if (!batch) return item;

        const newBatches = { ...item.batches };
        
        if (quantity <= 0) {
          delete newBatches[batchId];
        } else {
          newBatches[batchId] = { batch, quantity };
        }

        const totalQuantity = Object.values(newBatches).reduce(
          (sum, { quantity }) => sum + quantity, 
          0
        );

        return {
          ...item,
          batches: newBatches,
          totalQuantity,
        };
      })
    );
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));

      // Validate that we have items to export
      if (exportItems.length === 0) {
        message.error('Vui lòng thêm ít nhất một nguyên liệu để xuất');
        return;
      }

      // Validate that each ingredient has at least one batch with quantity > 0
      const invalidItems = exportItems.filter(item => item.totalQuantity <= 0);
      if (invalidItems.length > 0) {
        message.error('Vui lòng nhập số lượng xuất cho tất cả nguyên liệu');
        return;
      }

      // Validation helper functions
      const validateBatchQuantities = (): string[] => {
        const errors: string[] = [];
        
        exportItems.forEach((item: IngredientExportItem) => {
          const ingredient = item.ingredient;
          if (!ingredient) return;
          
          // Check if total quantity exceeds available stock
          const availableStock = ingredient.current_quantity || 0;
          if (item.totalQuantity > availableStock) {
            errors.push(`${ingredient.name}: Số lượng xuất (${item.totalQuantity}) vượt quá tồn kho (${availableStock})`);
          }
          
          // Check individual batch quantities
          Object.values(item.batches).forEach((batchData: { batch: BatchModel; quantity: number }) => {
            const { batch, quantity } = batchData;
            if (quantity > batch.remaining_quantity) {
              errors.push(`${ingredient.name} - Lô ${batch.lot_number || 'N/A'}: Số lượng xuất (${quantity}) vượt quá tồn kho lô (${batch.remaining_quantity})`);
            }
          });
        });
        
        return errors;
      };

      const errors = validateBatchQuantities();
      if (errors.length > 0) {
        message.error(
          errors.map((error, index) => (
            `${index + 1}. ${error}`
          )).join('\n')
        );
        return;
      }

      // Convert to API format
      const exportData: CreateExportDto = {
        reference_number: values.reference_number,
        export_date: values.export_date.toDate(),
        reason: values.reason,
        notes: values.notes,
        items: exportItems.flatMap((item: IngredientExportItem) => 
          Object.values(item.batches).map((batchData) => ({
            batchId: (batchData as { batch: BatchModel; quantity: number }).batch.id,
            ingredientId: item.ingredient_id,
            quantity: (batchData as { batch: BatchModel; quantity: number }).quantity,
          }))
        ),
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
      setLoading((prev: typeof loading) => ({ ...prev, submitting: false }));
    }
  };

  const getTotalExportQuantity = () => {
    return exportItems.reduce((sum: number, item: IngredientExportItem) => sum + item.totalQuantity, 0);
  };

  const getBatchStatusColor = (batch: BatchModel) => {
    if (!batch.expiry_date) return 'blue';
    
    const daysToExpiry = moment(batch.expiry_date).diff(moment(), 'days');
    if (daysToExpiry <= 3) return 'red';
    if (daysToExpiry <= 7) return 'orange';
    if (daysToExpiry <= 30) return 'yellow';
    return 'green';
  };

  if (loading.ingredients) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Đang tải dữ liệu...</div>
      </div>
    );
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
            Nhập thông tin để tạo phiếu xuất kho mới. Có thể xuất từ nhiều lô khác nhau cho cùng một nguyên liệu.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            export_date: moment(),
            reason: 'usage',
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

          {/* Add ingredient section */}
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
            <Row gutter={16} align="middle">
              <Col flex={1}>
                <Select
                  placeholder="Chọn nguyên liệu để thêm vào danh sách xuất"
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input: string, option: any) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={addIngredientToExport}
                  value={undefined}
                >
                  {ingredients
                    .filter(ingredient => !exportItems.find(item => item.ingredient_id === ingredient.id))
                    .map(ingredient => (
                      <Option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.unit}) - Tồn: {ingredient.current_quantity || 0}
                      </Option>
                    ))
                  }
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Export items */}
          {exportItems.length === 0 ? (
            <Alert
              message="Chưa có nguyên liệu nào được chọn"
              description="Vui lòng chọn nguyên liệu từ danh sách phía trên để bắt đầu tạo phiếu xuất."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Collapse 
              defaultActiveKey={exportItems.map((_, index) => index.toString())}
              style={{ marginBottom: 16 }}
            >
              {exportItems.map((item, index) => (
                <Panel
                  key={index}
                  header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{item.ingredient?.name}</strong> ({item.ingredient?.unit})
                        {item.totalQuantity > 0 && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            Xuất: {item.totalQuantity.toLocaleString()}
                          </Tag>
                        )}
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeIngredientFromExport(item.ingredient_id);
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  }
                >
                  <div>
                    <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                      Chọn số lượng cần xuất từ mỗi lô. Tổng có sẵn: {item.ingredient?.current_quantity || 0} {item.ingredient?.unit}
                    </Text>

                    {loading.batches ? (
                      <div className="text-center py-4">Đang tải thông tin lô hàng...</div>
                    ) : (
                      <div className="space-y-3">
                        {(availableBatches[item.ingredient_id] || []).map(batch => {
                          const currentQuantity = item.batches[batch.id]?.quantity || 0;
                          
                          return (
                            <Card key={batch.id} size="small" style={{ border: '1px solid #d9d9d9' }}>
                              <Row gutter={16} align="middle">
                                <Col xs={24} md={8}>
                                  <div>
                                    <div style={{ fontWeight: 'bold' }}>
                                      Lô: {batch.lot_number || 'Không có mã'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                      Đơn giá: {batch.unit_price?.toLocaleString()} VND/{item.ingredient?.unit}
                                    </div>
                                  </div>
                                </Col>
                                
                                <Col xs={24} md={6}>
                                  <div>
                                    <Tag color={getBatchStatusColor(batch)}>
                                      Còn: {batch.remaining_quantity}
                                    </Tag>
                                    {batch.expiry_date && (
                                      <div style={{ 
                                        fontSize: '12px', 
                                        color: moment(batch.expiry_date).diff(moment(), 'days') <= 7 ? '#ff4d4f' : '#52c41a' 
                                      }}>
                                        HSD: {moment(batch.expiry_date).format('DD/MM/YYYY')}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                                
                                <Col xs={24} md={10}>
                                  <InputNumber
                                    value={currentQuantity}
                                    onChange={(value) => updateBatchQuantity(item.ingredient_id, batch.id, value || 0)}
                                    placeholder="Số lượng xuất"
                                    min={0}
                                    max={batch.remaining_quantity}
                                    step={0.1}
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, ''))}
                                  />
                                </Col>
                              </Row>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    {item.totalQuantity > 0 && (
                      <Alert
                        message={`Tổng số lượng xuất: ${item.totalQuantity.toLocaleString()} ${item.ingredient?.unit}`}
                        type="success"
                        showIcon
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}

          {/* Summary */}
          {exportItems.length > 0 && getTotalExportQuantity() > 0 && (
            <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Tổng số loại nguyên liệu: {exportItems.length}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Tổng số lô xuất: {exportItems.reduce((sum, item) => sum + Object.keys(item.batches).length, 0)}</Text>
                </Col>
              </Row>
            </Card>
          )}

          <Divider />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading.submitting}
                icon={<SaveOutlined />}
                disabled={getTotalExportQuantity() === 0}
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

export default MultiBatchExportForm;
