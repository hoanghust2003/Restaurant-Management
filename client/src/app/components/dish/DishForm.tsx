'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, InputNumber, Select, Upload, Switch } from 'antd';
import { SaveOutlined, UploadOutlined, PlusOutlined, MinusCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { dishService } from '@/app/services/dish.service';
import { categoryService } from '@/app/services/category.service';
import { ingredientService } from '@/app/services/ingredient.service';
import { DishModel, CreateDishDto, UpdateDishDto } from '@/app/models/dish.model';
import { CategoryModel } from '@/app/models/category.model';
import { IngredientModel } from '@/app/models/ingredient.model';
import { useRouter } from 'next/navigation';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { TextArea } = Input;
const { Option } = Select;

interface DishFormProps {
  dish?: DishModel;
  isEdit?: boolean;
  onSuccess?: (dish: DishModel) => void;
}

const DishForm: React.FC<DishFormProps> = ({ 
  dish, 
  isEdit = false,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(dish?.image_url);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, ingredientsData] = await Promise.all([
          categoryService.getAll(),
          ingredientService.getAll()
        ]);
        setCategories(categoriesData);
        setIngredients(ingredientsData);
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('Không thể tải danh sách danh mục và nguyên liệu');
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (isEdit && dish) {
      const formIngredients = dish.dishIngredients ? dish.dishIngredients.map(item => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity
      })) : [];
      
      form.setFieldsValue({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        preparation_time: dish.preparation_time,
        is_preparable: dish.is_preparable,
        available: dish.available,
        categoryId: dish.categoryId,
        ingredients: formIngredients
      });
      setImageUrl(dish.image_url);
    }
  }, [dish, form, isEdit]);

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ có thể tải lên file JPG/PNG!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      if (imageUrl) {
        values.image_url = imageUrl;
      }
      
      let result: DishModel;
      
      if (isEdit && dish) {
        result = await dishService.update(dish.id, values as UpdateDishDto);
        message.success('Cập nhật món ăn thành công');
      } else {
        result = await dishService.create(values as CreateDishDto);
        message.success('Tạo món ăn thành công');
        form.resetFields();
        setImageUrl(undefined);
      }
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push('/admin/dishes');
      }
    } catch (error) {
      console.error('Error submitting dish:', error);
      message.error(isEdit ? 'Không thể cập nhật món ăn' : 'Không thể tạo món ăn');
    } finally {
      setLoading(false);
    }
  };
  
  const uploadProps = {
    name: 'file',
    action: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/uploads/s3/dishes`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    beforeUpload: beforeUpload,
    showUploadList: false,
    onChange(info: any) {
      if (info.file.status === 'uploading') {
        setImageLoading(true);
        return;
      }
      
      if (info.file.status === 'done') {
        setImageLoading(false);
        const uploadedUrl = info.file.response.url;
        setImageUrl(uploadedUrl);
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        setImageLoading(false);
        message.error(`${info.file.name} upload failed.`);
      }
    },
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        {isEdit ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          is_preparable: true,
          available: true,
          ingredients: [{ ingredientId: '', quantity: 1 }]
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div>
            <Form.Item
              name="name"
              label="Tên món ăn"
              rules={[{ required: true, message: 'Vui lòng nhập tên món ăn' }]}
            >
              <Input placeholder="Nhập tên món ăn" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả món ăn' }]}
            >
              <TextArea rows={4} placeholder="Nhập mô tả món ăn" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập giá món ăn' }]}
            >
              <InputNumber
                min={0}
                step={1000}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsedValue = value ? Number(value.replace(/[^\d]/g, '')) : 0;
                  return parsedValue as any;
                }}
                placeholder="Nhập giá món ăn"
              />
            </Form.Item>

            <Form.Item
              name="preparation_time"
              label="Thời gian chuẩn bị (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian chuẩn bị' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập thời gian chuẩn bị" />
            </Form.Item>
              <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select 
                placeholder="Chọn danh mục"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                dropdownRender={menu => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button 
                        type="text" 
                        icon={<PlusOutlined />} 
                        onClick={() => router.push('/admin/categories/create')}
                        size="small"
                      >
                        Thêm danh mục mới
                      </Button>
                    </div>
                  </>
                )}
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Right column */}
          <div>
            <Form.Item label="Hình ảnh">
              <div className="flex flex-col items-center">                {imageUrl ? (
                  <div className="mb-4 relative">
                    <ImageWithFallback
                      src={imageUrl}
                      type="dishes"
                      alt={form.getFieldValue('name') || 'Món ăn'}
                      width={200}
                      height={200}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex justify-center">
                    <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Chưa có ảnh</span>
                    </div>
                  </div>
                )}

                <Upload {...uploadProps}>
                  <Button icon={imageLoading ? <LoadingOutlined /> : <UploadOutlined />}>
                    {imageLoading ? 'Đang tải...' : 'Tải ảnh lên'}
                  </Button>
                </Upload>
              </div>
            </Form.Item>

            <Form.Item
              name="is_preparable"
              label="Có thể chuẩn bị"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="available"
              label="Có sẵn để phục vụ"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <div className="border p-4 rounded-md mb-4">
              <h3 className="text-lg font-medium mb-4">Nguyên liệu</h3>

              <Form.List name="ingredients">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex items-start mb-2">
                        <Form.Item
                          {...restField}
                          name={[name, 'ingredientId']}
                          className="mb-0 mr-2 flex-1"
                          rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
                        >
                          <Select placeholder="Chọn nguyên liệu">
                            {ingredients.map(ingredient => (
                              <Option key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} ({ingredient.unit})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          className="mb-0 w-24"
                          rules={[{ required: true, message: 'Nhập số lượng' }]}
                        >
                          <InputNumber 
                            min={0.1} 
                            step={0.1} 
                            placeholder="Số lượng" 
                            style={{ width: '100%' }} 
                          />
                        </Form.Item>
                        
                        <Button 
                          type="text"
                          className="ml-2"
                          icon={<MinusCircleOutlined />} 
                          onClick={() => remove(name)} 
                        />
                      </div>
                    ))}
                    
                    <Form.Item className="mb-0 mt-2">
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        Thêm nguyên liệu
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            type="default" 
            onClick={() => router.push('/admin/dishes')}
            className="mr-2"
          >
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />} 
            loading={loading}
          >
            {isEdit ? 'Cập nhật' : 'Tạo món ăn'}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default DishForm;