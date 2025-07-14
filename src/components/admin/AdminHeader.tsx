"use client";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function AdminHeader() {
  const { user } = useAuth();

  // Function để lấy lời chào theo thời gian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    if (hour < 22) return "Chào buổi tối";
    return "Chào đêm khuya";
  };

  // Lấy tên admin từ user data hoặc fallback
  const adminName = user?.username || user?.email?.split("@")[0] || "Admin";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo/Title */}
        <div className="flex-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {getGreeting()}, {adminName}!
            </p>
          </div>
        </div>

        {/* Right side - User Menu only */}
        <div className="flex items-center">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 text-sm focus:outline-none">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/admin/profile"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Thông tin cá nhân
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/admin/settings"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Cài đặt
                    </Link>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-200">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          // Handle logout
                          localStorage.removeItem("accessToken");
                          localStorage.removeItem("refreshToken");
                          window.location.href = "/dang-nhap";
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${
                          active ? "bg-gray-100" : ""
                        }`}
                      >
                        Đăng xuất
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
