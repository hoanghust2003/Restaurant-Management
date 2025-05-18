## 🔐 PHÂN QUYỀN (User Roles)

```
ts
Copy code
export enum UserRole {
  ADMIN = 'admin',
  WAITER = 'waiter',
  CHEF = 'chef',
  CASHIER = 'cashier',
  WAREHOUSE = 'warehouse',
  CUSTOMER = 'customer',
}

```

---

## 📱 CHỨC NĂNG THEO TỪNG ROLE

### 1. CUSTOMER

- **Gọi món qua QR**
    - Hiện menu
    - Chọn món
    - Chatbot gợi ý món
- **Đánh giá đơn hàng**

---

### 2. WAITER

- **Quản lý bàn ăn**
    - Xem danh sách bàn, trạng thái (available, occupied, reserved...)
    - Cập nhật trạng thái bàn
- **Đặt món cho khách (tại quầy)**

---

### 3. CHEF

- Sử dụng WebSocket để:
    - Hiển thị món cần làm theo thứ tự thời gian
    - Xác nhận bắt đầu làm
    - Cập nhật trạng thái món: `waiting → preparing → done`
    - Xem chi tiết đơn hàng
    - Xem lịch sử món đã chế biến

---

### 4. CASHIER

- **Xử lý thanh toán**
    - Xem đơn hàng chờ thanh toán
    - Chỉnh sửa đơn (số lượng, món)
    - Xác nhận thanh toán
    - In hóa đơn
    - Cập nhật trạng thái bàn về `available`
- **Thống kê doanh thu ngày**

---

### 5. WAREHOUSE

- **Quản lý nguyên liệu**
    - CRUD nguyên liệu, đơn vị tính
    - Tìm kiếm, lọc nguyên liệu
- **Quản lý kho**
    - Nhập kho (`ingredient_imports`, tạo nhiều `batches`)
    - Xuất kho (`ingredient_exports`)
    - Tồn kho hiện tại (tổng tồn theo nguyên liệu)
    - In phiếu nhập/xuất
    - Lịch sử nhập xuất
- **Quản lý nhà cung ứng**
    - CRUD nhà cung ứng

---

### 6. ADMIN

- Toàn quyền các chức năng bên trên
- **Quản lý tài khoản người dùng**
    - Xem, thêm, sửa, xóa tài khoản
- **Quản lý món ăn**
    - CRUD `categories`, `dishes`, `dish_ingredients`, `menus`
- **Quản lý bàn**
    - CRUD bàn ăn
- **Báo cáo - Thống kê**
    - Doanh thu theo ngày/tháng
    - Món bán chạy
    - Truy xuất nguồn gốc nguyên liệu của đơn cụ thể
    - Quản lý khoản thu/chi (gắn với `orders`, `ingredient_imports`)
    - In báo cáo chi tiết