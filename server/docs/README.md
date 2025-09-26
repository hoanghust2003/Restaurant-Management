# 📚 API Documentation

<div align="center">

![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)
![OpenAPI](https://img.shields.io/badge/OpenAPI-6BA539?logo=openapi-initiative&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?logo=postman&logoColor=white)

*Comprehensive API documentation for Restaurant Management System*

</div>

---

## 🎯 Tổng quan

Tài liệu API đầy đủ cho hệ thống quản lý nhà hàng được tạo bằng **Swagger UI** với **OpenAPI 3.0** specification. Cung cấp interface tương tác để test và explore tất cả API endpoints.

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
- 🔐 **Auth** - Authentication và authorization
- 👥 **Users** - Quản lý người dùng và profiles
- 🏪 **Restaurants** - Thông tin nhà hàng
- 📂 **Categories** - Phân loại món ăn và nguyên liệu
- 🥬 **Ingredients** - Quản lý nguyên liệu
- 🍽️ **Dishes** - Quản lý món ăn và recipe
- 📋 **Menus** - Quản lý thực đơn
- 🪑 **Tables** - Quản lý bàn ăn và QR codes
- 📋 **Orders** - Xử lý đơn hàng và tracking
- 💳 **Payment** - Thanh toán và receipts
- 📦 **Inventory** - Quản lý kho và reports
- 🏢 **Suppliers** - Quản lý nhà cung cấp
- 🏠 **Batches** - Batch tracking và management
- 📤 **Exports** - Xuất kho operations
- 📥 **Imports** - Nhập kho operations
- 📁 **Upload** - File upload và asset management
- 📊 **Reports** - Analytics và reporting
- 👤 **Customer** - Customer-facing endpoints
- 👨‍🍳 **Kitchen** - Kitchen workflow management

## 🚀 Cách sử dụng

### 1. 🌐 Truy cập Swagger UI
```
http://localhost:8000/api/docs
```

Hoặc production environment:
```
https://api.findnear.vn/api/docs
```

### 2. 🔐 Xác thực (Authentication)

#### Bước 1: Đăng nhập để lấy token
1. Mở endpoint `/api/auth/login`
2. Click **"Try it out"**
3. Nhập credentials:
   ```json
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```
4. Click **"Execute"**
5. Copy JWT token từ response

#### Bước 2: Authorize trong Swagger
1. Click nút **"Authorize"** ở góc trên bên phải
2. Nhập token với format: 
   ```
   Bearer <your-jwt-token>
   ```
3. Click **"Authorize"** để áp dụng
4. Click **"Close"**

#### Bước 3: Test protected endpoints
- Tất cả endpoints có 🔒 icon đã được authorize
- Token sẽ tự động được gửi trong header `Authorization`

### 3. 🧪 Test API endpoints
1. **Chọn endpoint** cần test
2. **Điền parameters/body** cần thiết
3. Click **"Try it out"** → **"Execute"**
4. **Xem kết quả** trong Response section

### 4. 📋 Explore API structure
- **Tags**: Endpoints được nhóm theo module
- **Models**: Click để xem schema của DTOs
- **Examples**: Mỗi endpoint có request/response examples

## 📜 Generate OpenAPI Specification

### 🔄 Tự động sinh file spec

```bash
# Chạy script generate
npm run docs:generate
```

Script sẽ tạo ra:
- `docs/openapi.json` - OpenAPI spec dạng JSON
- `docs/openapi.yaml` - OpenAPI spec dạng YAML

### 📥 Import vào tools khác

#### Postman
1. Mở Postman
2. Click **Import** → **File**
3. Chọn file `docs/openapi.json`
4. Collection sẽ được tạo tự động với tất cả endpoints

#### Insomnia
1. Mở Insomnia
2. Click **Create** → **Import From**
3. Chọn **File** → `docs/openapi.yaml`
4. Workspace sẽ được tạo với organized requests

#### VS Code REST Client
1. Install extension **REST Client**
2. Tạo file `.http` với content từ OpenAPI spec
3. Sử dụng variables cho base URL và tokens

### 🔧 Advanced Usage

#### Custom Environment Variables
```http
### Variables
@baseUrl = http://localhost:8000
@token = your-jwt-token-here

### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

### Get Profile  
GET {{baseUrl}}/api/auth/me
Authorization: Bearer {{token}}
```

## 🎨 Customization

### UI Options đã tối ưu:
- **docExpansion**: 'list' - Hiển thị danh sách thu gọn
- **filter**: true - Tìm kiếm endpoint
- **showRequestDuration**: true - Hiện thời gian response
- **tryItOutEnabled**: true - Cho phép test trực tiếp
- **requestSnippets**: true - Code examples multiple languages
- **persistAuthorization**: true - Lưu token giữa các session

### Custom CSS:
- Logo và branding tùy chỉnh
- Color scheme phù hợp với brand
- Responsive design cho mobile
- Dark/Light theme support

### Custom Headers:
```typescript
// swagger-config.ts
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Restaurant Management API')
  .setDescription('Comprehensive restaurant management system API')
  .setVersion('1.0.0')
  .addServer('http://localhost:8000', 'Development Server')
  .addServer('https://api.findnear.vn', 'Production Server')
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
```

## 📋 Response Structure

### ✅ Success Response Format
```json
{
  "data": {
    "id": "uuid-string",
    "name": "Example Data",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Operation completed successfully",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### ❌ Error Response Format
```json
{
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      }
    ]
  },
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

