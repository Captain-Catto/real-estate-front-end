import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  logoutAllAsync,
  getProfileAsync,
  clearError,
  updateProfile,
  initializeAuth,
} from "./slices/authSlice";
import { useEffect, useState } from "react";

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth-specific hooks
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      // Kiểm tra token trong localStorage
      const token = localStorage.getItem("accessToken");

      if (token) {
        // Có token, khôi phục auth state và load profile
        dispatch(initializeAuth());

        try {
          // Load profile để xác thực token
          await dispatch(getProfileAsync()).unwrap();
        } catch (error) {
          // Token không hợp lệ, clear localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }

      setIsInitialized(true);
    };

    initAuth();
  }, [dispatch]);

  return {
    // State
    ...auth,
    isInitialized, // Thêm flag để biết đã khởi tạo xong chưa

    // Actions
    login: (credentials: { email: string; password: string }) =>
      dispatch(loginAsync(credentials)),

    register: (userData: {
      username: string;
      email: string;
      password: string;
    }) => dispatch(registerAsync(userData)),

    logout: () => dispatch(logoutAsync()),

    logoutAll: () => dispatch(logoutAllAsync()),

    getProfile: () => dispatch(getProfileAsync()),

    clearError: () => dispatch(clearError()),

    updateProfile: (profileData: any) => dispatch(updateProfile(profileData)),
  };
};
