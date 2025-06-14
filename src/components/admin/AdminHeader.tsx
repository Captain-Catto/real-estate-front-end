"use client";
import { useState, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function AdminHeader() {
  const [notifications] = useState([
    {
      id: 1,
      message: "Có 5 tin đăng mới chờ duyệt",
      time: "5 phút trước",
      unread: true,
    },
    {
      id: 2,
      message: "Người dùng mới đăng ký: Nguyễn Văn A",
      time: "10 phút trước",
      unread: true,
    },
    {
      id: 3,
      message: "Giao dịch thành công: 2.5 tỷ VNĐ",
      time: "1 giờ trước",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none">
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
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
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Thông báo ({unreadCount} mới)
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <Menu.Item key={notification.id}>
                      <div
                        className={`p-4 hover:bg-gray-50 ${
                          notification.unread ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 text-sm focus:outline-none">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Admin</p>
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
                    <a
                      href="/admin/profile"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Thông tin cá nhân
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/admin/settings"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Cài đặt
                    </a>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-200">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/logout"
                        className={`block px-4 py-2 text-sm text-gray-700 ${
                          active ? "bg-gray-100" : ""
                        }`}
                      >
                        Đăng xuất
                      </a>
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
