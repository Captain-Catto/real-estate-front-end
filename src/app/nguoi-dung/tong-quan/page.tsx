"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserIcon,
  HeartIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalPosts: number;
  activePosts: number;
  favorites: number;
  views: number;
  messages: number;
  notifications: number;
}

interface AdminStats {
  totalPublishedPosts: number;
  pendingPosts: number;
  totalContacts: number;
  totalViews: number;
  todayViews: number;
  weekViews: number;
}

export default function TongQuanPage() {
  const { isAuthenticated, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    activePosts: 0,
    favorites: 0,
    views: 0,
    messages: 0,
    notifications: 0,
  });
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalPublishedPosts: 0,
    pendingPosts: 0,
    totalContacts: 0,
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
  });

  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  // Authentication check
  useEffect(() => {
    if (user !== undefined) {
      setAccessChecked(true);
    }
  }, [user]);

  useEffect(() => {
    // TODO: Fetch real data from API
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data for regular users
        setStats({
          totalPosts: 12,
          activePosts: 8,
          favorites: 25,
          views: 1250,
          messages: 5,
          notifications: 3,
        });

        // Mock data for admin/employee
        if (isAdmin || isEmployee) {
          setAdminStats({
            totalPublishedPosts: 245,
            pendingPosts: 18,
            totalContacts: 156,
            totalViews: 25680,
            todayViews: 320,
            weekViews: 2150,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (user && accessChecked && isAuthenticated) {
      fetchDashboardData();
    }
  }, [user, isAdmin, isEmployee, accessChecked, isAuthenticated]);

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

  const statCards = [
    ...(isAdmin || isEmployee
      ? [
          {
            title: "Tin đã phê duyệt",
            value: adminStats.totalPublishedPosts,
            icon: CheckCircleIcon,
            color: "bg-green-500",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
          },
          {
            title: "Tin chờ duyệt",
            value: adminStats.pendingPosts,
            icon: ClipboardDocumentCheckIcon,
            color: "bg-orange-500",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
          },
          {
            title: "Lượt liên hệ",
            value: adminStats.totalContacts,
            icon: UserGroupIcon,
            color: "bg-blue-500",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
          },
          {
            title: "Tổng lượt xem",
            value: adminStats.totalViews.toLocaleString(),
            icon: ChartBarIcon,
            color: "bg-purple-500",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
          },
          {
            title: "Xem hôm nay",
            value: adminStats.todayViews,
            icon: EyeIcon,
            color: "bg-indigo-500",
            bgColor: "bg-indigo-50",
            textColor: "text-indigo-600",
          },
          {
            title: "Xem tuần này",
            value: adminStats.weekViews.toLocaleString(),
            icon: ChartBarIcon,
            color: "bg-teal-500",
            bgColor: "bg-teal-50",
            textColor: "text-teal-600",
          },
        ]
      : [
          {
            title: "Tổng bài đăng",
            value: stats.totalPosts,
            icon: DocumentTextIcon,
            color: "bg-blue-500",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
          },
          {
            title: "Bài đang hoạt động",
            value: stats.activePosts,
            icon: HomeIcon,
            color: "bg-green-500",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
          },
          {
            title: "Yêu thích",
            value: stats.favorites,
            icon: HeartIcon,
            color: "bg-red-500",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
          },
          {
            title: "Lượt xem",
            value: stats.views,
            icon: EyeIcon,
            color: "bg-purple-500",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
          },
          {
            title: "Yêu cầu liên hệ",
            value: stats.messages,
            icon: ChatBubbleLeftRightIcon,
            color: "bg-yellow-500",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600",
          },
          {
            title: "Thông báo",
            value: stats.notifications,
            icon: BellIcon,
            color: "bg-indigo-500",
            bgColor: "bg-indigo-50",
            textColor: "text-indigo-600",
          },
        ]),
  ];

  const quickActions = [
    ...(isAdmin || isEmployee
      ? [
          {
            title: "Kiểm tra tin đăng",
            description: "Duyệt và quản lý các tin đăng",
            href: "/admin/kiem-tra-tin-dang",
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
            href: "/nguoi-dung/quan-ly-tin",
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`${stat.bgColor} ${stat.textColor} p-3 rounded-lg`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 animate-fade-in">
        {/* Quick Actions */}
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
