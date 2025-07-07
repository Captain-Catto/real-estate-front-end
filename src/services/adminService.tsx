import { refreshToken } from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface AdminStats {
  totalPosts: number;
  totalUsers: number;
  newUsersThisMonth: number;
  postsThisMonth: number;
  postsLastMonth: number;
  monthlyRevenue: number;
  pendingPosts: number;
  todayPostViews: number;
  approvedPosts: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  status: string;
  relatedId: string;
}

export interface TopPost {
  id: string;
  title: string;
  views: number;
  status: string;
  author: string;
  createdAt: string;
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
  message?: string;
}

export interface RecentActivitiesResponse {
  success: boolean;
  data: ActivityItem[];
  message?: string;
}

export interface TopPostsResponse {
  success: boolean;
  data: TopPost[];
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API calls with token refresh
const apiCall = async (url: string, options: RequestInit = {}) => {
  const makeRequest = async (headers: HeadersInit) => {
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  };

  let response = await makeRequest(getAuthHeaders());

  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry with new token
      response = await makeRequest(getAuthHeaders());
    }
  }

  return response;
};

export const AdminService = {
  // Get admin overview statistics
  getAdminStats: async (): Promise<AdminStatsResponse> => {
    try {
      const response = await apiCall(`${API_BASE_URL}/admin/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  },

  // Get recent activities (posts, users, payments)
  getRecentActivities: async (
    limit: number = 10
  ): Promise<RecentActivitiesResponse> => {
    try {
      const response = await apiCall(
        `${API_BASE_URL}/admin/recent-activities?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  },

  // Get top posts by views
  getTopPosts: async (limit: number = 10): Promise<TopPostsResponse> => {
    try {
      const response = await apiCall(
        `${API_BASE_URL}/admin/top-posts?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching top posts:", error);
      throw error;
    }
  },
};
