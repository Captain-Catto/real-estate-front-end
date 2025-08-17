import { fetchWithAuth, API_BASE_URL } from "@/services/authService";
import { toast } from "sonner";

export interface OverviewStats {
  totalUsers: number;
  totalRevenue: number;
  totalPosts: number;
  paidPosts: number;
  totalProjects: number;
  totalContacts: number;
  totalNews: number;
  totalViews: number;
  activePosts: number;
  newUsersThisMonth: number;
  newPostsThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  userGrowth: number;
  revenueGrowth: number;
  postGrowth: number;
}

export interface RevenueChart {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }>;
}

export interface PostsChart {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

export interface PropertyTypesChart {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
  }>;
}

export interface TopLocation {
  province: string;
  provinceCode: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: "payment" | "post" | "user" | "contact";
  title: string;
  description: string;
  timestamp: string;
  status: string;
  amount?: number;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const realStatsService = {
  // Lấy thống kê tổng quan
  async getOverviewStats(): Promise<OverviewStats> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/stats/overview`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch overview stats");
      }
      const result = await response.json();

      // Provide default values for missing fields
      const defaultStats: OverviewStats = {
        totalUsers: 0,
        totalRevenue: 0,
        totalPosts: 0,
        paidPosts: 0,
        totalProjects: 0,
        totalContacts: 0,
        totalNews: 0,
        totalViews: 0,
        activePosts: 0,
        newUsersThisMonth: 0,
        newPostsThisMonth: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        userGrowth: 0,
        revenueGrowth: 0,
        postGrowth: 0,
      };

      return { ...defaultStats, ...result.data };
    } catch {
      toast.error("Không thể tải thống kê tổng quan");
      // Return default values on error
      return {
        totalUsers: 0,
        totalRevenue: 0,
        totalPosts: 0,
        paidPosts: 0,
        totalProjects: 0,
        totalContacts: 0,
        totalNews: 0,
        totalViews: 0,
        activePosts: 0,
        newUsersThisMonth: 0,
        newPostsThisMonth: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        userGrowth: 0,
        revenueGrowth: 0,
        postGrowth: 0,
      };
    }
  },

  // Lấy thống kê tổng quan với date range
  async getOverviewStatsWithDateRange(
    startDate?: string,
    endDate?: string
  ): Promise<OverviewStats> {
    try {
      let url = `${API_BASE_URL}/admin/stats/overview`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error("Failed to fetch overview stats");
      }
      const result = await response.json();

      // Provide default values for missing fields
      const defaultStats: OverviewStats = {
        totalUsers: 0,
        totalRevenue: 0,
        totalPosts: 0,
        paidPosts: 0,
        totalProjects: 0,
        totalContacts: 0,
        totalNews: 0,
        totalViews: 0,
        activePosts: 0,
        newUsersThisMonth: 0,
        newPostsThisMonth: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        userGrowth: 0,
        revenueGrowth: 0,
        postGrowth: 0,
      };

      return { ...defaultStats, ...result.data };
    } catch {
      toast.error("Không thể tải thống kê theo thời gian");
      // Return default values on error
      return {
        totalUsers: 0,
        totalRevenue: 0,
        totalPosts: 0,
        paidPosts: 0,
        totalProjects: 0,
        totalContacts: 0,
        totalNews: 0,
        totalViews: 0,
        activePosts: 0,
        newUsersThisMonth: 0,
        newPostsThisMonth: 0,
        revenueThisMonth: 0,
        revenueLastMonth: 0,
        userGrowth: 0,
        revenueGrowth: 0,
        postGrowth: 0,
      };
    }
  },

  // Lấy biểu đồ doanh thu theo tháng
  async getRevenueChart(period: string = "month"): Promise<RevenueChart> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/revenue-chart?period=${period}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch revenue chart");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy biểu đồ doanh thu theo tháng với date range
  async getRevenueChartWithDateRange(
    period: string = "month",
    startDate?: string,
    endDate?: string
  ): Promise<RevenueChart> {
    let url = `${API_BASE_URL}/admin/stats/revenue-chart?period=${period}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Failed to fetch revenue chart");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy biểu đồ bài đăng theo gói
  async getPostsChart(): Promise<PostsChart> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/posts-chart`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch posts chart");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy biểu đồ loại bất động sản
  async getPropertyTypesChart(): Promise<PropertyTypesChart> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/property-types-chart`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch property types chart");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy top địa điểm
  async getTopLocations(): Promise<TopLocation[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/top-locations`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch top locations");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy hoạt động gần đây
  async getRecentActivities(): Promise<RecentActivity[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/recent-activities`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch recent activities");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy thống kê user theo tháng
  async getUserChart(period: string = "month"): Promise<RevenueChart> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/user-chart?period=${period}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user chart");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy thống kê user theo tháng với date range
  async getUserChartWithDateRange(
    period: string = "month",
    startDate?: string,
    endDate?: string
  ): Promise<RevenueChart> {
    let url = `${API_BASE_URL}/admin/stats/user-chart?period=${period}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Failed to fetch user chart");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy thống kê liên hệ
  async getContactStats(): Promise<{
    total: number;
    pending: number;
    replied: number;
    closed: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/contact-stats`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch contact stats");
    }
    const result = await response.json();
    return result.data;
  },

  // Lấy thống kê thanh toán
  async getPaymentStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalAmount: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats/payment-stats`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch payment stats");
    }
    const result = await response.json();
    return result.data;
  },
};
