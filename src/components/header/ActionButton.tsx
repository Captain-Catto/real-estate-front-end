"use client";
import { useState, Fragment, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationRefresh } from "@/hooks/useNotificationRefresh";

import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import { useAuth } from "@/hooks/useAuth"; // Updated import path
import { useFavorites } from "@/store/hooks";
import { toast } from "sonner";
import { FavoriteItem } from "@/store/slices/favoritesSlices";
import { formatPriceByType } from "@/utils/format";

export default function ActionButton() {
  // Use our enhanced auth hook
  const { user, isAuthenticated, loading, logout } = useAuth();

  // DEBUG: Log current user info
  useEffect(() => {
    if (user) {
      console.log("🔍 Current user ID:", user.id);
      console.log("🔍 Current user:", user);
    }
  }, [user]);

  // Listen for notification refresh events
  useNotificationRefresh();

  // Initialize router for navigation
  const router = useRouter();

  // Lấy danh sách yêu thích và các actions từ Redux store
  const {
    favorites: favoriteItems,
    loading: favoritesLoading,
    removeFavorite,
    fetchUserFavorites,
  } = useFavorites();

  // Use Redux notifications
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    getFilteredNotifications,
  } = useNotifications();

  // State cho popup yêu thích
  const [showFavoritesPopup, setShowFavoritesPopup] = useState(false);
  const favoritesRef = useRef<HTMLDivElement>(null);

  // State cho notification popup
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [activeNotificationTab, setActiveNotificationTab] = useState("ALL");

  // Fetch favorites when component mounts or user authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserFavorites();
    }
  }, [isAuthenticated, fetchUserFavorites]);

  // Handle notification click - navigate to link if available
  const handleNotificationClick = (notification: any) => {
    console.log(
      "🔔 Notification clicked:",
      notification._id,
      "read:",
      notification.read
    );

    // Always mark as read when clicked (even if already read for consistency)
    if (!notification.read) {
      console.log("📖 Marking notification as read:", notification._id);
      markAsRead(notification._id);
    }

    if (notification.data?.actionButton?.link) {
      // Close notification popup
      setShowNotificationPopup(false);

      // Navigate to the link using Next.js router
      const link = notification.data.actionButton.link;
      console.log("🔗 Navigating to:", link);

      // Check if it's an external link
      if (link.startsWith("http://") || link.startsWith("https://")) {
        window.open(link, "_blank");
      } else {
        // Internal link - use Next.js router
        router.push(link);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      window.location.href = "/";
    }
  };

  // Hàm xử lý xóa yêu thích
  const handleRemoveFavorite = async (itemId: string) => {
    try {
      await removeFavorite(itemId);
      toast.success("Đã xóa khỏi danh sách yêu thích");

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("favorites-updated", {
          detail: {
            action: "remove",
            itemId: itemId,
          },
        })
      );

      console.log("Favorite removed:", itemId);
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Không thể xóa khỏi danh sách yêu thích");
    }
  };

  // Handle click outside để đóng popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        favoritesRef.current &&
        !favoritesRef.current.contains(event.target as Node)
      ) {
        setShowFavoritesPopup(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPopup(false);
      }
    };

    if (showFavoritesPopup || showNotificationPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFavoritesPopup, showNotificationPopup]);

  // Hiển thị loading state khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Nút Yêu thích */}
      <div className="relative" ref={favoritesRef}>
        <button
          onClick={() => setShowFavoritesPopup(!showFavoritesPopup)}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative"
          title="Danh sách tin đã lưu"
        >
          <svg
            className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="currentColor"
              strokeWidth="2"
              fill={
                favoriteItems.length > 0 ? "rgba(239, 68, 68, 0.2)" : "none"
              }
              className="group-hover:fill-red-100"
            />
          </svg>

          {/* Badge số lượng - Hiển thị số lượng từ Redux store */}
          {favoriteItems.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {favoriteItems.length > 9 ? "9+" : favoriteItems.length}
              </span>
            </span>
          )}
        </button>

        {/* Popup Yêu thích */}
        <Transition
          show={showFavoritesPopup}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden scrollbar-stable">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  Tin đăng đã lưu
                </h3>
                {favoriteItems.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {favoriteItems.length} tin đăng
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            {favoritesLoading ? (
              <div className="px-4 py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            ) : favoriteItems.length === 0 ? (
              /* Empty State */
              <div className="px-4 py-8">
                <div className="text-center">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <path
                        d="M50 85L45 80C25 62 15 53 15 40C15 30 23 22 33 22C39 22 45 25 50 30C55 25 61 22 67 22C77 22 85 30 85 40C85 53 75 62 55 80L50 85z"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <circle
                        cx="70"
                        cy="30"
                        r="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                      />
                      <path
                        d="M65 25L75 35M75 25L65 35"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Bạn chưa lưu tin đăng nào
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Nhấn vào biểu tượng ♡ để lưu tin yêu thích
                  </p>
                </div>
              </div>
            ) : (
              /* List of favorites */
              <>
                <div className="max-h-80 overflow-y-auto">
                  {favoriteItems.slice(0, 3).map((item: FavoriteItem) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                          <Image
                            src={
                              typeof item.image === "string"
                                ? item.image
                                : item.image[0]
                            }
                            alt={item.title}
                            width={64}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/chi-tiet/${item.slug}`}
                            onClick={() => setShowFavoritesPopup(false)}
                          >
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 hover:text-blue-600">
                              {item.title}
                            </h4>
                          </Link>
                          <div className="text-sm font-semibold text-red-600 mb-1">
                            {(() => {
                              // Parse price to handle different formats
                              const numericPrice =
                                typeof item.price === "string"
                                  ? parseFloat(
                                      item.price.replace(/[^\d]/g, "")
                                    ) || 0
                                  : Number(item.price) || 0;

                              if (numericPrice === 0) return "Thỏa thuận";

                              // Default to "ban" type if can't determine
                              return formatPriceByType(numericPrice, "ban");
                            })()}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="truncate">{item.location}</span>
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveFavorite(item.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Bỏ lưu"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Show more items indicator */}
                  {favoriteItems.length > 3 && (
                    <div className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50">
                      +{favoriteItems.length - 3} tin đăng khác
                    </div>
                  )}
                </div>

                {/* Footer - Show when has items */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <Link
                    href="/nguoi-dung/yeu-thich"
                    className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium w-full py-1 rounded transition-colors hover:bg-blue-50"
                    onClick={() => setShowFavoritesPopup(false)}
                  >
                    <span>Xem tất cả ({favoriteItems.length})</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Transition>
      </div>

      {/* Notification Button - Chỉ hiển thị khi đã đăng nhập */}
      {isAuthenticated && user && (
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotificationPopup(!showNotificationPopup);
            }}
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

          {/* Notification Popup */}
          <Transition
            show={showNotificationPopup}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
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
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>

                    {/* Notification Tabs */}
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                      {["ALL", "UNREAD"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveNotificationTab(tab)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            activeNotificationTab === tab
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
                  {notificationsLoading ? (
                    <div className="px-4 py-8 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    </div>
                  ) : getFilteredNotifications(
                      activeNotificationTab as "ALL" | "UNREAD"
                    ).length === 0 ? (
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
                          {activeNotificationTab === "UNREAD"
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
                      {getFilteredNotifications(
                        activeNotificationTab as "ALL" | "UNREAD"
                      ).map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read
                              ? "bg-blue-50 border-l-2 border-l-blue-500"
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

                              {/* Metadata */}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString("vi-VN")}
                                </span>
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
          </Transition>
        </div>
      )}

      {/* Conditional rendering based on authentication status */}
      {isAuthenticated && user ? (
        /* User Info & Menu với HeadlessUI */
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 data-[open]:bg-gray-50">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Name */}
            <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
              {user.username || user.email?.split("@")[0]}
            </span>

            {/* Dropdown Icon */}
            <svg
              className="w-3 h-3 text-gray-500 transition-transform duration-200 group-data-[open]:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </MenuButton>

          {/* Dropdown Menu với Transition */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 focus:outline-none overflow-hidden">
              <div className="py-2 overflow-y-auto pr-[17px] scrollbar-stable">
                <MenuItem>
                  <Link
                    href="/nguoi-dung/tai-khoan"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Thông tin cá nhân
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5v4M16 5v4"
                      />
                    </svg>
                    Tin đăng của tôi
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    href="/nguoi-dung/vi-tien"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Ví tiền
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    href="/nguoi-dung/yeu-thich"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Yêu thích
                  </Link>
                </MenuItem>

                <hr className="my-1" />

                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2 data-[focus]:bg-red-50"
                  >
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Đăng xuất
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      ) : (
        /* Login & Register Buttons */
        <div className="flex items-center gap-3">
          <Link
            href="/dang-nhap"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-red-300 focus:ring-opacity-50"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-1 focus:ring-red-300 focus:ring-opacity-50"
          >
            Đăng ký
          </Link>
        </div>
      )}
    </div>
  );
}
