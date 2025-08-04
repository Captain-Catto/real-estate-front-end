# Hệ thống Quản lý Role và Quyền truy cập

## Tổng quan

Hệ thống quản lý role trong dự án Real Estate được thiết kế để:

1. **Quản lý role** của user (admin, employee, user)
2. **Lưu trữ role** trong Redux store an toàn
3. **Hiển thị sidebar** theo quyền của user
4. **Bảo vệ component và page** theo role
5. **Cung cấp utilities** để kiểm tra quyền

## Cấu trúc Role

```typescript
type UserRole = "user" | "admin" | "employee";
```

### Phân quyền:

- **admin**: Toàn quyền, có thể truy cập tất cả chức năng
- **employee**: Quyền hạn trung gian, quản lý nội dung
- **user**: Quyền cơ bản, đăng tin và tìm kiếm BĐS

## Các thành phần chính

### 1. AuthSlice (Redux Store)

**File**: `src/store/slices/authSlice.ts`

```typescript
// Cấu trúc User với role type-safe
interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole; // Type-safe role
  // ... other fields
}

// Actions mới
setUserRole(role: UserRole)  // Set role trực tiếp
setUser(user: User)          // Set toàn bộ user info
```

### 2. useAuth Hook (Enhanced)

**File**: `src/hooks/useAuth.ts`

```typescript
const {
  user, // User info
  isAuthenticated, // Trạng thái đăng nhập
  hasRole, // Kiểm tra role
  isAdmin, // Kiểm tra admin
  isEmployee, // Kiểm tra employee
  hasAdminAccess, // Có quyền admin không
  canAccessAdmin, // Có thể truy cập admin features
  canAccessEmployee, // Có thể truy cập employee features
  getUserRole, // Lấy role hiện tại
} = useAuth();
```

### 3. RoleGuard Components

**File**: `src/components/admin/RoleGuard.tsx`

```typescript
// Bảo vệ component theo role
<RoleGuard allowedRoles={["admin", "employee"]}>
  <AdminPanel />
</RoleGuard>

// Utility components
<AdminGuard>        // Chỉ admin
<EmployeeGuard>     // Admin + employee
<UserGuard>         // Tất cả user đã đăng nhập
```

### 4. HOC Protection

**File**: `src/components/admin/withRoleProtection.tsx`

```typescript
// Bảo vệ toàn bộ page
const ProtectedAdminPage = withAdminProtection(AdminPage);
const ProtectedEmployeePage = withEmployeeProtection(EmployeePage);

// Custom protection
const ProtectedPage = withRoleProtection(MyPage, {
  allowedRoles: ["admin"],
  redirectTo: "/unauthorized",
  showToast: true,
});
```

### 5. Sidebar Management

**File**: `src/hooks/useSidebarConfig.ts`

```typescript
const {
  sidebarConfig, // Sidebar items theo role
  menuItemsCount, // Số menu items có quyền
  hasAccessToMenuItem, // Kiểm tra quyền menu item
  getMenuItemByHref, // Lấy menu item theo href
  userRole, // Role hiện tại
} = useSidebarConfig();
```

### 6. User Role Display

**File**: `src/components/admin/UserRoleDisplay.tsx`

```typescript
<UserRoleDisplay showFullInfo={true} />  // Hiển thị full info
<UserRoleDisplay />                      // Chỉ role badge
<RoleBadge role="admin" />              // Custom role badge
<UserPermissions />                      // Hiển thị quyền
```

## Cách sử dụng

### 1. Kiểm tra role trong component

```typescript
function MyComponent() {
  const { user, isAdmin, canAccessAdmin, hasRole } = useAuth();

  return (
    <div>
      {/* Chỉ admin thấy */}
      {isAdmin() && <AdminButton />}

      {/* Admin và employee thấy */}
      {canAccessAdmin() && <ManageButton />}

      {/* Kiểm tra linh hoạt */}
      {hasRole(["admin", "employee"]) && <StaffPanel />}
    </div>
  );
}
```

