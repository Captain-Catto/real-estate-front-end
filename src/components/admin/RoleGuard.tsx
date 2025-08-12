"use client";

/**
 * @deprecated This component is deprecated. Please use ProtectionGuard from "@/components/auth/ProtectionGuard" instead.
 *
 * Migration example:
 * // OLD
 * <RoleGuard allowedRoles={["admin"]} redirectTo="/unauthorized">
 *
 * // NEW
 * <AdminGuard isPageGuard redirectTo="/unauthorized"> // from ProtectionGuard
 * // or
 * <ProtectionGuard roles={["admin"]} isPageGuard redirectTo="/unauthorized">
 */

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  showToast?: boolean;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/",
  fallback,
  showToast = true,
}: RoleGuardProps) {
  const { isAuthenticated, isInitialized, hasRole, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isInitialized || loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      if (showToast) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
      }
      router.push("/dang-nhap");
      return;
    }

    // If user doesn't have required role
    if (!hasRole(allowedRoles)) {
      if (showToast) {
        toast.error("Bạn không có quyền truy cập vào trang này");
      }
      router.push(redirectTo);
      return;
    }

    setIsChecking(false);
  }, [
    isAuthenticated,
    isInitialized,
    loading,
    hasRole,
    allowedRoles,
    redirectTo,
    router,
    showToast,
  ]);

  // Show loading while checking
  if (!isInitialized || loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">
            Đang kiểm tra quyền truy cập...
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated or no permission, show fallback
  if (!isAuthenticated || !hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">
            Bạn không có quyền truy cập
          </div>
          <div className="mt-2 text-gray-600">
            Vui lòng liên hệ quản trị viên để được hỗ trợ
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook để kiểm tra role trong component
export function useRoleCheck(allowedRoles: UserRole[]) {
  const { hasRole, isAuthenticated, isInitialized } = useAuth();

  const hasPermission = isAuthenticated && hasRole(allowedRoles);
  const isLoading = !isInitialized;

  return {
    hasPermission,
    isLoading,
    isAuthenticated,
  };
}

// Utility components for common roles
export function AdminGuard({
  children,
  ...props
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["admin"]} {...props}>
      {children}
    </RoleGuard>
  );
}

export function EmployeeGuard({
  children,
  ...props
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["admin", "employee"]} {...props}>
      {children}
    </RoleGuard>
  );
}

export function UserGuard({
  children,
  ...props
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["admin", "employee"]} {...props}>
      {children}
    </RoleGuard>
  );
}
