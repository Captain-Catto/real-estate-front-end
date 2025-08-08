const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface OverviewStats {
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

interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface TopLocation {
  name: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
}

class StatsService {
  private baseUrl = `${API_BASE_URL}/admin/stats`;

  private async apiRequest<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "API call failed");
    }

    return result.data;
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getOverviewStats(): Promise<OverviewStats> {
    return this.apiRequest<OverviewStats>("/overview");
  }

  /**
   * Lấy biểu đồ doanh thu theo tháng
   */
  async getRevenueChart(): Promise<ChartData> {
    return this.apiRequest<ChartData>("/revenue-chart");
  }

  /**
   * Lấy biểu đồ phân bố gói tin đăng
   */
  async getPostsChart(): Promise<ChartData> {
    return this.apiRequest<ChartData>("/posts-chart");
  }

  /**
   * Lấy biểu đồ loại bất động sản
   */
  async getPropertyTypesChart(): Promise<ChartData> {
    return this.apiRequest<ChartData>("/property-types-chart");
  }

  /**
   * Lấy top địa điểm có nhiều bài đăng nhất
   */
  async getTopLocations(): Promise<TopLocation[]> {
    return this.apiRequest<TopLocation[]>("/top-locations");
  }

  /**
   * Lấy hoạt động gần đây
   */
  async getRecentActivities(limit?: number): Promise<RecentActivity[]> {
    const endpoint = limit
      ? `/recent-activities?limit=${limit}`
      : "/recent-activities";
    return this.apiRequest<RecentActivity[]>(endpoint);
  }
}

export const statsService = new StatsService();
export type { OverviewStats, ChartData, TopLocation, RecentActivity };