### 2. Bảo vệ component

```typescript
function AdminPanel() {
  return (
    <AdminGuard>
      <div>Nội dung chỉ admin thấy</div>
    </AdminGuard>
  );
}
```

### 3. Bảo vệ page

```typescript
// pages/admin/users.tsx
function UsersPage() {
  return <div>Quản lý người dùng</div>;
}

export default withAdminProtection(UsersPage);
```

### 4. Sử dụng trong layout

```typescript
function AdminLayout({ children }) {
  return (
    <EmployeeGuard>
      <div className="admin-layout">
        <AdminSidebar />
        <main>{children}</main>
      </div>
    </EmployeeGuard>
  );
}
```

## Flow hoạt động

### 1. User đăng nhập

```
1. User nhập thông tin đăng nhập
2. Frontend gọi API login
3. Backend trả về user info (có role)
4. Redux store lưu user với role
5. UI được update theo role
```

### 2. Hiển thị sidebar

```
1. AdminSidebar component render
2. useSidebarConfig hook filter menu theo role
3. Chỉ hiển thị menu items user có quyền
4. Dynamic title theo role
```

### 3. Bảo vệ routes

```
1. User truy cập protected route
2. RoleGuard/HOC kiểm tra quyền
3. Nếu không có quyền → redirect + toast
4. Nếu có quyền → render component
```

## Cấu hình Sidebar

Sidebar config được định nghĩa trong `useSidebarConfig.ts`:

```typescript
const sidebarConfig = [
  {
    id: "dashboard",
    name: "Tổng quan",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        href: "/admin",
        roles: ["admin", "employee"], // Quyền truy cập
      },
    ],
  },
];
```

## Best Practices

### 1. Kiểm tra quyền

```typescript
// ✅ Tốt
const { hasRole } = useAuth();
if (hasRole("admin")) {
  // Do admin stuff
}

// ❌ Tránh
if (user?.role === "admin") {
  // Hard-coded check
}
```

### 2. Bảo vệ component

```typescript
// ✅ Tốt - Dùng RoleGuard
<AdminGuard>
  <SensitiveComponent />
</AdminGuard>;

// ❌ Tránh - Conditional rendering thủ công
{
  user?.role === "admin" && <SensitiveComponent />;
}
```

### 3. Bảo vệ page

```typescript
// ✅ Tốt - Dùng HOC
export default withAdminProtection(AdminPage);

// ❌ Tránh - Kiểm tra trong component
function AdminPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin()) return <div>Unauthorized</div>;
  return <div>Admin content</div>;
}
```

## Troubleshooting

### 1. Sidebar không hiển thị menu

- Kiểm tra user có role chính xác không
- Kiểm tra menu config có role phù hợp không
- Kiểm tra user đã đăng nhập chưa

### 2. Component không được bảo vệ

- Đảm bảo wrap component trong RoleGuard
- Kiểm tra allowedRoles có đúng không
- Kiểm tra user role có match không

### 3. Redirect không hoạt động

- Kiểm tra redirectTo path có đúng không
- Đảm bảo router đã setup
- Kiểm tra toast notification

## File Examples

Xem file `src/examples/RoleManagementExamples.tsx` để có ví dụ đầy đủ về cách sử dụng tất cả features.

## Migration Guide

Nếu đang migrate từ hệ thống cũ:

1. Update User interface với UserRole type
2. Replace hard-coded role checks bằng useAuth hooks
3. Wrap components với RoleGuard
4. Update sidebar config với roles array
5. Protect pages với HOC

## Security Notes

- ⚠️ **Quan trọng**: Luôn validate quyền ở backend
- Frontend role check chỉ để UX, không phải security
- Sensitive API calls phải kiểm tra quyền ở server
- Token expiry sẽ auto logout user
