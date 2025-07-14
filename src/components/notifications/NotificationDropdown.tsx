"use client";

import React, { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface ActionButton {
  text: string;
  link: string;
  style: "primary" | "secondary" | "success" | "warning" | "info" | "danger";
}

interface NotificationData {
  actionButton?: ActionButton;
  orderId?: string;
  amount?: number;
  postId?: string;
  postTitle?: string;
  packageName?: string;
  duration?: number;
  reason?: string;
  action?: string;
}

interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | "PAYMENT"
    | "POST_PAYMENT"
    | "POST_APPROVED"
    | "POST_REJECTED"
    | "PACKAGE_PURCHASE"
    | "SYSTEM"
    | "INTEREST";
  data: NotificationData;
  read: boolean;
  createdAt: string;
}

// Icon mapping for notification types
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "PAYMENT":
      return "💰";
    case "POST_PAYMENT":
      return "💳";
    case "PACKAGE_PURCHASE":
      return "🎉";
    case "POST_APPROVED":
      return "✅";
    case "POST_REJECTED":
      return "❌";
    case "INTEREST":
      return "💖";
    case "SYSTEM":
      return "🔔";
    default:
      return "📢";
  }
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = "",
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No token found");
        return;
      }

      console.log("Fetching notifications...");
      const response = await fetch(
        "http://localhost:8080/api/notifications?limit=10",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Notifications data:", data);

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
        console.log(
          "Set notifications:",
          data.data.notifications.length,
          "items"
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await fetch("http://localhost:8080/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Create demo notifications (for testing)
  const createDemoNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await fetch("http://localhost:8080/api/notifications/demo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error("Error creating demo notifications:", error);
    }
  };

  // Handle notification click - navigate to link if available
  const handleNotificationClick = (notification: Notification) => {
    if (notification.data.actionButton?.link) {
      // Mark as read if not already read
      if (!notification.read) {
        markAsRead(notification._id);
      }

      // Close dropdown
      setIsOpen(false);

      // Navigate to the link using Next.js router
      const link = notification.data.actionButton.link;

      // Check if it's an external link
      if (link.startsWith("http://") || link.startsWith("https://")) {
        window.open(link, "_blank");
      } else {
        // Internal link - use Next.js router
        router.push(link);
      }
    } else if (!notification.read) {
      // If no action button but notification is unread, just mark as read
      markAsRead(notification._id);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-blue-600" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <button
                onClick={createDemoNotifications}
                className="text-sm text-purple-600 hover:text-purple-800"
                title="Tạo demo notifications"
              >
                Demo
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có thông báo nào</p>
                <button
                  onClick={createDemoNotifications}
                  className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  Tạo demo notifications
                </button>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? "bg-blue-50" : ""
                    } ${
                      notification.data.actionButton?.link
                        ? "hover:bg-blue-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={`text-sm font-medium ${
                              !notification.read
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>

                          {/* Action Button - REMOVED, now click entire notification */}
                          {/* Click vào toàn bộ notification để chuyển hướng */}
                        </div>

                        {/* Mark as read button for unread notifications */}
                        {!notification.read &&
                          !notification.data.actionButton && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  router.push("/nguoi-dung/thong-bao");
                  setIsOpen(false);
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
