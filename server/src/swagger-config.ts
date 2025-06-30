import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Restaurant Management API')
  .setDescription(`
    # Restaurant Management System API Documentation
    
    Hệ thống quản lý nhà hàng toàn diện với các tính năng đầy đủ cho việc vận hành nhà hàng hiện đại.
    
    ## Tính năng chính
    - **🔐 Xác thực & Phân quyền**: JWT-based authentication với phân quyền theo vai trò
    - **👥 Quản lý người dùng**: Admin, Staff, Kitchen, Waiter, Warehouse roles
    - **🍽️ Quản lý thực đơn**: Categories, dishes, menus với theo dõi nguyên liệu
    - **📋 Quản lý đơn hàng**: Đặt bàn qua QR, workflow bếp, theo dõi trạng thái
    - **📦 Quản lý kho**: Theo dõi nguyên liệu, quản lý lô hàng, nhập/xuất kho
    - **💳 Thanh toán**: Tích hợp VNPay cho thanh toán online
    - **🪑 Quản lý bàn**: Tạo QR code, theo dõi trạng thái bàn
    - **📊 Báo cáo**: Báo cáo tài chính, báo cáo kho
    
    ## Xác thực API
    Hầu hết các endpoint yêu cầu xác thực qua JWT token. Thêm token vào header Authorization:
    \`Authorization: Bearer <your-jwt-token>\`
    
    ## Phân quyền người dùng
    - **ADMIN**: Toàn quyền hệ thống
    - **STAFF**: Các thao tác nhân viên phục vụ
    - **KITCHEN**: Các thao tác đặc thù bếp
    - **WAITER**: Quản lý bàn và đơn hàng
    - **WAREHOUSE**: Quản lý kho
    
    ## HTTP Status Codes
    API trả về các mã trạng thái HTTP chuẩn:
    - **200**: Thành công
    - **201**: Tạo mới thành công
    - **400**: Yêu cầu không hợp lệ
    - **401**: Chưa xác thực
    - **403**: Không có quyền truy cập
    - **404**: Không tìm thấy
    - **500**: Lỗi server
    
    ## Cấu trúc Response
    Tất cả response đều có cấu trúc nhất quán:
    \`\`\`json
    {
      "data": {}, // Dữ liệu chính
      "message": "Success message",
      "statusCode": 200
    }
    \`\`\`
    
    ## Upload File
    Các endpoint upload file hỗ trợ:
    - **Định dạng**: JPG, PNG, JPEG
    - **Kích thước tối đa**: 5MB
    - **Loại file**: Avatar, dish images, ingredient images, menu images
    
    ## Pagination
    Các endpoint list hỗ trợ pagination với query parameters:
    - \`page\`: Số trang (default: 1)
    - \`limit\`: Số item per page (default: 10)
    - \`search\`: Tìm kiếm (optional)
    - \`sort\`: Sắp xếp (optional)
  `)
  .setVersion('1.0.0')
  .setContact(
    'Restaurant Management Team',
    'https://restaurant-management.com',
    'support@restaurant-management.com'
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:8000', 'Development Server')
  .addServer('https://api.findnear.vn', 'Production Server')
  .addTag('app', '🏠 Application health and info')
  .addTag('auth', '🔐 Authentication and authorization')
  .addTag('users', '👥 User management and profiles')
  .addTag('categories', '📂 Food categories management')
  .addTag('ingredients', '🥬 Ingredient inventory management')
  .addTag('dishes', '🍽️ Dish and recipe management')
  .addTag('menus', '📋 Menu composition and management')
  .addTag('tables', '🪑 Table management and QR codes')
  .addTag('orders', '📋 Order processing and tracking')
  .addTag('payment', '💳 Payment processing and receipts')
  .addTag('inventory', '📦 Inventory tracking and reports')
  .addTag('suppliers', '🏢 Supplier management')
  .addTag('batches', '📦 Batch tracking and management')
  .addTag('exports', '📤 Inventory export operations')
  .addTag('imports', '📥 Inventory import operations')
  .addTag('uploads', '📁 File upload and asset management')
  .addTag('reports', '📊 Analytics and reporting')
  .addTag('customer', '👤 Customer-facing endpoints')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Nhập JWT token (không cần prefix Bearer)',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();
