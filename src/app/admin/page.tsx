"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCard from "@/components/admin/StatsCard";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// Mock data services
const AdminService = {
  getOverviewStats: async () => ({
    totalProperties: 156,
    totalUsers: 1247,
    totalPosts: 89,
    totalRevenue: 12500000000,
    pendingApproval: 23,
    totalViews: 45678,
    approvedToday: 15,
    rejectedToday: 3,
  }),

  getRecentActivities: async () => [
    {
      id: 1,
      type: "post_submitted",
      message: "Nguyễn Văn A đã gửi tin đăng mới",
      time: "5 phút trước",
      status: "pending",
    },
    {
      id: 2,
      type: "user_registered",
      message: "Người dùng mới: Trần Thị B",
      time: "10 phút trước",
      status: "success",
    },
    {
      id: 3,
      type: "post_approved",
      message: "Tin đăng #BDS123 đã được duyệt",
      time: "15 phút trước",
      status: "success",
    },
    {
      id: 4,
      type: "payment_received",
      message: "Thanh toán 500.000 VNĐ từ user #U456",
      time: "30 phút trước",
      status: "success",
    },
    {
      id: 5,
      type: "post_rejected",
      message: "Tin đăng #BDS789 bị từ chối",
      time: "1 giờ trước",
      status: "error",
    },
  ],

  getTopPosts: async () => [
    {
      id: "BDS001",
      title: "Bán căn hộ 2PN tại Vinhomes Central Park",
      views: 1245,
      status: "active",
      author: "Nguyễn Văn A",
    },
    {
      id: "BDS002",
      title: "Cho thuê biệt thự đơn lập Phú Mỹ Hưng",
      views: 987,
      status: "active",
      author: "Trần Thị B",
    },
    {
      id: "BDS003",
      title: "Bán nhà mặt tiền đường Nguyễn Văn Cừ",
      views: 756,
      status: "pending",
      author: "Lê Văn C",
    },
  ],
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalPosts: 0,
    totalRevenue: 0,
    pendingApproval: 0,
    totalViews: 0,
    approvedToday: 0,
    rejectedToday: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData, postsData] = await Promise.all([
          AdminService.getOverviewStats(),
          AdminService.getRecentActivities(),
          AdminService.getTopPosts(),
        ]);

        setStats(statsData);
        setRecentActivities(activitiesData);
        setTopPosts(postsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post_submitted":
        return <DocumentTextIcon className="w-5 h-5" />;
      case "user_registered":
        return <UserGroupIcon className="w-5 h-5" />;
      case "post_approved":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "payment_received":
        return <CurrencyDollarIcon className="w-5 h-5" />;
      case "post_rejected":
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
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
              Tổng quan hệ thống
            </h1>
            <p className="text-gray-600">
              Xem tổng quan hoạt động của hệ thống bất động sản
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Tổng BĐS"
              value={stats.totalProperties}
              icon={<HomeIcon className="w-6 h-6" />}
              change="+12%"
              changeType="increase"
              href="/admin/properties"
              color="blue"
            />
            <StatsCard
              title="Người dùng"
              value={stats.totalUsers}
              icon={<UserGroupIcon className="w-6 h-6" />}
              change="+8%"
              changeType="increase"
              href="/admin/users"
              color="green"
            />
            <StatsCard
              title="Tin đăng"
              value={stats.totalPosts}
              icon={<DocumentTextIcon className="w-6 h-6" />}
              change="+15%"
              changeType="increase"
              href="/admin/posts"
              color="yellow"
            />
            <StatsCard
              title="Doanh thu"
              value={formatCurrency(stats.totalRevenue)}
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
              change="+23%"
              changeType="increase"
              href="/admin/transactions"
              color="purple"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Chờ duyệt"
              value={stats.pendingApproval}
              icon={<ClockIcon className="w-6 h-6" />}
              href="/admin/posts?status=pending"
              color="yellow"
            />
            <StatsCard
              title="Lượt xem hôm nay"
              value={stats.totalViews.toLocaleString()}
              icon={<EyeIcon className="w-6 h-6" />}
              color="blue"
            />
            <StatsCard
              title="Đã duyệt hôm nay"
              value={stats.approvedToday}
              icon={<CheckCircleIcon className="w-6 h-6" />}
              color="green"
            />
            <StatsCard
              title="Từ chối hôm nay"
              value={stats.rejectedToday}
              icon={<XCircleIcon className="w-6 h-6" />}
              color="red"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hoạt động gần đây
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`p-2 rounded-full ${getActivityColor(
                          activity.status
                        )}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tin đăng hot nhất
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topPosts.map((post: any, index) => (
                    <div key={post.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {post.views.toLocaleString()} lượt xem • {post.author}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            post.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.status === "active"
                            ? "Đang hiển thị"
                            : "Chờ duyệt"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
