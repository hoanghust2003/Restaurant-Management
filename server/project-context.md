# Project Context: Restaurant Management System

## 1. Tổng quan

Hệ thống quản lý nhà hàng, hỗ trợ các tính năng:

- **Gọi món**: Quét QR để hiện menu, chọn món, chatbot gợi ý món.
- **Đặt bàn**: Quản lý trạng thái bàn (available, reserved, occupied, cleaning).
- **Xử lý đơn hàng**: Thanh toán đơn hàng, cập nhật trạng thái bàn thành available khi thanh toán xong.
- **Bếp (Chef)**: Nhận đơn hàng qua WebSocket, xác nhận bắt đầu làm món, cập nhật trạng thái món.
- **Quản lý kho nguyên liệu**: Quản lý nguyên liệu, nhập - xuất nguyên liệu, kiểm kê hàng tồn kho.
- **Báo cáo thống kê**: Thống kê doanh thu, món bán chạy, truy xuất nguồn gốc nguyên liệu.
- **Quản lý tài khoản nhân viên**: CRUD tài khoản nhân viên (Admin).
- **Đăng nhập, đăng xuất**: Quản lý đăng nhập, đăng xuất.

## 2. Công nghệ

- **Backend**: NestJS, TypeORM, PostgreSQL.
- **Authentication**: JWT (hiện tại chỉ sử dụng Access Token, sẽ bổ sung Refresh Token sau).
- **Password**: bcrypt để hash password.
- **WebSocket**: Dùng cho module bếp (triển khai sau).
- **ORM**: TypeORM, sử dụng UUID làm primary key.

## 3. Kiến trúc thư mục

```bash
src/
|-- auth/               # Module Authentication
|-- users/              # Module Users
|-- restaurants/        # Module Restaurants
|-- ingredients/        # Module Ingredients
|-- suppliers/          # Module Suppliers
|-- categories/         # Module Categories
|-- dishes/             # Module Dishes
|-- dish-ingredients/   # Module Dish Ingredients
|-- menus/              # Module Menus
|-- menu-dishes/        # Module Menu Dishes
|-- tables/             # Module Tables
|-- orders/             # Module Orders
|-- order-items/        # Module Order Items
|-- batches/            # Module Batches
|-- ingredient-exports/ # Module Ingredient Exports
|-- export-items/       # Module Export Items
|-- financial-records/  # Module Financial Records
|-- enums/              # Các Enums (Role, Order Status, Table Status, v.v.)
|-- common/             # Middleware, Interceptor, Filter, Decorators

4. Database thiết kế
Các bảng chính trong cơ sở dữ liệu:

users: Quản lý thông tin người dùng.

restaurants: Quản lý nhà hàng.

ingredients: Quản lý nguyên liệu.

suppliers: Quản lý nhà cung cấp.

categories: Quản lý danh mục nguyên liệu, món ăn.

dishes: Quản lý món ăn.

dish_ingredients: Liên kết giữa món ăn và nguyên liệu.

menus: Quản lý menu.

menu_dishes: Liên kết giữa menu và món ăn.

tables: Quản lý bàn ăn.

orders: Quản lý đơn hàng.

order_items: Quản lý món ăn trong đơn hàng.

batches: Quản lý lô nguyên liệu.

ingredient_exports: Quản lý xuất nguyên liệu.

export_items: Liên kết xuất nguyên liệu và các món ăn.

financial_records: Quản lý tài chính, thu chi.

5. Authentication Flow
POST /auth/register: Đăng ký tài khoản.

POST /auth/login: Đăng nhập và nhận Access Token.

GET /auth/me: Lấy thông tin người dùng từ Access Token.

Token lưu ở Frontend (Client) dưới dạng Bearer Token.

Chưa cần sử dụng Refresh Token trong giai đoạn này.

6. Coding Conventions
Controller: Validate request và delegate xuống Service.

DTO: Sử dụng DTO (Data Transfer Object) và class-validator cho toàn bộ body và query parameters.

Error Handling: Sử dụng HttpException của NestJS.

Database: Sử dụng snake_case cho các bảng trong database và camelCase cho mã nguồn.

Entities & Enums: Tách riêng Entities và Enums thành các folder khác nhau.

7. Scope chức năng chi tiết
Gọi món
Quét QR -> Hiện menu -> Chọn món -> Chatbot gợi ý món.

Đặt đơn, ghi chú đơn
Đánh giá đơn hàng
Feedback trực tiếp vào đơn đã thanh toán.

Thanh toán (Admin)
Xem danh sách đơn hàng.

Sửa đơn hàng nếu cần.

Thanh toán đơn hàng và tự động cập nhật trạng thái bàn thành available.

Bếp (Chef)
Giao tiếp bằng WebSocket:

Hiển thị món cần làm.

Xác nhận bắt đầu làm.

Cập nhật trạng thái món.

Xem lịch sử chế biến.

Quản lý tài khoản
CRUD tài khoản nhân viên (Admin).

Quản lý kho
CRUD nguyên liệu.

CRUD danh mục nguyên liệu.

CRUD nhà cung cấp.

Nhập kho, xuất kho nguyên liệu.

Quản lý hàng tồn kho, lịch sử nhập xuất, in hóa đơn.

Báo cáo thống kê
Thống kê doanh thu.

Thống kê món bán chạy.

Truy xuất nguồn gốc nguyên liệu.

Quản lý khoản thu/chi, in báo cáo.

Quản lý bàn
CRUD bàn.

Cập nhật trạng thái bàn (available, occupied, reserved, cleaning).

Xem danh sách bàn trống.

Authentication
Đăng nhập, đăng xuất.

8. Mục tiêu hiện tại (Priority)
Triển khai Authentication:

Register, Login, Me.

Hoàn thiện Entities theo thiết kế Database.

Triển khai chuẩn kiến trúc thư mục theo NestJS best practices.

9. Lộ trình phát triển (Next Steps)
Bước 1: Triển khai Authentication API (Register, Login, Me).

Bước 2: Hoàn thiện các Entities (User, Order, Dish, Ingredient, etc.).

Bước 3: Tạo Service cho các module.

Bước 4: Triển khai các API cho mỗi module.

Bước 5: Kiểm thử các API và đảm bảo tính ổn định.

Bước 6: Thêm các tính năng phụ như WebSocket cho Bếp, thống kê doanh thu, v.v.

Ghi chú:

Bạn có thể tự động tạo service, controller, dto, entity nếu cần.

File test .spec.ts hiện tại không cần thiết, có thể bỏ qua để tiết kiệm thời gian.

Ưu tiên code sạch, module hóa, dễ dàng bảo trì và mở rộng.