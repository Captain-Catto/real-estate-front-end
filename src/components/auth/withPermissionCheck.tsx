"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ComponentType } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import AccessDeniedPage from "@/components/auth/AccessDeniedPage";

// Khai báo prop types cho HOC
export interface WithPermissionCheckProps {
  hasAccess: boolean;
  permittedActions: string[];
}

// Định nghĩa interface cho metadata của menu item
interface MenuItemMetadata {
  isGroup?: boolean;
  icon?: string;
  badge?: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * HOC kiểm tra phân quyền truy cập trang và chức năng
 * @param WrappedComponent Component cần kiểm tra quyền
 * @param requiredPermissions Các quyền cần thiết (tùy chọn)
 */
export function withPermissionCheck<P extends WithPermissionCheckProps>(
  WrappedComponent: ComponentType<P>,
  requiredPermissions: string[] = []
) {
  return function WithPermissionCheckWrapper(
    props: Omit<P, keyof WithPermissionCheckProps>
  ) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { flatMenuItems, loading: configLoading } = useSidebar();

    const [permittedActions, setPermittedActions] = useState<string[]>([]);
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);

    // Lấy danh sách các quyền cần kiểm tra
    const permissionsToCheck = requiredPermissions;

    useEffect(() => {
      const checkPermission = async () => {
        // Đang kiểm tra đăng nhập hoặc cấu hình
        if (authLoading || configLoading) {
          return;
        }

        // Không đăng nhập -> chuyển hướng login
        if (!isAuthenticated || !user) {
          router.push("/login");
          return;
        }

        // Quản trị viên luôn có quyền truy cập
        if (user.role === "admin") {
          setHasAccess(true);
          // Admin có tất cả các quyền
          setPermittedActions(permissionsToCheck);
          setIsChecking(false);
          return;
        }

        // Kiểm tra người dùng có quyền truy cập trang theo sidebar
        const currentMenuItem = flatMenuItems.find(
          (item) => item.path === pathname
        );

        // Nếu không tìm thấy menu hoặc không có quyền
        if (
          !currentMenuItem ||
          !currentMenuItem.allowedRoles.includes(
            user.role as "admin" | "employee"
          )
        ) {
          setHasAccess(false);
          setPermittedActions([]);
          setIsChecking(false);
          return;
        }

        // Có quyền truy cập trang
        setHasAccess(true);

        // Kiểm tra quyền với các action cụ thể
        // Giả sử mỗi menuItem có thể có permissions là mảng các quyền
        const menuMetadata =
          (currentMenuItem.metadata as MenuItemMetadata) || {};
        const menuPermissions = menuMetadata.permissions || [];

        // Filter các quyền được phép từ danh sách quyền yêu cầu
        const userPermittedActions = permissionsToCheck.filter((perm) => {
          // Admin có tất cả quyền
          if (user.role === "admin") return true;

          // Employee chỉ có các quyền được định nghĩa trong menu
          return (
            Array.isArray(menuPermissions) && menuPermissions.includes(perm)
          );
        });

        setPermittedActions(userPermittedActions);
        setIsChecking(false);
      };

      checkPermission();
    }, [
      authLoading,
      configLoading,
      isAuthenticated,
      user,
      router,
      pathname,
      flatMenuItems,
      permissionsToCheck,
    ]);

    // Đang kiểm tra quyền
    if (isChecking || authLoading || configLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-3 text-sm text-gray-600">
              Đang kiểm tra quyền truy cập...
            </div>
          </div>
        </div>
      );
    }

    // Không có quyền truy cập
    if (!hasAccess) {
      return <AccessDeniedPage />;
    }

    // Có quyền truy cập, truyền quyền cụ thể vào component
    return (
      <WrappedComponent
        {...(props as P)}
        hasAccess={hasAccess}
        permittedActions={permittedActions}
      />
    );
  };
}
