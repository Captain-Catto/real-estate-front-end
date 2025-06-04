"use client";
import { useState, Fragment, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";

export default function ActionButton() {
  // State để mô phỏng trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "Nguyễn Văn A",
    avatar: "/assets/images/avatar.jpg", // hoặc null nếu không có avatar
  });

  // State cho popup yêu thích
  const [showFavoritesPopup, setShowFavoritesPopup] = useState(false);
  const favoritesRef = useRef<HTMLDivElement>(null);

  // State cho notification popup
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [activeNotificationTab, setActiveNotificationTab] = useState("ALL");

  const handleLogout = () => {
    setIsLoggedIn(false);
    // TODO: Implement logout logic
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

  return (
    <div className="flex items-center gap-4">
      {/* Nút Yêu thích */}
      <div className="relative" ref={favoritesRef}>
        <button
          onClick={() => setShowFavoritesPopup(!showFavoritesPopup)}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group"
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
              fill="none"
              className="group-hover:fill-red-100"
            />
          </svg>
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
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-sm font-semibold text-gray-800">
                Tin đăng đã lưu
              </h3>
            </div>

            {/* Content - Empty State */}
            <div className="px-4 py-8">
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <path
                      d="M50 85L45 80C25 62 15 53 15 40C15 30 23 22 33 22C39 22 45 25 50 30C55 25 61 22 67 22C77 22 85 30 85 40C85 53 75 62 55 80L50 85Z"
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

            {/* Footer - Hidden when empty */}
            <div className="hidden px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Link
                href="/favorites"
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setShowFavoritesPopup(false)}
              >
                <span>Xem tất cả</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>
        </Transition>
      </div>

      {/* Notification Button - Chỉ hiển thị khi đã đăng nhập */}
      {isLoggedIn && (
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotificationPopup(!showNotificationPopup)}
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
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </span>
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
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>

                    {/* Notification Tabs */}
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                      {["ALL", "UNREAD", "SYSTEM"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveNotificationTab(tab)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            activeNotificationTab === tab
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {tab === "ALL"
                            ? "Tất cả"
                            : tab === "UNREAD"
                            ? "Chưa đọc"
                            : "Hệ thống"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tab Body */}
                <div className="tab-body" style={{ overflow: "auto" }}>
                  {/* Empty State */}
                  <div className="px-4 py-8">
                    <div className="text-center">
                      <div className="mb-4 flex items-center justify-center">
                        <svg
                          width="130"
                          height="130"
                          viewBox="0 0 130 130"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M118.42 75.84C118.43 83.2392 116.894 90.5589 113.91 97.33H16.0901C12.8945 90.0546 11.3623 82.1579 11.605 74.2154C11.8478 66.2728 13.8594 58.4844 17.4933 51.4177C21.1272 44.3511 26.2919 38.1841 32.6109 33.3662C38.93 28.5483 46.2444 25.2008 54.021 23.5676C61.7976 21.9345 69.8407 22.0568 77.564 23.9257C85.2874 25.7946 92.4966 29.363 98.6662 34.3709C104.836 39.3787 109.811 45.6999 113.228 52.8739C116.645 60.0478 118.419 67.8937 118.42 75.84Z"
                            fill="#F2F2F2"
                          ></path>
                          <path
                            d="M4.58008 97.3301H125.42"
                            stroke="#63666A"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
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
                          <path
                            d="M99.2101 102.71C100.82 98.7101 99.6401 92.9401 95.7001 87.3601C91.0001 81.0001 88.6801 74.2801 87.5701 65.5701C87.3182 62.3646 86.134 59.3027 84.1635 56.7618C82.193 54.2209 79.5221 52.3119 76.4801 51.2701C74.579 50.5286 72.5005 50.3684 70.5083 50.8099C68.516 51.2515 66.6999 52.2748 65.2901 53.7501C62.3755 56.9524 60.5972 61.0257 60.2301 65.3401C58.9201 75.5501 56.1401 82.0001 50.6001 89.5001C47.2401 94.2501 45.3701 101.63 48.2901 104.61H96.2901C96.9095 104.614 97.5164 104.437 98.0356 104.099C98.5547 103.761 98.9632 103.278 99.2101 102.71Z"
                            fill="white"
                          ></path>
                          <path
                            d="M86.3002 60.4702C82.0002 51.7802 73.8702 49.7402 67.8102 49.7402C59.2402 49.7402 49.3702 53.8802 48.0602 65.5702C46.9402 74.2802 44.6502 80.9702 39.9302 87.3602C35.9302 92.9402 34.8102 98.7202 36.4202 102.71C36.6692 103.283 37.0822 103.769 37.6073 104.107C38.1323 104.445 38.7458 104.62 39.3702 104.61H96.2502C96.8831 104.631 97.5074 104.46 98.0424 104.121C98.5773 103.783 98.9981 103.291 99.2502 102.71C100.86 98.7102 99.6802 92.9402 95.7402 87.3602C91.5766 81.5452 88.8894 74.8049 87.9102 67.7202"
                            stroke="#63666A"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                          ></path>
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        Không có thông báo nào
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Chúng tôi sẽ thông báo khi có cập nhật mới
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      )}

      {/* Conditional rendering based on login status */}
      {isLoggedIn ? (
        /* User Info & Menu với HeadlessUI */
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 data-[open]:bg-gray-50">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-gray-600 text-sm"></i>
              )}
            </div>

            {/* User Name */}
            <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
              {user.name}
            </span>

            {/* Dropdown Icon */}
            <i className="fas fa-chevron-down text-xs text-gray-500 transition-transform duration-200 data-[open]:rotate-180"></i>
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
            <MenuItems className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 focus:outline-none">
              <div className="py-2">
                <MenuItem>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <i className="fas fa-user text-gray-500"></i>
                    Thông tin cá nhân
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    href="/my-properties"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <i className="fas fa-home text-gray-500"></i>
                    Tin đăng của tôi
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    href="/favorites"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <i className="fas fa-heart text-gray-500"></i>
                    Tin đã lưu
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 flex items-center gap-2 data-[focus]:bg-gray-50"
                  >
                    <i className="fas fa-cog text-gray-500"></i>
                    Cài đặt
                  </Link>
                </MenuItem>

                <hr className="my-1" />

                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2 data-[focus]:bg-red-50"
                  >
                    <i className="fas fa-sign-out-alt text-red-500"></i>
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
            href="/login"
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

      {/* Test buttons - Remove in production */}
      <div className="ml-4 flex gap-2">
        <button
          onClick={() => setIsLoggedIn(true)}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Test Login
        </button>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Test Logout
        </button>
      </div>
    </div>
  );
}
