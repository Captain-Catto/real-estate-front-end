"use client";
import { useState, Fragment, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";

export default function TongQuanPage() {
  // Mock user data - thay thế bằng data thật từ context/API
  const userData = {
    name: "Lê Quang Trí Đạt",
    avatar: "Đ", // First letter of name
    balance: "0 đ",
    greeting: "Chào buổi sáng 🌤",
  };

  // State cho notification popup
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);
  const desktopNotificationRef = useRef<HTMLDivElement>(null);
  const [activeNotificationTab, setActiveNotificationTab] = useState("ALL");

  // Handle click outside để đóng popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Kiểm tra cả 2 ref
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

  return (
    <>
      <div className="flex">
        {/* Sidebar - Hide on mobile and tablet */}
        <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen w-full">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow">
              {/* Header Section */}
              <div className="bg-white border-b border-gray-200 p-2 sm:p-6 rounded-t-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Side - User Info and Notification (aligned horizontally on mobile) */}
                  <div className="flex items-center justify-between w-full lg:w-auto">
                    {/* User Avatar & Info */}
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
                            <p className="font-medium text-gray-900">
                              {userData.name}
                            </p>
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

                    {/* Mobile Notification - Aligned to the right on mobile */}
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
                              3
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
                                        onClick={() =>
                                          setActiveNotificationTab(tab)
                                        }
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
                              <div
                                className="tab-body"
                                style={{ overflow: "auto" }}
                              >
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
                  </div>

                  {/* Right Side - Wallet & Actions */}
                  <div className="mt-4 lg:mt-0 flex items-center gap-4 lg:w-auto">
                    {/* Wallet Info */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex-[1.5] lg:flex-none h-[48px]">
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

                      {/* Nạp tiền Button */}
                      <Link href="/nap-tien" className="flex-1 lg:flex-none">
                        <button className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors w-full lg:w-auto justify-center h-[48px]">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
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
                    </div>

                    {/* Desktop Notification - Hidden on mobile */}
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
                              3
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
                                        onClick={() =>
                                          setActiveNotificationTab(tab)
                                        }
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
                              <div
                                className="tab-body"
                                style={{ overflow: "auto" }}
                              >
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
                  </div>
                </div>
              </div>
              {/* Content Area */}
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Tổng quan tài khoản */}
                <div className="mb-6 lg:mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Tổng quan tài khoản
                  </h2>

                  {/* Overview Cards - Mobile responsive */}
                  <div className="flex gap-3 sm:gap-4 overflow-x-auto mb-4 sm:mb-6 pb-2">
                    {/* Tin đăng Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 min-w-[260px] sm:min-w-[280px] lg:min-w-[320px] flex-shrink-0">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-gray-700 sm:w-6 sm:h-6"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium text-sm">Tin đăng</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg sm:text-xl font-semibold">
                            0 tin
                          </p>
                          <p className="text-xs text-gray-500">Đang hiển thị</p>
                        </div>
                      </div>
                      <Link
                        href="/dang-tin"
                        className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        Đăng tin
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M9.47 7.47a.75.75 0 0 1 1.06 0l3.293 3.293a1.75 1.75 0 0 1 0 2.474L10.53 16.53a.75.75 0 1 1-1.06-1.06l3.293-3.293a.25.25 0 0 0 0-.354L9.47 8.53a.75.75 0 0 1 0-1.06"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>

                    {/* Liên hệ Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 min-w-[260px] sm:min-w-[280px] lg:min-w-[320px] flex-shrink-0">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-gray-700 sm:w-6 sm:h-6"
                        >
                          <path
                            fill="currentColor"
                            d="M13.499 6.25a4.25 4.25 0 1 0-8.5 0 4.25 4.25 0 0 0 8.5 0m4.25 0a2.75 2.75 0 0 0-2.75-2.75.75.75 0 1 1 0-1.5 4.25 4.25 0 0 1 0 8.5.75.75 0 1 1 0-1.5 2.75 2.75 0 0 0 2.75-2.75m-.309 13.883a2.63 2.63 0 0 1-1.942.836h-12.5a2.63 2.63 0 0 1-1.941-.836 2.13 2.13 0 0 1-.47-2.108C1.664 14.595 5.157 12 9.248 12c4.092 0 7.585 2.595 8.661 6.025.253.806.018 1.57-.47 2.108m3.81.867c.754 0 1.466-.311 1.94-.836a2.13 2.13 0 0 0 .465-2.11c-.753-2.37-2.675-4.374-5.155-5.252a.75.75 0 1 0-.5 1.414c2.044.724 3.617 2.378 4.226 4.293a.63.63 0 0 1-.147.648 1.13 1.13 0 0 1-.829.343h-.5a.75.75 0 0 0 0 1.5z"
                          />
                        </svg>
                        <span className="font-medium text-sm">
                          Liên hệ trong 30 ngày
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg sm:text-xl font-semibold">
                            0 người
                          </p>
                          <p className="text-xs text-green-600">
                            + 0 mới vào hôm nay
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Gói Hội Viên Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 min-w-[260px] sm:min-w-[280px] lg:min-w-[320px] flex-shrink-0">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-gray-700 sm:w-6 sm:h-6"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 6.5c.684 0 1.5-.668 1.5-1.833v-.834C13.5 12.668 12.684 12 12 12s-1.5.668-1.5 1.833v.834c0 1.165.816 1.833 1.5 1.833Zm-6.201.66 3.247-1.908A3.717 3.717 0 0 1 9 14.667v-.834c0-1.84 1.343-3.333 3-3.333s3 1.492 3 3.333v.834c0 .2-.016.395-.046.585L18.2 17.16a2.184 2.184 0 0 1 1.299 2.005v.709c0 .621-.504 1.125-1.125 1.125H5.625A1.125 1.125 0 0 1 4.5 19.875v-.709c0-.873.511-1.662 1.299-2.005Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium text-sm">
                          Gói Hội Viên
                        </span>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.32916 3.5C9.23969 3.5 9.15704 3.54782 9.11244 3.62538L4.51244 11.6254C4.4166 11.792 4.53691 12 4.72916 12H7.67252C8.77993 12 9.6089 13.0156 9.38704 14.1006L8.15227 20.1391C8.13665 20.2155 8.14983 20.265 8.16749 20.2998C8.18801 20.3403 8.22565 20.3808 8.27877 20.4094C8.33189 20.438 8.38644 20.447 8.4315 20.4419C8.47028 20.4374 8.51883 20.4211 8.57398 20.366L19.5132 9.42678C19.6707 9.26928 19.5591 9 19.3364 9H16.8687C15.5678 9 14.7216 7.63095 15.3034 6.46738L16.6062 3.8618C16.6893 3.69558 16.5684 3.5 16.3826 3.5H9.32916ZM7.81208 2.87768C8.12428 2.33472 8.70285 2 9.32916 2H16.3826C17.6835 2 18.5296 3.36905 17.9479 4.53262L16.6451 7.1382C16.562 7.30442 16.6828 7.5 16.8687 7.5H19.3364C20.8955 7.5 21.6763 9.385 20.5739 10.4874L9.63464 21.4267C8.40755 22.6537 6.33503 21.5388 6.68268 19.8386L7.91745 13.8001C7.94915 13.6451 7.83072 13.5 7.67252 13.5H4.72916C3.38339 13.5 2.54125 12.0443 3.21208 10.8777L7.81208 2.87768L8.44279 3.24034L7.81208 2.87768Z"
                              fill="currentColor"
                            />
                          </svg>
                          Tiết kiệm đến 39%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Thảnh thơi đăng tin/đẩy tin không lo biến động giá
                      </p>
                      <Link
                        href="/goi-hoi-vien"
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        Tìm hiểu ngay
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Thống kê hiệu suất tin đăng */}
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Thống kê hiệu suất tin đăng
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Theo dõi hiệu suất của các tin đăng bất động sản của bạn
                  </p>

                  {/* Statistics Cards - Mobile stack, tablet/desktop grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Lượt xem tin Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-blue-600 sm:w-6 sm:h-6"
                          >
                            <path
                              fill="currentColor"
                              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Lượt xem tin
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Số người xem tin của bạn
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            0
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            lượt xem
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            Hôm nay:
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-green-600">
                            +0
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: Hôm nay
                      </div>
                    </div>

                    {/* Click vào tin Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-green-600 sm:w-6 sm:h-6"
                          >
                            <path
                              fill="currentColor"
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Click vào tin
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Số người click vào chi tiết tin
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            0
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            lần click
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            Tỷ lệ click:
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-blue-600">
                            0%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: Hôm nay
                      </div>
                    </div>

                    {/* Click số điện thoại Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-orange-600 sm:w-6 sm:h-6"
                          >
                            <path
                              fill="currentColor"
                              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Click số điện thoại
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Số người xem số điện thoại
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            0
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            lần click
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            Từ click tin:
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-orange-600">
                            0%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: Hôm nay
                      </div>
                    </div>
                  </div>

                  {/* Chart Section - Mobile responsive */}
                  <div className="mt-6 sm:mt-8 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          Biểu đồ hiệu suất
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Theo dõi lượt xem và tương tác trong 7 ngày qua
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-600 rounded-lg">
                          7 ngày
                        </button>
                        <button className="px-3 py-1 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          30 ngày
                        </button>
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="h-48 sm:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="mx-auto mb-3 sm:mb-4 text-gray-400 sm:w-12 sm:h-12"
                        >
                          <path
                            fill="currentColor"
                            d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium text-sm sm:text-base">
                          Chưa có dữ liệu thống kê
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Đăng tin đầu tiên để xem thống kê
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tips Section - Mobile responsive */}
                  <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-blue-600 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
                          Mẹo tăng hiệu suất tin đăng
                        </h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                          <li>• Đăng ảnh chất lượng cao và nhiều góc chụp</li>
                          <li>• Viết tiêu đề hấp dẫn và mô tả chi tiết</li>
                          <li>• Cập nhật thông tin liên hệ chính xác</li>
                          <li>
                            • Sử dụng tính năng đẩy tin để tăng khả năng hiển
                            thị
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer with responsive padding */}
      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
