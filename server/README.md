# 🍽️ Restaurant Management Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)

*Backend API cho hệ thống quản lý nhà hàng được xây dựng bằng NestJS*

</div>

---

## 📋 Tổng quan

Backend API RESTful cho hệ thống quản lý nhà hàng, hỗ trợ đầy đủ các tính năng từ xác thực, quản lý menu, xử lý đơn hàng, thanh toán đến báo cáo. Được xây dựng với **NestJS framework**, **TypeORM**, và **PostgreSQL**.

## 🚀 Tính năng chính

### 🔐 Authentication & Authorization
- **JWT-based authentication** với Access Token
- **Role-based access control**: Admin, Staff, Kitchen, Waiter, Warehouse  
- **Password hashing** với bcrypt
- **Swagger authentication** integration

### 📊 Core Modules

#### 👥 Users Management
- CRUD người dùng với phân quyền
- Profile management và avatar upload
- Multi-role support

#### 🍽️ Menu & Dishes
- **Categories**: Phân loại món ăn
- **Dishes**: Quản lý món ăn với ingredients
- **Menus**: Tạo menu linh hoạt
- **Image upload** cho dishes

#### 🪑 Table & QR Management  
- **Table management** với trạng thái real-time
- **QR Code generation** tự động cho từng bàn
- **Table status tracking**: Available, Occupied, Reserved, Cleaning

#### 📋 Order Processing
- **Order workflow** hoàn chỉnh
- **Real-time status updates** qua WebSocket
- **Order items** với customization
- **Kitchen integration** cho chế biến

#### 📦 Inventory Management
- **Ingredients management** với categories
- **Suppliers management**
- **Batches tracking** cho truy xuất nguồn gốc
- **Import/Export operations**
- **Stock alerts** và reports

#### 💳 Payment Integration
- **VNPay integration** cho thanh toán online
- **Payment receipts** và records
- **Financial reports** và analytics

#### 📊 Reports & Analytics
- **Revenue reports** theo thời gian
- **Inventory reports** 
- **Popular dishes analytics**
- **Export data** ra file

#### 👨‍🍳 Kitchen Module
- **Real-time order notifications** qua WebSocket
- **Order status management**
- **Cooking workflow** tracking

#### 📁 File Upload
- **Multi-format support**: JPG, PNG, JPEG
- **AWS S3 integration** hoặc local storage
- **Image optimization** và resize

## 🛠️ Công nghệ sử dụng

### Core Framework
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **TypeORM** - Database ORM  
- **PostgreSQL** - Primary database

### Authentication & Security
- **Passport JWT** - Authentication strategy
- **bcrypt** - Password hashing
- **class-validator** - Request validation
- **CORS** - Cross-origin support

### API Documentation
- **Swagger/OpenAPI 3.0** - Auto-generated docs
- **DTOs** - Request/Response validation
- **API versioning** support

### File & Storage  
- **AWS S3** - Cloud file storage
- **Multer** - File upload handling
- **QR Code** - Table QR generation

### Real-time & Events
- **Socket.io** - WebSocket connections
- **Event Emitter** - Internal events
- **Scheduled tasks** - Cron jobs

## 🗂️ Cấu trúc thư mục

```bash
src/
├── 🔐 auth/                    # Authentication module
│   ├── auth.controller.ts      # Login, register endpoints
│   ├── auth.service.ts         # JWT logic
│   ├── dto/                    # Auth DTOs
│   └── strategies/             # Passport strategies
├── 👥 users/                   # User management
├── 🏪 restaurants/             # Restaurant info
├── 🥬 ingredients/             # Ingredients CRUD
├── 🏢 suppliers/               # Suppliers management  
├── 📂 categories/              # Food categories
├── 🍽️ dishes/                 # Dishes management
├── 📋 menus/                   # Menu composition
├── 🪑 tables/                  # Table & QR management
├── 📋 orders/                  # Order processing
├── 💳 payment/                 # Payment integration
├── 📦 inventory/               # Stock management
├── 🏠 batches/                 # Batch tracking
├── 📤 exports/                 # Inventory exports
├── 📥 imports/                 # Inventory imports  
├── 📊 reports/                 # Analytics
├── 👤 customer/                # Customer-facing APIs
├── 👨‍🍳 kitchen/                # Kitchen module
├── 📁 file-upload/             # File handling
├── 📡 events/                  # Event handling
├── 🗄️ entities/               # Database entities
├── 📊 enums/                   # Type definitions
├── 🔧 config/                  # App configuration
├── 🛠️ common/                  # Shared utilities
└── 📜 scripts/                 # Utility scripts
```

## 🚀 Cài đặt & Chạy

### 📋 Yêu cầu hệ thống
- Node.js v18+
- PostgreSQL v14+
- npm hoặc yarn

### ⚙️ Cài đặt

1. **Cài đặt dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Cấu hình môi trường**
   ```bash
   cp .env.example .env
   ```

