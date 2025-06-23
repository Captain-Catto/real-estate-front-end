const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

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
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      createdAt: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export interface UserProfile {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      avatar?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Helper function để thêm token vào headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function để xử lý response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

// Helper function để refresh token
const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Helper function để thực hiện fetch với auto-retry khi token expired
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    // Nếu 401 và có refresh token, thử refresh
    if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // Thử lại request với token mới
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
        return handleResponse(retryResponse);
      } else {
        // Refresh thất bại, clear tokens và redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        throw new Error("Session expired");
      }
    }

    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

export const authService = {
  // Đăng nhập
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse(response);

    if (data.success) {
      const { accessToken, refreshToken } = data.data.tokens;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    return data;
  },

  // Đăng ký
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await handleResponse(response);

    if (data.success) {
      const { accessToken, refreshToken } = data.data.tokens;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    return data;
  },

  // Update profile
  async updateProfile(profileData: {
    username?: string;
    email?: string;
  }): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/auth/change-password`, {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  },

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");

      if (refreshTokenValue) {
        await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // Đăng xuất khỏi tất cả thiết bị
  async logoutAll(): Promise<void> {
    try {
      await fetchWithAuth(`${API_BASE_URL}/auth/logout-all`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // Lấy thông tin profile
  async getProfile(): Promise<UserProfile> {
    return fetchWithAuth(`${API_BASE_URL}/auth/profile`);
  },

  // Kiểm tra đăng nhập
  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  },

  // Lấy token
  getToken(): string | null {
    return localStorage.getItem("accessToken");
  },
};
