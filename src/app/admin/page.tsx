"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { toast } from "sonner";
import {
  UserGroupIcon,
  HomeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  NewspaperIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalProjects: number;
  totalNews: number;
  totalRevenue: number;
  pendingPosts: number;
}

function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalProjects: 0,
    totalNews: 0,
    totalRevenue: 0,
    pendingPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard stats
    const loadStats = async () => {
      try {
        setLoading(true);
        // TODO: Fetch real stats from API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStats({
          totalUsers: 1250,
          totalPosts: 8500,
          totalProjects: 125,
          totalNews: 450,
          totalRevenue: 150000000,
          pendingPosts: 45,
        });
      } catch {
        toast.error("Lỗi khi tải thống kê dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const quickActions = [
    {
      title: "Quản lý người dùng",
      description: "Xem và quản lý thông tin người dùng",
      icon: UserGroupIcon,
      href: "/admin/quan-ly-nguoi-dung",
      permission: PERMISSIONS.USER.VIEW,
      color: "bg-blue-500",
    },
    {
      title: "Quản lý tin đăng",
      description: "Duyệt và quản lý tin đăng bất động sản",
      icon: HomeIcon,
      href: "/admin/quan-ly-tin-dang",
      permission: PERMISSIONS.POST.VIEW,
      color: "bg-green-500",
    },
    {
      title: "Quản lý dự án",
      description: "Tạo và quản lý các dự án bất động sản",
      icon: BuildingOfficeIcon,
      href: "/admin/quan-ly-du-an",
      permission: PERMISSIONS.PROJECT.VIEW,
      color: "bg-purple-500",
    },
    {
      title: "Quản lý tin tức",
      description: "Viết và quản lý bài viết tin tức",
      icon: NewspaperIcon,
      href: "/admin/quan-ly-tin-tuc",
      permission: PERMISSIONS.NEWS.VIEW,
      color: "bg-orange-500",
    },
    {
      title: "Thống kê",
      description: "Xem báo cáo và thống kê hệ thống",
      icon: ChartBarIcon,
      href: "/admin/thong-ke",
      permission: PERMISSIONS.STATISTICS.VIEW,
      color: "bg-indigo-500",
    },
    {
      title: "Cài đặt",
      description: "Cấu hình hệ thống và danh mục",
      icon: CogIcon,
      href: "/admin/quan-ly-danh-muc",
      permission: PERMISSIONS.SETTINGS.MANAGE_CATEGORIES,
      color: "bg-gray-500",
    },
  ];

  const statsCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers.toLocaleString(),
      icon: UserGroupIcon,
      color: "bg-blue-500",
      permission: PERMISSIONS.USER.VIEW,
    },
    {
      title: "Tin đăng",
      value: stats.totalPosts.toLocaleString(),
      icon: HomeIcon,
      color: "bg-green-500",
      permission: PERMISSIONS.POST.VIEW,
    },
    {
      title: "Dự án",
      value: stats.totalProjects.toLocaleString(),
      icon: BuildingOfficeIcon,
      color: "bg-purple-500",
      permission: PERMISSIONS.PROJECT.VIEW,
    },
    {
      title: "Tin tức",
      value: stats.totalNews.toLocaleString(),
      icon: NewspaperIcon,
      color: "bg-orange-500",
      permission: PERMISSIONS.NEWS.VIEW,
    },
    {
      title: "Doanh thu",
      value: formatCurrency(stats.totalRevenue),
      icon: BanknotesIcon,
      color: "bg-emerald-500",
      permission: PERMISSIONS.STATISTICS.VIEW,
    },
    {
      title: "Tin chờ duyệt",
      value: stats.pendingPosts.toLocaleString(),
      icon: DocumentTextIcon,
      color: "bg-red-500",
      permission: PERMISSIONS.POST.APPROVE,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trang quản trị
            </h1>
            <p className="text-gray-600">
              Chào mừng bạn đến với hệ thống quản trị Real Estate Platform
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => (
              <PermissionGuard key={index} permission={card.permission}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className={`${card.color} rounded-lg p-3`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">
                        {card.title}
                      </h3>
                      <div className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                        ) : (
                          card.value
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </PermissionGuard>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <PermissionGuard key={index} permission={action.permission}>
                  <button
                    onClick={() => router.push(action.href)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center mb-3">
                      <div className={`${action.color} rounded-lg p-2`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-900">
                        {action.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </button>
                </PermissionGuard>
              ))}
            </div>
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hoạt động gần đây
            </h2>
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tính năng đang được phát triển</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrap với AdminGuard
function AdminPageInternal() {
  return (
    <AdminGuard permissions={[PERMISSIONS.DASHBOARD.VIEW]}>
      <AdminDashboard />
    </AdminGuard>
  );
}

// Wrap component with AdminGuard
export default function ProtectedAdminPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.DASHBOARD.VIEW]}>
      <AdminPageInternal />
    </AdminGuard>
  );
}
