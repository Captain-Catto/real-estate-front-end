"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
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
import {
  AdminService,
  AdminStats,
  ActivityItem,
  TopPost,
} from "@/services/adminService";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalPosts: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    postsThisMonth: 0,
    postsLastMonth: 0,
    monthlyRevenue: 0,
    pendingPosts: 0,
    todayPostViews: 0,
    approvedPosts: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, activitiesResponse, postsResponse] =
          await Promise.all([
            AdminService.getAdminStats(),
            AdminService.getRecentActivities(10),
            AdminService.getTopPosts(10),
          ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
        if (activitiesResponse.success) {
          setRecentActivities(activitiesResponse.data);
        }
        if (postsResponse.success) {
          setTopPosts(postsResponse.data);
        }
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

  const calculateChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
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
      <AdminLayout title="Tổng quan hệ thống">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-4 text-gray-600">Đang tải dữ liệu...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tổng quan hệ thống">
      {/* Page Description */}
      <div className="mb-8">
        <p className="text-gray-600">
          Xem tổng quan hoạt động của hệ thống bất động sản
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Tổng tin đăng"
          value={stats.totalPosts}
          icon={<DocumentTextIcon className="w-6 h-6" />}
          change={calculateChangePercentage(
            stats.postsThisMonth,
            stats.postsLastMonth
          )}
          changeType={
            stats.postsThisMonth >= stats.postsLastMonth
              ? "increase"
              : "decrease"
          }
          href="/admin/posts"
          color="blue"
        />
        <StatsCard
          title="Tin tháng này"
          value={stats.postsThisMonth}
          icon={<HomeIcon className="w-6 h-6" />}
          change={calculateChangePercentage(
            stats.postsThisMonth,
            stats.postsLastMonth
          )}
          changeType={
            stats.postsThisMonth >= stats.postsLastMonth
              ? "increase"
              : "decrease"
          }
          href="/admin/posts"
          color="yellow"
        />{" "}
        <StatsCard
          title="Doanh thu tháng"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          change="Tháng này"
          changeType="increase"
          href="/admin/transactions"
          color="purple"
        />
        <StatsCard
          title="Người dùng"
          value={stats.totalUsers}
          icon={<UserGroupIcon className="w-6 h-6" />}
          change={`+${stats.newUsersThisMonth}`}
          changeType="increase"
          href="/admin/quan-ly-nguoi-dung"
          color="green"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Chờ duyệt"
          value={stats.pendingPosts}
          icon={<ClockIcon className="w-6 h-6" />}
          href="/admin/posts?status=pending"
          color="yellow"
        />
        <StatsCard
          title="Đã duyệt"
          value={stats.approvedPosts}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Lượt xem hôm nay"
          value={stats.todayPostViews.toLocaleString()}
          icon={<EyeIcon className="w-6 h-6" />}
          color="blue"
        />

        <StatsCard
          title="User mới tháng này"
          value={stats.newUsersThisMonth}
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="blue"
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
              {recentActivities.map((activity: ActivityItem) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-full ${getActivityColor(
                      activity.status
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.time)}
                    </p>
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
              {topPosts.map((post: TopPost, index) => (
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
                        post.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : post.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.status === "approved"
                        ? "Đang hiển thị"
                        : post.status === "pending"
                        ? "Chờ duyệt"
                        : "Khác"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
