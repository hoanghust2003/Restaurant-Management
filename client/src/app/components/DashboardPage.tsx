'use client';

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  CogIcon,
  Square3Stack3DIcon,
  FireIcon,
  QueueListIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import LayoutProvider from '../layouts/LayoutProvider';
import { Button, Typography, Card, Row, Col, Space } from 'antd';
import { ShoppingCartOutlined, QrcodeOutlined, TableOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Dashboard card component
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const DashboardCard = ({ title, description, icon, href, color }: DashboardCardProps) => {
  return (
    <Link 
      href={href}
      className={`p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-white border-l-4 ${color} hover:translate-y-[-5px]`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
};

// Guest welcome section
const GuestDashboard = () => {
  return (
    <div className="p-6">
      <Card className="text-center mb-6">
        <Title level={2}>Chào mừng đến với nhà hàng</Title>
        <Text className="text-lg block mb-6">
          Hãy bắt đầu trải nghiệm dịch vụ đặt món trực tuyến của chúng tôi
        </Text>
        
        <Space>
          <Link href="/customer/menu">
            <Button type="primary" size="large" icon={<TableOutlined />}>
              Đặt món ngay
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="large">
              Đăng nhập
            </Button>
          </Link>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="text-center h-full">
            <QrcodeOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={4}>Quét mã QR</Title>
            <Text>Quét mã QR trên bàn để truy cập menu và đặt món dễ dàng</Text>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="text-center h-full">
            <TableOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={4}>Chọn bàn</Title>
            <Text>Xem và chọn bàn trống để bắt đầu đặt món</Text>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="text-center h-full">
            <ShoppingCartOutlined style={{ fontSize: '48px', color: '#f5222d', marginBottom: '16px' }} />
            <Title level={4}>Đặt món</Title>
            <Text>Dễ dàng chọn món, thêm ghi chú và theo dõi đơn hàng</Text>
          </Card>
        </Col>
      </Row>

      <Card className="mt-6">
        <Title level={3}>Hướng dẫn đặt món</Title>
        <ol className="list-decimal pl-6">
          <li className="mb-2">
            Quét mã QR trên bàn hoặc chọn "Đặt món ngay" để bắt đầu
          </li>
          <li className="mb-2">
            Chọn bàn bạn muốn ngồi từ danh sách bàn trống
          </li>
          <li className="mb-2">
            Duyệt menu và thêm món ăn vào giỏ hàng
          </li>
          <li className="mb-2">
            Xem lại giỏ hàng và xác nhận đặt món
          </li>
          <li className="mb-2">
            Theo dõi trạng thái đơn hàng của bạn
          </li>
        </ol>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show guest dashboard for non-authenticated users
  if (!isAuthenticated || !user) {
    return <GuestDashboard />;
  }

  // Show admin dashboard for authenticated users
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Table management - only for admin, waiter, and cashier */}
        {hasRole(['admin', 'staff']) && (
          <DashboardCard
            title="Quản lý bàn"
            description="Xem và quản lý trạng thái bàn"
            icon={<Square3Stack3DIcon className="w-6 h-6 text-blue-600" />}
            href="/tables/router"
            color="border-blue-500"
          />
        )}
        
        {/* Staff can manage orders */}
        {hasRole(['admin', 'staff']) && (
          <DashboardCard
            title="Đặt món"
            description="Tạo và quản lý đơn hàng"
            icon={<ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />}
            href="/orders"
            color="border-green-500"
          />
        )}

        {/* Admin and Manager only */}
        {hasRole(['admin']) && (
          <>
            <DashboardCard
              title="Quản lý nhân viên"
              description="Thêm, sửa, xóa nhân viên"
              icon={<UserGroupIcon className="w-6 h-6 text-purple-600" />}
              href="/users"
              color="border-purple-500"
            />
            
            <DashboardCard
              title="Báo cáo & thống kê"
              description="Xem báo cáo doanh thu và thống kê"
              icon={<ChartPieIcon className="w-6 h-6 text-yellow-600" />}
              href="/reports"
              color="border-yellow-500"
            />
            
            <DashboardCard
              title="Quản lý thực đơn"
              description="Thêm, sửa, xóa món ăn và thực đơn"
              icon={<QueueListIcon className="w-6 h-6 text-red-600" />}
              href="/menus"
              color="border-red-500"
            />
            
            <DashboardCard
              title="Cài đặt hệ thống"
              description="Thiết lập và cấu hình hệ thống"
              icon={<CogIcon className="w-6 h-6 text-gray-600" />}
              href="/settings"
              color="border-gray-500"
            />
          </>
        )}
        
        {/* Chef only */}
        {hasRole(['chef', 'admin', 'manager']) && (
          <DashboardCard
            title="Giao diện bếp"
            description="Quản lý và xử lý đơn hàng trong bếp"
            icon={<FireIcon className="w-6 h-6 text-orange-600" />}
            href="/kitchen"
            color="border-orange-500"
          />
        )}
        
        {/* Cashier staff only */}
        {hasRole(['staff', 'admin']) && (
          <DashboardCard
            title="Thanh toán"
            description="Xử lý thanh toán và hóa đơn"
            icon={<CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />}
            href="/cashier"
            color="border-emerald-500"
          />
        )}

        {/* Warehouse staff */}
        {hasRole(['warehouse', 'admin', 'manager']) && (
          <DashboardCard
            title="Quản lý kho"
            description="Quản lý nguyên liệu và tồn kho"
            icon={<ArchiveBoxIcon className="w-6 h-6 text-indigo-600" />}
            href="/inventory"
            color="border-indigo-500"
          />
        )}
      </div>

      <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Chào mừng, {user?.name}!</h3>
        <p className="text-gray-600 mb-2">
          Bạn đang đăng nhập với vai trò <span className="font-semibold">
            {user?.role === 'admin' && 'Quản trị viên'}
            {user?.role === 'staff' && 'Nhân viên phục vụ'}
            {user?.role === 'chef' && 'Đầu bếp'}
            {user?.role === 'warehouse' && 'Nhân viên kho'}
            {user?.role === 'customer' && 'Khách hàng'}
          </span>
        </p>
        <p className="text-gray-600">
          Sử dụng các liên kết ở trên để truy cập các tính năng mà bạn có quyền sử dụng.
        </p>
      </div>
    </div>
  );
}
