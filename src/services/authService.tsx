export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

import { store } from "@/store";
import { setAccessToken } from "@/store/slices/authSlice";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    user?: any;
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
        `Fetching ${url.split("/").slice(-2).join("/")} (token ${
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

    // Handle 401 Unauthorized error
    if (response.status === 401) {
      try {
        const refreshed = await refreshToken();

        if (refreshed) {
          // Get new token from Redux store and retry
          const newToken = getAccessToken();

          if (newToken) {
            const newHeaders = {
              ...mergedHeaders,
              Authorization: `Bearer ${newToken}`,
            };

            return fetch(url, {
              ...requestConfig,
              headers: newHeaders,
            });
          }
        } else {
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
        console.error("Token refresh error:", refreshError);
      }
    }

    return response;
  } catch (error) {
    console.error("Network error in fetchWithAuth:", error);

    // Return a controlled error response
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Refresh token function
export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      // Don't log errors for 401 or 403 status - these are expected when user is not logged in
      // or refresh token is expired/invalid
      if (response.status !== 401 && response.status !== 403) {
        console.error(`Refresh token failed with status: ${response.status}`);
      }
      store.dispatch(setAccessToken(null));
      return false;
    }

    const data = await response.json();

    if (data.success && data.data?.accessToken) {
      // Lưu token mới vào Redux store
      store.dispatch(setAccessToken(data.data.accessToken));
      return true;
    }

    store.dispatch(setAccessToken(null));
    return false;
  } catch (error) {
    // Only log unexpected errors (not 401s)
    console.error("Refresh token error:", error);
    store.dispatch(setAccessToken(null));
    return false;
  }
};

// Add profile caching to prevent infinite API calls
let profileCache: {
  data: any;
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
                : null,
          },
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Đăng nhập thất bại",
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
            user: profileResponse.success ? profileResponse.data.user : null,
          },
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Đăng ký thất bại",
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
    } catch (error: any) {
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
    } catch (error: any) {
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
        // EMERGENCY FIX: Disable console.log to prevent infinite logging
        // console.log("Using cached profile data");
        return profileCache.data;
      }

      // Handle concurrent requests
      if (isProfileFetching) {
        // EMERGENCY FIX: Disable console.log to prevent infinite logging
        // console.log("Profile request already in progress");
        const startTime = Date.now();
        while (isProfileFetching && Date.now() - startTime < 3000) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // If cache was populated during wait, return it
        if (profileCache) {
          return profileCache.data;
        }
      }

      // Set fetching flag
      isProfileFetching = true;

      if (process.env.NODE_ENV === "development") {
        console.log("Fetching fresh profile data");
      }
      const response = await fetchWithAuth(`${API_BASE_URL}/auth/profile`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get profile");
      }

      // Cache the successful response
      profileCache = {
        data,
        timestamp: Date.now(),
      };

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi lấy thông tin profile");
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
        throw new Error(data.message || "Failed to get profile");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi lấy thông tin profile");
    }
  },

  // Clear profile cache when updating profile
  async updateProfile(profileData: {
    username?: string;
    phoneNumber?: string;
    avatar?: string;
  }): Promise<any> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Clear the profile cache
      profileCache = null;

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Cập nhật profile thất bại");
    }
  },

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "PUT",
          body: JSON.stringify(passwordData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Đổi mật khẩu thất bại");
    }
  },

  async deleteAccount(password: string): Promise<any> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/auth/delete-account`,
        {
          method: "DELETE",
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      // Clear localStorage sau khi xóa tài khoản
      store.dispatch(setAccessToken(null));

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Xóa tài khoản thất bại");
    }
  },
};
