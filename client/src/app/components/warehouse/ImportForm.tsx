import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Space,
  Table,
  message,
  Card
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { importService } from '@/app/services/warehouse.service';
import { ingredientService } from '@/app/services/ingredient.service';
import { CreateImportDto } from '@/app/models/warehouse.model';
import { IngredientModel } from '@/app/models/ingredient.model';
import moment from 'moment';

const { Option } = Select;

interface ImportFormProps {
  onSuccess?: () => void;
  initialIngredientId?: string;
}

const ImportForm: React.FC<ImportFormProps> = ({
  onSuccess,
  initialIngredientId
}) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchIngredients();
  }, []);
  useEffect(() => {
    if (initialIngredientId && ingredients.length > 0) {
      const ingredient = ingredients.find(i => i.id === initialIngredientId);
      if (ingredient) {
        form.setFieldsValue({
          items: [
            {
              ingredient_id: initialIngredientId,
              quantity: 1,
              unit_price: 0
            }
          ]
        });
      }
    }
  }, [initialIngredientId, ingredients, form]);

  const fetchIngredients = async () => {
    try {
      const data = await ingredientService.getAll();
      setIngredients(data);
    } catch (err: any) {
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const importData: CreateImportDto = {
        import_date: values.import_date.toDate(),
        supplier_id: values.supplier_id,
        items: values.items.map((item: any) => ({
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          expiry_date: item.expiry_date?.toDate()
        }))
      };
      
      await importService.create(importData);
      message.success('Tạo phiếu nhập kho thành công');
      onSuccess?.();
      router.push('/warehouse/imports');

    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể tạo phiếu nhập'}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          import_date: moment(),
          items: initialIngredientId ? [{
            ingredient_id: initialIngredientId,
            quantity: 1
          }] : []
        }}
      >
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
              <Table
                dataSource={fields.map(field => ({
                  ...field,
                  ...form.getFieldValue('items')[field.name],
                  key: field.key,
                }))}
                pagination={false}
                columns={[
                  {
                    title: 'Nguyên liệu',
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
                    key: 'quantity', 
                    width: '20%',
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
                    key: 'unit_price',
                    width: '20%', 
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
                          formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                          parser={(value) => value ? parseFloat(value.replace(/[^\d.]/g, '')) : 0}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'Ngày hết hạn',
                    key: 'expiry_date',
                    width: '20%',
                    render: (_, record) => (
                      <Form.Item
                        name={[record.name, 'expiry_date']}
                        style={{ margin: 0 }}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày hết hạn"
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: '',
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
              />

              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                style={{ marginTop: 16, width: '100%' }}
              >
                Thêm nguyên liệu
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo phiếu nhập
            </Button>
            <Button onClick={() => router.push('/warehouse/imports')}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ImportForm;