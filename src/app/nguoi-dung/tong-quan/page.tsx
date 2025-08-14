"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
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
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { dashboardService } from "@/services/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ContactRequestData {
  period: string;
  count: number;
}

interface TopPostData {
  id: string;
  title: string;
  views: number;
  createdAt: string;
}

interface ChartData {
  contactRequests: {
    weekly: ContactRequestData[];
    monthly: ContactRequestData[];
    yearly: ContactRequestData[];
  };
  topPosts: TopPostData[];
}

export default function TongQuanPage() {
  const { isAuthenticated, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [chartData, setChartData] = useState<ChartData>({
    contactRequests: {
      weekly: [],
      monthly: [],
      yearly: [],
    },
    topPosts: [],
  });
  const [contactPeriod, setContactPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("weekly");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  // Authentication check
  useEffect(() => {
    if (user !== undefined) {
      setAccessChecked(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);

        if (isAdmin || isEmployee) {
          // Fetch admin dashboard data
          const response = await dashboardService.getAdminDashboardData();
          if (response.success && response.data) {
            setChartData(response.data);
          } else {
            console.error(
              "Failed to fetch admin dashboard data:",
              response.message
            );
            // Fallback to mock data on error
            setChartData({
              contactRequests: {
                weekly: [
                  { period: "Tuần 1", count: 15 },
                  { period: "Tuần 2", count: 22 },
                  { period: "Tuần 3", count: 18 },
                  { period: "Tuần 4", count: 28 },
                  { period: "Tuần 5", count: 24 },
                  { period: "Tuần 6", count: 31 },
                  { period: "Tuần 7", count: 26 },
                ],
                monthly: [
                  { period: "Tháng 1", count: 85 },
                  { period: "Tháng 2", count: 92 },
                  { period: "Tháng 3", count: 78 },
                  { period: "Tháng 4", count: 105 },
                  { period: "Tháng 5", count: 118 },
                  { period: "Tháng 6", count: 134 },
                ],
                yearly: [
                  { period: "2022", count: 856 },
                  { period: "2023", count: 1024 },
                  { period: "2024", count: 1285 },
                  { period: "2025", count: 892 },
                ],
              },
              topPosts: [
                {
                  id: "1",
                  title: "Bán nhà mặt tiền đường Nguyễn Trãi, Q1, HCM",
                  views: 2450,
                  createdAt: "2025-01-15T10:30:00Z",
                },
              ],
            });
          }
        } else {
          // Fetch regular user dashboard data
          const response = await dashboardService.getDashboardData();
          if (response.success && response.data) {
            setChartData(response.data);
          } else {
            console.error("Failed to fetch dashboard data:", response.message);
            // Fallback to mock data on error
            setChartData({
              contactRequests: {
                weekly: [
                  { period: "Tuần 1", count: 15 },
                  { period: "Tuần 2", count: 22 },
                  { period: "Tuần 3", count: 18 },
                  { period: "Tuần 4", count: 28 },
                  { period: "Tuần 5", count: 24 },
                  { period: "Tuần 6", count: 31 },
                  { period: "Tuần 7", count: 26 },
                ],
                monthly: [
                  { period: "Tháng 1", count: 85 },
                  { period: "Tháng 2", count: 92 },
                  { period: "Tháng 3", count: 78 },
                  { period: "Tháng 4", count: 105 },
                  { period: "Tháng 5", count: 118 },
                  { period: "Tháng 6", count: 134 },
                ],
                yearly: [
                  { period: "2022", count: 856 },
                  { period: "2023", count: 1024 },
                  { period: "2024", count: 1285 },
                  { period: "2025", count: 892 },
                ],
              },
              topPosts: [
                {
                  id: "1",
                  title: "Bán nhà mặt tiền đường Nguyễn Trãi, Q1, HCM",
                  views: 2450,
                  createdAt: "2025-01-15T10:30:00Z",
                },
                {
                  id: "2",
                  title: "Cho thuê căn hộ Vinhomes Central Park view sông",
                  views: 1980,
                  createdAt: "2025-01-10T14:20:00Z",
                },
                {
                  id: "3",
                  title: "Bán đất nền KDC Phú Hữu, Q9, giá đầu tư",
                  views: 1750,
                  createdAt: "2025-01-08T09:15:00Z",
                },
                {
                  id: "4",
                  title: "Bán biệt thự Thảo Điền, Q2, full nội thất",
                  views: 1620,
                  createdAt: "2025-01-05T16:45:00Z",
                },
                {
                  id: "5",
                  title: "Cho thuê văn phòng tòa nhà Bitexco, Q1",
                  views: 1580,
                  createdAt: "2025-01-03T11:30:00Z",
                },
              ],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Set fallback mock data on error
      } finally {
        setLoading(false);
      }
    };

    if (user && accessChecked && isAuthenticated) {
      fetchChartData();
    }
  }, [user, accessChecked, isAuthenticated, isAdmin, isEmployee]);

  // Prepare chart data for contact requests
  const getContactChartData = () => {
    const data = chartData.contactRequests[contactPeriod];
    return {
      labels: data.map((item) => item.period),
      datasets: [
        {
          label: "Lượt yêu cầu liên hệ",
          data: data.map((item) => item.count),
          backgroundColor: "rgba(239, 68, 68, 0.5)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Biểu đồ lượt yêu cầu liên hệ theo ${
          contactPeriod === "weekly"
            ? "tuần"
            : contactPeriod === "monthly"
            ? "tháng"
            : "năm"
        }`,
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa đăng nhập
          </h2>
          <p className="text-gray-600">
            Vui lòng đăng nhập để xem trang tổng quan.
          </p>
        </div>
      </div>
    );
  }

  const quickActions = [
    ...(isAdmin || isEmployee
      ? [
          {
            title: "Kiểm tra tin đăng",
            description: "Duyệt và quản lý các tin đăng",
            href: "/admin/quan-ly-tin-dang",
            icon: ClipboardDocumentCheckIcon,
            color: "bg-orange-600 hover:bg-orange-700",
          },
          {
            title: "Thống kê liên hệ",
            description: "Xem số người liên hệ và tương tác",
            href: "/admin/thong-ke-lien-he",
            icon: UserGroupIcon,
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            title: "Biểu đồ lượt xem",
            description: "Xem biểu đồ thống kê lượt xem",
            href: "/admin/bieu-do-luot-xem",
            icon: ChartBarIcon,
            color: "bg-purple-600 hover:bg-purple-700",
          },
          {
            title: "Quản lý tài khoản",
            description: "Quản lý người dùng và phân quyền",
            href: "/admin/quan-ly-tai-khoan",
            icon: UserIcon,
            color: "bg-gray-600 hover:bg-gray-700",
          },
        ]
      : [
          {
            title: "Đăng tin mới",
            description: "Tạo bài đăng bất động sản mới",
            href: "/nguoi-dung/dang-tin",
            icon: DocumentTextIcon,
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            title: "Quản lý tin đăng",
            description: "Xem và chỉnh sửa các bài đăng",
            href: "/nguoi-dung/quan-ly-tin-rao-ban-cho-thue",
            icon: BuildingOfficeIcon,
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            title: "Tin yêu thích",
            description: "Xem các tin đã lưu",
            href: "/nguoi-dung/yeu-thich",
            icon: HeartIcon,
            color: "bg-red-600 hover:bg-red-700",
          },
          {
            title: "Cài đặt tài khoản",
            description: "Cập nhật thông tin cá nhân",
            href: "/nguoi-dung/tai-khoan",
            icon: UserIcon,
            color: "bg-gray-600 hover:bg-gray-700",
          },
        ]),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin/Employee Access */}
      {(isAdmin || isEmployee) && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-sm p-6 text-white animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Khu vực quản trị</h2>
              <p className="text-indigo-100 mt-2">
                Truy cập vào bảng điều khiển dành cho{" "}
                {isAdmin ? "quản trị viên" : "nhân viên"}
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Vào trang Admin →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isAdmin || isEmployee ? "Công cụ quản trị" : "Thao tác nhanh"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`${action.color} text-white p-2 rounded-lg group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Contact Requests Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Lượt yêu cầu liên hệ
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setContactPeriod("weekly")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  contactPeriod === "weekly"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => setContactPeriod("monthly")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  contactPeriod === "monthly"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => setContactPeriod("yearly")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  contactPeriod === "yearly"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Năm
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="h-64">
              <Bar data={getContactChartData()} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Top Posts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 bài viết có lượt xem nhiều nhất
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {chartData.topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 bg-red-500 text-white text-sm font-bold rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <ChartBarIcon className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-600">
                          {post.views.toLocaleString()} lượt xem
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 gap-6 animate-fade-in">
        {/* Tips */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mẹo sử dụng
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Đăng ảnh chất lượng cao để thu hút nhiều người xem hơn
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Cập nhật thông tin liên hệ để khách hàng dễ dàng liên lạc
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Mô tả chi tiết sẽ giúp tin đăng của bạn nổi bật hơn
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Đặt giá hợp lý theo thị trường để tăng khả năng bán/cho thuê
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Cập nhật tin đăng thường xuyên để giữ vị trí cao trong tìm kiếm
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Trả lời tin nhắn và bình luận nhanh chóng để tạo ấn tượng tốt
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Đăng tin vào giờ cao điểm (19h-21h) để có nhiều lượt xem nhất
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Sử dụng từ khóa phù hợp trong tiêu đề để dễ tìm kiếm hơn
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Kiểm tra và xóa tin đăng hết hạn để tránh spam
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
