/**
 * Ví dụ về cách sử dụng hệ thống quản lý role trong dự án Real Estate
 *
 * Hệ thống này bao gồm:
 * 1. AuthSlice với type-safe UserRole
 * 2. useAuth hook với các utility functions
 * 3. RoleGuard components để bảo vệ UI
 * 4. withRoleProtection HOC để bảo vệ pages
 * 5. useSidebarConfig hook để quản lý sidebar theo role
 */

import { useAuth } from "@/hooks/useAuth";
import {
  AdminGuard,
  EmployeeGuard,
  UserGuard,
  RoleGuard,
} from "@/components/admin/RoleGuard";
import {
  withAdminProtection,
  withEmployeeProtection,
} from "@/components/admin/withRoleProtection";
import UserRoleDisplay, {
  RoleBadge,
  UserPermissions,
} from "@/components/admin/UserRoleDisplay";
import { useSidebarConfig, useMenuAccess } from "@/hooks/useSidebarConfig";

// ===== 1. SỬ DỤNG useAuth HOOK =====

function ExampleAuthUsage() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isEmployee,
    hasAdminAccess,
    canAccessAdmin,
    canAccessEmployee,
    getUserRole,
    hasRole,
  } = useAuth();

  return (
    <div>
      <h2>Thông tin Authentication</h2>

      {/* Hiển thị thông tin user */}
      <p>Đã đăng nhập: {isAuthenticated ? "Có" : "Không"}</p>
      <p>Tên người dùng: {user?.username}</p>
      <p>Role: {getUserRole()}</p>

      {/* Kiểm tra role cụ thể */}
      <p>Là Admin: {isAdmin() ? "Có" : "Không"}</p>
      <p>Là Employee: {isEmployee() ? "Có" : "Không"}</p>

      {/* Kiểm tra quyền truy cập */}
      <p>Có quyền Admin: {canAccessAdmin() ? "Có" : "Không"}</p>
      <p>Có quyền Employee: {canAccessEmployee() ? "Có" : "Không"}</p>

      {/* Kiểm tra role linh hoạt */}
      <p>
        Có role admin hoặc employee:{" "}
        {hasRole(["admin", "employee"]) ? "Có" : "Không"}
      </p>
    </div>
  );
}

// ===== 2. SỬ DỤNG ROLE GUARD COMPONENTS =====

function ExampleRoleGuards() {
  return (
    <div>
      {/* Chỉ admin mới thấy */}
      <AdminGuard>
        <div className="admin-only-content">
          <h3>Nội dung chỉ dành cho Admin</h3>
          <button>Xóa tất cả dữ liệu</button>
        </div>
      </AdminGuard>

      {/* Admin và employee đều thấy */}
      <EmployeeGuard>
        <div className="employee-content">
          <h3>Nội dung cho Admin và Employee</h3>
          <button>Duyệt tin đăng</button>
        </div>
      </EmployeeGuard>

      {/* Tất cả user đã đăng nhập đều thấy */}
      <UserGuard>
        <div className="user-content">
          <h3>Nội dung cho tất cả user</h3>
          <button>Đăng tin</button>
        </div>
      </UserGuard>

      {/* Custom role guard */}
      <RoleGuard allowedRoles={["admin"]} redirectTo="/admin" showToast={true}>
        <div className="custom-admin-content">
          <h3>Custom Admin Content</h3>
        </div>
      </RoleGuard>
    </div>
  );
}

// ===== 3. SỬ DỤNG HOC PROTECTION =====

// Component cần bảo vệ
function AdminPage() {
  return (
    <div>
      <h1>Trang Admin</h1>
      <p>Chỉ admin mới có thể thấy trang này</p>
    </div>
  );
}

function EmployeePage() {
  return (
    <div>
      <h1>Trang Employee</h1>
      <p>Admin và employee đều có thể thấy trang này</p>
    </div>
  );
}

// Bảo vệ pages bằng HOC
const ProtectedAdminPage = withAdminProtection(AdminPage, {
  redirectTo: "/",
  showToast: true,
});

const ProtectedEmployeePage = withEmployeeProtection(EmployeePage, {
  redirectTo: "/admin",
  showToast: true,
});

// ===== 4. SỬ DỤNG USER ROLE DISPLAY =====

