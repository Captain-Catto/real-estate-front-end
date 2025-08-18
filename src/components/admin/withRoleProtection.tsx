"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showErrorToast } from "@/utils/errorHandler";

interface WithRoleProtectionOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
  showToast?: boolean;
  loadingComponent?: React.ComponentType;
  unauthorizedComponent?: React.ComponentType;
}

/**
 * Higher Order Component để bảo vệ component theo role
 * @param Component - Component cần bảo vệ
 * @param options - Tùy chọn cấu hình
 * @returns Protected component
 */
export function withRoleProtection<T extends object>(
  Component: React.ComponentType<T>,
  options: WithRoleProtectionOptions
) {
  const {
    allowedRoles,
    redirectTo = "/",
    showToast = true,
    loadingComponent: LoadingComponent,
    unauthorizedComponent: UnauthorizedComponent,
  } = options;

  return function ProtectedComponent(props: T) {
    const { isAuthenticated, isInitialized, hasRole } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (!isInitialized) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        if (showToast) {
          showErrorToast("Vui lòng đăng nhập để tiếp tục");
        }
        router.push("/dang-nhap");
        return;
      }

      // If user doesn't have required role
      if (!hasRole(allowedRoles)) {
        if (showToast) {
          showErrorToast("Bạn không có quyền truy cập vào trang này");
        }
        router.push(redirectTo);
        return;
      }

      setIsChecking(false);
    }, [isAuthenticated, isInitialized, hasRole, router]);

    // Show loading while checking
    if (!isInitialized || isChecking) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }

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

    // If not authenticated or no permission
    if (!isAuthenticated || !hasRole(allowedRoles)) {
      if (UnauthorizedComponent) {
        return <UnauthorizedComponent />;
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

    return <Component {...props} />;
  };
}

// Utility HOCs for common roles
export function withAdminProtection<T extends object>(
  Component: React.ComponentType<T>,
  options?: Omit<WithRoleProtectionOptions, "allowedRoles">
) {
  return withRoleProtection(Component, {
    allowedRoles: ["admin"],
    ...options,
  });
}

export function withEmployeeProtection<T extends object>(
  Component: React.ComponentType<T>,
  options?: Omit<WithRoleProtectionOptions, "allowedRoles">
) {
  return withRoleProtection(Component, {
    allowedRoles: ["admin", "employee"],
    ...options,
  });
}

export function withUserProtection<T extends object>(
  Component: React.ComponentType<T>,
  options?: Omit<WithRoleProtectionOptions, "allowedRoles">
) {
  return withRoleProtection(Component, {
    allowedRoles: ["user", "admin", "employee"],
    ...options,
  });
}

// Example usage:
// const ProtectedAdminPage = withAdminProtection(AdminPage);
// const ProtectedEmployeePage = withEmployeeProtection(EmployeePage);
// const ProtectedUserPage = withUserProtection(UserPage);

export default withRoleProtection;
