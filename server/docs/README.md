# 📚 API Documentation

## 🎯 Tổng quan

Tài liệu API đầy đủ cho hệ thống quản lý nhà hàng được tạo bằng **Swagger UI** với **OpenAPI 3.0** specification.

## 🌟 Tính năng

### ✅ Đã hoàn thành
- ✨ **Swagger UI đầy đủ** với giao diện đẹp, dễ sử dụng
- 📝 **Mô tả chi tiết** cho tất cả endpoints và DTOs
- 🔐 **Xác thực Bearer Token** (JWT) tích hợp
- 📁 **Upload file** được hỗ trợ đầy đủ
- 🏷️ **Tags và phân nhóm** theo module (với emoji)
- 📤 **Response examples** cho tất cả trường hợp
- 🎨 **UI customization** với CSS và options tối ưu
- 📋 **Script tự động** sinh OpenAPI spec (JSON/YAML)

### 🔧 Modules được tích hợp Swagger
- 🧑‍💼 **Users** - Quản lý người dùng
- 🥘 **Dishes** - Quản lý món ăn  
- 🧅 **Ingredients** - Quản lý nguyên liệu
- 📋 **Menus** - Quản lý thực đơn
- 🪑 **Tables** - Quản lý bàn ăn
- 📂 **Categories** - Phân loại món ăn
- 🛒 **Orders** - Đơn hàng
- 📦 **Suppliers** - Nhà cung cấp
- 💳 **Payment** - Thanh toán
- 📊 **Inventory** - Kho hàng
- 🔐 **Auth** - Xác thực
- 📤 **File Upload** - Tải file

## 🚀 Cách sử dụng

### 1. Truy cập Swagger UI
```
http://localhost:8000/api/docs
```

### 2. Xác thực (Authentication)
1. Đăng nhập qua endpoint `/api/auth/login`
2. Copy JWT token từ response
3. Click nút **"Authorize"** ở góc trên bên phải
4. Nhập token với format: `Bearer <your-token>`
5. Click **"Authorize"** để áp dụng

### 3. Test API endpoints
- Chọn endpoint cần test
- Điền parameters/body cần thiết
- Click **"Try it out"** → **"Execute"**
- Xem response và status code

### 4. Upload files
- Các endpoint upload có **file input** tích hợp
- Hỗ trợ multiple file types (image, document)
- Preview file type và size restrictions

## 📜 Tạo OpenAPI Specification

### Tự động sinh file spec:
```bash
npm run docs:generate
```

Sẽ tạo ra:
- `docs/openapi.json` - OpenAPI spec dạng JSON
- `docs/openapi.yaml` - OpenAPI spec dạng YAML

### Import vào tools khác:
- **Postman**: Import từ file JSON/YAML
- **Insomnia**: Import từ OpenAPI spec
- **VS Code**: Sử dụng extension REST Client

## 🎨 Customization

### UI Options đã tối ưu:
- **docExpansion**: 'list' - Hiển thị danh sách thu gọn
- **filter**: true - Tìm kiếm endpoint
- **showRequestDuration**: true - Hiện thời gian response
- **tryItOutEnabled**: true - Cho phép test trực tiếp
- **requestSnippets**: true - Code examples multiple languages

### Custom CSS:
- Logo và branding tùy chỉnh
- Color scheme phù hợp
- Responsive design
- Dark/Light theme support

## 📋 Response Structure

### Cấu trúc response chuẩn:
```typescript
// Success Response
{
  "success": true,
  "data": T,
  "message": "string",
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// Error Response  
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// Paginated Response
{
  "success": true,
  "data": T[],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## ⚡ Performance Tips

- Sử dụng **pagination** cho danh sách lớn
- **Cache** JWT token để tránh đăng nhập lại
- **Compress** file uploads khi có thể
- Sử dụng **filters** để tìm kiếm nhanh endpoint

## 🔗 Links hữu ích

- [Swagger UI](http://localhost:8000/api/docs) - API Documentation
- [OpenAPI Specification](https://swagger.io/specification/) - OpenAPI 3.0 docs
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction) - NestJS integration guide

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**
   - ✅ Kiểm tra JWT token đã được set chưa
   - ✅ Token còn hạn sử dụng không
   - ✅ Format: `Bearer <token>`

2. **403 Forbidden** 
   - ✅ User có đúng role không
   - ✅ Endpoint yêu cầu permissions gì

3. **File upload fails**
   - ✅ File size trong giới hạn (max 10MB)
   - ✅ File type được support
   - ✅ Multipart/form-data content-type

4. **Swagger UI không load**
   - ✅ Server đang chạy port 8000
   - ✅ Firewall không block
   - ✅ Clear browser cache

---

**🎉 Happy API Testing!** 

Nếu có vấn đề gì, vui lòng tạo issue hoặc liên hệ team phát triển.
