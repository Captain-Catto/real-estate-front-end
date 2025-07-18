# Dynamic Sidebar Management System

## Tổng quan

Hệ thống quản lý sidebar động cho phép quản trị viên (admin) tùy chỉnh thứ tự và quyền truy cập các mục menu trong sidebar cho cả admin và employee.

## Tính năng chính

### 1. Quản lý mục menu

- ✅ Kéo thả để sắp xếp thứ tự menu
- ✅ Bật/tắt hiển thị từng mục menu
- ✅ Phân quyền xem cho Admin và Employee
- ✅ Xem trước sidebar theo role
- ✅ Thêm/sửa/xóa mục menu
- ✅ Lưu trữ cấu hình (localStorage + backend)
- ✅ Khôi phục cấu hình mặc định

### 2. Phân quyền Role-based

- **Admin**: Có thể xem tất cả mục menu được phép
- **Employee**: Chỉ xem các mục menu được cấp quyền

### 3. Đồng bộ dữ liệu

- Lưu cấu hình vào localStorage (offline)
- Đồng bộ với backend API (online)
- Fallback mechanism khi backend không khả dụng

## Cách sử dụng

### 1. Truy cập trang cấu hình

Đăng nhập với tài khoản admin và truy cập:

```
/admin/cau-hinh-sidebar
```

### 2. Quản lý mục menu

#### Sắp xếp thứ tự

- Kéo thả icon "⋮⋮" để di chuyển mục menu
- Thứ tự sẽ được cập nhật tự động

#### Phân quyền truy cập

- Click nút "Admin" hoặc "Employee" để bật/tắt quyền truy cập
- Mục có nền xanh = được phép, nền xám = không được phép

#### Hiển thị/Ẩn menu

- Click icon mắt (👁️) để ẩn/hiện mục menu
- Mục bị ẩn sẽ không xuất hiện trong sidebar

#### Xem trước

- Chọn role (Admin/Employee) ở góc phải để xem preview
- Sidebar bên phải sẽ hiển thị menu theo role đã chọn

### 3. Lưu cấu hình

- Click "Lưu cấu hình" để lưu thủ công
- Hoặc cấu hình tự động lưu khi có thay đổi
- Thời gian lưu cuối cùng hiển thị bên cạnh

### 4. Khôi phục mặc định

- Click "Khôi phục mặc định" để reset về cấu hình ban đầu
- Xác nhận để hoàn tất

## Cấu trúc Component

### 1. DynamicSidebarManager

```typescript
// Component chính quản lý cấu hình sidebar
<DynamicSidebarManager />
```

### 2. DynamicAdminSidebar

```typescript
// Sidebar động cho admin, tự động load cấu hình
<DynamicAdminSidebar />
```

### 3. DynamicEmployeeSidebar

```typescript
// Sidebar động cho employee, lọc theo quyền
<DynamicEmployeeSidebar />
```

## Cấu hình mặc định

### Menu Items cho Admin

1. Tổng quan (`/admin`)
2. Quản lý tin đăng (`/admin/quan-ly-tin-dang`)
3. Quản lý người dùng (`/admin/quan-ly-nguoi-dung`)
4. Tin tức (`/admin/quan-ly-tin-tuc`)
5. Giao dịch (`/admin/quan-ly-giao-dich`)
6. Thống kê (`/admin/thong-ke`)
7. Cài đặt (`/admin/cai-dat`)
8. Cấu hình Sidebar (`/admin/cau-hinh-sidebar`)
9. Quản lý địa chính (`/admin/quan-ly-dia-chinh`)
10. Quản lý dự án (`/admin/quan-ly-du-an`)
11. Quản lý chủ đầu tư (`/admin/quan-ly-chu-dau-tu`)
12. Quản lý danh mục (`/admin/quan-ly-danh-muc`)
13. Quản lý diện tích (`/admin/quan-ly-dien-tich`)
14. Quản lý giá (`/admin/quan-ly-gia`)

### Menu Items cho Employee

1. Tổng quan (`/employee`)
2. Quản lý tin đăng (`/employee/quan-ly-tin-dang`)
3. Quản lý người dùng (`/employee/quan-ly-nguoi-dung`)
4. Tin tức (`/employee/quan-ly-tin-tuc`)
5. Giao dịch (`/employee/quan-ly-giao-dich`)

## API Integration

### Backend Service

```typescript
// services/sidebarConfigService.ts
class SidebarConfigService {
  static async getSidebarConfig();
  static async updateSidebarConfig(menuItems);
  static async resetSidebarConfig();
  static async getSidebarConfigByRole(role);
}
```

### Endpoints cần implement

```
GET    /api/admin/sidebar-config
PUT    /api/admin/sidebar-config
POST   /api/admin/sidebar-config/reset
GET    /api/admin/sidebar-config/role/:role
```

## Cách tích hợp vào trang mới

### 1. Thay thế AdminSidebar cũ

```typescript
// Thay vì
import AdminSidebar from "@/components/admin/AdminSidebar";

// Sử dụng
import DynamicAdminSidebar from "@/components/admin/DynamicAdminSidebar";

// Trong component
<DynamicAdminSidebar />;
```

### 2. Thay thế EmployeeSidebar cũ

```typescript
// Thay vì
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";

// Sử dụng
import DynamicEmployeeSidebar from "@/components/employee/DynamicEmployeeSidebar";

// Trong component
<DynamicEmployeeSidebar />;
```

## Lưu ý kỹ thuật

### 1. Fallback Strategy

- Ưu tiên load từ backend
- Fallback về localStorage
- Cuối cùng sử dụng cấu hình mặc định

### 2. Icons Support

- Hỗ trợ các icon từ `@heroicons/react/24/outline`
- Thêm icon mới trong `iconMap` object

### 3. Role Management

- Mỗi menu item có array `roles: ["admin", "employee"]`
- Filter tự động theo role của user hiện tại

### 4. Persistence

- LocalStorage key: `sidebarMenuItems`
- Auto-save khi có thay đổi
- Manual save button cho control tốt hơn

## Troubleshooting

### 1. Menu không hiển thị

- Kiểm tra role của user
- Kiểm tra `isActive` của menu item
- Kiểm tra array `roles` có chứa role hiện tại

### 2. Thay đổi không được lưu

- Kiểm tra localStorage permissions
- Kiểm tra kết nối backend API
- Xem console logs để debug

### 3. Icon không hiển thị

- Kiểm tra icon name trong `iconMap`
- Thêm icon mới vào mapping nếu cần

## Mở rộng tương lai

### 1. Nested Menu

- Hỗ trợ menu con với `parentId` và `children`
- Expand/collapse functionality

### 2. Custom Icons

- Upload custom icons
- Icon picker interface

### 3. Advanced Permissions

- Permission per menu item
- User group based access

### 4. Multi-language

- i18n support cho menu names
- Role-based language switching
