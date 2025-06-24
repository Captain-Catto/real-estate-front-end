const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

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

// Helper function để handle API calls với token refresh
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("accessToken");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // Quan trọng: để gửi cookies
  });

  // Nếu token expired, thử refresh
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry với token mới
      const newToken = localStorage.getItem("accessToken");
      return fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
        credentials: "include",
      });
    }
  }

  return response;
};

// Refresh token function
export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Gửi httpOnly cookie
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        return true;
      }
    }

    // Refresh failed, clear tokens
    localStorage.removeItem("accessToken");
    return false;
  } catch (error) {
    console.error("Refresh token error:", error);
    localStorage.removeItem("accessToken");
    return false;
  }
};

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
        // Lưu access token vào localStorage
        localStorage.setItem("accessToken", data.data.accessToken);

        // Lấy thông tin user ngay sau khi login
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
        // Lưu access token vào localStorage
        localStorage.setItem("accessToken", data.data.accessToken);

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

      // Luôn clear localStorage, bất kể API response
      localStorage.removeItem("accessToken");

      return data;
    } catch (error: any) {
      // Vẫn clear localStorage nếu có lỗi
      localStorage.removeItem("accessToken");
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

      // Luôn clear localStorage
      localStorage.removeItem("accessToken");

      return data;
    } catch (error: any) {
      // Vẫn clear localStorage nếu có lỗi
      localStorage.removeItem("accessToken");
      return {
        success: true,
        message: "Đăng xuất khỏi tất cả thiết bị thành công",
      };
    }
  },

  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/auth/profile`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get profile");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi lấy thông tin profile");
    }
  },

  async updateProfile(profileData: {
    username?: string;
    email?: string;
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
      localStorage.removeItem("accessToken");

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Xóa tài khoản thất bại");
    }
  },
};
