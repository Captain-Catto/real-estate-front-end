"use client";

import React, { ReactNode } from "react";
import { usePermissionChecker } from "@/utils/permissionChecker";

interface PermissionUIProps {
  permission:
    | "view"
    | "edit"
    | "create"
    | "delete"
    | "approve"
    | "reject"
    | string;
  resource: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component bảo vệ UI dựa trên quyền
 * Chỉ hiển thị nội dung khi người dùng có quyền tương ứng
 *
 * @example
 * <PermissionUI permission="edit" resource="posts">
 *   <EditButton />
 * </PermissionUI>
 */
export default function PermissionUI({
  permission,
  resource,
  children,
  fallback = null,
}: PermissionUIProps) {
  const { canView, canEdit, canDelete, canCreate, canPerform, isAdmin } =
    usePermissionChecker();

  // Admin luôn có đầy đủ quyền
  if (isAdmin) {
    return <>{children}</>;
  }

  let hasPermission = false;

  // Kiểm tra quyền dựa trên loại
  switch (permission) {
    case "view":
      hasPermission = canView(resource);
      break;
    case "edit":
      hasPermission = canEdit(resource);
      break;
    case "create":
      hasPermission = canCreate(resource);
      break;
    case "delete":
      hasPermission = canDelete(resource);
      break;
    default:
      // Các quyền tùy chỉnh khác
      hasPermission = canPerform(
        permission.includes(`_${resource}`)
          ? permission
          : `${permission}_${resource}`
      );
      break;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component hiển thị nội dung chỉ dành cho Admin
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin } = usePermissionChecker();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}
