# Hướng Dẫn Sử Dụng Hệ Thống Phân Quyền

Tài liệu này hướng dẫn cách sử dụng hệ thống phân quyền cho nhân viên đã được triển khai.

## 1. Tổng Quan Hệ Thống

Hệ thống phân quyền hoạt động ở hai lớp chính:

1. **Cấp menu sidebar**: Kiểm soát việc hiển thị và truy cập trang
2. **Cấp UI component**: Kiểm soát các hành động chi tiết trong trang

## 2. Các Script Phân Quyền

### Script Cập Nhật Quyền Sidebar

Chạy các script sau để cập nhật quyền trong cơ sở dữ liệu:

```bash
# Cập nhật quyền cơ bản theo menu
npm run update-sidebar-permissions

# Cập nhật quyền chi tiết theo vai trò
npm run update-sidebar-role-permissions
```

## 3. Cách Sử Dụng Trong Code Frontend

### Bảo Vệ Toàn Trang

Sử dụng `PagePermissionGuard` để bảo vệ toàn bộ trang. Component này sẽ chuyển hướng người dùng nếu không có quyền:

```tsx
"use client";

import { PagePermissionGuard } from "@/components/auth/PagePermissionGuard";

export default function ProtectedPage() {
  return (
    <PagePermissionGuard permissions={["view_users"]}>
      {/* Nội dung trang, chỉ hiển thị nếu người dùng có quyền */}
      <YourPageContent />
    </PagePermissionGuard>
  );
}
```

### Bảo Vệ Component UI

Sử dụng `PermissionGuard` để ẩn/hiện các phần UI dựa trên quyền:

```tsx
import PermissionGuard from "@/components/auth/PermissionGuard";

function AdminPanel() {
  return (
    <div>
      {/* Button chỉ hiển thị nếu có quyền xóa người dùng */}
      <PermissionGuard permission="delete_user">
        <button>Xóa người dùng</button>
      </PermissionGuard>

      {/* Component chỉ hiển thị nếu có ít nhất 1 trong 2 quyền */}
      <PermissionGuard
        permissions={["edit_user", "change_user_status"]}
        requireAll={false}
      >
        <AdvancedUserOptions />
      </PermissionGuard>
    </div>
  );
}
```

### Hook Kiểm Tra Quyền

Sử dụng `usePermissions` để kiểm tra quyền trong code:

```tsx
import { usePermissions } from "@/hooks/usePermissions";

function UserActionButtons() {
  const { isAdmin, can, canAll, canAny } = usePermissions();

  const handleDelete = () => {
    // Kiểm tra quyền trước khi thực hiện
    if (!can("delete_user")) {
      toast.error("Bạn không có quyền xóa người dùng");
      return;
    }

    // Thực hiện hành động xóa
  };

  return (
    <div>
      <button onClick={handleEdit}>Chỉnh sửa</button>

      {/* Chỉ hiển thị nút nếu có quyền xóa */}
      {can("delete_user") && <button onClick={handleDelete}>Xóa</button>}
    </div>
  );
}
```

## 4. Kiểm Tra Nhiều Quyền

Để kiểm tra nhiều quyền cùng lúc, sử dụng utility `useActionPermissions`:

```tsx
import { useActionPermissions } from "@/utils/permissionUtils";

function ActionPanel() {
  // Kiểm tra nhiều quyền cùng lúc
  const actionPermissions = useActionPermissions([
    "edit_post",
    "delete_post",
    "approve_post",
  ]);

  return (
    <div>
      {/* Hiển thị theo quyền riêng lẻ */}
      {actionPermissions.edit_post && <button>Chỉnh sửa bài đăng</button>}

      {actionPermissions.delete_post && <button>Xóa bài đăng</button>}
    </div>
  );
}
```

## 5. Kiểm Tra Quyền Trong Backend API

Đảm bảo kiểm tra quyền ở cả backend để tăng tính bảo mật:

```typescript
// Controller API
static async updatePost(req: AuthRequest, res: Response) {
  try {
    // Kiểm tra quyền từ JWT token
    if (req.user.role !== 'admin' && !hasPermission(req.user, 'edit_post')) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thực hiện hành động này'
      });
    }

    // Tiếp tục xử lý cập nhật...
  } catch (err) {
    // Xử lý lỗi
  }
}
```

## 6. Lưu Ý Quan Trọng

- **Luôn kiểm tra quyền ở cả frontend và backend**
- Admin có tất cả các quyền mà không cần kiểm tra chi tiết
- Employee chỉ có quyền theo cấu hình trong script `update-sidebar-role-permissions.ts`
- Các thay đổi quyền cần chạy lại script để cập nhật vào database
- Nên kiểm tra kỹ các chức năng nhạy cảm như xóa, thay đổi vai trò, v.v.
