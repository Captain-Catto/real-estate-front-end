"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Notification as NotificationData } from "@/store/slices/notificationSlice";
import NotificationMobileModal from "./NotificationMobileModal";

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

  // Use Redux notifications
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    getFilteredNotifications,
  } = useNotifications();

  const tabs = ["ALL", "UNREAD"];

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isMobile &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile]);

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 43200)
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleNotificationClick = async (notification: NotificationData) => {
    console.log("Dropdown notification clicked:", notification);
    console.log("Dropdown notification data:", notification.data);

    if (!notification.read) {
      await markAsRead(notification._id);
    }

    if (notification.data?.actionButton?.link) {
      const link = notification.data.actionButton.link;
      console.log("Dropdown navigating to:", link);

      // Check if it's an external link
      if (link.startsWith("http://") || link.startsWith("https://")) {
        window.open(link, "_blank");
      } else {
        // Internal link - use Next.js router
        router.push(link);
      }
    } else {
      console.log("No link found in dropdown notification");
    }
    setIsOpen(false);
  };

  const getTabCount = (tab: string) => {
    if (tab === "ALL") return notifications.length;
    if (tab === "UNREAD") return unreadCount;
    return 0;
  };

  const filteredNotifications = getFilteredNotifications(activeTab);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative"
          title="Thông báo"
        >
          <svg
            className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors duration-200"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.7999 18.2998C14.7999 19.8298 13.6299 20.9998 12.0999 20.9998C10.5699 20.9998 9.3999 19.8298 9.3999 18.2998"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
            />
            <path
              d="M18.2222 12.6632C18.2222 10.65 18.2222 8.63684 18.2222 8.63684C18.2222 5.49632 15.4667 3 12 3C8.53333 3 5.77778 5.49632 5.77778 8.63684C5.77778 8.63684 5.77778 10.65 5.77778 12.6632C5.77778 15.8842 4 18.3 4 18.3H20C20 18.3 18.2222 15.8842 18.2222 12.6632Z"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
            />
          </svg>
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </span>
          )}
        </button>

        {/* Desktop Dropdown */}
        {isOpen && !isMobile && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
            <div
              className="container scroll-bar"
              style={{ maxHeight: "calc(100vh - 60px - 48px)" }}
            >
              {/* Header */}
              <div className="header">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Thông báo
                    </h3>
                    <button
                      onClick={() => {
                        markAllAsRead();
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as "ALL" | "UNREAD")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          activeTab === tab
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tab === "ALL" ? "Tất cả" : "Chưa đọc"} (
                        {getTabCount(tab)})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Body */}
              <div
                className="tab-body"
                style={{ overflow: "auto", maxHeight: "400px" }}
              >
                {loading ? (
                  <div className="px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  /* Empty State */
                  <div className="px-4 py-8">
                    <div className="text-center">
                      <div className="mb-4 flex items-center justify-center">
                        <svg
                          width="60"
                          height="60"
                          viewBox="0 0 130 130"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M118.42 75.84C118.43 83.2392 116.894 90.5589 113.91 97.33H16.0901C12.8945 90.0546 11.3623 82.1579 11.605 74.2154C11.8478 66.2728 13.8594 58.4844 17.4933 51.4177C21.1272 44.3511 26.2919 38.1841 32.6109 33.3662C38.93 28.5483 46.2444 25.2008 54.021 23.5676C61.7976 21.9345 69.8407 22.0568 77.564 23.9257C85.2874 25.7946 92.4966 29.363 98.6662 34.3709C104.836 39.3787 109.811 45.6999 113.228 52.8739C116.645 60.0478 118.419 67.8937 118.42 75.84Z"
                            fill="#F2F2F2"
                          ></path>
                          <path
                            d="M67.8105 114.8C73.1014 114.8 77.3905 110.511 77.3905 105.22C77.3905 99.9293 73.1014 95.6401 67.8105 95.6401C62.5196 95.6401 58.2305 99.9293 58.2305 105.22C58.2305 110.511 62.5196 114.8 67.8105 114.8Z"
                            fill="#A7A7A7"
                            stroke="#63666A"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M87.5702 65.5702C86.2602 53.8802 76.3802 49.7402 67.8102 49.7402C59.2402 49.7402 49.3702 53.8802 48.0602 65.5702C46.9402 74.2802 44.6502 80.9702 39.9302 87.3602C35.9302 92.9402 34.8102 98.7202 36.4202 102.71C36.6692 103.283 37.0822 103.769 37.6073 104.107C38.1323 104.445 38.7458 104.62 39.3702 104.61H96.2502C96.8831 104.631 97.5074 104.46 98.0424 104.121C98.5773 103.783 98.9981 103.291 99.2502 102.71C100.86 98.7102 99.6802 92.9402 95.7402 87.3602C91.0002 81.0002 88.6802 74.2802 87.5702 65.5702Z"
                            fill="#D7D7D7"
                          ></path>
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {activeTab === "UNREAD"
                          ? "Không có thông báo chưa đọc"
                          : "Không có thông báo nào"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Chúng tôi sẽ thông báo khi có cập nhật mới
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Notification List */
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read
                            ? "bg-blue-50 border-l-2 border-l-blue-500"
                            : ""
                        } ${
                          notification.data?.actionButton?.link
                            ? "hover:bg-blue-100"
                            : ""
                        }`}
                      >
                        <div className="flex items-start">
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-sm font-medium ${
                                !notification.read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <p
                              className="text-xs text-gray-600 mt-1"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {notification.message}
                            </p>

                            {/* Timestamp */}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-400">
                                {formatDate(notification.createdAt)}
                              </p>

                              {/* Unread indicator */}
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      <NotificationMobileModal
        isOpen={isOpen && isMobile}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default NotificationDropdown;