3. **Cấu hình database trong `.env`**
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=restaurant_db

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h

   # App Settings
   PORT=8000
   FRONTEND_URL=http://localhost:3000

   # VNPay Payment (Sandbox)
   VNPAY_TMN_CODE=your_tmn_code
   VNPAY_SECRET_KEY=your_secret_key
   VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNPAY_RETURN_URL=http://localhost:3000/payment/return

   # AWS S3 (Optional)
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=restaurant-uploads
   AWS_S3_REGION=ap-southeast-1

   # Upload Settings (Local fallback)
   UPLOAD_DEST=./uploads
   MAX_FILE_SIZE=5242880  # 5MB
   ```

4. **Tạo database**
   ```bash
   createdb restaurant_db
   ```

5. **Chạy migrations** (nếu có)
   ```bash
   npm run typeorm:migration:run
   ```

### 🏃‍♂️ Development

```bash
# Development mode với hot reload
npm run start:dev

# Production build
npm run build

# Production mode  
npm run start:prod

# Debug mode
npm run start:debug
```

Server sẽ chạy tại: **http://localhost:8000**

## 📚 API Documentation

### 🌐 Swagger UI
Truy cập Swagger documentation tại: **http://localhost:8000/api/docs**

### 🔐 API Authentication
1. Đăng nhập qua `/api/auth/login`
2. Copy JWT token từ response
3. Click **"Authorize"** trong Swagger UI
4. Nhập: `Bearer <your-jwt-token>`
5. Test các protected endpoints

### 📄 Generate API Specs
```bash
# Tự động sinh OpenAPI specification
npm run docs:generate

# Tạo files:
# docs/openapi.json
# docs/openapi.yaml
```

### 🧪 API Testing

#### Với Swagger UI
- Truy cập http://localhost:8000/api/docs
- Authorize với JWT token
- Test trực tiếp trong browser

#### Với Postman
- Import file `docs/openapi.json`
- Set Bearer token trong Authorization
- Test collection

#### Với cURL
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get profile với token
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 API Endpoints Overview

### 🔐 Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

### 👥 Users  
- `GET /api/users` - Danh sách users
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### 🍽️ Dishes & Menu
- `GET /api/categories` - Danh sách categories
- `GET /api/dishes` - Danh sách món ăn
- `POST /api/dishes` - Tạo món mới
- `GET /api/menus` - Danh sách menu

### 🪑 Tables & QR
- `GET /api/tables` - Danh sách bàn
- `POST /api/tables` - Tạo bàn mới  
- `GET /api/tables/:id/qr` - QR code cho bàn

### 📋 Orders
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái

### 📦 Inventory
- `GET /api/ingredients` - Danh sách nguyên liệu
- `POST /api/ingredients` - Thêm nguyên liệu
- `GET /api/inventory/report` - Báo cáo tồn kho

### 💳 Payment
- `POST /api/payment/vnpay` - Tạo thanh toán VNPay
- `GET /api/payment/return` - Xử lý VNPay callback

### 📊 Reports
- `GET /api/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/popular-dishes` - Món bán chạy

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🔧 Scripts hữu ích

```bash
# Lint code
npm run lint

# Format code  
npm run format

# Generate OpenAPI docs
npm run docs:generate

# Database operations
npm run typeorm:migration:create -- -n MigrationName
npm run typeorm:migration:run
npm run typeorm:migration:revert
```

## ⚠️ Troubleshooting

### Database Connection Issues
```bash
# Kiểm tra PostgreSQL service
sudo service postgresql status

# Tạo database nếu chưa có
createdb restaurant_db

# Test connection
psql -h localhost -U postgres -d restaurant_db
```

### JWT Token Issues
- Đảm bảo `JWT_SECRET` đủ dài và phức tạp
- Check token expiry time trong JWT payload
- Verify Bearer format: `Bearer <token>`

### File Upload Issues  
- Check quyền write cho thư mục `uploads/`
- Verify AWS S3 credentials và bucket permissions
- Check file size limits (default 5MB)

### WebSocket Connection
- Verify CORS settings cho frontend domain
- Check firewall rules cho port 8000
- Enable Socket.io debug logs nếu cần

## 🤝 Development Guidelines

### Code Style
- Sử dụng TypeScript strict mode
- Follow NestJS best practices
- Use DTOs cho validation
- Implement proper error handling

### Database
- Sử dụng UUID cho primary keys
- Implement soft deletes khi cần
- Create indexes cho performance
- Backup database thường xuyên  

### Security
- Validate tất cả inputs
- Implement rate limiting
- Log security events
- Update dependencies định kỳ

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/hoanghust2003/Restaurant-Management/issues)
- **Docs**: [Full Documentation](../README.md)
- **API Reference**: [Swagger UI](http://localhost:8000/api/docs)

---

<div align="center">

*Made with ❤️ using NestJS & TypeScript*

</div>
