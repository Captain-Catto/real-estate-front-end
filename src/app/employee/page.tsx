"use client";
import { useState, useEffect } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeHeader from "@/components/employee/EmployeeHeader";
import StatsCard from "@/components/admin/StatsCard";
import {
  DocumentTextIcon,
  UserGroupIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Mock service cho employee stats
const EmployeeStatsService = {
  getEmployeeStats: async () => {
    await new Promise((r) => setTimeout(r, 500));
    return {
      totalPosts: 856,
      pendingPosts: 45,
      approvedPosts: 720,
      rejectedPosts: 91,
      totalNews: 123,
      pendingNews: 8,
      totalUsers: 1247,
      activeUsers: 1089,
      totalTransactions: 234,
      pendingTransactions: 12,
    };
  },

  getRecentActivities: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return [
      {
        id: 1,
        type: "post_pending",
        message: "Tin đăng mới cần duyệt: Bán căn hộ 2PN Vinhomes",
        time: "5 phút trước",
        status: "pending",
      },
      {
        id: 2,
        type: "user_registered",
        message: "Người dùng mới đăng ký: Nguyễn Văn A",
        time: "15 phút trước",
        status: "info",
      },
      {
        id: 3,
        type: "news_pending",
        message: "Bài viết tin tức mới: Xu hướng BĐS 2024",
        time: "30 phút trước",
        status: "pending",
      },
      {
        id: 4,
        type: "transaction_completed",
        message: "Giao dịch thanh toán hoàn thành: 500.000 VNĐ",
        time: "1 giờ trước",
        status: "success",
      },
      {
        id: 5,
        type: "post_approved",
        message: "Đã duyệt tin đăng: Cho thuê nhà phố Q7",
        time: "2 giờ trước",
        status: "success",
      },
    ];
  },
};

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        EmployeeStatsService.getEmployeeStats(),
        EmployeeStatsService.getRecentActivities(),
      ]);

      setStats(statsData);
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <EmployeeSidebar />
        <div className="flex-1">
          <EmployeeHeader />
          <main className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeHeader />
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Chào mừng, Nhân viên!
            </h1>
            <p className="text-gray-600">
              Quản lý nội dung và hỗ trợ người dùng trên hệ thống
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Tổng tin đăng"
              value={stats.totalPosts.toLocaleString()}
              icon={<DocumentTextIcon className="w-6 h-6" />}
              change={`${stats.pendingPosts} chờ duyệt`}
              changeType="warning"
              color="blue"
            />
            <StatsCard
              title="Người dùng"
              value={stats.totalUsers.toLocaleString()}
              icon={<UserGroupIcon className="w-6 h-6" />}
              change={`${stats.activeUsers} đang hoạt động`}
              changeType="increase"
              color="green"
            />
            <StatsCard
              title="Tin tức"
              value={stats.totalNews.toLocaleString()}
              icon={<NewspaperIcon className="w-6 h-6" />}
              change={`${stats.pendingNews} chờ duyệt`}
              changeType="warning"
              color="purple"
            />
            <StatsCard
              title="Giao dịch"
              value={stats.totalTransactions.toLocaleString()}
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
              change={`${stats.pendingTransactions} đang xử lý`}
              changeType="warning"
              color="orange"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Work Summary */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tổng quan công việc
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tin đăng */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Tin đăng</h4>
                      <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Chờ duyệt:</span>
                        <span className="font-medium text-orange-600">
                          {stats.pendingPosts}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đã duyệt:</span>
                        <span className="font-medium text-green-600">
                          {stats.approvedPosts}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Từ chối:</span>
                        <span className="font-medium text-red-600">
                          {stats.rejectedPosts}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tin tức */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Tin tức</h4>
                      <NewspaperIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Chờ duyệt:</span>
                        <span className="font-medium text-orange-600">
                          {stats.pendingNews}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tổng bài viết:</span>
                        <span className="font-medium text-gray-900">
                          {stats.totalNews}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Người dùng */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Người dùng</h4>
                      <UserGroupIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đang hoạt động:</span>
                        <span className="font-medium text-green-600">
                          {stats.activeUsers}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tổng người dùng:</span>
                        <span className="font-medium text-gray-900">
                          {stats.totalUsers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Giao dịch */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Giao dịch</h4>
                      <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đang xử lý:</span>
                        <span className="font-medium text-orange-600">
                          {stats.pendingTransactions}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tổng giao dịch:</span>
                        <span className="font-medium text-gray-900">
                          {stats.totalTransactions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Hoạt động gần đây
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.status === "pending"
                            ? "bg-orange-100"
                            : activity.status === "success"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {activity.status === "pending" && (
                          <ClockIcon className="w-4 h-4 text-orange-600" />
                        )}
                        {activity.status === "success" && (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        )}
                        {activity.status === "info" && (
                          <EyeIcon className="w-4 h-4 text-blue-600" />
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
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Thao tác nhanh
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href="/employee/quan-ly-tin-dang"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Duyệt tin đăng
                    </h4>
                    <p className="text-sm text-gray-500">
                      {stats.pendingPosts} tin chờ duyệt
                    </p>
                  </div>
                </a>

                <a
                  href="/employee/quan-ly-tin-tuc"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <NewspaperIcon className="w-6 h-6 text-purple-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Duyệt tin tức</h4>
                    <p className="text-sm text-gray-500">
                      {stats.pendingNews} bài chờ duyệt
                    </p>
                  </div>
                </a>

                <a
                  href="/employee/quan-ly-nguoi-dung"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserGroupIcon className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Quản lý người dùng
                    </h4>
                    <p className="text-sm text-gray-500">Hỗ trợ và quản lý</p>
                  </div>
                </a>

                <a
                  href="/employee/quan-ly-giao-dich"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CurrencyDollarIcon className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Theo dõi giao dịch
                    </h4>
                    <p className="text-sm text-gray-500">
                      {stats.pendingTransactions} đang xử lý
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
