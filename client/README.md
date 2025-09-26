# 🎨 Restaurant Management Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-1890FF?logo=antdesign&logoColor=white)

*Frontend Web Application cho hệ thống quản lý nhà hàng được xây dựng bằng Next.js*

</div>

---

## 📋 Tổng quan

Frontend web application hiện đại cho hệ thống quản lý nhà hàng, được xây dựng với **Next.js 15**, **TypeScript**, **TailwindCSS** và **Ant Design**. Hỗ trợ đầy đủ các tính năng quản lý nhà hàng từ admin dashboard đến customer ordering interface.

## 🚀 Tính năng chính

### 🔐 Authentication & User Management
- **Login/Register** với JWT authentication
- **Role-based dashboards**: Admin, Staff, Kitchen, Waiter, Warehouse
- **Profile management** với avatar upload
- **Password reset** và security features

### 👩‍💼 Admin Dashboard
- **Restaurant overview** với analytics real-time
- **Revenue charts** và business insights
- **User management** với role assignment
- **System settings** và configuration

### 🍽️ Menu Management
- **Categories management** với drag & drop
- **Dishes CRUD** với image upload
- **Menu composition** linh hoạt
- **Pricing management** và promotions

### 🪑 Table & QR Management
- **Interactive table layout** 
- **QR Code generation** và printing
- **Table status** real-time updates
- **Reservation management**

### 📋 Order Management
- **Order tracking** real-time với WebSocket
- **Order status workflow**
- **Customer notes** và special requests
- **Order history** và analytics

### 👨‍🍳 Kitchen Interface
- **Order queue** real-time
- **Cooking status** updates
- **Timer management** cho món ăn
- **Kitchen workflow** optimization

### 📦 Inventory Management
- **Ingredients tracking**
- **Stock alerts** và notifications
- **Supplier management**
- **Import/Export** operations

### 💳 Payment Processing
- **VNPay integration** UI
- **Payment status** tracking
- **Receipt generation**
- **Financial reporting**

### 📱 Customer Interface
- **QR Code scanning** menu access
- **Mobile-responsive** ordering
- **Cart management**
- **Order tracking** real-time

### 📊 Reports & Analytics
- **Revenue dashboard** với charts
- **Popular dishes** analytics
- **Inventory reports**
- **Export functionality**

## 🛠️ Công nghệ sử dụng

### Core Framework
- **Next.js 15** - React framework với App Router
- **TypeScript** - Type safety
- **React 18** - Latest React features

### Styling & UI
- **TailwindCSS** - Utility-first CSS framework
- **Ant Design** - Enterprise UI components
- **Framer Motion** - Smooth animations
- **React Icons** - Icon library

### State & Data Management
- **React Hooks** - State management
- **React Hook Form** - Form handling
- **Yup** - Form validation
- **Axios** - HTTP client

### Real-time & Communication
- **Socket.io Client** - WebSocket connections
- **React Hot Toast** - Notifications
- **React Toastify** - Advanced toasts

### Charts & Visualization
- **Recharts** - Data visualization
- **Moment.js** - Date handling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 🗂️ Cấu trúc thư mục

```bash
src/
├── 📱 app/                     # Next.js App Router
│   ├── (auth)/                 # Authentication pages
│   ├── admin/                  # Admin dashboard
│   ├── kitchen/                # Kitchen interface
│   ├── customer/               # Customer interface
│   ├── api/                    # API routes (if any)
│   └── globals.css             # Global styles
├── 🧩 components/              # Reusable components
│   ├── ui/                     # UI components
│   ├── forms/                  # Form components
│   ├── charts/                 # Chart components
│   └── layout/                 # Layout components
├── 🔧 lib/                     # Utilities & configs
│   ├── api.ts                  # API client setup
│   ├── auth.ts                 # Auth utilities
│   ├── socket.ts               # Socket.io setup
│   └── utils.ts                # Helper functions
├── 🎨 styles/                  # Additional styles
├── 📝 types/                   # TypeScript types
├── 🔒 middleware.ts            # Next.js middleware
└── 📋 utils/                   # Utility functions
```

## 🚀 Cài đặt & Chạy

### 📋 Yêu cầu hệ thống
- Node.js v18+
- npm hoặc yarn
- Backend API đang chạy

### ⚙️ Cài đặt

1. **Cài đặt dependencies**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Cấu hình API trong `.env.local`**
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000

   # App Configuration
   NEXT_PUBLIC_APP_NAME=Restaurant Management
   NEXT_PUBLIC_APP_VERSION=1.0.0

   # Upload Configuration
   NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB
   NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

   # VNPay (Frontend URLs)
   NEXT_PUBLIC_VNPAY_RETURN_URL=http://localhost:3000/payment/return
   NEXT_PUBLIC_VNPAY_CANCEL_URL=http://localhost:3000/payment/cancel
   ```

### 🏃‍♂️ Development

```bash
# Development mode với hot reload
npm run dev

# Production build
npm run build

# Production preview
npm run start

