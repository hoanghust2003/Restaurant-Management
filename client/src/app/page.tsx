import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Restaurant Management System</h1>
          <div>
            <Link 
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Hệ Thống Quản Lý Nhà Hàng</h1>
          <p className="text-xl mb-8">Giải pháp toàn diện để vận hành nhà hàng hiệu quả</p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/demo/customer" 
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Menu (Khách hàng)
            </Link>
            <Link 
              href="/auth/login" 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Đăng nhập hệ thống
            </Link>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Phân hệ chính</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Customer UI */}
            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Gọi món tại bàn</h3>
              <p className="mb-4 text-gray-600">Khách hàng quét QR code, xem thực đơn và đặt món một cách dễ dàng.</p>
              <Link href="/demo/customer" className="text-blue-600 hover:underline">Dùng thử &rarr;</Link>
            </div>
            
            {/* Chef UI */}
            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Quản lý Bếp</h3>
              <p className="mb-4 text-gray-600">Nhận đơn hàng và cập nhật trạng thái món ăn theo thời gian thực.</p>
              <Link href="/demo/kitchen" className="text-blue-600 hover:underline">Dùng thử &rarr;</Link>
            </div>
            
            {/* Inventory */}
            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Quản lý Kho</h3>
              <p className="mb-4 text-gray-600">Theo dõi tồn kho, cảnh báo nguyên liệu sắp hết và quản lý hạn sử dụng.</p>
              <Link href="/demo/inventory" className="text-blue-600 hover:underline">Dùng thử &rarr;</Link>
            </div>
            
            {/* Reception */}
            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Tiếp tân</h3>
              <p className="mb-4 text-gray-600">Quản lý trạng thái bàn và điều phối giữa khách hàng và bếp.</p>
              <Link href="/demo/reception" className="text-blue-600 hover:underline">Dùng thử &rarr;</Link>
            </div>
            
            {/* Admin */}
            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Quản lý Nhà hàng</h3>
              <p className="mb-4 text-gray-600">Xem báo cáo, thống kê và quản lý nhân viên.</p>
              <Link href="/demo/admin" className="text-blue-600 hover:underline">Dùng thử &rarr;</Link>
            </div>
            
            {/* Analytics */}
            <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Thống kê & Phân tích</h3>
              <p className="mb-4 text-gray-600">Xem báo cáo doanh thu, chi phí và hiệu suất của nhà hàng.</p>
              <Link href="/demo/analytics" className="text-blue-600 hover:underline">Dùng thử &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto text-center">
          <p>© 2025 Restaurant Management System</p>
          <p className="mt-2 text-gray-400">Đồ án tốt nghiệp</p>
        </div>
      </footer>
    </div>
  );
}
