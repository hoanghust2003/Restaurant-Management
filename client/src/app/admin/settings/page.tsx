'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  InputNumber, 
  message, 
  Typography,
  Divider,
  Space,
  Row,
  Col,
  Upload,
  Spin
} from 'antd';
import { 
  SaveOutlined, 
  ShopOutlined, 
  PercentageOutlined, 
  PrinterOutlined, 
  GlobalOutlined, 
  LockOutlined, 
  NotificationOutlined, 
  PlusOutlined,
  DatabaseOutlined,
  BellOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useAuth } from '@/app/contexts/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Giả lập dữ liệu cấu hình hệ thống
const initialSettings = {
  general: {
    restaurantName: 'Việt Cuisine',
    address: '123 Đường Lê Lợi, Quận 1, TP Hồ Chí Minh',
    phone: '0987654321',
    email: 'contact@vietcuisine.com',
    website: 'www.vietcuisine.com',
    logo: 'logo.png',
    timezone: 'Asia/Ho_Chi_Minh',
    currency: 'VND',
    language: 'vi',
  },
  tax: {
    vat: 10,
    serviceCharge: 5,
    enableVat: true,
    enableServiceCharge: true,
    vatNumber: '0123456789',
    displayTaxOnReceipt: true,
  },
  printer: {
    defaultPrinter: 'Máy in chính',
    receiptPrinter: 'Máy in hóa đơn',
    kitchenPrinter: 'Máy in bếp',
    barPrinter: 'Máy in bar',
    enableAutoPrint: true,
    printReceiptAfterPayment: true,
    printKitchenOrderAfterConfirm: true,
    printFormat: 'A4',
    receiptFooter: 'Cảm ơn quý khách đã sử dụng dịch vụ! Hẹn gặp lại!',
    receiptHeader: 'Nhà hàng Việt Cuisine - Hóa đơn thanh toán',
  },
  notification: {
    enableEmailNotification: true,
    enableSmsNotification: false,
    lowStockThreshold: 10,
    notifyAdminOnNewOrder: true,
    notifyKitchenOnNewOrder: true,
    emailProvider: 'smtp',
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'notification@vietcuisine.com',
  },
  system: {
    maintenanceMode: false,
    debugMode: false,
    allowUserRegistration: true,
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '03:00',
    dataRetentionDays: 365,
    maxUploadSize: 10,
  }
};

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [generalForm] = Form.useForm();
  const [taxForm] = Form.useForm();
  const [printerForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [logoFile, setLogoFile] = useState<UploadFile | null>(null);
  const { hasRole } = useAuth();

  // Load settings on component mount
  useEffect(() => {
    // Simulate loading settings from API
    const loadSettings = async () => {
      setLoading(true);
      try {
        // In a real application, this would fetch from an API
        // For now, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Initialize form values with settings
        generalForm.setFieldsValue(settings.general);
        taxForm.setFieldsValue(settings.tax);
        printerForm.setFieldsValue(settings.printer);
        notificationForm.setFieldsValue(settings.notification);
        systemForm.setFieldsValue(settings.system);
        
        // Set logo file preview
        setLogoFile({
          uid: '-1',
          name: 'restaurant-logo.png',
          status: 'done',
          url: '/logo.png',
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        message.error('Không thể tải cài đặt hệ thống');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [generalForm, taxForm, printerForm, notificationForm, systemForm, settings]);

  // Handle settings save
  const handleSaveSettings = async (formData: any, settingType: string) => {
    setLoading(true);
    try {
      // In a real application, this would send to an API
      console.log(`Saving ${settingType} settings:`, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSettings((prev) => ({
        ...prev,
        [settingType]: {
          ...prev[settingType as keyof typeof prev],
          ...formData,
        }
      }));
      
      message.success(`Cài đặt ${getSettingTypeName(settingType)} đã được lưu thành công`);
    } catch (error) {
      console.error(`Failed to save ${settingType} settings:`, error);
      message.error(`Không thể lưu cài đặt ${getSettingTypeName(settingType)}`);
    } finally {
      setLoading(false);
    }
  };

  // Get settings type name in Vietnamese
  const getSettingTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      general: 'thông tin chung',
      tax: 'thuế và phí',
      printer: 'máy in',
      notification: 'thông báo',
      system: 'hệ thống',
    };
    return typeMap[type] || type;
  };

  // Handle logo upload
  const handleLogoUpload: UploadProps['onChange'] = ({ fileList }) => {
    if (fileList.length > 0) {
      setLogoFile(fileList[fileList.length - 1]);
      generalForm.setFieldsValue({ logo: fileList[fileList.length - 1].name });
    } else {
      setLogoFile(null);
      generalForm.setFieldsValue({ logo: undefined });
    }
  };

  // Logo upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  if (!hasRole(['admin'])) {
    return (
      <AdminLayout title="Cài đặt hệ thống">
        <Card>
          <div className="text-center py-10">
            <Text type="danger" strong>Bạn không có quyền truy cập vào trang này.</Text>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Cài đặt hệ thống">
      <div className="p-6">
        <Spin spinning={loading}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabPosition="left"
              className="settings-tabs"
            >
              <TabPane 
                tab={
                  <span>
                    <ShopOutlined /> Thông tin nhà hàng
                  </span>
                } 
                key="general"
              >
                <Title level={4}>Thông tin nhà hàng</Title>
                <Text type="secondary" className="block mb-6">
                  Cài đặt thông tin chung của nhà hàng hiển thị trên hóa đơn và trang web
                </Text>
                
                <Form
                  form={generalForm}
                  layout="vertical"
                  onFinish={(values) => handleSaveSettings(values, 'general')}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={16}>
                      <Form.Item
                        name="restaurantName"
                        label="Tên nhà hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên nhà hàng' }]}
                      >
                        <Input placeholder="Nhập tên nhà hàng" />
                      </Form.Item>
                      
                      <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                      >
                        <Input.TextArea placeholder="Nhập địa chỉ đầy đủ" rows={2} />
                      </Form.Item>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                          >
                            <Input placeholder="Số điện thoại" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                              { required: true, message: 'Vui lòng nhập email' },
                              { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                          >
                            <Input placeholder="Email liên hệ" />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Form.Item
                        name="website"
                        label="Website"
                      >
                        <Input placeholder="Website của nhà hàng" />
                      </Form.Item>
                      
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name="timezone"
                            label="Múi giờ"
                            rules={[{ required: true, message: 'Vui lòng chọn múi giờ' }]}
                          >
                            <Select placeholder="Chọn múi giờ">
                              <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</Option>
                              <Option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</Option>
                              <Option value="Asia/Singapore">Asia/Singapore (GMT+8)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name="currency"
                            label="Tiền tệ"
                            rules={[{ required: true, message: 'Vui lòng chọn tiền tệ' }]}
                          >
                            <Select placeholder="Chọn tiền tệ">
                              <Option value="VND">VND (đ)</Option>
                              <Option value="USD">USD ($)</Option>
                              <Option value="EUR">EUR (€)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            name="language"
                            label="Ngôn ngữ"
                            rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
                          >
                            <Select placeholder="Chọn ngôn ngữ">
                              <Option value="vi">Tiếng Việt</Option>
                              <Option value="en">English</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="logo"
                        label="Logo nhà hàng"
                      >
                        <div className="text-center">
                          <Upload
                            name="logo"
                            listType="picture-card"
                            className="logo-uploader"
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleLogoUpload}
                            maxCount={1}
                          >
                            {logoFile ? (
                              <img 
                                src={logoFile.url || '/logo.png'} 
                                alt="Logo" 
                                style={{ width: '100%' }} 
                              />
                            ) : uploadButton}
                          </Upload>
                          <Text type="secondary" className="block mt-2">
                            Kích thước đề xuất: 200x200 pixels
                          </Text>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item className="text-right">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Lưu cài đặt
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <PercentageOutlined /> Thuế & Phí
                  </span>
                } 
                key="tax"
              >
                <Title level={4}>Cài đặt thuế và phí dịch vụ</Title>
                <Text type="secondary" className="block mb-6">
                  Thiết lập thuế VAT và phí dịch vụ áp dụng cho hóa đơn
                </Text>
                
                <Form
                  form={taxForm}
                  layout="vertical"
                  onFinish={(values) => handleSaveSettings(values, 'tax')}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Thuế GTGT (VAT)"
                        help="% tỷ lệ thuế giá trị gia tăng áp dụng cho hóa đơn"
                      >
                        <Input.Group compact>
                          <Form.Item
                            name="vat"
                            noStyle
                            rules={[{ required: true, message: 'Vui lòng nhập % VAT' }]}
                          >
                            <InputNumber 
                              style={{ width: 'calc(100% - 60px)' }} 
                              min={0} 
                              max={100} 
                              precision={1}
                            />
                          </Form.Item>
                          <span style={{ width: 60, height: 32, lineHeight: '32px', textAlign: 'center', backgroundColor: '#f0f0f0', border: '1px solid #d9d9d9', borderLeft: 'none' }}>
                            %
                          </span>
                        </Input.Group>
                      </Form.Item>
                      
                      <Form.Item
                        name="enableVat"
                        valuePropName="checked"
                      >
                        <Switch /> <span className="ml-2">Kích hoạt thuế VAT</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="vatNumber"
                        label="Mã số thuế"
                      >
                        <Input placeholder="Nhập mã số thuế" />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        label="Phí dịch vụ"
                        help="% phí dịch vụ áp dụng cho hóa đơn"
                      >
                        <Input.Group compact>
                          <Form.Item
                            name="serviceCharge"
                            noStyle
                            rules={[{ required: true, message: 'Vui lòng nhập % phí dịch vụ' }]}
                          >
                            <InputNumber 
                              style={{ width: 'calc(100% - 60px)' }} 
                              min={0} 
                              max={100}
                              precision={1}
                            />
                          </Form.Item>
                          <span style={{ width: 60, height: 32, lineHeight: '32px', textAlign: 'center', backgroundColor: '#f0f0f0', border: '1px solid #d9d9d9', borderLeft: 'none' }}>
                            %
                          </span>
                        </Input.Group>
                      </Form.Item>
                      
                      <Form.Item
                        name="enableServiceCharge"
                        valuePropName="checked"
                      >
                        <Switch /> <span className="ml-2">Kích hoạt phí dịch vụ</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="displayTaxOnReceipt"
                        valuePropName="checked"
                        help="Hiển thị chi tiết thuế và phí trên hóa đơn"
                      >
                        <Switch /> <span className="ml-2">Hiển thị thuế/phí trên hóa đơn</span>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item className="text-right">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Lưu cài đặt
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <PrinterOutlined /> Cài đặt in ấn
                  </span>
                } 
                key="printer"
              >
                <Title level={4}>Cài đặt máy in</Title>
                <Text type="secondary" className="block mb-6">
                  Thiết lập máy in cho hóa đơn, nhà bếp và các khu vực khác
                </Text>
                
                <Form
                  form={printerForm}
                  layout="vertical"
                  onFinish={(values) => handleSaveSettings(values, 'printer')}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="defaultPrinter"
                        label="Máy in mặc định"
                        rules={[{ required: true, message: 'Vui lòng chọn máy in mặc định' }]}
                      >
                        <Select placeholder="Chọn máy in mặc định">
                          <Option value="Máy in chính">Máy in chính</Option>
                          <Option value="Máy in quầy">Máy in quầy</Option>
                          <Option value="Máy in hóa đơn">Máy in hóa đơn</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="receiptPrinter"
                        label="Máy in hóa đơn"
                      >
                        <Select placeholder="Chọn máy in hóa đơn">
                          <Option value="Máy in hóa đơn">Máy in hóa đơn</Option>
                          <Option value="Máy in chính">Máy in chính</Option>
                          <Option value="Máy in quầy">Máy in quầy</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="kitchenPrinter"
                        label="Máy in bếp"
                      >
                        <Select placeholder="Chọn máy in bếp">
                          <Option value="Máy in bếp">Máy in bếp</Option>
                          <Option value="Máy in chính">Máy in chính</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="barPrinter"
                        label="Máy in quầy bar"
                      >
                        <Select placeholder="Chọn máy in quầy bar">
                          <Option value="Máy in bar">Máy in bar</Option>
                          <Option value="Máy in chính">Máy in chính</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        name="printFormat"
                        label="Khổ giấy in"
                        rules={[{ required: true, message: 'Vui lòng chọn khổ giấy in' }]}
                      >
                        <Select placeholder="Chọn khổ giấy in">
                          <Option value="80mm">Hóa đơn 80mm</Option>
                          <Option value="58mm">Hóa đơn 58mm</Option>
                          <Option value="A4">Giấy A4</Option>
                          <Option value="A5">Giấy A5</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="receiptHeader"
                        label="Tiêu đề hóa đơn"
                      >
                        <Input.TextArea placeholder="Nội dung tiêu đề trên hóa đơn" rows={2} />
                      </Form.Item>
                      
                      <Form.Item
                        name="receiptFooter"
                        label="Chân trang hóa đơn"
                      >
                        <Input.TextArea placeholder="Nội dung chân trang trên hóa đơn" rows={2} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="enableAutoPrint"
                        valuePropName="checked"
                      >
                        <Switch /> <span className="ml-2">Tự động in</span>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="printReceiptAfterPayment"
                        valuePropName="checked"
                      >
                        <Switch /> <span className="ml-2">Tự động in hóa đơn sau thanh toán</span>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="printKitchenOrderAfterConfirm"
                        valuePropName="checked"
                      >
                        <Switch /> <span className="ml-2">Tự động in đơn cho bếp</span>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item className="text-right">
                    <Space>
                      <Button onClick={() => message.info('Đang thử kết nối máy in...')}>
                        Thử kết nối máy in
                      </Button>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                        Lưu cài đặt
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <BellOutlined /> Thông báo
                  </span>
                }
                key="notification"
              >
                <Title level={4}>Cài đặt thông báo</Title>
                <Text type="secondary" className="block mb-6">
                  Thiết lập thông báo qua email và SMS
                </Text>
                
                <Form
                  form={notificationForm}
                  layout="vertical"
                  onFinish={(values) => handleSaveSettings(values, 'notification')}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="enableEmailNotification"
                        valuePropName="checked"
                        label="Thông báo qua Email"
                      >
                        <Switch /> <span className="ml-2">Kích hoạt thông báo qua email</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="emailProvider"
                        label="Nhà cung cấp Email"
                        rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp email' }]}
                      >
                        <Select placeholder="Chọn nhà cung cấp email">
                          <Option value="smtp">SMTP Server</Option>
                          <Option value="gmail">Gmail</Option>
                          <Option value="mailgun">Mailgun</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="smtpServer"
                        label="SMTP Server"
                      >
                        <Input placeholder="Địa chỉ máy chủ SMTP" />
                      </Form.Item>
                      
                      <Form.Item
                        name="smtpPort"
                        label="SMTP Port"
                      >
                        <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                      </Form.Item>
                      
                      <Form.Item
                        name="smtpUsername"
                        label="Email người gửi"
                      >
                        <Input placeholder="Email sử dụng để gửi thông báo" />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        name="enableSmsNotification"
                        valuePropName="checked"
                        label="Thông báo qua SMS"
                      >
                        <Switch /> <span className="ml-2">Kích hoạt thông báo qua SMS</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="lowStockThreshold"
                        label="Ngưỡng thông báo hết nguyên liệu"
                        rules={[{ required: true, message: 'Vui lòng nhập ngưỡng cảnh báo' }]}
                      >
                        <InputNumber
                          min={1}
                          style={{ width: '100%' }}
                          placeholder="Khi số lượng nguyên liệu dưới ngưỡng này sẽ gửi thông báo"
                        />
                      </Form.Item>
                      
                      <Form.Item
                        name="notifyAdminOnNewOrder"
                        valuePropName="checked"
                      >
                        <Switch /> <span className="ml-2">Thông báo Admin khi có đơn hàng mới</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="notifyKitchenOnNewOrder"
                        valuePropName="checked"
                      >
                        <Switch /> <span className="ml-2">Thông báo Bếp khi có đơn hàng mới</span>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item className="text-right">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Lưu cài đặt
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <DatabaseOutlined /> Hệ thống
                  </span>
                }
                key="system"
              >
                <Title level={4}>Cài đặt hệ thống</Title>
                <Text type="secondary" className="block mb-6">
                  Cài đặt nâng cao cho hệ thống
                </Text>
                
                <Form
                  form={systemForm}
                  layout="vertical"
                  onFinish={(values) => handleSaveSettings(values, 'system')}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="maintenanceMode"
                        valuePropName="checked"
                        label="Chế độ bảo trì"
                      >
                        <Switch /> <span className="ml-2">Kích hoạt chế độ bảo trì</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="debugMode"
                        valuePropName="checked"
                        label="Chế độ gỡ lỗi"
                      >
                        <Switch /> <span className="ml-2">Kích hoạt chế độ gỡ lỗi</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="allowUserRegistration"
                        valuePropName="checked"
                        label="Đăng ký tài khoản"
                      >
                        <Switch /> <span className="ml-2">Cho phép đăng ký tài khoản mới</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="maxUploadSize"
                        label="Kích thước tệp tải lên tối đa (MB)"
                      >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        name="autoBackup"
                        valuePropName="checked"
                        label="Sao lưu tự động"
                      >
                        <Switch /> <span className="ml-2">Kích hoạt sao lưu tự động</span>
                      </Form.Item>
                      
                      <Form.Item
                        name="backupFrequency"
                        label="Tần suất sao lưu"
                      >
                        <Select placeholder="Chọn tần suất sao lưu">
                          <Option value="daily">Hàng ngày</Option>
                          <Option value="weekly">Hàng tuần</Option>
                          <Option value="monthly">Hàng tháng</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="backupTime"
                        label="Thời gian sao lưu"
                      >
                        <Input placeholder="HH:MM" />
                      </Form.Item>
                      
                      <Form.Item
                        name="dataRetentionDays"
                        label="Thời gian lưu trữ dữ liệu (ngày)"
                      >
                        <InputNumber min={30} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Space>
                    <Button danger onClick={() => message.warning('Tính năng này sẽ xóa tất cả dữ liệu tạm thời, hãy cẩn thận!')}>
                      Xóa bộ nhớ đệm
                    </Button>
                    <Button onClick={() => message.info('Đang tiến hành sao lưu dữ liệu...')}>
                      Sao lưu thủ công
                    </Button>
                    <Button type="primary" danger onClick={() => message.warning('Chức năng khôi phục dữ liệu có thể gây mất dữ liệu hiện tại!')}>
                      Khôi phục dữ liệu
                    </Button>
                  </Space>
                  
                  <Form.Item className="text-right" style={{ marginTop: '16px' }}>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Lưu cài đặt
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </Spin>
        
        <style jsx global>{`
          .settings-tabs .ant-tabs-tab {
            padding: 12px 24px;
            margin: 0 0 8px 0;
          }
          .settings-tabs .ant-tabs-tab-active {
            background-color: #e6f7ff;
            border-radius: 4px;
          }
          .logo-uploader .ant-upload-select-picture-card {
            width: 200px;
            height: 200px;
            margin: 0 auto;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;
