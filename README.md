# 🍽️ Restaurant Management System

<div align="center">

![Restaurant Management](https://img.shields.io/badge/Restaurant-Management-brightgreen)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)

*Hệ thống quản lý nhà hàng toàn diện với công nghệ hiện đại*

</div>

---

## 📋 Tổng quan

**Restaurant Management System** là một hệ thống quản lý nhà hàng hoàn chỉnh, được xây dựng bằng **NestJS** (Backend) và **Next.js** (Frontend), hỗ trợ đầy đủ các tính năng vận hành nhà hàng hiện đại từ việc gọi món qua QR code đến quản lý kho, thanh toán và báo cáo.

## 🚀 Tính năng chính

### 🔐 **Xác thực & Phân quyền**
- Đăng nhập/đăng ký với JWT authentication
- Phân quyền theo vai trò: Admin, Staff, Kitchen, Waiter, Warehouse
- Bảo mật API với Bearer Token

### 📱 **Gọi món qua QR Code**
- **Tạo QR Code tự động** cho từng bàn ăn
- **Gọi món không tiếp xúc**: Khách quét QR → hiển thị menu → đặt món
- **Nhận diện bàn tự động**: Đơn hàng được liên kết với bàn ngay lập tức
- **Chatbot gợi ý món**: AI hỗ trợ gợi ý món ăn phù hợp

### 🍽️ **Quản lý thực đơn**
- Quản lý **danh mục món ăn** (Categories)
- Tạo và chỉnh sửa **món ăn** với hình ảnh, giá cả, mô tả
- **Quản lý nguyên liệu** cho từng món
- **Tạo menu** linh hoạt theo thời gian, sự kiện

### 📋 **Xử lý đơn hàng**
- **Workflow đầy đủ**: Đặt món → Bếp → Phục vụ → Thanh toán
- **Theo dõi trạng thái real-time** qua WebSocket
- **Quản lý bàn ăn**: Available, Occupied, Reserved, Cleaning
- **Ghi chú đặc biệt** cho từng món

### 👨‍🍳 **Module bếp (Kitchen)**
- **Nhận đơn hàng real-time** qua WebSocket
- **Xác nhận bắt đầu chế biến**
- **Cập nhật trạng thái món**: Đang làm, Hoàn thành
- **Lịch sử chế biến** và theo dõi thời gian

### 📦 **Quản lý kho nguyên liệu**
- **CRUD nguyên liệu** với phân loại, đơn vị tính
- **Quản lý nhà cung cấp** và thông tin liên hệ
- **Nhập/xuất kho** với theo dõi lô hàng (batches)
- **Kiểm kê tự động** và cảnh báo hết hàng
- **Truy xuất nguồn gốc** nguyên liệu

### 💳 **Thanh toán**
- **Tích hợp VNPay** cho thanh toán online
- **Thanh toán tiền mặt** tại quầy
- **In hóa đơn** tự động
- **Cập nhật trạng thái bàn** sau thanh toán

### 📊 **Báo cáo & Thống kê**
- **Báo cáo doanh thu** theo ngày, tháng, quý
- **Thống kê món bán chạy**
- **Báo cáo tồn kho** và nhập xuất
- **Phân tích hiệu suất** nhà hàng

### ⚡ **Tính năng nâng cao**
- **Real-time notifications** với WebSocket
- **File upload** cho hình ảnh món ăn, avatar
- **RESTful API** với Swagger documentation
- **Database migrations** tự động
- **Multi-language support** (Vietnamese/English)

## 🛠️ Công nghệ sử dụng

### Backend (NestJS)
- **Framework**: NestJS với TypeScript
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT với Passport
- **API Documentation**: Swagger/OpenAPI 3.0
- **File Upload**: Multer + AWS S3
- **Real-time**: WebSocket (Socket.io)
- **Payment**: VNPay Integration
- **QR Code**: qrcode library

### Frontend (Next.js)
- **Framework**: Next.js 15 với TypeScript
- **Styling**: TailwindCSS + Ant Design
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form + Yup
- **Charts**: Recharts

### DevOps & Tools
- **Container**: Docker + Docker Compose
- **Database**: PostgreSQL
- **File Storage**: AWS S3 / Local Storage
- **Process Manager**: PM2
- **Linting**: ESLint + Prettier

## 🏗️ Kiến trúc hệ thống

```
Restaurant Management System
├── 🔒 Authentication Layer (JWT)
├── 🌐 API Gateway (NestJS)
├── 📱 Web Client (Next.js)
├── 🗄️ Database (PostgreSQL)
├── 📡 WebSocket (Real-time)
├── 💾 File Storage (S3/Local)
└── 💳 Payment Gateway (VNPay)
```

### Phân tầng Backend
```
src/
├── 🔐 auth/              # Xác thực & JWT
├── 👥 users/             # Quản lý người dùng
├── 🏪 restaurants/       # Thông tin nhà hàng
├── 🥬 ingredients/       # Nguyên liệu
├── 🏢 suppliers/         # Nhà cung cấp
├── 📂 categories/        # Phân loại
├── 🍽️ dishes/           # Món ăn
├── 📋 menus/            # Thực đơn
├── 🪑 tables/           # Quản lý bàn
├── 📋 orders/           # Đơn hàng
├── 💳 payment/          # Thanh toán
├── 📦 inventory/        # Kho
├── 📊 reports/          # Báo cáo
├── 👤 customer/         # API khách hàng
├── 👨‍🍳 kitchen/          # Module bếp
└── 📁 file-upload/      # Upload files
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- **Node.js**: v18+ 
- **npm/yarn**: Latest version
- **PostgreSQL**: v14+
- **Docker** (optional): Latest version

### 🔧 Cài đặt Backend

1. **Clone repository**
   ```bash
   git clone https://github.com/hoanghust2003/Restaurant-Management.git
   cd Restaurant-Management/server
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Cấu hình môi trường**
   ```bash
   cp .env.example .env
   ```
   
   Chỉnh sửa file `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=restaurant_db

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h

   # App
   PORT=8000
   FRONTEND_URL=http://localhost:3000

   # VNPay (Payment)
   VNPAY_TMN_CODE=your_vnpay_tmn_code
   VNPAY_SECRET_KEY=your_vnpay_secret_key
   VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

   # AWS S3 (File Upload)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BUCKET=your_s3_bucket
   AWS_S3_REGION=your_s3_region
   ```

4. **Tạo database**
   ```bash
   createdb restaurant_db
   ```

5. **Chạy migrations** (nếu có)
   ```bash
   npm run typeorm:migration:run
   ```

6. **Khởi động development server**
   ```bash
   npm run start:dev
   ```

   Server sẽ chạy tại: `http://localhost:8000`
   
   Swagger Documentation: `http://localhost:8000/api/docs`

### 🎨 Cài đặt Frontend

1. **Chuyển đến thư mục client**
   ```bash
   cd ../client
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Chỉnh sửa file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=Restaurant Management
   ```

4. **Khởi động development server**
   ```bash
   npm run dev
   ```

   Client sẽ chạy tại: `http://localhost:3000`

### 🐳 Chạy với Docker

1. **Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Kiểm tra services**
   ```bash
   docker-compose ps
   ```

## 📱 Hướng dẫn sử dụng

### 👩‍💼 Dành cho Quản lý
1. **Đăng nhập** với tài khoản Admin
2. **Thiết lập nhà hàng**: Thông tin cơ bản, menu, bàn ăn
3. **Quản lý nhân viên**: Tạo tài khoản cho staff, kitchen, waiter
4. **Cấu hình menu**: Tạo categories, dishes, ingredients
5. **Tạo QR codes** cho các bàn ăn

### 👨‍🍳 Dành cho Bếp
1. **Đăng nhập** với tài khoản Kitchen
2. **Theo dõi đơn hàng** real-time
3. **Xác nhận bắt đầu chế biến**
4. **Cập nhật trạng thái món** khi hoàn thành

### 🧑‍🤝‍🧑 Dành cho Khách hàng
1. **Quét QR Code** trên bàn
2. **Xem menu** và chọn món
3. **Đặt hàng** với ghi chú đặc biệt
4. **Theo dõi trạng thái** đơn hàng
5. **Thanh toán** online hoặc tại quầy

## 🧪 Testing

### API Testing
- **Swagger UI**: `http://localhost:8000/api/docs`
- **Postman Collection**: Import từ `docs/openapi.json`

### QR Code Testing
1. Tạo QR code cho bàn test
2. Quét bằng điện thoại 
3. Đặt món thử nghiệm
4. Kiểm tra workflow từ kitchen đến payment

## 📚 Tài liệu

### API Documentation
- **Swagger UI**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **OpenAPI Spec**: [docs/openapi.json](./server/docs/openapi.json)
- **API Guide**: [server/docs/README.md](./server/docs/README.md)

### Development Docs  
- **Backend Setup**: [server/README.md](./server/README.md)
- **Frontend Setup**: [client/README.md](./client/README.md)
- **Database Schema**: [restaurant.sql](./restaurant.sql)
- **Project Context**: [server/project-context.md](./server/project-context.md)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Developer**: [hoanghust2003](https://github.com/hoanghust2003)
- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **Project Link**: [https://github.com/hoanghust2003/Restaurant-Management](https://github.com/hoanghust2003/Restaurant-Management)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

*Made with ❤️ by [hoanghust2003](https://github.com/hoanghust2003)*

</div>
