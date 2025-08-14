import { fetchWithAuth } from "./authService";

const API_BASE_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
    : "http://localhost:8080/api";

export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  role: "user" | "admin" | "employee";
  status: "active" | "inactive" | "banned";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  // Additional computed fields from backend
  totalPosts?: number;
  totalTransactions?: number;
  totalSpent?: number;
  location?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    stats?: UserStats;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message?: string;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
  message?: string;
}

export interface UserPost {
  _id: string;
  title: string;
  type: "ban" | "cho-thue";
  category: string;
  location: {
    province: string;
    district: string;
    ward: string;
    address?: string;
  };
  price: number;
  area: string;
  status: "active" | "pending" | "rejected" | "expired" | "deleted";
  views: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
  author: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface UserPayment {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "completed" | "pending" | "failed";
  description: string;
  createdAt: string;
  completedAt?: string;
  postId?: {
    _id: string;
    title: string;
    type: string;
  };
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: UserPost[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message?: string;
}

export interface PaymentsResponse {
  success: boolean;
  data: {
    payments: UserPayment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message?: string;
}

export interface UserLog {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  changedBy: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  action: "created" | "updated" | "statusChanged" | "deleted";
  changes: Record<string, { from: unknown; to: unknown }>;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogsResponse {
  success: boolean;
  data: {
    logs: UserLog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message?: string;
}

// Get all users with filters
export async function getUsers(
  filters: UserFilters = {}
): Promise<UsersResponse> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.role && filters.role !== "all")
      queryParams.append("role", filters.role);
    if (filters.status && filters.status !== "all")
      queryParams.append("status", filters.status);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const url = `${API_BASE_URL}/admin/users${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      data: { users: [] },
      message: "Có lỗi xảy ra khi tải danh sách người dùng",
    };
  }
}

// Get user statistics
export async function getUserStats(): Promise<UserStatsResponse> {
  try {
    const url = `${API_BASE_URL}/admin/user-stats`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        newUsersThisMonth: 0,
      },
      message: "Có lỗi xảy ra khi tải thống kê người dùng",
    };
  }
}

// Get user by ID
export async function getUserById(
  id: string
): Promise<{ success: boolean; data?: { user: User }; message?: string }> {
  try {
    const url = `${API_BASE_URL}/admin/users/${id}`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi tải thông tin người dùng",
    };
  }
}

// Update user status
export async function updateUserStatus(
  id: string,
  status: "active" | "inactive" | "banned"
): Promise<{ success: boolean; message?: string }> {
  try {
    const url = `${API_BASE_URL}/admin/users/${id}/status`;
    const response = await fetchWithAuth(url, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật trạng thái người dùng",
    };
  }
}

// Delete user
export async function deleteUser(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const url = `${API_BASE_URL}/admin/users/${id}`;
    const response = await fetchWithAuth(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xóa người dùng",
    };
  }
}

// Update user
export async function updateUser(
  id: string,
  userData: Partial<User>
): Promise<{ success: boolean; data?: { user: User }; message?: string }> {
  try {
    const url = `${API_BASE_URL}/admin/users/${id}`;
    const response = await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật thông tin người dùng",
    };
  }
}

// Get user posts
export async function getUserPosts(
  userId: string,
  filters?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }
): Promise<PostsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters?.type && filters.type !== "all")
      params.append("type", filters.type);

    const url = `${API_BASE_URL}/admin/users/${userId}/posts?${params.toString()}`;
    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return {
      success: false,
      data: {
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lấy danh sách tin đăng",
    };
  }
}

// Get user payments
export async function getUserPayments(
  userId: string,
  filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<PaymentsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status && filters.status !== "all")
      params.append("status", filters.status);

    const url = `${API_BASE_URL}/admin/users/${userId}/payments?${params.toString()}`;
    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return {
      success: false,
      data: {
        payments: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lấy lịch sử giao dịch",
    };
  }
}

// Get user logs
export async function getUserLogs(
  userId: string,
  filters?: {
    page?: number;
    limit?: number;
  }
): Promise<LogsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = `${API_BASE_URL}/admin/users/${userId}/logs?${params.toString()}`;
    const response = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return {
      success: false,
      data: {
        logs: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lấy lịch sử thay đổi",
    };
  }
}

// Get public user info (for user profile page)
export async function getPublicUser(userId: string): Promise<{
  success: boolean;
  user?: User;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/public/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public user:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lấy thông tin người dùng",
    };
  }
}
