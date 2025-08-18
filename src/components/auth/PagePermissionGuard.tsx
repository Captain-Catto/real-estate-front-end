"use client";

/**
 * @deprecated This component is deprecated. Please use ProtectionGuard from "@/components/auth/ProtectionGuard" instead.
 *
 * Migration example:
 * // OLD
 * <PagePermissionGuard permissions={["users.view"]}>
 *
 * // NEW
 * <PagePermissionGuard permissions={["users.view"]}> // from ProtectionGuard
 * // or
 * <ProtectionGuard permissions={["users.view"]} isPageGuard>
 */

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showErrorToast } from "@/utils/errorHandler";
import { useAuth } from "@/hooks/useAuth";

interface PagePermissionGuardProps {
  children: ReactNode;
  permissions: string[];
  redirectTo?: string;
  showToast?: boolean;
  requireAll?: boolean; // Yêu cầu có tất cả quyền hay chỉ cần một
}

/**
 * Component bảo vệ quyền truy cập toàn trang
 * Chuyển hướng người dùng nếu không đủ quyền
 */
export function PagePermissionGuard({
  children,
  permissions,
  redirectTo = "/admin",
  showToast = true,
  requireAll = true, // Mặc định yêu cầu tất cả quyền
}: PagePermissionGuardProps) {
  const { user } = useAuth();
  const { canAll, canAny, isAdmin, isLoading } = usePermissions();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Đợi permissions được tải xong trước
    if (isLoading) {
      return;
    }

    // Nếu không có user, chuyển hướng về login
    if (!user) {
      if (showToast) {
        showErrorToast("Vui lòng đăng nhập để tiếp tục");
      }
      router.replace("/dang-nhap");
      return;
    }

    // Admin luôn có quyền truy cập
    if (isAdmin) {
      setIsChecking(false);
      return;
    }

    // Nếu không yêu cầu quyền cụ thể, cho phép truy cập
    if (permissions.length === 0) {
      setIsChecking(false);
      return;
    }

    // Kiểm tra quyền theo yêu cầu
    const hasPermission = requireAll
      ? canAll(permissions)
      : canAny(permissions);

    if (!hasPermission) {
      if (showToast) {
        showErrorToast("Bạn không có quyền truy cập trang này");
      }
      router.replace(redirectTo);
      return;
    }

    setIsChecking(false);
  }, [
    user?.id, // Chỉ theo dõi user ID thay vì toàn bộ user object
    isAdmin,
    permissions, // Array của strings, stable reference
    requireAll,
    router,
    redirectTo,
    showToast,
    isLoading,
    canAll,
    canAny,
  ]);

  if (isChecking || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook để kiểm tra và chuyển hướng người dùng nếu không có đủ quyền
 * Sử dụng trong các trang cần quyền truy cập
 */
export function usePagePermissionCheck(
  permissions: string[],
  options = {
    redirectTo: "/admin",
    showToast: true,
    requireAll: true,
  }
) {
  const { canAll, canAny, isAdmin, isLoading } = usePermissions();
  const { user } = useAuth();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const { redirectTo, showToast, requireAll } = options;

  useEffect(() => {
    // Nếu không có user, chuyển hướng về login
    if (!user) {
      if (showToast) {
        showErrorToast("Vui lòng đăng nhập để tiếp tục");
      }
      router.replace("/dang-nhap");
      return;
    }

    // Admin luôn có quyền truy cập
    if (isAdmin) {
      setHasPermission(true);
      setIsChecking(false);
      return;
    }

    // Đợi permissions được tải xong cho user không phải admin
    if (isLoading) {
      return;
    }

    // Kiểm tra quyền theo yêu cầu
    const permitted =
      permissions.length === 0
        ? true
        : requireAll
        ? canAll(permissions)
        : canAny(permissions);

    setHasPermission(permitted);

    if (!permitted) {
      if (showToast) {
        showErrorToast("Bạn không có quyền truy cập trang này");
      }
      router.replace(redirectTo);
      return;
    }

    setIsChecking(false);
  }, [
    user,
    isAdmin,
    canAll,
    canAny,
    permissions,
    router,
    redirectTo,
    showToast,
    requireAll,
    isLoading,
  ]);

  return { hasPermission, isChecking };
}
