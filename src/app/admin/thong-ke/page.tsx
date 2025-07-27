"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCard from "@/components/admin/StatsCard";
import {
  UserGroupIcon,
  BanknotesIcon,
  DocumentTextIcon,
  StarIcon,
  HomeIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Mock service cho thống kê
const StatsService = {
  getOverviewStats: async () => {
    await new Promise((r) => setTimeout(r, 500));
    return {
      totalUsers: 15420,
      totalRevenue: 2450000000, // 2.45 tỷ VNĐ
      totalPosts: 8750,
      paidPosts: 2340,
      totalProperties: 6850,
      totalProjects: 245,
      totalViews: 125000,
      totalContacts: 3200,
      newUsersThisMonth: 340,
      revenueThisMonth: 180000000, // 180 triệu VNĐ
      newPostsThisMonth: 520,
      activeAdsThisMonth: 420,
    };
  },

  getRevenueChart: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      labels: [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ],
      datasets: [
        {
          label: "Doanh thu (triệu VNĐ)",
          data: [120, 150, 180, 200, 170, 190, 220, 250, 180, 200, 170, 160],
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    };
  },

  getPostsChart: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      labels: ["Miễn phí", "Cơ bản", "Premium", "VIP"],
      datasets: [
        {
          data: [4200, 1800, 1500, 1250],
          backgroundColor: [
            "rgba(156, 163, 175, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(139, 69, 19, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgb(156, 163, 175)",
            "rgb(251, 191, 36)",
            "rgb(139, 69, 19)",
            "rgb(239, 68, 68)",
          ],
          borderWidth: 1,
        },
      ],
    };
  },

  getPropertyTypesChart: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      labels: [
        "Căn hộ",
        "Nhà riêng",
        "Biệt thự",
        "Đất nền",
        "Shophouse",
        "Khác",
      ],
      datasets: [
        {
          data: [3200, 1800, 800, 1200, 600, 250],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(139, 69, 19, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(156, 163, 175, 0.8)",
          ],
        },
      ],
    };
  },

  getTopLocations: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return [
      { name: "TP. Hồ Chí Minh", count: 2850, percentage: 33.5 },
      { name: "Hà Nội", count: 2340, percentage: 27.5 },
      { name: "Đà Nẵng", count: 890, percentage: 10.4 },
      { name: "Bình Dương", count: 650, percentage: 7.6 },
      { name: "Đồng Nai", count: 520, percentage: 6.1 },
      { name: "Khác", count: 1250, percentage: 14.9 },
    ];
  },

  getRecentActivities: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return [
      {
        id: 1,
        type: "user_register",
        message: "Người dùng mới đăng ký: Nguyễn Văn A",
        time: "5 phút trước",
        icon: "user",
      },
      {
        id: 2,
        type: "post_created",
        message: "Tin đăng mới: Bán căn hộ 2PN tại Vinhomes",
        time: "15 phút trước",
        icon: "post",
      },
      {
        id: 3,
        type: "payment",
        message: "Thanh toán VIP thành công: 500.000 VNĐ",
        time: "30 phút trước",
        icon: "payment",
      },
      {
        id: 4,
        type: "contact",
        message: "Liên hệ mới từ khách hàng về BDS001",
        time: "1 giờ trước",
        icon: "contact",
      },
      {
        id: 5,
        type: "project_added",
        message: "Dự án mới được thêm: Vinhomes Smart City",
        time: "2 giờ trước",
        icon: "project",
      },
    ];
  },
};

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueChart, setRevenueChart] = useState<any>(null);
  const [postsChart, setPostsChart] = useState<any>(null);
  const [propertyTypesChart, setPropertyTypesChart] = useState<any>(null);
  const [topLocations, setTopLocations] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        overviewStats,
        revenueData,
        postsData,
        propertyTypesData,
        locationsData,
        activitiesData,
      ] = await Promise.all([
        StatsService.getOverviewStats(),
        StatsService.getRevenueChart(),
        StatsService.getPostsChart(),
        StatsService.getPropertyTypesChart(),
        StatsService.getTopLocations(),
        StatsService.getRecentActivities(),
      ]);

      setStats(overviewStats);
      setRevenueChart(revenueData);
      setPostsChart(postsData);
      setPropertyTypesChart(propertyTypesData);
      setTopLocations(locationsData);
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + " tỷ";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + " triệu";
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + "k";
    }
    return amount.toString();
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Thống kê tổng quan
            </h1>
            <p className="text-gray-600">
              Xem báo cáo chi tiết về hoạt động hệ thống bất động sản
            </p>
          </div>

          {/* Overview Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Tổng người dùng"
              value={formatNumber(stats.totalUsers)}
              icon={<UserGroupIcon className="w-6 h-6" />}
              change={`+${stats.newUsersThisMonth}`}
              changeType="increase"
              color="blue"
            />
            <StatsCard
              title="Doanh thu năm"
              value={`${formatCurrency(stats.totalRevenue)} VNĐ`}
              icon={<BanknotesIcon className="w-6 h-6" />}
              change={`+${formatCurrency(stats.revenueThisMonth)} tháng này`}
              changeType="increase"
              color="green"
            />
            <StatsCard
              title="Tổng tin đăng"
              value={formatNumber(stats.totalPosts)}
              icon={<DocumentTextIcon className="w-6 h-6" />}
              change={`+${stats.newPostsThisMonth} tháng này`}
              changeType="increase"
              color="purple"
            />
            <StatsCard
              title="Tin trả phí"
              value={formatNumber(stats.paidPosts)}
              icon={<StarIcon className="w-6 h-6" />}
              change={`+${stats.activeAdsThisMonth} tháng này`}
              changeType="increase"
              color="yellow"
            />
          </div>

          {/* Additional Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Bất động sản"
              value={formatNumber(stats.totalProperties)}
              icon={<HomeIcon className="w-6 h-6" />}
              color="blue"
            />
            <StatsCard
              title="Dự án"
              value={formatNumber(stats.totalProjects)}
              icon={<BuildingOfficeIcon className="w-6 h-6" />}
              color="green"
            />
            <StatsCard
              title="Lượt xem"
              value={formatNumber(stats.totalViews)}
              icon={<EyeIcon className="w-6 h-6" />}
              color="purple"
            />
            <StatsCard
              title="Liên hệ"
              value={formatNumber(stats.totalContacts)}
              icon={<PhoneIcon className="w-6 h-6" />}
              color="red"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                Doanh thu theo tháng
              </h3>
              {revenueChart && (
                <Bar
                  data={revenueChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Posts Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                Phân bố loại tin đăng
              </h3>
              {postsChart && (
                <Doughnut
                  data={postsChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Property Types & Top Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Property Types */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HomeIcon className="w-5 h-5 text-purple-600" />
                Loại hình bất động sản
              </h3>
              {propertyTypesChart && (
                <Doughnut
                  data={propertyTypesChart}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                />
              )}
            </div>

            {/* Top Locations */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-red-600" />
                Địa điểm hot nhất
              </h3>
              <div className="space-y-3">
                {topLocations.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-900 font-medium">
                        {location.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-semibold">
                        {formatNumber(location.count)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {location.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-orange-600" />
                Hoạt động gần đây
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.icon === "user" && (
                        <UserGroupIcon className="w-4 h-4 text-blue-600" />
                      )}
                      {activity.icon === "post" && (
                        <DocumentTextIcon className="w-4 h-4 text-green-600" />
                      )}
                      {activity.icon === "payment" && (
                        <BanknotesIcon className="w-4 h-4 text-yellow-600" />
                      )}
                      {activity.icon === "contact" && (
                        <PhoneIcon className="w-4 h-4 text-red-600" />
                      )}
                      {activity.icon === "project" && (
                        <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">
                        {activity.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
