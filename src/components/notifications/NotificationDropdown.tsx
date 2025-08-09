"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { notificationService } from "@/services/notificationService";

interface NotificationData {
  actionButton?: {
    text: string;
    link?: string;
    style?: "primary" | "secondary" | "success" | "warning" | "danger";
  };
  [key: string]: unknown;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "PAYMENT" | "ORDER" | "SYSTEM" | "PROMOTION" | "ACCOUNT";
  read: boolean;
  createdAt: string;
  userId: string;
  data: NotificationData;
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const tabs = ["ALL", "UNREAD"];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  // Get filtered notifications based on active tab
  const getFilteredNotifications = useCallback(() => {
    if (activeTab === "ALL") {
      return notifications;
    } else if (activeTab === "UNREAD") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return "💳";
      case "ORDER":
        return "📦";
      case "SYSTEM":
        return "⚙️";
      case "PROMOTION":
        return "🎉";
      case "ACCOUNT":
        return "👤";
      default:
        return "📢";
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications();
      if (response.success) {
        setNotifications(response.data || []);
        const unread =
          response.data?.filter((n: Notification) => !n.read) || [];
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Handle action button click
    if (notification.data.actionButton?.link) {
      router.push(notification.data.actionButton.link);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in (has token)
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchNotifications();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
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
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>

            {/* Tabs */}
            <div className="mt-3">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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
                    {tab === "ALL" ? "Tất cả" : "Chưa đọc"}
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
            ) : getFilteredNotifications().length === 0 ? (
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
                {getFilteredNotifications().map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read
                        ? "bg-blue-50 border-l-2 border-l-blue-500"
                        : ""
                    } ${
                      notification.data.actionButton?.link
                        ? "hover:bg-blue-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="text-lg flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

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

                          {/* Action button */}
                          {notification.data.actionButton && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                                notification.data.actionButton.style ===
                                "primary"
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : notification.data.actionButton.style ===
                                    "success"
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : notification.data.actionButton.style ===
                                    "warning"
                                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                                  : notification.data.actionButton.style ===
                                    "danger"
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-gray-600 text-white hover:bg-gray-700"
                              }`}
                            >
                              {notification.data.actionButton.text}
                            </button>
                          )}

                          {/* Mark as read button for unread notifications */}
                          {!notification.read &&
                            !notification.data.actionButton && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Đánh dấu đã đọc
                              </button>
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
      )}
    </div>
  );
};

export default NotificationDropdown;