function ExampleUserDisplay() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Hiển thị thông tin User</h2>

      {/* Hiển thị full info */}
      <UserRoleDisplay showFullInfo={true} />

      {/* Chỉ hiển thị role badge */}
      <UserRoleDisplay />

      {/* Custom role badge */}
      {user && <RoleBadge role={user.role} />}

      {/* Hiển thị quyền */}
      <UserPermissions />
    </div>
  );
}

// ===== 5. SỬ DỤNG SIDEBAR CONFIG =====

function ExampleSidebarUsage() {
  const {
    sidebarConfig,
    menuItemsCount,
    hasAccessToMenuItem,
    getMenuItemByHref,
    userRole,
  } = useSidebarConfig();

  const hasUsersAccess = useMenuAccess("users");

  return (
    <div>
      <h2>Thông tin Sidebar</h2>
      <p>Role hiện tại: {userRole}</p>
      <p>Số menu items có quyền: {menuItemsCount}</p>
      <p>
        Có quyền truy cập "Quản lý người dùng":{" "}
        {hasUsersAccess ? "Có" : "Không"}
      </p>
      <p>
        Có quyền truy cập menu "users":{" "}
        {hasAccessToMenuItem("users") ? "Có" : "Không"}
      </p>

      {/* Hiển thị sidebar config */}
      <div>
        <h3>Sidebar Groups:</h3>
        {sidebarConfig.map((group) => (
          <div key={group.id}>
            <h4>{group.name}</h4>
            <ul>
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.href}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 6. VÍ DỤ CONDITIONAL RENDERING DỰA TRÊN ROLE =====

function ExampleConditionalRendering() {
  const { user, isAdmin, canAccessAdmin, hasRole } = useAuth();

  if (!user) {
    return <div>Vui lòng đăng nhập</div>;
  }

  return (
    <div>
      <h2>Dashboard - {user.username}</h2>

      {/* Chỉ hiển thị cho admin */}
      {isAdmin() && (
        <div className="admin-panel">
          <h3>Admin Panel</h3>
          <button>Quản lý hệ thống</button>
        </div>
      )}

      {/* Hiển thị cho admin và employee */}
      {canAccessAdmin() && (
        <div className="management-panel">
          <h3>Management Panel</h3>
          <button>Quản lý nội dung</button>
        </div>
      )}

      {/* Hiển thị cho user thường */}
      {hasRole("user") && (
        <div className="user-panel">
          <h3>User Panel</h3>
          <button>Đăng tin BĐS</button>
        </div>
      )}

      {/* Hiển thị dựa trên multiple roles */}
      {hasRole(["admin", "employee"]) && (
        <div className="staff-panel">
          <h3>Staff Panel</h3>
          <button>Xem báo cáo</button>
        </div>
      )}
    </div>
  );
}

// ===== 7. CUSTOM HOOKS CHO SPECIFIC FEATURES =====

// Hook để kiểm tra quyền truy cập vào một feature cụ thể
function useFeatureAccess(feature: string) {
  const { hasRole, isAuthenticated } = useAuth();

  const featurePermissions = {
    "delete-users": ["admin"],
    "manage-posts": ["admin", "employee"],
    "view-analytics": ["admin"],
    "create-content": ["admin", "employee"],
    "user-profile": ["user", "admin", "employee"],
  };

  const requiredRoles =
    featurePermissions[feature as keyof typeof featurePermissions];

  return {
    hasAccess: isAuthenticated && hasRole(requiredRoles || []),
    requiredRoles,
  };
}

// Sử dụng custom hook
function ExampleCustomHook() {
  const { hasAccess: canDeleteUsers } = useFeatureAccess("delete-users");
  const { hasAccess: canManagePosts } = useFeatureAccess("manage-posts");

  return (
    <div>
      <h2>Feature Access</h2>

      {canDeleteUsers && <button className="danger">Xóa người dùng</button>}

      {canManagePosts && <button>Quản lý tin đăng</button>}
    </div>
  );
}

// Export các component để sử dụng
export {
  ExampleAuthUsage,
  ExampleRoleGuards,
  ProtectedAdminPage,
  ProtectedEmployeePage,
  ExampleUserDisplay,
  ExampleSidebarUsage,
  ExampleConditionalRendering,
  ExampleCustomHook,
  useFeatureAccess,
};
