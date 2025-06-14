"use client";

import { useState, Fragment, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import UserHeader from "@/components/user/UserHeader";

export default function ThongTinCaNhanPage() {
  // Mock user data - Thêm role để check admin
  const [userData, setUserData] = useState({
    name: "Lê Quang Trí Đạt",
    phone: "0901234567",
    email: "lequangtridat@example.com",
    avatar: "Đ",
    balance: "450.000 đ",
    greeting: "Chào buổi sáng 🌤",
    joinDate: "15/03/2023",
    role: "admin", // Thêm role - có thể là "admin" hoặc "user"
  });

  // Bỏ các state notification không cần thiết vì đã có trong UserHeader
  // const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  // const mobileNotificationRef = useRef<HTMLDivElement>(null);

  // Form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: userData.name,
    phone: userData.phone,
    email: userData.email,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bỏ mock notifications và useEffect không cần thiết
  // const notifications = [...];
  // useEffect(() => {...}, []);

  // Check if user is admin
  const isAdmin = userData.role === "admin";

  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update user data
      setUserData((prev) => ({
        ...prev,
        name: profileForm.name,
        phone: profileForm.phone,
        email: profileForm.email,
      }));

      setIsEditingProfile(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      alert("Đổi mật khẩu thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi đổi mật khẩu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setProfileForm({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
    });
    setIsEditingProfile(false);
  };

  const cancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  };

  return (
    <>
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen w-full pb-20 lg:pb-0">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow">
              {/* Header Section */}
              <UserHeader
                userData={userData}
                showNotificationButton={true}
                showWalletButton={false}
              />

              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Page Title */}
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                      Thông tin cá nhân
                    </h1>
                    <p className="text-gray-600">
                      Quản lý thông tin tài khoản và bảo mật của bạn
                    </p>
                  </div>

                  {/* Admin Access Card - Chỉ hiển thị khi user là admin */}
                  {isAdmin && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-purple-900">
                              Quản trị viên
                            </h3>
                          </div>
                        </div>
                        <Link
                          href="/admin"
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                        >
                          Trang Admin
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Thông tin tài khoản
                        </h2>
                        {!isEditingProfile && (
                          <button
                            onClick={() => setIsEditingProfile(true)}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            Chỉnh sửa
                          </button>
                        )}
                      </div>

                      {!isEditingProfile ? (
                        // View Mode
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-2xl">
                                {userData.avatar}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {userData.name}
                                </h3>
                                {/* Admin Badge */}
                                {isAdmin && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600">
                                Thành viên từ {userData.joinDate}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="text-green-500"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                  />
                                </svg>
                                <span className="text-sm text-green-600">
                                  Tài khoản đã xác thực
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên
                              </label>
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className="text-gray-900">
                                  {userData.name}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                              </label>
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className="text-gray-900">
                                  {userData.phone}
                                </span>
                              </div>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                              </label>
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className="text-gray-900">
                                  {userData.email}
                                </span>
                              </div>
                            </div>

                            {/* Role Field - Chỉ hiển thị cho admin */}
                            {isAdmin && (
                              <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Vai trò
                                </label>
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <span className="text-purple-900 font-medium">
                                    Quản trị viên hệ thống
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Edit Mode
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên *
                              </label>
                              <input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) =>
                                  handleProfileFormChange(
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập họ và tên"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại *
                              </label>
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) =>
                                  handleProfileFormChange(
                                    "phone",
                                    e.target.value
                                  )
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập số điện thoại"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                              </label>
                              <input
                                type="email"
                                value={profileForm.email}
                                onChange={(e) =>
                                  handleProfileFormChange(
                                    "email",
                                    e.target.value
                                  )
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập email"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveProfile}
                              disabled={isSubmitting}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isSubmitting}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Bảo mật
                        </h2>
                        {!isChangingPassword && (
                          <button
                            onClick={() => setIsChangingPassword(true)}
                            className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            Đổi mật khẩu
                          </button>
                        )}
                      </div>

                      {!isChangingPassword ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="text-green-600"
                              >
                                <path
                                  fill="currentColor"
                                  d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-green-800">
                                Mật khẩu được bảo mật
                              </span>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                              Lần đổi mật khẩu cuối: 15/05/2024
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">
                              Khuyến nghị bảo mật
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="text-green-500"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                  />
                                </svg>
                                <span>Mật khẩu đủ mạnh</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="text-green-500"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                  />
                                </svg>
                                <span>Email đã xác thực</span>
                              </div>
                              {isAdmin && (
                                <div className="flex items-center gap-2">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-green-500"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                    />
                                  </svg>
                                  <span>Quyền quản trị đã được xác thực</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="text-yellow-500"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M13 17h-2v-6h2v6zm0-8h-2V7h2v2zm-1-5.99L12 2C6.47 2 2 6.48 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                  />
                                </svg>
                                <span>Bật xác thực 2 bước (khuyến nghị)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Password Change Form
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu hiện tại *
                            </label>
                            <input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                handlePasswordFormChange(
                                  "currentPassword",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu mới *
                            </label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                handlePasswordFormChange(
                                  "newPassword",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nhập mật khẩu mới"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Xác nhận mật khẩu mới *
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                handlePasswordFormChange(
                                  "confirmPassword",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nhập lại mật khẩu mới"
                            />
                          </div>

                          <div className="text-xs text-gray-600">
                            <p>Mật khẩu nên có:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Ít nhất 6 ký tự</li>
                              <li>Bao gồm chữ hoa, chữ thường</li>
                              <li>Có ít nhất 1 số và 1 ký tự đặc biệt</li>
                            </ul>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={handleChangePassword}
                              disabled={isSubmitting}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting
                                ? "Đang cập nhật..."
                                : "Đổi mật khẩu"}
                            </button>
                            <button
                              onClick={cancelPasswordChange}
                              disabled={isSubmitting}
                              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
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
                d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
              />
            </svg>
            <span className="text-xs">Tổng quan</span>
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
            href="/dang-tin"
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

          {/* Ví tiền */}
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

          {/* Tài khoản - Active */}
          <Link
            href="/nguoi-dung/tai-khoan"
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
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <span className="text-xs font-medium">Tài khoản</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
