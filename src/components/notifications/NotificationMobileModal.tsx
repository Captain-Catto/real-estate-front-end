"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/store/slices/notificationSlice";

interface NotificationMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationMobileModal: React.FC<NotificationMobileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    getFilteredNotifications,
  } = useNotifications();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleTabClick = (tab: "ALL" | "UNREAD", event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveTab(tab);
  };

  const handleMarkAllAsRead = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    markAllAsRead();
  };

  const handleContentClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

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

  const handleNotificationClick = async (
    notification: Notification,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Notification clicked:", notification);
    console.log("Notification data:", notification.data);
    console.log("Action button:", notification.data?.actionButton);

    // Mark as read first
    if (!notification.read) {
      console.log("Marking as read...");
      await markAsRead(notification._id);
    }

    // Handle navigation
    if (notification.data?.actionButton?.link) {
      const link = notification.data.actionButton.link;
      console.log("Navigating to:", link);

      // Check if it's an external link
      if (link.startsWith("http://") || link.startsWith("https://")) {
        console.log("Opening external link");
        window.open(link, "_blank");
      } else {
        console.log("Navigating to internal link");
        // Close modal first, then navigate immediately
        onClose();

        // Navigate immediately without setTimeout
        router.push(link);
        return;
      }
    } else {
      console.log("No link found in notification data");
      // Fallback: navigate to a default page or show a message
      console.log(
        "Available notification data keys:",
        Object.keys(notification.data || {})
      );

      // Optional: Navigate to a default notification detail page
      // onClose();
      // router.push('/thong-bao');
    }

    // Close modal if no navigation needed
    onClose();
  };

  const getTabCount = (tab: string) => {
    if (tab === "ALL") return notifications.length;
    if (tab === "UNREAD") return unreadCount;
    return 0;
  };

  const filteredNotifications = getFilteredNotifications(activeTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-white z-[200] flex flex-col overflow-hidden w-full max-w-full"
      onClick={handleContentClick}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            Thông báo
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mt-3 gap-2 w-full">
          {["ALL", "UNREAD"].map((tab) => (
            <button
              key={tab}
              onClick={(e) => handleTabClick(tab as "ALL" | "UNREAD", e)}
              className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg transition-colors min-w-0 ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="truncate">
                {tab === "ALL" ? "Tất cả" : "Chưa đọc"} ({getTabCount(tab)})
              </span>
            </button>
          ))}
        </div>

        {/* Mark all as read */}
        <div className="mt-3 w-full">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors truncate"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto bg-gray-50 overscroll-contain w-full"
        style={{
          maxHeight: "calc(100vh - 180px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4 w-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5-5-5h5V3h0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm break-words">
              {activeTab === "ALL"
                ? "Chưa có thông báo nào"
                : "Không có thông báo chưa đọc"}
            </p>
          </div>
        ) : (
          <div className="bg-white divide-y divide-gray-100 min-h-full w-full">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification._id || index}
                onClick={(event) =>
                  handleNotificationClick(notification, event)
                }
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100 w-full ${
                  !notification.read ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div className="flex items-start space-x-3 w-full">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === "PAYMENT"
                        ? "bg-green-100"
                        : notification.type === "ORDER"
                        ? "bg-yellow-100"
                        : notification.type === "SYSTEM"
                        ? "bg-red-100"
                        : notification.type === "POST_APPROVED"
                        ? "bg-green-100"
                        : notification.type === "POST_REJECTED"
                        ? "bg-red-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        notification.type === "PAYMENT"
                          ? "text-green-600"
                          : notification.type === "ORDER"
                          ? "text-yellow-600"
                          : notification.type === "SYSTEM"
                          ? "text-red-600"
                          : notification.type === "POST_APPROVED"
                          ? "text-green-600"
                          : notification.type === "POST_REJECTED"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p
                      className="text-sm font-medium text-gray-900 mb-1 break-words"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {notification.title}
                    </p>
                    <p
                      className="text-sm text-gray-600 mb-2 break-words"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 break-words truncate">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationMobileModal;
