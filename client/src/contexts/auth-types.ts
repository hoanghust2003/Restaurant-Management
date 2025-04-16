// Các vai trò người dùng trong hệ thống
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  RECEPTION = 'reception',
  CHEF = 'chef',
  WAITER = 'waiter',
  CUSTOMER = 'customer' // Cho khách hàng sử dụng QR code
}

// Thông tin người dùng đã đăng nhập
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// Các đường dẫn (routes) phân theo vai trò
export const ROLE_BASED_ROUTES: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['/admin', '/kitchen', '/reception', '/inventory', '/analytics'],
  [UserRole.MANAGER]: ['/admin', '/kitchen', '/reception', '/inventory', '/analytics'],
  [UserRole.RECEPTION]: ['/reception'],
  [UserRole.CHEF]: ['/kitchen'],
  [UserRole.WAITER]: ['/reception', '/customer'],
  [UserRole.CUSTOMER]: ['/customer'],
};

// Kiểm tra xem người dùng có quyền truy cập vào một route cụ thể không
export const hasPermission = (user: User | null, path: string): boolean => {
  if (!user) return false;
  
  // Nếu là admin thì có quyền truy cập mọi route
  if (user.role === UserRole.ADMIN) return true;
  
  // Lấy các routes được phép của vai trò
  const allowedRoutes = ROLE_BASED_ROUTES[user.role] || [];
  
  // Kiểm tra xem path hiện tại có thuộc routes được phép không
  return allowedRoutes.some(route => path.startsWith(route));
};