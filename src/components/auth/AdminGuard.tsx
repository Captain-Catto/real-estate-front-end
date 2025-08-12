"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

interface AdminGuardProps {
  children: ReactNode;
  permissions?: string[]; // Quyền cần kiểm tra
  requireAllPermissions?: boolean; // Cần tất cả quyền hay chỉ cần 1 quyền
  redirectToHome?: boolean; // true = redirect về trang chủ, false = redirect về /admin
}

/**
 * Component bảo vệ admin đơn giản
 * Bước 1: Check role (admin hoặc employee)
 * Bước 2: Check permissions (nếu có)
 *
 * Luật:
 * - Không phải admin/employee → redirect về trang chủ
 * - Là admin/employee nhưng không có quyền → redirect về /admin
 */
export default function AdminGuard({
  children,
  permissions = [],
  requireAllPermissions = true,
  redirectToHome = false,
}: AdminGuardProps) {
  const { user, isAuthenticated, isInitialized, loading } = useAuth();
  const { can, isLoading: permissionsLoading } = usePermissions();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Đợi auth và permissions khởi tạo xong
    if (!isInitialized || permissionsLoading || loading) {
      return;
    }

    // Bước 1: Check authentication
    if (!isAuthenticated || !user) {
      console.log("❌ Not authenticated, redirecting to login");
      router.push("/dang-nhap");
      return;
    }

    // Bước 2: Check role (admin hoặc employee)
    const hasValidRole = user.role === "admin" || user.role === "employee";
    if (!hasValidRole) {
      console.log("❌ Invalid role, redirecting to home");
      router.push("/");
      return;
    }

    // Bước 3: Check permissions (nếu có yêu cầu)
    if (permissions.length > 0) {
      const hasPermissions = requireAllPermissions
        ? permissions.every((permission) => can(permission))
        : permissions.some((permission) => can(permission));

      if (!hasPermissions) {
        console.log(
          "❌ No permissions, redirecting based on redirectToHome flag"
        );
        const redirectPath = redirectToHome ? "/" : "/admin";
        router.push(redirectPath);
        return;
      }
    }

    // Tất cả kiểm tra đều pass
    setIsChecking(false);
  }, [
    user,
    isAuthenticated,
    isInitialized,
    loading,
    permissionsLoading,
    permissions,
    requireAllPermissions,
    redirectToHome,
    can,
    router,
  ]);

  // Hiển thị loading khi đang kiểm tra
  if (isChecking || !isInitialized || permissionsLoading || loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper components cho các trường hợp thường dùng

/**
 * Chỉ check role, không check permission
 */
export function AdminRoleOnlyGuard({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}

/**
 * Check role + permission cụ thể
 */
export function AdminPermissionGuard({
  children,
  permission,
  redirectToHome = false,
}: {
  children: ReactNode;
  permission: string;
  redirectToHome?: boolean;
}) {
  return (
    <AdminGuard permissions={[permission]} redirectToHome={redirectToHome}>
      {children}
    </AdminGuard>
  );
}

/**
 * Check role + nhiều permissions (cần tất cả)
 */
export function AdminMultiPermissionGuard({
  children,
  permissions,
  redirectToHome = false,
}: {
  children: ReactNode;
  permissions: string[];
  redirectToHome?: boolean;
}) {
  return (
    <AdminGuard
      permissions={permissions}
      requireAllPermissions={true}
      redirectToHome={redirectToHome}
    >
      {children}
    </AdminGuard>
  );
}

/**
 * Check role + ít nhất 1 trong các permissions
 */
export function AdminAnyPermissionGuard({
  children,
  permissions,
  redirectToHome = false,
}: {
  children: ReactNode;
  permissions: string[];
  redirectToHome?: boolean;
}) {
  return (
    <AdminGuard
      permissions={permissions}
      requireAllPermissions={false}
      redirectToHome={redirectToHome}
    >
      {children}
    </AdminGuard>
  );
}
