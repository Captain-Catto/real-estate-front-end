"use client";

/**
 * @deprecated This component is deprecated. Please use ProtectionGuard from "@/components/auth/ProtectionGuard" instead.
 *
 * Migration example:
 * // OLD
 * <PermissionGuard permission="users.edit" fallback={<div>No access</div>}>
 *
 * // NEW
 * <PermissionGuard permission="users.edit" fallback={<div>No access</div>}> // from ProtectionGuard
 * // or
 * <ProtectionGuard permissions={["users.edit"]} fallback={<div>No access</div>}>
 */

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Component bảo vệ quyền truy cập
 * Chỉ hiển thị nội dung khi người dùng có quyền
 *
 * @example
 * <PermissionGuard permission="edit_user">
 *   <button>Chỉnh sửa</button>
 * </PermissionGuard>
 *
 * @example
 * <PermissionGuard permissions={["delete_user", "change_user_role"]} requireAll={false}>
 *   <div>Chỉ cần một trong hai quyền</div>
 * </PermissionGuard>
 */
export default function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = true,
  fallback = null,
}: PermissionGuardProps) {
  const { can, canAll, canAny, isAdmin } = usePermissions();

  // Admin luôn có mọi quyền
  if (isAdmin) {
    return <>{children}</>;
  }

  // Kiểm tra quyền đơn
  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  // Kiểm tra nhiều quyền
  if (permissions.length > 0) {
    const hasPermission = requireAll
      ? canAll(permissions)
      : canAny(permissions);

    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  // Có quyền
  return <>{children}</>;
}
