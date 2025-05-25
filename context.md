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

### 2. STAFF

- **Quản lý bàn ăn**
    - Xem danh sách bàn, trạng thái (available, occupied, reserved...)
    - Cập nhật trạng thái bàn
- **Đặt món cho khách (tại quầy)**

- **Xử lý thanh toán**
    - Xem đơn hàng chờ thanh toán
    - Chỉnh sửa đơn (số lượng, món)
    - Xác nhận thanh toán
    - In hóa đơn
    - Cập nhật trạng thái bàn về `available`
---

### 3. CHEF

- Sử dụng WebSocket để:
    - Hiển thị món cần làm theo thứ tự thời gian
    - Xác nhận bắt đầu làm
    - Cập nhật trạng thái món: `waiting → preparing → done`
    - Xem chi tiết đơn hàng
    - Xem lịch sử món đã chế biến

---

### 4. WAREHOUSE

    🏬 Warehouse Management (Quản lý kho)
    📌 Mục tiêu
    Theo dõi, cập nhật và kiểm soát nguyên liệu dùng trong nhà hàng — bao gồm nhập kho, xuất kho, tồn kho hiện tại, cảnh báo hạn sử dụng và truy xuất nguồn gốc nguyên liệu đã sử dụng cho từng món.

    🧱 Các thực thể liên quan
    Tên bảng	Vai trò
    ingredients	Danh sách nguyên liệu (tên, đơn vị, ngưỡng cảnh báo, ảnh)
    ingredient_imports	Phiếu nhập kho, gồm nhiều batches nguyên liệu
    batches	Mỗi lô nguyên liệu nhập, có số lượng, giá, ngày hết hạn
    ingredient_exports	Phiếu xuất kho (cho bếp, hủy, v.v.)
    export_items	Danh sách nguyên liệu trong một lần xuất
    suppliers	Danh sách nhà cung cấp

    🛠 Chức năng chính
    1. 📦 Quản lý nguyên liệu (ingredients)
    CRUD nguyên liệu

    Trường chính:

    name, unit, threshold, image_url

    Truy vấn nâng cao:

    Lọc theo tên, trạng thái tồn kho, nguyên liệu sắp hết, sắp hết hạn

    2. 📥 Nhập kho (ingredient_imports, batches)
    Một phiếu nhập (ingredient_imports) có thể nhập nhiều nguyên liệu, mỗi nguyên liệu tạo một batch.

    Mỗi batch có:

    ingredient_id

    quantity, price, expiry_date, remaining_quantity

    Lưu thông tin:

    supplier_id, created_by, note

    Cho phép in phiếu nhập

    Ví dụ dữ liệu nhập:

    json
    Copy
    Edit
    {
    "supplier_id": "uuid",
    "note": "Nhập nguyên liệu từ nhà cung cấp A",
    "items": [
        {
        "ingredient_id": "uuid",
        "quantity": 10,
        "price": 20000,
        "expiry_date": "2025-06-15"
        },
        {
        "ingredient_id": "uuid",
        "quantity": 5,
        "price": 50000,
        "expiry_date": "2025-06-20"
        }
    ]
    }
    3. 📤 Xuất kho (ingredient_exports, export_items)
    Một phiếu xuất kho có thể xuất nhiều nguyên liệu từ các batch.

    Thông tin cần có:

    created_by, reason, danh sách batch_id, ingredient_id, quantity

    Cho phép in phiếu xuất

    Dùng để:

    Xuất cho bếp

    Hủy bỏ do hỏng

    Kiểm kê chênh lệch

    4. 📊 Tồn kho hiện tại
    Tính theo tổng remaining_quantity của tất cả batches chưa hết hạn và chưa hết số lượng

    Trả ra:

    json
    Copy
    Edit
    [
    {
        "ingredient_id": "...",
        "name": "Thịt bò",
        "unit": "kg",
        "total_quantity": 25,
        "threshold": 10,
        "status": "low" // nếu dưới threshold
    }
    ]
    5. ⏰ Cảnh báo hết hạn
    API liệt kê các batch có expiry_date gần (ví dụ trong 7 ngày)

    Dùng để cảnh báo warehouse quản lý

    6. 🔎 Lịch sử nhập/xuất
    Truy vấn phiếu nhập/xuất theo:

    Thời gian

    Nguyên liệu

    Người tạo

    Nhà cung cấp (với nhập)

    7. 🔄 Truy xuất nguồn gốc
    Cho phép tra ngược từ đơn hàng đến nguyên liệu đã dùng

    Dựa vào:

    order_items → dish_id

    dish_ingredients → ingredient_id

    Truy lại các batches đã xuất cho món

    8. 👤 Quản lý nhà cung cấp
    CRUD suppliers

    Trường gồm: name, contact_name, contact_phone, contact_email, address

    📚 API đề xuất
    GET /ingredients

    POST /ingredient-imports (kèm batches)

    GET /ingredient-imports/:id

    POST /ingredient-exports (kèm export_items)

    GET /inventory – tồn kho hiện tại

    GET /inventory/expiring – nguyên liệu sắp hết hạn

    GET /inventory/history – lịch sử nhập/xuất

    GET /reports/order/:id/trace-ingredients – truy xuất nguyên liệu theo đơn hàng

    🔐 Phân quyền
    Role	Quyền
    warehouse	Full access
    admin	Full access
    Others	❌ Không có quyền
    ---

### 5. ADMIN

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
- **Quản lý nhà hàng**
    - Xem thông tin nhà hànghàng