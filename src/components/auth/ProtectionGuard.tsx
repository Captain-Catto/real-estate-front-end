"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/utils/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/store/slices/authSlice";

export interface ProtectionOptions {
  // Authentication requirements
  requireAuth?: boolean;

  // Role-based protection
  roles?: UserRole[];
  requireAllRoles?: boolean; // If multiple roles, require ALL (default: false = ANY)

  // Permission-based protection
  permissions?: string[];
  requireAllPermissions?: boolean; // If multiple permissions, require ALL (default: true)

  // Behavior configuration
  redirectTo?: string;
  showToast?: boolean;
  fallback?: ReactNode;

  // Page vs Component mode
  isPageGuard?: boolean; // If true, will redirect. If false, will show fallback or null
}

interface ProtectionGuardProps extends ProtectionOptions {
  children: ReactNode;
}

/**
 * Unified Protection Guard - handles all authentication, role, and permission checking
 *
 * @example
 * // Basic authentication
 * <ProtectionGuard requireAuth>
 *   <UserContent />
 * </ProtectionGuard>
 *
 * @example
 * // Role-based protection
 * <ProtectionGuard roles={["admin"]}>
 *   <AdminPanel />
 * </ProtectionGuard>
 *
 * @example
 * // Permission-based protection
 * <ProtectionGuard permissions={["users.view"]}>
 *   <UsersList />
 * </ProtectionGuard>
 *
 * @example
 * // Complex protection (admin OR has permission)
 * <ProtectionGuard
 *   roles={["admin"]}
 *   permissions={["users.delete"]}
 *   requireAllRoles={false}
 *   requireAllPermissions={false}
 * >
 *   <DeleteButton />
 * </ProtectionGuard>
 *
 * @example
 * // Page protection (will redirect)
 * <ProtectionGuard
 *   roles={["admin"]}
 *   isPageGuard
 *   redirectTo="/unauthorized"
 * >
 *   <AdminPage />
 * </ProtectionGuard>
 */