# Linting
npm run lint
```

Application sẽ chạy tại: **http://localhost:3000**

## 🎯 Pages & Routes

### 🔐 Authentication Routes
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu

### 👩‍💼 Admin Routes
- `/admin` - Admin dashboard
- `/admin/users` - Quản lý người dùng
- `/admin/restaurants` - Thông tin nhà hàng
- `/admin/reports` - Báo cáo tổng hợp

### 🍽️ Menu Management
- `/admin/categories` - Quản lý danh mục
- `/admin/dishes` - Quản lý món ăn
- `/admin/menus` - Quản lý thực đơn

### 🪑 Table Management
- `/admin/tables` - Quản lý bàn
- `/admin/tables/:id/qr` - QR Code cho bàn

### 📋 Order Management
- `/admin/orders` - Danh sách đơn hàng
- `/admin/orders/:id` - Chi tiết đơn hàng

### 📦 Inventory Routes
- `/admin/ingredients` - Quản lý nguyên liệu
- `/admin/suppliers` - Quản lý nhà cung cấp
- `/admin/inventory` - Báo cáo kho

### 👨‍🍳 Kitchen Routes
- `/kitchen` - Kitchen dashboard
- `/kitchen/orders` - Queue đơn hàng
- `/kitchen/orders/:id` - Chi tiết chế biến

### 💳 Payment Routes
- `/payment/checkout` - Thanh toán
- `/payment/return` - VNPay return
- `/payment/cancel` - Hủy thanh toán

### 📱 Customer Routes
- `/menu` - Menu khách hàng
- `/menu/:tableId` - Menu theo bàn (QR)
- `/cart` - Giỏ hàng
- `/order/:id` - Theo dõi đơn hàng

## 🎨 UI Components

### 📋 Form Components
```tsx
import { LoginForm } from '@/components/forms/LoginForm'
import { DishForm } from '@/components/forms/DishForm'
import { OrderForm } from '@/components/forms/OrderForm'
```

### 📊 Chart Components
```tsx
import { RevenueChart } from '@/components/charts/RevenueChart'
import { PopularDishesChart } from '@/components/charts/PopularDishesChart'
```

### 🎯 Layout Components
```tsx
import { AdminLayout } from '@/components/layout/AdminLayout'
import { KitchenLayout } from '@/components/layout/KitchenLayout'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
```

## 🔌 API Integration

### 🔧 API Client Setup
```tsx
// lib/api.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatic token attachment
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 📡 WebSocket Integration
```tsx
// lib/socket.ts
import io from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL)

// Real-time order updates
socket.on('orderUpdate', (data) => {
  // Handle order status changes
})

socket.on('newOrder', (data) => {
  // Handle new orders for kitchen
})
```

### 🔐 Authentication Hook
```tsx
// hooks/useAuth.ts
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const login = async (credentials) => {
    // Login logic
  }

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return { user, login, logout, loading }
}
```

## 🧪 Development & Testing

### 🔧 Code Style
```bash
# Lint checking
npm run lint

# Format code
npm run lint:fix

# Type checking
npm run type-check
```

### 📱 Responsive Testing
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: iPad, Android tablets
- **Mobile**: iPhone, Android phones

### 🌐 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Build & Deployment

### 📦 Production Build
```bash
# Create optimized build
npm run build

# Serve build locally
npm run start
```

### 🌐 Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Static Export
```bash
# Next.js static export
npm run build
npm run export
```

## ⚡ Performance Optimization

### 🖼️ Image Optimization
```tsx
import Image from 'next/image'
import { useState } from 'react'

const DishImage = ({ src, alt }) => {
  const [loading, setLoading] = useState(true)
  
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={200}
      onLoad={() => setLoading(false)}
      className={`transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
    />
  )
}
```

### ⚡ Code Splitting
```tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const ChartComponent = dynamic(() => import('@/components/charts/RevenueChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false
})
```

### 📊 Bundle Analysis
```bash
# Analyze bundle size
npm run analyze
```

## 🔧 Troubleshooting

### 🚫 Common Issues

#### API Connection Problems
```tsx
// Check API base URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)

// Verify token format
const token = localStorage.getItem('token')
console.log('Token:', token ? 'Present' : 'Missing')
```

#### WebSocket Connection Issues
```tsx
// Enable Socket.io debug
localStorage.debug = 'socket.io-client:socket'
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### 📱 Mobile Issues
- Test on actual devices
- Check viewport meta tag
- Verify touch interactions
- Test form inputs on mobile keyboards

## 📞 Support & Resources

### 📚 Documentation
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **TailwindCSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Ant Design**: [https://ant.design/docs/react/introduce](https://ant.design/docs/react/introduce)

### �� Development Guidelines
- Follow TypeScript strict mode
- Use functional components với hooks
- Implement proper error boundaries
- Write accessible components
- Follow Next.js best practices

### 🔗 Useful Links
- **GitHub Repository**: [Restaurant Management](https://github.com/hoanghust2003/Restaurant-Management)
- **Backend API**: [Server Documentation](../server/README.md)
- **Issues**: [GitHub Issues](https://github.com/hoanghust2003/Restaurant-Management/issues)

---

<div align="center">

*Made with ❤️ using Next.js & TypeScript*

</div>
