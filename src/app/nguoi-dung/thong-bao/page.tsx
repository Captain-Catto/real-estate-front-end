"use client";

import React, { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";
import { showErrorToast } from "@/utils/errorHandler";

interface NotificationData {
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications();
      if (response.success) {
        // Convert ServiceNotification to Notification format
        const convertedNotifications = (response.data || []).map((item) => ({
          _id: item._id,
          title: item.title,
          message: item.message,
          type: item.type as
            | "PAYMENT"
            | "ORDER"
            | "SYSTEM"
            | "PROMOTION"
            | "ACCOUNT",
          read: item.read || item.isRead || false,
          createdAt: item.createdAt,
          userId: item.userId || "",
          data: item.data || {},
        }));
        setNotifications(convertedNotifications);
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi tải thông báo");
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
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi đánh dấu thông báo là đã đọc");
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    for (const notification of unreadNotifications) {
      await markAsRead(notification._id);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                <p className="text-gray-600 mt-1">
                  Quản lý và xem tất cả các thông báo của bạn
                </p>
              </div>

              {/* Mark all as read button */}
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as "ALL" | "UNREAD")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab === "ALL" ? "Tất cả" : "Chưa đọc"}
                    {tab === "UNREAD" && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : getFilteredNotifications().length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="mb-4 flex items-center justify-center">
                  <svg
                    width="80"
                    height="80"
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
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {activeTab === "UNREAD"
                    ? "Không có thông báo chưa đọc"
                    : "Chưa có thông báo nào"}
                </h3>
                <p className="text-gray-500">
                  {activeTab === "UNREAD"
                    ? "Tất cả thông báo của bạn đã được đọc"
                    : "Chúng tôi sẽ thông báo khi có cập nhật mới"}
                </p>
              </div>
            ) : (
              /* Notification List */
              <div className="space-y-4">
                {getFilteredNotifications().map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg border transition-colors ${
                      !notification.read
                        ? "bg-blue-50 border-blue-200 border-l-4 border-l-blue-500"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={`text-base font-semibold ${
                              !notification.read
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 ml-3"></div>
                          )}
                        </div>

                        <p className="text-gray-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>

                          <div className="flex items-center space-x-3">
                            {/* Mark as read button for unread notifications */}
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
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
    </div>
  );
}
