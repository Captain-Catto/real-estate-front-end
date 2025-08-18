import { store } from "@/store";
import { setAccessToken } from "@/store/slices/authSlice";
import { showErrorToast } from "@/utils/errorHandler";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    user?: User;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      avatar?: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

// Helper function để lấy access token từ Redux store
export const getAccessToken = (): string | null => {
  const state = store.getState();
  return state.auth.accessToken;
};

// Helper function để handle API calls với token refresh
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    // Lấy token từ Redux store thay vì localStorage
    const token = getAccessToken();

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🌐 Fetching ${url.split("/").slice(-2).join("/")} (token ${
          token ? "exists" : "missing"
        })`
      );
    }

    // Handle Content-Type properly - don't set for FormData
    const isFormData = options.body instanceof FormData;

    // Build headers carefully
    const headers: HeadersInit = {};

    // Only add Content-Type for JSON requests
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    // Add Authorization if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;

      if (process.env.NODE_ENV === "development") {
        console.log(`🔒 Token being sent: ${token.substring(0, 20)}...`);
      }
    }

    // Merge with user-provided headers, but prioritize auth headers
    const mergedHeaders = {
      ...options.headers,
      ...headers,
    };

    // Create the request config
    const requestConfig: RequestInit = {
      ...options,
      headers: mergedHeaders,
      credentials: "include",
    };

    const response = await fetch(url, requestConfig);

    // Handle 401 Unauthorized error - but avoid infinite loops
    if (response.status === 401) {
      console.log("🔄 Got 401, attempting token refresh...");

      // Add flag to prevent infinite retry loops
      const alreadyRetried = (
        options as RequestInit & { _authRetried?: boolean }
      )._authRetried;
      if (alreadyRetried) {
        console.log(
          "❌ Already retried auth, not retrying again to prevent loop"
        );
        // Clear token and redirect if in browser
        store.dispatch(setAccessToken(null));
        if (typeof window !== "undefined" && !url.includes("/admin/")) {
          setTimeout(() => {
            window.location.href = "/dang-nhap?session=expired";
          }, 1000);
        }
        return response;
      }

      try {
        const refreshed = await refreshToken();

        if (refreshed) {
          console.log("✅ Token refreshed, retrying original request...");
          // Get new token from Redux store and retry
          const newToken = getAccessToken();

          if (newToken) {
            const newHeaders = {
              ...mergedHeaders,
              Authorization: `Bearer ${newToken}`,
            };

            // Mark this request as already retried to prevent infinite loops
            const retryConfig: RequestInit & { _authRetried?: boolean } = {
              ...requestConfig,
              headers: newHeaders,
              _authRetried: true,
            };

            return fetch(url, retryConfig);
          }
        } else {
          console.log("❌ Token refresh failed");
          // Clear token on failed refresh
          store.dispatch(setAccessToken(null));

          // Only redirect from browser context and for non-admin API calls
          if (typeof window !== "undefined" && !url.includes("/admin/")) {
            setTimeout(() => {
              window.location.href = "/dang-nhap?session=expired";
            }, 1000);
          }
        }
      } catch (refreshError) {
        console.error("❌ Token refresh error:", refreshError);
        store.dispatch(setAccessToken(null));
      }
    }

    return response;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    showErrorToast(error, "Lỗi kết nối đến máy chủ");
  }
};

// Refresh token function
export const refreshToken = async (): Promise<boolean> => {
  try {
    console.log("🔄 Attempting to refresh access token...");

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    console.log(`📊 Refresh token response status: ${response.status}`);

    if (!response.ok) {
      // Don't log errors for 401 or 403 status - these are expected when user is not logged in
      // or refresh token is expired/invalid
      if (response.status !== 401 && response.status !== 403) {
        console.error(`❌ Unexpected refresh token error: ${response.status}`);
        showErrorToast("Lỗi làm mới token đăng nhập");
      } else {
        console.log("ℹ️ Refresh token expired or invalid, user needs to login");
      }
      store.dispatch(setAccessToken(null));
      return false;
    }

    const data = await response.json();

    if (data.success && data.data?.accessToken) {
      console.log("✅ Access token refreshed successfully");
      // Lưu token mới vào Redux store
      store.dispatch(setAccessToken(data.data.accessToken));
      return true;
    }

    console.log("❌ Invalid refresh token response structure");
    store.dispatch(setAccessToken(null));
    return false;
  } catch (error: unknown) {
    // Only log unexpected errors (not 401s)
    console.error("❌ Refresh token request failed:", error);
    showErrorToast(error, "Lỗi làm mới token đăng nhập");
    store.dispatch(setAccessToken(null));
    return false;
  }
};

// Add profile caching to prevent infinite API calls
let profileCache: {
  data: ProfileResponse;
  timestamp: number;
} | null = null;

// Profile cache duration (5 minutes)
const PROFILE_CACHE_DURATION = 5 * 60 * 1000;

// Track ongoing profile requests
let isProfileFetching = false;

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Để nhận httpOnly cookie
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.data.accessToken) {
        // Không lưu access token vào localStorage - sẽ được lưu trong Redux thông qua loginAsync

        // Lấy thông tin user ngay sau khi login - pass token trực tiếp
        const profileResponse = await this.getProfileWithToken(
          data.data.accessToken
        );

        return {
          success: true,
          message: data.message,
          data: {
            accessToken: data.data.accessToken,
            user:
              profileResponse.success && profileResponse.data
                ? profileResponse.data.user
                : undefined,
          },
        };
      }

      return data;
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Đăng nhập thất bại",
      };
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Để nhận httpOnly cookie
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.data.accessToken) {
        // Không lưu access token vào localStorage - sẽ được lưu trong Redux thông qua registerAsync

        // Lấy thông tin user ngay sau khi register
        const profileResponse = await this.getProfile();

        return {
          success: true,
          message: data.message,
          data: {
            accessToken: data.data.accessToken,
            user: profileResponse.success
              ? profileResponse.data.user
              : undefined,
          },
        };
      }

      return data;
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Đăng ký thất bại",
      };
    }
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Gửi httpOnly cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // Luôn clear localStorage và Redux store
      store.dispatch(setAccessToken(null));

      // Clear cache
      profileCache = null;

      return data;
    } catch {
      // Clear cache
      profileCache = null;
      // Vẫn clear Redux store nếu có lỗi
      store.dispatch(setAccessToken(null));
      return {
        success: true,
        message: "Đăng xuất thành công",
      };
    }
  },

  async logoutAll(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout-all`, {
        method: "POST",
        credentials: "include", // Gửi httpOnly cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // Luôn clear Redux store
      store.dispatch(setAccessToken(null));

      // Clear cache
      profileCache = null;

      return data;
    } catch {
      // Vẫn clear Redux store nếu có lỗi
      store.dispatch(setAccessToken(null));
      return {
        success: true,
        message: "Đăng xuất khỏi tất cả thiết bị thành công",
      };
    }
  },

  async getProfile(): Promise<ProfileResponse> {
    try {
      // Return cached profile if still valid
      if (
        profileCache &&
        Date.now() - profileCache.timestamp < PROFILE_CACHE_DURATION
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log("📄 Using cached profile data");
        }
        return profileCache.data;
      }

      // Handle concurrent requests - prevent multiple simultaneous calls
      if (isProfileFetching) {
        if (process.env.NODE_ENV === "development") {
          console.log("⏳ Profile request already in progress, waiting...");
        }
        const startTime = Date.now();
        while (isProfileFetching && Date.now() - startTime < 5000) {
          // Increased timeout to 5s
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // If cache was populated during wait, return it
        if (profileCache) {
          console.log("📄 Returning profile data populated during wait");
          return profileCache.data;
        }

        // If still no cache after waiting, proceed with fresh request
        console.log("⚠️ No cache after wait, proceeding with fresh request");
      }

      // Set fetching flag
      isProfileFetching = true;

      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Fetching fresh profile data");
      }
      const response = await fetchWithAuth(`${API_BASE_URL}/auth/profile`);

      if (!response) {
        console.error("❌ No response received from profile endpoint");
        throw new Error("No response received");
      }

      if (!response.ok) {
        const data = await response.json();
        showErrorToast(data.message || "Không thể lấy thông tin profile");
        throw new Error(data.message || "Failed to get profile");
      }

      const data = await response.json();

      // Cache the successful response
      profileCache = {
        data,
        timestamp: Date.now(),
      };

      return data;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        !error.message.includes("No response received")
      ) {
        showErrorToast(error.message);
      }
      throw new Error(
        error instanceof Error ? error.message : "Lỗi khi lấy thông tin profile"
      );
    } finally {
      isProfileFetching = false;
    }
  },

  // Get profile với token được pass trực tiếp (dùng trong login flow)
  async getProfileWithToken(token: string): Promise<AuthResponse> {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Fetching fresh profile data with provided token");
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        showErrorToast(data.message || "Không thể lấy thông tin profile");
        throw new Error(data.message || "Failed to get profile");
      }

      return data;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        !error.message.includes("Failed to get profile")
      ) {
        showErrorToast(error.message);
      }
      throw new Error(
        error instanceof Error ? error.message : "Lỗi khi lấy thông tin profile"
      );
    }
  },

  // Clear profile cache when updating profile
  async updateProfile(profileData: {
    username?: string;
    phoneNumber?: string;
    avatar?: string;
  }): Promise<UpdateProfileResponse> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      if (!response) {
        showErrorToast("Không thể kết nối đến máy chủ");
        throw new Error("No response received");
      }

      if (!response.ok) {
        const data = await response.json();
        showErrorToast(data.message || "Cập nhật profile thất bại");
        throw new Error(data.message || "Failed to update profile");
      }

      const data = await response.json();

      // Clear the profile cache
      profileCache = null;

      return data;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        !error.message.includes("No response received")
      ) {
        showErrorToast(error.message);
      }
      throw new Error(
        error instanceof Error ? error.message : "Cập nhật profile thất bại"
      );
    }
  },

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ChangePasswordResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "PUT",
          body: JSON.stringify(passwordData),
        }
      );

      if (!response) {
        showErrorToast("Không thể kết nối đến máy chủ");
        throw new Error("No response received");
      }

      if (!response.ok) {
        const data = await response.json();
        showErrorToast(data.message || "Đổi mật khẩu thất bại");
        throw new Error(data.message || "Failed to change password");
      }

      const data = await response.json();

      return data;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        !error.message.includes("No response received")
      ) {
        showErrorToast(error.message);
      }
      throw new Error(
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại"
      );
    }
  },

  async deleteAccount(password: string): Promise<DeleteAccountResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/auth/delete-account`,
        {
          method: "DELETE",
          body: JSON.stringify({ password }),
        }
      );

      if (!response) {
        showErrorToast("Không thể kết nối đến máy chủ");
        throw new Error("No response received");
      }

      if (!response.ok) {
        const data = await response.json();
        showErrorToast(data.message || "Xóa tài khoản thất bại");
        throw new Error(data.message || "Failed to delete account");
      }

      const data = await response.json();

      // Clear localStorage sau khi xóa tài khoản
      store.dispatch(setAccessToken(null));

      return data;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        !error.message.includes("No response received")
      ) {
        showErrorToast(error.message);
      }
      throw new Error(
        error instanceof Error ? error.message : "Xóa tài khoản thất bại"
      );
    }
  },

  // Forgot Password
  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Gửi email thất bại"
      );
    }
  },

  // Reset Password
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại"
      );
    }
  },
};
