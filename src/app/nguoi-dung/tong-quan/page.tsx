"use client";

import { useState, useEffect, useRef } from "react";
import UserSidebar from "@/components/user/UserSidebar";
import Footer from "@/components/footer/Footer";
import { useAuth } from "@/store/hooks";
import UserHeader from "@/components/user/UserHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

export default function TongQuanPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  // Use wallet hook with safeguards
  const { balance, formattedBalance } = useWallet();

  // Use a ref to track data loading state
  const dataLoadingRef = useRef(false);

  // User data for UserHeader component
  const userData = {
    name: user?.username || "Người dùng",
    avatar: (user?.username?.[0] || "U").toUpperCase(),
    greeting: getGreeting(),
    verified: user?.emailVerified || false,
  };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng 🌅";
    if (hour < 18) return "Chào buổi chiều ☀️";
    return "Chào buổi tối 🌙";
  }

  // Mock data for recent posts
  const recentPosts = [
    {
      id: 1,
      title: "Nhà phố mặt tiền đường Nguyễn Văn Linh",
      price: "2,500,000,000",
      status: "active",
      date: "10/06/2023",
      views: 125,
    },
    // ...other posts
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      type: "post_created",
      title: "Bạn đã đăng tin mới",
      description: "Nhà phố mặt tiền đường Nguyễn Văn Linh",
      date: "10/06/2023 15:30",
    },
    // ...other activities
  ];

  // Check if authenticated once on mount
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/dang-nhap");
    }
  }, [isAuthenticated, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex">
        {/* Sidebar - Hide on mobile and tablet */}
        <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen w-full pb-20 lg:pb-0">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow">
              {/* Header Section - Using Component */}
              <UserHeader
                userData={userData}
                showNotificationButton={true}
                showWalletButton={true}
              />

              {/* Content Area */}
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Tổng quan tài khoản */}
                <div className="mb-6 lg:mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Tổng quan tài khoản
                  </h2>

                  {/* Overview Cards - Mobile responsive */}
                  <div className="flex gap-3 sm:gap-4 overflow-x-auto mb-4 sm:mb-6 pb-2">
                    {/* Tin đăng Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 min-w-[260px] sm:min-w-[280px] lg:min-w-[320px] flex-shrink-0">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-gray-700 sm:w-6 sm:h-6"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium text-sm">Tin đăng</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg sm:text-xl font-semibold">
                            0 tin
                          </p>
                          <p className="text-xs text-gray-500">Đang hiển thị</p>
                        </div>
                      </div>
                      <Link
                        href="/nguoi-dung/dang-tin"
                        className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        Đăng tin
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M9.47 7.47a.75.75 0 0 1 1.06 0l3.293 3.293a1.75 1.75 0 0 1 0 2.474L10.53 16.53a.75.75 0 1 1-1.06-1.06l3.293-3.293a.25.25 0 0 0 0-.354L9.47 8.53a.75.75 0 0 1 0-1.06"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>

                    {/* Liên hệ Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 min-w-[260px] sm:min-w-[280px] lg:min-w-[320px] flex-shrink-0">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-gray-700 sm:w-6 sm:h-6"
                        >
                          <path
                            fill="currentColor"
                            d="M13.499 6.25a4.25 4.25 0 1 0-8.5 0 4.25 4.25 0 0 0 8.5 0m4.25 0a2.75 2.75 0 0 0-2.75-2.75.75.75 0 1 1 0-1.5 4.25 4.25 0 0 1 0 8.5.75.75 0 1 1 0-1.5 2.75 2.75 0 0 0 2.75-2.75m-.309 13.883a2.63 2.63 0 0 1-1.942.836h-12.5a2.63 2.63 0 0 1-1.941-.836 2.13 2.13 0 0 1-.47-2.108C1.664 14.595 5.157 12 9.248 12c4.092 0 7.585 2.595 8.661 6.025.253.806.018 1.57-.47 2.108m3.81.867c.754 0 1.466-.311 1.94-.836a2.13 2.13 0 0 0 .465-2.11c-.753-2.37-2.675-4.374-5.155-5.252a.75.75 0 1 0-.5 1.414c2.044.724 3.617 2.378 4.226 4.293a.63.63 0 0 1-.147.648 1.13 1.13 0 0 1-.829.343h-.5a.75.75 0 0 0 0 1.5z"
                          />
                        </svg>
                        <span className="font-medium text-sm">
                          Liên hệ trong 30 ngày
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg sm:text-xl font-semibold">
                            0 người
                          </p>
                          <p className="text-xs text-green-600">
                            + 0 mới vào hôm nay
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thống kê hiệu suất tin đăng */}
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Thống kê hiệu suất tin đăng
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Theo dõi hiệu suất của các tin đăng bất động sản của bạn
                  </p>

                  {/* Statistics Cards - Mobile stack, tablet/desktop grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Lượt xem tin Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-blue-600 sm:w-6 sm:h-6"
                          >
                            <path
                              fill="currentColor"
                              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Lượt xem tin
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Số người xem tin của bạn
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            0
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            lượt xem
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            Hôm nay:
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-green-600">
                            +0
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: Hôm nay
                      </div>
                    </div>

                    {/* Click vào tin Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-green-600 sm:w-6 sm:h-6"
                          >
                            <path
                              fill="currentColor"
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Click vào tin
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Số người click vào chi tiết tin
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            0
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            lần click
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            Tỷ lệ click:
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-blue-600">
                            0%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: Hôm nay
                      </div>
                    </div>

                    {/* Click số điện thoại Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-orange-600 sm:w-6 sm:h-6"
                          >
                            <path
                              fill="currentColor"
                              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Click số điện thoại
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Số người xem số điện thoại
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            0
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            lần click
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            Từ click tin:
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-orange-600">
                            0%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: Hôm nay
                      </div>
                    </div>
                  </div>

                  {/* Chart Section - Mobile responsive */}
                  <div className="mt-6 sm:mt-8 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          Biểu đồ hiệu suất
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Theo dõi lượt xem và tương tác trong 7 ngày qua
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-600 rounded-lg">
                          7 ngày
                        </button>
                        <button className="px-3 py-1 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          30 ngày
                        </button>
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="h-48 sm:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="mx-auto mb-3 sm:mb-4 text-gray-400 sm:w-12 sm:h-12"
                        >
                          <path
                            fill="currentColor"
                            d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium text-sm sm:text-base">
                          Chưa có dữ liệu thống kê
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Đăng tin đầu tiên để xem thống kê
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tips Section - Mobile responsive */}
                  <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-blue-600 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
                          Mẹo tăng hiệu suất tin đăng
                        </h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                          <li>• Đăng ảnh chất lượng cao và nhiều góc chụp</li>
                          <li>• Viết tiêu đề hấp dẫn và mô tả chi tiết</li>
                          <li>• Cập nhật thông tin liên hệ chính xác</li>
                          <li>
                            • Sử dụng tính năng đẩy tin để tăng khả năng hiển
                            thị
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          {/* Tổng quan */}
          <Link
            href="/nguoi-dung/tong-quan"
            className="flex flex-col items-center py-2 px-1 text-blue-600 bg-blue-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
              />
            </svg>
            <span className="text-xs font-medium">Tổng quan</span>
          </Link>

          {/* Quản lý tin */}
          <Link
            href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Quản lý</span>
          </Link>

          {/* Đăng tin */}
          <Link
            href="/nguoi-dung/dang-tin"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-1"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.75 2C8.16421 2 8.5 2.33579 8.5 2.75V7H12.75C13.1642 7 13.5 7.33579 13.5 7.75C13.5 8.16421 13.1642 8.5 12.75 8.5H8.5V12.75C8.5 13.1642 8.16421 13.5 7.75 13.5C7.33579 13.5 7 13.1642 7 12.75V8.5H2.75C2.33579 8.5 2 8.16421 2 7.75C2 7.33579 2.33579 7 2.75 7H7V2.75C7 2.33579 7.33579 2 7.75 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs">Đăng tin</span>
          </Link>

          {/* Nạp tiền */}
          <Link
            href="/nguoi-dung/vi-tien"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
              />
            </svg>
            <span className="text-xs">Ví tiền</span>
          </Link>

          {/* Tài khoản */}
          <Link
            href="/nguoi-dung/tai-khoan"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <span className="text-xs">Tài khoản</span>
          </Link>
        </div>
      </div>

      {/* Footer with responsive padding */}
      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
