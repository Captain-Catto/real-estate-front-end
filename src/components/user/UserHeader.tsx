"use client";

import React, { useState, useRef, useEffect, Fragment } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";

interface UserData {
  name: string;
  avatar: string;
  greeting?: string;
  balance?: string;
  verified?: boolean;
}

interface UserHeaderProps {
  userData: UserData;
  showNotificationButton?: boolean;
  showWalletButton?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  userData,
  showNotificationButton = false,
  showWalletButton = false,
}) => {
  const router = useRouter();

  // Wallet hook with improved implementation
  const {
    formattedBalance,
    loading: walletLoading,
    refresh: refreshWallet,
  } = useWallet();

  // Notification state
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState("ALL");
  const mobileNotificationRef = useRef<HTMLDivElement>(null);
  const desktopNotificationRef = useRef<HTMLDivElement>(null);

  // Wallet popup state
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside of popups
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check for notification popup
      if (
        showNotificationPopup &&
        mobileNotificationRef.current &&
        desktopNotificationRef.current &&
        !mobileNotificationRef.current.contains(event.target as Node) &&
        !desktopNotificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPopup(false);
      }

      // Check for wallet popup
      if (
        showWalletPopup &&
        walletRef.current &&
        !walletRef.current.contains(event.target as Node)
      ) {
        setShowWalletPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationPopup, showWalletPopup]);

  // Placeholder notifications data
  const notifications = [
    {
      id: 1,
      title: "Tin đăng của bạn đã được duyệt",
      time: "5 phút trước",
      read: false,
      type: "POST",
    },
    {
      id: 2,
      title: "Bạn đã nạp 500.000đ vào tài khoản",
      time: "2 giờ trước",
      read: true,
      type: "PAYMENT",
    },
    {
      id: 3,
      title: "Có người quan tâm đến tin đăng của bạn",
      time: "1 ngày trước",
      read: false,
      type: "INTEREST",
    },
  ];

  const handleWalletClick = () => {
    setShowWalletPopup(!showWalletPopup);
  };

  const handleNotificationClick = () => {
    setShowNotificationPopup(!showNotificationPopup);
  };

  // Filter notifications based on active tab
  const filteredNotifications =
    activeNotificationTab === "ALL"
      ? notifications
      : notifications.filter((n) => n.type === activeNotificationTab);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {userData.avatar}
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {userData.greeting || "Xin chào"}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {userData.name}
            </h2>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wallet Button - Conditional rendering */}
          {showWalletButton && (
            <div className="relative" ref={walletRef}>
              <button
                onClick={handleWalletClick}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-700"
                >
                  <path
                    fill="currentColor"
                    d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                  />
                </svg>
                <span className="hidden sm:inline font-medium">
                  {walletLoading ? "Đang tải..." : formattedBalance}
                </span>
                <span className="sm:hidden font-medium">
                  {walletLoading ? "..." : formattedBalance}
                </span>
              </button>

              {/* Wallet Popup */}
              {showWalletPopup && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Ví tiền của bạn
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-blue-700">Số dư hiện tại</p>
                      <p className="text-xl font-bold text-blue-900">
                        {formattedBalance}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/nguoi-dung/vi-tien"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            fill="currentColor"
                            d="M4 20h16V8H4v12zM19 4h-4.18c-.41-1.16-1.52-2-2.82-2S9.6 2.84 9.18 4H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm1 14H8v-2h5v2zm3-4H8v-2h8v2zm0-4H8V8h8v2z"
                          />
                        </svg>
                        Xem chi tiết ví tiền
                      </Link>
                      <Link
                        href="/nguoi-dung/vi-tien"
                        className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors"
                      >
                        Nạp tiền
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notification Button - Conditional rendering */}
          {showNotificationButton && (
            <div className="relative" ref={desktopNotificationRef}>
              <button
                onClick={handleNotificationClick}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-700"
                >
                  <path
                    fill="currentColor"
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup - Desktop */}
              {showNotificationPopup && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden sm:block">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                  </div>

                  {/* Notification Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveNotificationTab("ALL")}
                      className={`flex-1 py-2 text-sm font-medium ${
                        activeNotificationTab === "ALL"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setActiveNotificationTab("POST")}
                      className={`flex-1 py-2 text-sm font-medium ${
                        activeNotificationTab === "POST"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      Tin đăng
                    </button>
                    <button
                      onClick={() => setActiveNotificationTab("PAYMENT")}
                      className={`flex-1 py-2 text-sm font-medium ${
                        activeNotificationTab === "PAYMENT"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      Giao dịch
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-gray-500 text-sm">
                          Không có thông báo
                        </p>
                      </div>
                    )}
                  </div>

                  {/* View All */}
                  {filteredNotifications.length > 0 && (
                    <div className="p-2 border-t border-gray-100 text-center">
                      <Link
                        href="/nguoi-dung/thong-bao"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Notification Panel - Only shown when showNotificationPopup is true */}
      {showNotificationPopup && (
        <div
          ref={mobileNotificationRef}
          className="fixed inset-0 bg-white z-50 sm:hidden overflow-y-auto"
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Thông báo</h2>
            <button
              onClick={() => setShowNotificationPopup(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fill="currentColor"
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveNotificationTab("ALL")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeNotificationTab === "ALL"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveNotificationTab("POST")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeNotificationTab === "POST"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Tin đăng
            </button>
            <button
              onClick={() => setActiveNotificationTab("PAYMENT")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeNotificationTab === "PAYMENT"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              Giao dịch
            </button>
          </div>

          {/* Notification List - Mobile */}
          {filteredNotifications.length > 0 ? (
            <div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="text-base font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-400"
                >
                  <path
                    fill="currentColor"
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Không có thông báo nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserHeader;
