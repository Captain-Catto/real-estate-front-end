import { usePermissions } from "@/hooks/usePermissions";
import { useCallback } from "react";
import React from "react";

/**
 * Hook kiểm tra quyền để hiển thị giao diện
 * Trả về các hàm tiện ích để kiểm tra quyền dễ dàng
 *
 * @example
 * const { canView, canEdit, canDelete, canCreate, canPerform } = usePermissionChecker();
 *
 * // Sử dụng trong JSX
 * {canEdit('posts') && <EditButton />}
 */
export const usePermissionChecker = () => {
  const { can, isAdmin } = usePermissions();

  /**
   * Kiểm tra quyền xem đối tượng
   * @param resource Tên tài nguyên (posts, users, projects,...)
   */
  const canView = useCallback(
    (resource: string) => {
      if (isAdmin) return true;
      return can(`view_${resource}`);
    },
    [can, isAdmin]
  );

  /**
   * Kiểm tra quyền chỉnh sửa đối tượng
   * @param resource Tên tài nguyên (posts, users, projects,...)
   */
  const canEdit = useCallback(
    (resource: string) => {
      if (isAdmin) return true;
      return can(`edit_${resource}`);
    },
    [can, isAdmin]
  );

  /**
   * Kiểm tra quyền xóa đối tượng
   * @param resource Tên tài nguyên (posts, users, projects,...)
   */
  const canDelete = useCallback(
    (resource: string) => {
      if (isAdmin) return true;
      return can(`delete_${resource}`);
    },
    [can, isAdmin]
  );

  /**
   * Kiểm tra quyền tạo mới đối tượng
   * @param resource Tên tài nguyên (posts, users, projects,...)
   */
  const canCreate = useCallback(
    (resource: string) => {
      if (isAdmin) return true;
      return can(`create_${resource}`);
    },
    [can, isAdmin]
  );

  /**
   * Kiểm tra quyền thực hiện một hành động cụ thể
   * @param action Tên hành động cụ thể (approve_post, reject_post,...)
   */
  const canPerform = useCallback(
    (action: string) => {
      if (isAdmin) return true;
      return can(action);
    },
    [can, isAdmin]
  );

  return {
    canView,
    canEdit,
    canDelete,
    canCreate,
    canPerform,
    isAdmin,
  };
};

/**
 * Hook để bọc các thành phần UI cần kiểm tra quyền truy cập
 */
export function usePermissionUI() {
  const { canView, canEdit, canDelete, canCreate, canPerform, isAdmin } =
    usePermissionChecker();

  /**
   * Render component chỉ khi có quyền, nếu không có quyền thì render fallback
   */
  const renderIfCan = useCallback(
    (
      permission: string,
      resource: string,
      component: React.ReactNode,
      fallback: React.ReactNode = null
    ) => {
      let hasPermission = false;

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
          hasPermission = canPerform(`${permission}_${resource}`);
          break;
      }

      return hasPermission ? component : fallback;
    },
    [canView, canEdit, canDelete, canCreate, canPerform]
  );

  return {
    renderIfCan,
    isAdmin,
  };
}
