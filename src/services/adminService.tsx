import { refreshToken, getAccessToken } from "./authService";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/authService";

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
  const token = getAccessToken();
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
    // Try to refresh token only once
    try {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry with new token
        response = await makeRequest(getAuthHeaders());
      } else {
        // If refresh fails, silently return the 401 response
        return response;
      }
    } catch {
      // If refresh fails, silently return the 401 response
      return response;
    }
  }

  return response;
};

export const AdminService = {
  // Get admin overview statistics
  getAdminStats: async (): Promise<AdminStatsResponse> => {
    try {
      const response = await apiCall(`${API_BASE_URL}/admin/stats`);

      if (response.status === 401) {
        // Return a default response for unauthorized access
        return {
          success: false,
          data: {
            totalPosts: 0,
            totalUsers: 0,
            newUsersThisMonth: 0,
            postsThisMonth: 0,
            postsLastMonth: 0,
            monthlyRevenue: 0,
            pendingPosts: 0,
            todayPostViews: 0,
            approvedPosts: 0,
          },
          message: "Unauthorized access",
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch {
      toast.error("Không thể tải thống kê admin");
      // Return default response instead of throwing
      return {
        success: false,
        data: {
          totalPosts: 0,
          totalUsers: 0,
          newUsersThisMonth: 0,
          postsThisMonth: 0,
          postsLastMonth: 0,
          monthlyRevenue: 0,
          pendingPosts: 0,
          todayPostViews: 0,
          approvedPosts: 0,
        },
        message: "Error fetching stats",
      };
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

      if (response.status === 401) {
        // Return a default response for unauthorized access
        return {
          success: false,
          data: [],
          message: "Unauthorized access",
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch {
      toast.error("Không thể tải hoạt động gần đây");
      // Return default response instead of throwing
      return {
        success: false,
        data: [],
        message: "Error fetching activities",
      };
    }
  },

  // Get top posts by views
  getTopPosts: async (limit: number = 10): Promise<TopPostsResponse> => {
    try {
      const response = await apiCall(
        `${API_BASE_URL}/admin/top-posts?limit=${limit}`
      );

      if (response.status === 401) {
        // Return a default response for unauthorized access
        return {
          success: false,
          data: [],
          message: "Unauthorized access",
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch {
      toast.error("Không thể tải bài đăng hàng đầu");
      // Return default response instead of throwing
      return {
        success: false,
        data: [],
        message: "Error fetching posts",
      };
    }
  },
};
