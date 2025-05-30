import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Định nghĩa interface cho JWT payload
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

// Các routes công khai mà không cần xác thực
const publicRoutes = ['/auth/login', '/auth/register', '/auth'];

// Các routes chỉ dành cho ADMIN
const adminOnlyRoutes = ['/admin', '/admin/users'];

// Routes cần quyền ADMIN
const adminRoutes = ['/reports', '/settings'];

// Routes dành cho bếp trưởng/đầu bếp
const chefRoutes = ['/kitchen'];

// Routes dành cho nhân viên kho
const warehouseRoutes = ['/inventory', '/suppliers'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware checking path:', pathname);
  
  // Bỏ qua yêu cầu đối với tài nguyên tĩnh
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    console.log('Skipping middleware for static resource');
    return NextResponse.next();
  }

  // TEMPORARY FIX: Allow all routes to bypass authentication while debugging
  // This will let us see if the issue is caused by middleware
  console.log('⚠️ WARNING: Authentication checks temporarily disabled for debugging');
  return NextResponse.next();

  /* The code below is temporarily disabled while debugging login loop issue

  // Cho phép truy cập các route công khai
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('Public route detected, proceeding without token check');
    return NextResponse.next();
  }

  // Lấy token từ cookie hoặc localStorage (phụ thuộc vào cách lưu trữ token)
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.split(' ')[1];
  
  console.log('Token from cookies/headers:', token ? 'Found' : 'Not found');

  // Nếu không có token và đang truy cập vào route cần xác thực
  if (!token) {
    // Chuyển hướng đến trang đăng nhập, nhưng tránh vòng lặp redirect
    if (pathname === '/auth/login') {
      console.log('On login page, proceeding without token');
      return NextResponse.next();
    }
    console.log('No token, redirecting to login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Giải mã token
    const decoded = jwtDecode<JwtPayload>(token);
    
    // Kiểm tra token hết hạn
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      // Token hết hạn, chuyển hướng đến trang đăng nhập
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Kiểm tra quyền truy cập dựa trên vai trò
    const { role } = decoded;

    // Kiểm tra quyền admin
    if (adminOnlyRoutes.some(route => pathname.startsWith(route)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Kiểm tra quyền manager
    if (adminRoutes.some(route => pathname.startsWith(route)) && 
        !['admin'].includes(role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Kiểm tra quyền đầu bếp
    if (chefRoutes.some(route => pathname.startsWith(route)) && 
        !['admin', 'chef'].includes(role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Kiểm tra quyền nhân viên kho
    if (warehouseRoutes.some(route => pathname.startsWith(route)) && 
        !['admin', 'warehouse'].includes(role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Lỗi giải mã token, chuyển hướng đến trang đăng nhập
    // Tránh vòng lặp redirect tại trang đăng nhập
    if (pathname === '/auth/login') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  */
}

// Cấu hình middleware chỉ áp dụng cho các routes cụ thể
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};