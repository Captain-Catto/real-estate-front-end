"use client";
import { useState, Fragment, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/store/hooks";
import { useIsMobile } from "@/hooks/useIsMobile";
import { toast } from "sonner";
import { FavoriteItem } from "@/store/slices/favoritesSlices";
import { formatPriceByType } from "@/utils/format";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default function ActionButton() {
  // Use our enhanced auth hook
  const { user, isAuthenticated, loading, logout, accessToken } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  // Lấy danh sách yêu thích và các actions từ Redux store
  const {
    favorites: favoriteItems,
    loading: favoritesLoading,
    removeFavorite,
    fetchUserFavorites,
  } = useFavorites();

  // State cho popup yêu thích
  const [showFavoritesPopup, setShowFavoritesPopup] = useState(false);
  const favoritesRef = useRef<HTMLDivElement>(null);

  // Fetch favorites when component mounts or user authentication changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserFavorites();
    }
  }, [isAuthenticated, accessToken, fetchUserFavorites]);

  // Handle logout
  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      window.location.href = "/";
    }
  };

  // Hàm xử lý click nút favorites
  const handleFavoritesClick = () => {
    if (isMobile) {
      // Trên mobile, chuyển đến trang yêu thích
      router.push("/nguoi-dung/yeu-thich");
    } else {
      // Trên desktop, toggle popup
      setShowFavoritesPopup(!showFavoritesPopup);
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
    } catch (error) {
      // Log for debugging, show user-friendly message via toast
      console.log("Remove favorite error (logged for debugging):", error);
      toast.error("Có lỗi xảy ra khi xóa yêu thích");
    }
  };

  // Handle click outside to close popups (chỉ trên desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isMobile &&
        favoritesRef.current &&
        !favoritesRef.current.contains(event.target as Node)
      ) {
        setShowFavoritesPopup(false);
      }
    };

    if (!isMobile && showFavoritesPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFavoritesPopup, isMobile]);

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-8"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-20"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Notification Button - Chỉ hiển thị khi đã đăng nhập */}
      {isAuthenticated && user && <NotificationDropdown />}

      {/* Favorites Button - Chỉ hiển thị khi đã đăng nhập */}
      {isAuthenticated && user && (
        <div className="relative" ref={favoritesRef}>
          <button
            onClick={handleFavoritesClick}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative"
            title="Yêu thích"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200"
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

            {/* Favorites Badge */}
            {favoriteItems.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {favoriteItems.length > 99 ? "99+" : favoriteItems.length}
                </span>
              </span>
            )}
          </button>

          {/* Favorites Popup - Chỉ hiển thị trên desktop */}
          {!isMobile && (
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
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Danh sách yêu thích ({favoriteItems.length})
                  </h3>

                  {favoritesLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                    </div>
                  ) : favoriteItems.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                      <Image
                        src="/empty-favorites.svg"
                        alt="No favorites"
                        width={150}
                        height={150}
                        className="mx-auto mb-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {favoriteItems.map((item: FavoriteItem) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
                        >
                          {/* Hình ảnh */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                            {item.image && item.image !== "/placeholder.jpg" ? (
                              <Image
                                src={
                                  Array.isArray(item.image)
                                    ? item.image[0]
                                    : item.image
                                }
                                alt={item.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  // Show fallback icon
                                  const fallback =
                                    target.parentElement?.querySelector(
                                      ".fallback-icon"
                                    ) as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}

                            {/* Fallback icon */}
                            <div
                              className="fallback-icon w-full h-full flex items-center justify-center"
                              style={{
                                display:
                                  item.image &&
                                  item.image !== "/placeholder.jpg"
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-sm font-semibold text-red-600">
                              {item.price && typeof item.price === "number"
                                ? formatPriceByType(
                                    item.price,
                                    item.type === "property" ? "ban" : "project"
                                  )
                                : item.price || "Liên hệ"}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {item.location}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFavorite(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                            title="Xóa khỏi yêu thích"
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
                      ))}
                    </div>
                  )}

                  {favoriteItems.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 mt-3 pt-3">
                        <Link
                          href="/nguoi-dung/yeu-thich"
                          className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                          onClick={() => setShowFavoritesPopup(false)}
                        >
                          Xem tất cả yêu thích →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Transition>
          )}
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

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                <MenuItem>
                  <Link
                    href="/nguoi-dung/tong-quan"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Thông tin cá nhân
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Quản lý tin đăng
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/nguoi-dung/vi-tien"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Ví tiền
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/nguoi-dung/yeu-thich"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Yêu thích
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Đăng xuất
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      ) : (
        /* Login Button - Hiển thị khi chưa đăng nhập */
        <div className="flex items-center gap-3">
          <Link
            href="/dang-nhap"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Đăng nhập
          </Link>
          <Link
            href="/dang-ky"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-all duration-200"
          >
            Đăng ký
          </Link>
        </div>
      )}
    </div>
  );
}
