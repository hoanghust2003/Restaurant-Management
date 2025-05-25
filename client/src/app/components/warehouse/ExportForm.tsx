import React, { useState, useEffect } from 'react';
import { Form, Button, Select, InputNumber, Card, Space, message } from 'antd';
import { useRouter } from 'next/navigation';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { ingredientService } from '@/app/services/ingredient.service';
import { exportService } from '@/app/services/warehouse.service';
import { IngredientModel } from '@/app/models/ingredient.model';
import { CreateExportDto } from '@/app/models/warehouse.model';
import moment from 'moment';

const { Option } = Select;

const ExportForm = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await ingredientService.getAll();
      // Chỉ lấy nguyên liệu còn tồn kho
      const availableIngredients = data.filter(ing => (ing.current_quantity || 0) > 0);
      setIngredients(availableIngredients);
    } catch (error) {
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Format data
      const exportData: CreateExportDto = {
        export_date: moment().toDate(), // Use current date
        reason: 'usage', // Default reason
        items: values.items.map((item: any) => ({
          ingredient_id: item.ingredient_id,
          quantity: item.quantity
        }))
      };

      // Submit
      await exportService.create(exportData);
      message.success('Tạo phiếu xuất thành công');
      router.push('/warehouse/exports');

    } catch (error) {
      message.error('Tạo phiếu xuất thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Tạo phiếu xuất kho">
      <Form
        form={form}
        layout="vertical" 
        onFinish={handleSubmit}
      >
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
              {fields.map((field, index) => (
                <Card key={field.key} type="inner" size="small" style={{ marginBottom: 16 }}>
                  <Space align="baseline">
                    <Form.Item
                      {...field}
                      label="Nguyên liệu"
                      name={[field.name, 'ingredient_id']}
                      rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
                    >
                      <Select style={{ width: 200 }}>
                        {ingredients.map(ing => (
                          <Option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit}) - Tồn: {ing.current_quantity}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label="Số lượng"
                      name={[field.name, 'quantity']}
                      rules={[
                        { required: true, message: 'Nhập số lượng' },
                        {
                          validator: async (_, value) => {
                            const ingredientId = form.getFieldValue(['items', field.name, 'ingredient_id']);
                            const ingredient = ingredients.find(i => i.id === ingredientId);
                            if (ingredient && value > ingredient.current_quantity!) {
                              return Promise.reject(new Error('Số lượng xuất không được vượt quá tồn kho'));
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <InputNumber min={0.1} step={0.1} />
                    </Form.Item>

                    {fields.length > 1 && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    )}
                  </Space>
                </Card>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm nguyên liệu
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo phiếu xuất
            </Button>
            <Button onClick={() => router.push('/warehouse/exports')}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ExportForm;