### 📄 Paginated Response Format
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Item 1"
    },
    {
      "id": "uuid-2", 
      "name": "Item 2"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Data retrieved successfully",
  "statusCode": 200
}
```

## ⚡ Performance Tips

### 🚀 Pagination
- Sử dụng `page` và `limit` parameters
- Default limit: 10 items
- Maximum limit: 100 items

```bash
# Example pagination request
GET /api/dishes?page=1&limit=20
```

### 🔍 Filtering & Search
```bash
# Search dishes by name
GET /api/dishes?search=pizza

# Filter by category
GET /api/dishes?category=main-course

# Multiple filters
GET /api/dishes?category=appetizer&available=true
```

### 📊 Sorting
```bash
# Sort by name ascending
GET /api/dishes?sort=name:asc

# Sort by created date descending  
GET /api/dishes?sort=createdAt:desc

# Multiple sort fields
GET /api/dishes?sort=category:asc,name:asc
```

### 🗜️ Field Selection
```bash
# Select specific fields only
GET /api/dishes?fields=id,name,price

# Exclude certain fields
GET /api/dishes?exclude=description,ingredients
```

## 🔗 Links hữu ích

### 📚 Documentation
- **OpenAPI Specification**: [openapi.json](./openapi.json)
- **YAML Version**: [openapi.yaml](./openapi.yaml)
- **Backend Setup**: [../README.md](../README.md)

### 🛠️ Development Tools
- **Swagger Editor**: [https://editor.swagger.io](https://editor.swagger.io)
- **Postman**: [https://www.postman.com](https://www.postman.com)
- **Insomnia**: [https://insomnia.rest](https://insomnia.rest)
- **REST Client**: [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

### 🌐 External Resources
- **OpenAPI 3.0 Guide**: [https://swagger.io/docs/specification/about/](https://swagger.io/docs/specification/about/)
- **NestJS Swagger**: [https://docs.nestjs.com/openapi/introduction](https://docs.nestjs.com/openapi/introduction)
- **JWT.io**: [https://jwt.io](https://jwt.io) - JWT decoder

## 🐛 Troubleshooting

### ❌ Common Issues

#### 🔐 Authentication Problems
```bash
# Issue: 401 Unauthorized  
# Solution: Check token format
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Issue: Token expired
# Solution: Login again to get new token
POST /api/auth/login
```

#### 🌐 CORS Issues
```json
// Issue: CORS error in browser
// Solution: Check ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### 📁 File Upload Issues
```bash
# Issue: File too large
# Solution: Check MAX_FILE_SIZE in .env (default 5MB)
MAX_FILE_SIZE=5242880

# Issue: Invalid file type
# Solution: Check ALLOWED_FILE_TYPES
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

#### 🗄️ Database Connection
```bash
# Issue: Database connection failed
# Solution: Check DATABASE_URL format
DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
```

### 🔧 Debug Tips

#### Enable Debug Logging
```bash
# In .env file
NODE_ENV=development
LOG_LEVEL=debug
```

#### Check API Health
```bash
# Health check endpoint
GET /api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

#### Validate Request Body
```bash
# Use curl to test raw requests
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📞 Support

### 🤝 Đóng góp
- **Issues**: [GitHub Issues](https://github.com/hoanghust2003/Restaurant-Management/issues)
- **Pull Requests**: [Contributing Guide](../../CONTRIBUTING.md)
- **Discussions**: [GitHub Discussions](https://github.com/hoanghust2003/Restaurant-Management/discussions)

### 📧 Liên hệ
- **Developer**: [hoanghust2003](https://github.com/hoanghust2003)
- **Email**: [your-email@example.com](mailto:your-email@example.com)

---

<div align="center">

**🌟 API Documentation được tạo tự động từ code**

*Made with ❤️ using Swagger & OpenAPI*

</div>
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
