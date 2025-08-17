"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import { realStatsService } from "@/services/realStatsService";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";
import type {
  OverviewStats,
  RevenueChart,
  PostsChart,
  PropertyTypesChart,
  TopLocation,
} from "@/services/realStatsService";
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
  DocumentArrowDownIcon,
  CalendarIcon,
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
import { toast } from "sonner";
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

function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChart | null>(null);
  const [postsChart, setPostsChart] = useState<PostsChart | null>(null);
  const [propertyTypesChart, setPropertyTypesChart] =
    useState<PropertyTypesChart | null>(null);
  const [topLocations, setTopLocations] = useState<TopLocation[]>([]);
  const [userRegistrationsChart, setUserRegistrationsChart] =
    useState<RevenueChart | null>(null);
  const [timeFilter, setTimeFilter] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewStats,
        revenueData,
        postsData,
        propertyTypesData,
        locationsData,
        userRegistrationsData,
      ] = await Promise.all([
        realStatsService.getOverviewStats().catch(() => null),
        realStatsService.getRevenueChart(timeFilter).catch(() => null),
        realStatsService.getPostsChart().catch(() => null),
        realStatsService.getPropertyTypesChart().catch(() => null),
        realStatsService.getTopLocations().catch(() => []),
        realStatsService.getUserChart(timeFilter).catch(() => null),
      ]);

      setStats(overviewStats);
      setRevenueChart(revenueData);
      setPostsChart(postsData);
      setPropertyTypesChart(propertyTypesData);
      setTopLocations(locationsData);
      setUserRegistrationsChart(userRegistrationsData);
    } catch {
      toast.error("Có lỗi xảy ra khi tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "0";
    }
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + " tỷ";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + " triệu";
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + "k";
    }
    return amount.toString();
  };

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0";
    }
    return num.toLocaleString("vi-VN");
  };

  const handleExportReport = async () => {
    if (!stats) {
      alert("Không có dữ liệu để xuất báo cáo");
      return;
    }

    try {
      setIsExporting(true);

      // Tạo nội dung báo cáo
      const reportData = {
        title: "Báo cáo thống kê tổng quan",
        generatedAt: new Date().toLocaleDateString("vi-VN"),
        period: `${startDate || "Tất cả"} - ${endDate || "Hiện tại"}`,
        overview: stats,
        topLocations,
        timeFilter,
      };

      // Tạo file CSV
      const csvContent = generateCSVReport(reportData);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `thong-ke-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Xuất báo cáo thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSVReport = (data: {
    title: string;
    generatedAt: string;
    period: string;
    overview: OverviewStats;
    topLocations: TopLocation[];
    timeFilter: string;
  }) => {
    const rows = [
      ["Báo cáo thống kê tổng quan"],
      ["Thời gian tạo", data.generatedAt],
      ["Khoảng thời gian", data.period],
      [],
      ["Chỉ số tổng quan"],
      ["Tổng người dùng", data.overview.totalUsers || 0],
      ["Tổng doanh thu", data.overview.totalRevenue || 0],
      ["Tổng bài đăng", data.overview.totalPosts || 0],
      ["Bài đăng có phí", data.overview.paidPosts || 0],
      ["Tổng dự án", data.overview.totalProjects || 0],
      ["Tổng liên hệ", data.overview.totalContacts || 0],
      ["Tổng tin tức", data.overview.totalNews || 0],
      ["Tổng lượt xem", data.overview.totalViews || 0],
      ["Bài đăng đang hoạt động", data.overview.activePosts || 0],
      ["Người dùng mới tháng này", data.overview.newUsersThisMonth || 0],
      ["Bài đăng mới tháng này", data.overview.newPostsThisMonth || 0],
      ["Doanh thu tháng này", data.overview.revenueThisMonth || 0],
      [],
      ["Top địa điểm"],
      ...data.topLocations.map((location: TopLocation) => [
        location.province || "Không xác định",
        location.count || 0,
        `${location.percentage || 0}%`,
      ]),
    ];

    return rows.map((row) => row.join(",")).join("\n");
  };

  const handleCustomDateFilter = async () => {
    if (!startDate || !endDate) {
      alert("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
      return;
    }

    await fetchDataWithDateRange();
  };

  const fetchDataWithDateRange = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use APIs with date range support
      const [
        overviewStats,
        revenueData,
        postsData,
        propertyTypesData,
        locationsData,
        userRegistrationsData,
      ] = await Promise.all([
        realStatsService
          .getOverviewStatsWithDateRange(startDate, endDate)
          .catch(() => null),
        realStatsService
          .getRevenueChartWithDateRange(timeFilter, startDate, endDate)
          .catch(() => null),
        realStatsService.getPostsChart().catch(() => null),
        realStatsService.getPropertyTypesChart().catch(() => null),
        realStatsService.getTopLocations().catch(() => []),
        realStatsService
          .getUserChartWithDateRange(timeFilter, startDate, endDate)
          .catch(() => null),
      ]);

      setStats(overviewStats);
      setRevenueChart(revenueData);
      setPostsChart(postsData);
      setPropertyTypesChart(propertyTypesData);
      setTopLocations(locationsData);
      setUserRegistrationsChart(userRegistrationsData);
    } catch {
      toast.error("Có lỗi xảy ra khi tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Thống kê tổng quan">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu thống kê...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Thống kê tổng quan">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium">{error}</div>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Thống kê tổng quan"
      description="Xem báo cáo chi tiết về hoạt động hệ thống bất động sản"
    >
      {/* Page Title & Controls */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thống kê tổng quan
            </h1>
            <p className="text-gray-600">
              Xem báo cáo chi tiết về hoạt động hệ thống bất động sản
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Custom Date Range */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-0 outline-none text-sm"
                placeholder="Từ ngày"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-0 outline-none text-sm"
                placeholder="Đến ngày"
              />
              <button
                onClick={handleCustomDateFilter}
                className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Lọc
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportReport}
              disabled={isExporting || !stats}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
            </button>
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeFilter === "month"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => setTimeFilter("quarter")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeFilter === "quarter"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Quý
          </button>
          <button
            onClick={() => setTimeFilter("year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeFilter === "year"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Năm
          </button>
        </div>
      </div>

      {/* Overview Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng người dùng"
            value={formatNumber(stats.totalUsers || 0)}
            icon={<UserGroupIcon className="w-6 h-6" />}
            change={`+${stats.newUsersThisMonth || 0}`}
            changeType="increase"
            color="blue"
          />
          <StatsCard
            title="Doanh thu năm"
            value={formatCurrency(stats.totalRevenue || 0)}
            icon={<BanknotesIcon className="w-6 h-6" />}
            change={`+${formatCurrency(stats.revenueThisMonth || 0)} tháng này`}
            changeType="increase"
            color="green"
          />
          <StatsCard
            title="Tổng tin đăng"
            value={formatNumber(stats.totalPosts || 0)}
            icon={<DocumentTextIcon className="w-6 h-6" />}
            change={`+${stats.newPostsThisMonth || 0} tháng này`}
            changeType="increase"
            color="purple"
          />
          <StatsCard
            title="Tin trả phí"
            value={formatNumber(stats.paidPosts || 0)}
            icon={<StarIcon className="w-6 h-6" />}
            change={`+${stats.activePosts || 0} tháng này`}
            changeType="increase"
            color="yellow"
          />
        </div>
      )}

      {/* Additional Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Dự án"
            value={formatNumber(stats.totalProjects || 0)}
            icon={<HomeIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Tin tức"
            value={formatNumber(stats.totalNews || 0)}
            icon={<BuildingOfficeIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Lượt xem tin"
            value={formatNumber(stats.totalViews || 0)}
            icon={<EyeIcon className="w-6 h-6" />}
            change={`Tổng view các tin đăng`}
            changeType="increase"
            color="purple"
          />
          <StatsCard
            title="Liên hệ"
            value={formatNumber(stats.totalContacts || 0)}
            icon={<PhoneIcon className="w-6 h-6" />}
            color="red"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            Doanh thu theo{" "}
            {timeFilter === "month"
              ? "tháng"
              : timeFilter === "quarter"
              ? "quý"
              : "năm"}
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

        {/* User Registration Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            Đăng ký người dùng theo{" "}
            {timeFilter === "month"
              ? "tháng"
              : timeFilter === "quarter"
              ? "quý"
              : "năm"}
          </h3>
          {userRegistrationsChart && (
            <Line
              data={userRegistrationsChart}
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
            <ChartBarIcon className="w-5 h-5 text-purple-600" />
            Phân bố gói tin đăng
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
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-900 font-medium">
                    {location.province}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 font-semibold">
                    {formatNumber(location.count || 0)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {location.percentage || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Registrations Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-blue-600" />
          Người dùng đăng ký theo tháng
        </h3>
        {userRegistrationsChart && (
          <Bar
            data={userRegistrationsChart}
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
    </AdminLayout>
  );
}

// Wrap component with AdminGuard
export default function ProtectedStatsPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.STATISTICS.VIEW]}>
      <StatsPage />
    </AdminGuard>
  );
}
