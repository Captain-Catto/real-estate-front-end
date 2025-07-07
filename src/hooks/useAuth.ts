import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  logoutAllAsync,
  getProfileAsync,
  updateProfileAsync,
  initializeAuth,
  clearError,
  LoginRequest,
  RegisterRequest,
} from "@/store/slices/authSlice";
import { toast } from "sonner";

/**
 * Enhanced authentication hook that provides complete auth functionality
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Local initialization state
  const [isInitializing, setIsInitializing] = useState(true);

  // Get auth state from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const lastLoginTime = useAppSelector((state) => state.auth.lastLoginTime);

  // Initialize authentication state from localStorage - improved with better loading handling
  useEffect(() => {
    const initAuth = async () => {
      setIsInitializing(true);

      // Dispatch the action to initialize auth from localStorage
      await dispatch(initializeAuth());

      // If we're authenticated according to localStorage token but don't have user data, fetch it
      const token = localStorage.getItem("accessToken");
      if (token && !user) {
        try {
          await dispatch(getProfileAsync()).unwrap();
        } catch (error) {
          console.error(
            "Failed to fetch user profile during initialization:",
            error
          );
          // We'll handle this error silently - the auth state will be updated accordingly
        }
      }

      setIsInitializing(false);
    };

    initAuth();
  }, [dispatch, user]);

  // Important: Set initialization to false when user data is available
  useEffect(() => {
    if (user && isInitializing) {
      setIsInitializing(false);
    }
  }, [user, isInitializing]);

  // Derive a combined loading state that includes our local initialization
  // If user exists, we're not loading regardless of initialization state
  const isLoading = user ? false : loading || isInitializing;

  // Determine if the auth state is fully initialized
  const isInitialized =
    user || (!isInitializing && (Boolean(lastLoginTime) || !isAuthenticated));

  // Login handler
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const result = await dispatch(loginAsync(credentials)).unwrap();
        toast.success("Đăng nhập thành công!");
        return { success: true, data: result };
      } catch (error: any) {
        toast.error(error || "Đăng nhập thất bại");
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
        toast.success("Đăng ký thành công!");
        return { success: true, data: result };
      } catch (error: any) {
        toast.error(error || "Đăng ký thất bại");
        return { success: false, error };
      }
    },
    [dispatch]
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success("Đăng xuất thành công");
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất");
      return false;
    }
  }, [dispatch]);

  // Logout from all devices handler
  const logoutAll = useCallback(async () => {
    try {
      await dispatch(logoutAllAsync()).unwrap();
      toast.success("Đã đăng xuất khỏi tất cả thiết bị");
      return true;
    } catch (error) {
      console.error("Logout all error:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất");
      return false;
    }
  }, [dispatch]);

  // Update profile handler
  const updateProfile = useCallback(
    async (profileData: {
      username?: string;
      email?: string;
      phoneNumber?: string;
    }) => {
      try {
        const result = await dispatch(updateProfileAsync(profileData)).unwrap();
        toast.success("Cập nhật thông tin thành công");
        return { success: true, data: result };
      } catch (error: any) {
        toast.error(error || "Cập nhật thông tin thất bại");
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
    (role: string | string[]) => {
      if (!user || !user.role) return false;

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user]
  );

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
    isAuthenticated,
    loading: isLoading,
    error,
    isInitialized,
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    clearError: handleClearError,
    hasRole,
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
  const { isAuthenticated, isInitialized, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if:
    // 1. Authentication is fully initialized (not still loading)
    // 2. User is not authenticated (when we require authentication)
    // 3. We're not already redirecting
    if (
      isInitialized &&
      !loading &&
      requireAuthenticated &&
      !isAuthenticated &&
      !isRedirecting
    ) {
      setIsRedirecting(true);
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    isInitialized,
    loading,
    requireAuthenticated,
    redirectTo,
    router,
    isRedirecting,
  ]);

  return {
    isAuthenticated,
    isInitialized,
    loading: loading || !isInitialized || isRedirecting,
  };
};

export default useAuth;
