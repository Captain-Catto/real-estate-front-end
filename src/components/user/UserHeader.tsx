"use client";

import { useState, Fragment, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Link from "next/link";

interface UserHeaderProps {
  userData: {
    name: string;
    avatar: string;
    balance: string;
    greeting: string;
    verified?: boolean;
  };
  showNotificationButton?: boolean;
  showWalletButton?: boolean;
}

export default function UserHeader({
  userData,
  showNotificationButton = true,
  showWalletButton = false,
}: UserHeaderProps) {
  // State for notifications
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);
  const desktopNotificationRef = useRef<HTMLDivElement>(null);
  const [activeNotificationTab, setActiveNotificationTab] = useState("ALL");

  // Handle click outside for notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Kiểm tra notification refs
      const clickedInsideMobile =
        mobileNotificationRef.current?.contains(target);
      const clickedInsideDesktop =
        desktopNotificationRef.current?.contains(target);

      if (!clickedInsideMobile && !clickedInsideDesktop) {
        setShowNotificationPopup(false);
      }
    };

    if (showNotificationPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationPopup]);

  const unreadCount = 3; // Mock unread count

  return (
    <div className="bg-white border-b border-gray-200 p-2 sm:p-6 rounded-t-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side - User Info */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {userData.avatar}
                </span>
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-gray-600 mb-1">
                  {userData.greeting}
                </p>
                <div className="flex items-center gap-1">
                  <p className="font-medium text-gray-900">{userData.name}</p>
                  {userData.verified && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-blue-500"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
                      />
                    </svg>
                  )}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-600"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.64645 2.31307C5.84171 2.11781 6.15829 2.11781 6.35355 2.31307L10.7441 6.70359C11.46 7.41955 11.46 8.58035 10.7441 9.29631L6.35355 13.6868C6.15829 13.8821 5.84171 13.8821 5.64645 13.6868C5.45118 13.4916 5.45118 13.175 5.64645 12.9797L10.037 8.5892C10.3624 8.26377 10.3624 7.73613 10.037 7.41069L5.64645 3.02018C5.45118 2.82492 5.45118 2.50834 5.64645 2.31307Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Wallet & Actions */}
        <div className="mt-4 lg:mt-0 flex items-center gap-4 lg:w-auto">
          {/* Desktop Notifications */}
          {showNotificationButton && (
            <div className="hidden lg:block">
              <div className="relative" ref={desktopNotificationRef}>
                <button
                  onClick={() =>
                    setShowNotificationPopup(!showNotificationPopup)
                  }
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative cursor-pointer"
                  title="Thông báo"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-600 group-hover:text-blue-500 transition-colors duration-200"
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
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  </span>
                </button>

                {/* Desktop Notification Popup */}
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
            </div>
          )}

          {/* Wallet Info */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex-1 lg:flex-none h-[48px]">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-green-600"
                >
                  <path
                    fill="currentColor"
                    d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 leading-tight">
                  Số dư
                </span>
                <span className="font-semibold text-gray-900 text-sm leading-tight">
                  {userData.balance}
                </span>
              </div>
            </div>

            {/* Wallet Button - Conditional */}
            {showWalletButton && (
              <Link href="/nguoi-dung/vi-tien" className="flex-1 lg:flex-none">
                <button className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors w-full lg:w-auto justify-center h-[48px]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-white"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.16536 3.66861C2.70513 3.66861 2.33203 4.04171 2.33203 4.50194V6.00002H13.6628C13.6628 5.49936 13.6629 4.99894 13.6625 4.49846C13.6621 4.04021 13.2902 3.66861 12.8307 3.66861H3.16536ZM13.6628 7.00002V7.49872C13.6628 7.77486 13.8866 7.99872 14.1628 7.99872C14.4389 7.99872 14.6628 7.77486 14.6628 7.49872V6.50002C14.6628 6.34503 14.6628 6.19 14.6628 6.03496C14.6628 5.52268 14.6629 5.01015 14.6625 4.49768C14.6617 3.4862 13.8409 2.66861 12.8307 2.66861H3.16536C2.15284 2.66861 1.33203 3.48942 1.33203 4.50194V11.4974C1.33203 12.5099 2.15284 13.3307 3.16536 13.3307H8.99609C9.27224 13.3307 9.49609 13.1069 9.49609 12.8307C9.49609 12.5546 9.27224 12.3307 8.99609 12.3307H3.16536C2.70513 12.3307 2.33203 11.9577 2.33203 11.4974V7.00002H13.6628ZM12.832 8.99999C13.1082 8.99999 13.332 9.22385 13.332 9.49999V11H14.832C15.1082 11 15.332 11.2238 15.332 11.5C15.332 11.7761 15.1082 12 14.832 12H13.332V13.5C13.332 13.7761 13.1082 14 12.832 14C12.5559 14 12.332 13.7761 12.332 13.5V12H10.832C10.5559 12 10.332 11.7761 10.332 11.5C10.332 11.2238 10.5559 11 10.832 11H12.332V9.49999C12.332 9.22385 12.5559 8.99999 12.832 8.99999Z"
                      fill="currentColor"
                    />
                  </svg>
                  Nạp tiền
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Notification */}
          {showNotificationButton && (
            <div className="lg:hidden">
              <div className="relative" ref={mobileNotificationRef}>
                <button
                  onClick={() =>
                    setShowNotificationPopup(!showNotificationPopup)
                  }
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative cursor-pointer"
                  title="Thông báo"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-600 group-hover:text-blue-500 transition-colors duration-200"
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
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  </span>
                </button>

                {/* Mobile Notification Popup */}
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
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
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
                                width="100"
                                height="100"
                                viewBox="0 0 130 130"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="sm:w-32 sm:h-32"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