export default function ProtectionGuard({
  children,
  requireAuth = true,
  roles = [],
  requireAllRoles = false,
  permissions = [],
  requireAllPermissions = true,
  redirectTo = "/admin",
  showToast = true,
  fallback = null,
  isPageGuard = false,
}: ProtectionGuardProps) {
  const { user, isAuthenticated, isInitialized, loading } = useAuth();
  const {
    canAll,
    canAny,
    isAdmin,
    isLoading: permissionsLoading,
  } = usePermissions();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [initializationTimeout, setInitializationTimeout] = useState(false);

  // Timeout safeguard to prevent infinite initialization loops
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized || permissionsLoading || loading) {
        console.warn(
          "⚠️ Initialization timeout - forcing completion to prevent infinite loop"
        );
        setInitializationTimeout(true);
      }
    }, 10000); // 10 second timeout

    // Clear timeout when properly initialized
    if (isInitialized && !permissionsLoading && !loading) {
      clearTimeout(timeout);
      setInitializationTimeout(false);
    }

    return () => clearTimeout(timeout);
  }, [isInitialized, permissionsLoading, loading]);

  useEffect(() => {
    // Debug logging
    console.log("🔍 ProtectionGuard useEffect:", {
      isInitialized,
      permissionsLoading,
      isAuthenticated,
      user: user?.email,
      userRole: user?.role,
      isPageGuard,
      redirectTo,
    });

    // Wait for auth and permissions to be initialized (with timeout safeguard)
    if (
      (!isInitialized || permissionsLoading || loading) &&
      !initializationTimeout
    ) {
      console.log("⏳ Waiting for initialization...", {
        isInitialized,
        permissionsLoading,
        loading,
      });
      return;
    }

    // If we hit timeout, log warning but continue
    if (initializationTimeout) {
      console.warn("⚠️ Proceeding despite initialization timeout");
    }

    console.log("✅ Starting access check...");

    let accessGranted = true;
    let errorMessage = "";

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      accessGranted = false;
      errorMessage = "Vui lòng đăng nhập để tiếp tục";
      // Let the countdown logic handle the redirect instead of immediate redirect
    }

    // If not authenticated and auth is required, deny access
    if (requireAuth && !isAuthenticated) {
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    // If not authenticated and accessing admin area, use countdown before redirect
    if (!isAuthenticated) {
      const isAdminAreaAccess =
        redirectTo?.includes("/admin") ||
        window.location.pathname.includes("/admin");

      if (isAdminAreaAccess && isPageGuard) {
        accessGranted = false;
        errorMessage = "Vui lòng đăng nhập để truy cập khu vực quản trị";
        // Let the countdown logic handle the redirect
      }

      // If not accessing admin area and no auth required, allow access
      if (!requireAuth) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }
    }

    // If authenticated, perform role and permission checks
    if (isAuthenticated && user) {
      // Check if user is trying to access admin area but is not admin/employee
      const isAdminAreaAccess =
        redirectTo?.includes("/admin") ||
        window.location.pathname.includes("/admin");
      const isRegularUser = user?.role === "user" || !user?.role;

      if (isAdminAreaAccess && isRegularUser) {
        accessGranted = false;
        errorMessage = "Bạn không có quyền truy cập khu vực quản trị";
        // Don't redirect immediately, let the countdown logic handle it
      }

      // Admin bypass - admins have access to everything unless explicitly restricted
      if (isAdmin && (roles.length === 0 || roles.includes("admin"))) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Check role requirements
      if (roles.length > 0) {
        const roleCheck = requireAllRoles
          ? roles.every(
              (role) => user?.role === role || (role === "admin" && isAdmin)
            )
          : roles.some(
              (role) => user?.role === role || (role === "admin" && isAdmin)
            );

        if (!roleCheck) {
          accessGranted = false;
          errorMessage = "Bạn không có quyền truy cập vào trang này";
        }
      }

      // Check permission requirements (only if role check passed)
      if (accessGranted && permissions.length > 0) {
        // Admin bypass for permissions
        if (!isAdmin) {
          const permissionCheck = requireAllPermissions
            ? canAll(permissions)
            : canAny(permissions);

          if (!permissionCheck) {
            accessGranted = false;
            errorMessage = requireAllPermissions
              ? "Bạn không có đủ quyền để thực hiện hành động này"
              : "Bạn không có quyền để thực hiện hành động này";
          }
        }
      }
    }

    // Handle access denied
    if (!accessGranted) {
      if (isPageGuard) {
        if (showToast) showErrorToast(errorMessage);
        setHasAccess(false);
        setIsChecking(false);
        setShowUnauthorized(true);
        setCountdown(3); // Reset countdown to 3 seconds

        // Start 3-second countdown before redirect
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            const nextCount = prev - 1;

            if (nextCount <= 0) {
              clearInterval(countdownInterval);

              // Delay redirect slightly to show "0" for a moment
              setTimeout(() => {
                // Smart redirect logic after countdown
                if (isAuthenticated && user) {
                  const isRegularUser = user?.role === "user" || !user?.role;
                  const isAdminOrEmployee =
                    user?.role === "admin" || user?.role === "employee";
                  const isAdminAreaAccess =
                    redirectTo?.includes("/admin") ||
                    window.location.pathname.includes("/admin");

                  if (isRegularUser && isAdminAreaAccess) {
                    // Regular users accessing admin area -> redirect to homepage
                    router.push("/");
                  } else if (isAdminOrEmployee && isAdminAreaAccess) {
                    // Admin/employee with insufficient permissions -> redirect to admin dashboard
                    router.push("/admin");
                  } else {
                    // Fallback to homepage for other cases
                    router.push("/");
                  }
                } else {
                  // Not authenticated -> redirect to login
                  router.push("/dang-nhap");
                }
              }, 200); // Small delay to show "0" briefly

              return 0;
            }

            return nextCount;
          });
        }, 1000);

        // Cleanup function
        return () => {
          clearInterval(countdownInterval);
        };
      }
    }

    console.log("🎯 Final access decision:", { accessGranted, errorMessage });

    setHasAccess(accessGranted);
    setIsChecking(false);

    console.log("✅ ProtectionGuard check complete:", {
      hasAccess: accessGranted,
      isChecking: false,
    });
  }, [
    isAuthenticated,
    isInitialized,
    loading,
    permissionsLoading,
    user?.email,
    user?.role,
    isAdmin,
    requireAuth,
    isPageGuard,
    redirectTo,
    showToast,
    initializationTimeout,
  ]);

  // Show loading while checking (unless timeout occurred)
  if (
    (!isInitialized || permissionsLoading || loading || isChecking) &&
    !initializationTimeout
  ) {
    if (isPageGuard) {
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

    // For component guards, show nothing while loading
    return null;
  }

  // If access denied, show fallback or nothing
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (isPageGuard) {
      // Show unauthorized message with countdown if access denied
      if (showUnauthorized && countdown > 0) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md p-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Bạn không có quyền truy cập trang này
              </h1>
              <p className="text-gray-600 mb-6">
                Để truy cập trang này, bạn cần có quyền tương ứng. Vui lòng liên
                hệ quản trị viên để được cấp quyền.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  Đang chuyển hướng trong{" "}
                  <span className="font-bold text-lg">{countdown}</span> giây...
                </p>
              </div>
            </div>
          </div>
        );
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

    return null;
  }

  // Access granted
  return <>{children}</>;
}

/**
 * Convenience components for common protection patterns
 */

// Page-level guards (will redirect on access denied)
export function PageProtectionGuard(
  props: Omit<ProtectionGuardProps, "isPageGuard">
) {
  return <ProtectionGuard {...props} isPageGuard />;
}

// Basic authentication guard
export function AuthGuard(props: Omit<ProtectionGuardProps, "requireAuth">) {
  return <ProtectionGuard {...props} requireAuth />;
}

// Role-based guards
export function AdminGuard(props: Omit<ProtectionGuardProps, "roles">) {
  return <ProtectionGuard {...props} roles={["admin"]} />;
}

export function EmployeeGuard(props: Omit<ProtectionGuardProps, "roles">) {
  return <ProtectionGuard {...props} roles={["admin", "employee"]} />;
}

export function UserGuard(props: Omit<ProtectionGuardProps, "roles">) {
  return <ProtectionGuard {...props} roles={["admin", "employee"]} />;
}

// Permission-based guards
export function PermissionGuard({
  permission,
  ...props
}: Omit<ProtectionGuardProps, "permissions"> & { permission?: string }) {
  const permissions = permission ? [permission] : [];
  return <ProtectionGuard {...props} permissions={permissions} />;
}

// Page-level permission guard
export function PagePermissionGuard({
  permission,
  permissions,
  ...props
}: Omit<ProtectionGuardProps, "isPageGuard"> & {
  permission?: string;
  permissions?: string[];
}) {
  const permissionList = permission ? [permission] : permissions || [];
  return (
    <ProtectionGuard {...props} permissions={permissionList} isPageGuard />
  );
}

// Optional auth (user info if present, but not required)
export function OptionalAuthGuard(
  props: Omit<ProtectionGuardProps, "requireAuth">
) {
  return <ProtectionGuard {...props} requireAuth={false} />;
}
