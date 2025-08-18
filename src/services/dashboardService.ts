import { fetchWithAuth, API_BASE_URL } from "./authService";
import { showErrorToast } from "@/utils/errorHandler";

interface ContactRequestData {
  period: string;
  count: number;
}

interface TopPostData {
  id: string;
  title: string;
  views: number;
  createdAt: string;
  authorName?: string; // For admin view
}

interface DashboardData {
  contactRequests: {
    weekly: ContactRequestData[];
    monthly: ContactRequestData[];
    yearly: ContactRequestData[];
  };
  topPosts: TopPostData[];
}

class DashboardService {
  private baseUrl = `${API_BASE_URL}/dashboard`;

  // Get contact request statistics by period
  async getContactRequestStats(
    period: "weekly" | "monthly" | "yearly" = "weekly"
  ) {
    try {
      const response = await fetchWithAuth(
        `${this.baseUrl}/contact-stats?period=${period}`
      );
      const result = await response.json();
      return {
        success: true,
        data: result.data as ContactRequestData[],
      };
    } catch (error: unknown) {
      showErrorToast("Lấy thống kê yêu cầu liên hệ thất bại");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get contact request stats";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Get top posts by views for current user
  async getTopPostsByViews(limit: number = 5) {
    try {
      const response = await fetchWithAuth(
        `${this.baseUrl}/top-posts?limit=${limit}`
      );
      const result = await response.json();
      return {
        success: true,
        data: result.data as TopPostData[],
      };
    } catch (error: unknown) {
      showErrorToast("Lấy bài viết hàng đầu thất bại");
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get top posts";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Get admin dashboard data (admin/employee only)
  async getAdminDashboardData() {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/admin-data`);
      const result = await response.json();
      return {
        success: true,
        data: result.data as DashboardData,
      };
    } catch (error: unknown) {
      showErrorToast("Lấy dữ liệu bảng điều khiển admin thất bại");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get admin dashboard data";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Get all dashboard data for regular users
  async getDashboardData() {
    try {
      // Get both contact stats and top posts in parallel
      const [contactWeekly, contactMonthly, contactYearly, topPosts] =
        await Promise.all([
          this.getContactRequestStats("weekly"),
          this.getContactRequestStats("monthly"),
          this.getContactRequestStats("yearly"),
          this.getTopPostsByViews(5),
        ]);

      if (
        !contactWeekly.success ||
        !contactMonthly.success ||
        !contactYearly.success ||
        !topPosts.success
      ) {
        throw new Error("Failed to get some dashboard data");
      }

      return {
        success: true,
        data: {
          contactRequests: {
            weekly: contactWeekly.data || [],
            monthly: contactMonthly.data || [],
            yearly: contactYearly.data || [],
          },
          topPosts: topPosts.data || [],
        } as DashboardData,
      };
    } catch (error: unknown) {
      showErrorToast("Lấy dữ liệu bảng điều khiển thất bại");
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get dashboard data";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

export const dashboardService = new DashboardService();
export type { ContactRequestData, TopPostData, DashboardData };
