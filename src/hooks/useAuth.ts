import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  logoutAllAsync,
  updateProfileAsync,
  clearError,
  type UserRole,
} from "@/store/slices/authSlice";
import { LoginRequest, RegisterRequest } from "@/services/authService";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

/**
 * Enhanced authentication hook that provides complete auth functionality
 * Note: Authentication initialization is handled by ReduxProvider
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Get auth state from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);

  // Login handler
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const result = await dispatch(loginAsync(credentials)).unwrap();
        showSuccessToast("Đăng nhập thành công!");
        return { success: true, data: result };
      } catch (error: unknown) {
        showErrorToast(error, "Đăng nhập thất bại");
        return { success: false, error };
      }
    },
    [dispatch]
  );

  // Register handler
  const register = useCallback(
    async (userData: RegisterRequest) => {
      try {
        const result = await dispatch(registerAsync(userData)).unwrap();
        showSuccessToast("Đăng ký thành công!");
        return { success: true, data: result };
      } catch (error: unknown) {
        showErrorToast(error, "Đăng ký thất bại");
        return { success: false, error };
      }
    },
    [dispatch]
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      showSuccessToast("Đăng xuất thành công");
      return true;
    } catch (error: unknown) {
      showErrorToast(error, "Đã xảy ra lỗi khi đăng xuất");
      return false;
    }
  }, [dispatch]);

  // Logout from all devices handler
  const logoutAll = useCallback(async () => {
    try {
      await dispatch(logoutAllAsync()).unwrap();
      showSuccessToast("Đã đăng xuất khỏi tất cả thiết bị");
      return true;
    } catch (error: unknown) {
      showErrorToast(error, "Đã xảy ra lỗi khi đăng xuất");
      return false;
    }
  }, [dispatch]);

  // Update profile handler
  const updateProfile = useCallback(
    async (profileData: {
      username?: string;
      phoneNumber?: string;
      avatar?: string;
    }) => {
      try {
        const result = await dispatch(updateProfileAsync(profileData)).unwrap();
        showSuccessToast("Cập nhật thông tin thành công");
        return { success: true, data: result };
      } catch (error: unknown) {
        showErrorToast(error, "Cập nhật thông tin thất bại");
        return { success: false, error };
      }
    },
    [dispatch]
  );

  // Clear any auth errors
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if user has specific role
  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user || !user.role) return false;

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole("admin");
  }, [hasRole]);

  // Check if user is employee
  const isEmployee = useCallback(() => {
    return hasRole("employee");
  }, [hasRole]);

  // Check if user has admin or employee role
  const hasAdminAccess = useCallback(() => {
    return hasRole(["admin", "employee"]);
  }, [hasRole]);

  // Get user role
  const getUserRole = useCallback(() => {
    return user?.role || null;
  }, [user]);

  // Check if user can access admin features
  const canAccessAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  // Check if user can access employee features
  const canAccessEmployee = useCallback(() => {
    return user?.role === "admin" || user?.role === "employee";
  }, [user]);

  // Redirect to login if authentication is required
  const requireAuth = useCallback(
    (redirectTo = "/dang-nhap") => {
      if (!isInitialized) return; // Wait until auth is initialized

      if (!isAuthenticated) {
        router.push(redirectTo);
      }
    },
    [isAuthenticated, isInitialized, router]
  );

  return {
    user,
    accessToken,
    isAuthenticated,
    loading,
    error,
    isInitialized,
    sessionExpired,
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    clearError: handleClearError,
    hasRole,
    isAdmin,
    isEmployee,
    hasAdminAccess,
    getUserRole,
    canAccessAdmin,
    canAccessEmployee,
    requireAuth,
  };
};

/**
 * Hook for protected pages that require authentication
 */
export const useProtectedRoute = (
  redirectTo = "/dang-nhap",
  requireAuthenticated = true
) => {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for initialization to complete before making redirect decisions
    if (!isInitialized) return;

    // Only redirect if:
    // 1. We require authentication
    // 2. User is not authenticated OR we don't have user data
    // 3. We're not already redirecting
    if (requireAuthenticated && (!isAuthenticated || !user) && !isRedirecting) {
      setIsRedirecting(true);
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    isInitialized,
    requireAuthenticated,
    redirectTo,
    router,
    isRedirecting,
    user,
  ]);

  return {
    isAuthenticated: isAuthenticated && !!user,
    isInitialized,
    loading: !isInitialized || isRedirecting,
  };
};

export default useAuth;
