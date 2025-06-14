"use client";

import { useState, Fragment, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";

export default function ViTienPage() {
  // Mock user data
  const userData = {
    name: "Lê Quang Trí Đạt",
    avatar: "Đ",
    balance: "450.000 đ",
    greeting: "Chào buổi sáng 🌤",
  };

  // State for notifications
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  // Payment state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "Giao dịch thành công",
      message: "Bạn đã nạp 500.000đ vào ví thành công",
      time: "2 phút trước",
      read: false,
      type: "success",
    },
    {
      id: 2,
      title: "Thanh toán gói tin",
      message: "Thanh toán gói VIP cho tin POST123 thành công",
      time: "1 giờ trước",
      read: false,
      type: "info",
    },
    {
      id: 3,
      title: "Nạp tiền thất bại",
      message: "Giao dịch nạp tiền bị từ chối bởi ngân hàng",
      time: "3 giờ trước",
      read: true,
      type: "error",
    },
  ];

  // Predefined amounts with bonus
  const predefinedAmounts = [
    { value: 100000, label: "100.000 đ", bonus: 0 },
    { value: 500000, label: "500.000 đ", bonus: 0 },
    { value: 1000000, label: "1.000.000 đ", bonus: 100000 },
    { value: 3000000, label: "3.000.000 đ", bonus: 300000 },
    { value: 5000000, label: "5.000.000 đ", bonus: 500000 },
  ];

  // Payment methods
  const paymentMethods = [
    {
      id: "vnpay",
      name: "VNPay",
      icon: "💳",
      description: "Thanh toán an toàn qua ví VNPay",
    },
  ];

  // Recent transactions for preview
  const recentTransactions = [
    {
      id: "TXN001",
      type: "deposit",
      amount: 500000,
      status: "completed",
      date: "2024-06-11 14:30",
      description: "Nạp tiền vào ví",
    },
    {
      id: "TXN002",
      type: "payment",
      amount: -50000,
      status: "completed",
      date: "2024-06-10 09:15",
      description: "Thanh toán gói tin VIP - Căn hộ Vinhomes",
    },
    {
      id: "TXN003",
      type: "deposit",
      amount: 1000000,
      status: "failed",
      date: "2024-06-09 16:45",
      description: "Nạp tiền vào ví (Thất bại)",
    },
  ];

  // Handle click outside for notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileNotificationRef.current &&
        !mobileNotificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setCustomAmount(numericValue);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseInt(customAmount);
    return 0;
  };

  const getBonusAmount = (amount: number) => {
    const predefined = predefinedAmounts.find((p) => p.value === amount);
    if (predefined) return predefined.bonus;

    // Check bonus for custom amounts
    if (amount >= 5000000) return 500000;
    if (amount >= 3000000) return 300000;
    if (amount >= 1000000) return 100000;
    return 0;
  };

  const getTotalAmount = () => {
    const baseAmount = getFinalAmount();
    const bonus = getBonusAmount(baseAmount);
    return baseAmount + bonus;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePayment = async () => {
    const amount = getFinalAmount();
    const totalAmount = getTotalAmount();
    const bonus = getBonusAmount(amount);

    if (amount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000đ");
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Processing VNPay payment:", {
        amount,
        bonus,
        totalAmount,
        method: "vnpay",
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      let message = `Nạp tiền thành công ${formatCurrency(amount)}`;
      if (bonus > 0) {
        message += ` + tặng ${formatCurrency(bonus)} = ${formatCurrency(
          totalAmount
        )}`;
      }
      message += " qua VNPay!";

      alert(message);

      setSelectedAmount(null);
      setCustomAmount("");
    } catch (error) {
      alert("Có lỗi xảy ra khi nạp tiền qua VNPay!");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === "deposit" || amount > 0) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const getTypeIcon = (type: string) => {
    return type === "deposit" ? "📥" : "📤";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen w-full pb-20 lg:pb-0">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow">
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
                            <p className="font-medium text-gray-900">
                              {userData.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile notification */}
                    <div className="lg:hidden">
                      <div className="relative" ref={mobileNotificationRef}>
                        <button
                          onClick={() =>
                            setShowNotificationPopup(!showNotificationPopup)
                          }
                          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCount}
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
                          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                            <div className="p-4 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Thông báo
                                </h3>
                                {unreadCount > 0 && (
                                  <span className="text-sm text-blue-600">
                                    {unreadCount} mới
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                              {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                  {notifications.map((notification) => (
                                    <div
                                      key={notification.id}
                                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        !notification.read ? "bg-blue-50" : ""
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="text-lg flex-shrink-0">
                                          {getNotificationIcon(
                                            notification.type
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                              {notification.title}
                                            </p>
                                            {!notification.read && (
                                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {notification.message}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-2">
                                            {notification.time}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <div className="text-gray-400 mb-2">🔔</div>
                                  <p className="text-gray-600">
                                    Không có thông báo nào
                                  </p>
                                </div>
                              )}
                            </div>

                            {notifications.length > 0 && (
                              <div className="p-4 border-t border-gray-200">
                                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  Xem tất cả thông báo
                                </button>
                              </div>
                            )}
                          </div>
                        </Transition>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Balance Only */}
                  <div className="mt-4 lg:mt-0 flex items-center gap-4 lg:w-auto">
                    {/* Current Balance */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 w-full lg:w-auto h-[48px]">
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Content - Responsive layout */}
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                  {/* Page Title */}
                  <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                      Ví tiền
                    </h1>
                    <p className="text-gray-600">
                      Nạp tiền để sử dụng các dịch vụ trên nền tảng
                    </p>
                  </div>

                  {/* Main Content Grid - Side by side on desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Wallet Operations */}
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                          Nạp tiền vào ví
                        </h2>

                        {/* Predefined Amounts */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Chọn số tiền nạp
                          </label>
                          <div className="grid grid-cols-1 gap-3">
                            {predefinedAmounts.map((amount) => (
                              <button
                                key={amount.value}
                                onClick={() => handleAmountSelect(amount.value)}
                                className={`p-4 rounded-lg border-2 text-left transition-colors relative ${
                                  selectedAmount === amount.value
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div
                                      className={`font-semibold text-lg ${
                                        selectedAmount === amount.value
                                          ? "text-blue-700"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {amount.label}
                                    </div>
                                    {amount.bonus > 0 && (
                                      <div className="text-sm text-green-600 mt-1">
                                        Tặng thêm:{" "}
                                        {formatCurrency(amount.bonus)}
                                      </div>
                                    )}
                                  </div>
                                  {amount.bonus > 0 && (
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-green-600">
                                        ={" "}
                                        {formatCurrency(
                                          amount.value + amount.bonus
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Amount */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Hoặc nhập số tiền khác
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={
                                customAmount ? formatNumber(customAmount) : ""
                              }
                              onChange={(e) =>
                                handleCustomAmountChange(e.target.value)
                              }
                              placeholder="Nhập số tiền (tối thiểu 10.000đ)"
                              className="w-full p-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              đ
                            </span>
                          </div>
                          {/* Show bonus for custom amount */}
                          {customAmount &&
                            getBonusAmount(parseInt(customAmount)) > 0 && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 text-sm">
                                    🎉
                                  </span>
                                  <span className="text-sm text-green-700">
                                    Bạn sẽ được tặng thêm{" "}
                                    {formatCurrency(
                                      getBonusAmount(parseInt(customAmount))
                                    )}{" "}
                                    khi nạp số tiền này!
                                  </span>
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Payment Methods */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Phương thức thanh toán
                          </label>
                          <div className="space-y-3">
                            {paymentMethods.map((method) => (
                              <div
                                key={method.id}
                                className="p-4 rounded-lg border-2 bg-blue-50 border-blue-500"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {method.icon}
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-medium text-blue-700">
                                      {method.name}
                                    </div>
                                    <div className="text-sm text-blue-600">
                                      {method.description}
                                    </div>
                                  </div>
                                  <div className="ml-auto">
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      className="text-blue-600"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Summary */}
                        {getFinalAmount() > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-medium text-gray-900 mb-2">
                              Thông tin thanh toán
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Số tiền nạp:</span>
                                <span className="font-semibold">
                                  {formatCurrency(getFinalAmount())}
                                </span>
                              </div>
                              {getBonusAmount(getFinalAmount()) > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-green-600">
                                    Tiền thưởng:
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    +
                                    {formatCurrency(
                                      getBonusAmount(getFinalAmount())
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Phí giao dịch:</span>
                                <span className="text-green-600">Miễn phí</span>
                              </div>
                              <hr className="my-2" />
                              <div className="flex justify-between font-semibold text-lg">
                                <span>Tổng nhận được:</span>
                                <span className="text-green-600">
                                  {formatCurrency(getTotalAmount())}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Button */}
                        <button
                          onClick={handlePayment}
                          disabled={getFinalAmount() < 10000 || isProcessing}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Đang chuyển đến VNPay...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              Thanh toán
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Right Column - Recent Transactions */}
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold text-gray-900">
                            Giao dịch gần đây
                          </h2>
                          <Link
                            href="/nguoi-dung/vi-tien/lich-su-giao-dich"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Xem tất cả
                          </Link>
                        </div>

                        <div className="space-y-4">
                          {recentTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="text-xl flex-shrink-0">
                                    {getTypeIcon(transaction.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 text-base line-clamp-2">
                                      {transaction.description}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {transaction.date}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Mã GD: {transaction.id}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={`font-semibold text-lg ${getTransactionColor(
                                    transaction.type,
                                    transaction.amount
                                  )} flex-shrink-0`}
                                >
                                  {transaction.amount > 0 ? "+" : ""}
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Empty state for when no transactions */}
                        {recentTransactions.length === 0 && (
                          <div className="text-center py-12">
                            <div className="text-gray-400 mb-4 text-4xl">
                              💳
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Chưa có giao dịch nào
                            </h3>
                            <p className="text-gray-600">
                              Thực hiện giao dịch đầu tiên để xem lịch sử tại
                              đây
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile only - Show recent transactions below */}
                  <div className="lg:hidden">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Giao dịch gần đây
                        </h3>
                        <Link
                          href="/nguoi-dung/vi-tien/lich-su-giao-dich"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Xem tất cả
                        </Link>
                      </div>

                      <div className="space-y-3">
                        {recentTransactions.slice(0, 3).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="text-lg flex-shrink-0">
                                  {getTypeIcon(transaction.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm line-clamp-1">
                                    {transaction.description}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {transaction.date}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`font-semibold text-sm ${getTransactionColor(
                                  transaction.type,
                                  transaction.amount
                                )} flex-shrink-0`}
                              >
                                {transaction.amount > 0 ? "+" : ""}
                                {formatCurrency(Math.abs(transaction.amount))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          {/* Tổng quan */}
          <Link
            href="/nguoi-dung/tong-quan"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
              />
            </svg>
            <span className="text-xs">Tổng quan</span>
          </Link>

          {/* Quản lý tin */}
          <Link
            href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Quản lý</span>
          </Link>

          {/* Đăng tin */}
          <Link
            href="/nguoi-dung/dang-tin"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-1"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.75 2C8.16421 2 8.5 2.33579 8.5 2.75V7H12.75C13.1642 7 13.5 7.33579 13.5 7.75C13.5 8.16421 13.1642 8.5 12.75 8.5H8.5V12.75C8.5 13.1642 8.16421 13.5 7.75 13.5C7.33579 13.5 7 13.1642 7 12.75V8.5H2.75C2.33579 8.5 2 8.16421 2 7.75C2 7.33579 2.33579 7 2.75 7H7V2.75C7 2.33579 7.33579 2 7.75 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs">Đăng tin</span>
          </Link>

          {/* Ví tiền - Active */}
          <Link
            href="/nguoi-dung/vi-tien"
            className="flex flex-col items-center py-2 px-1 text-blue-600 bg-blue-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
              />
            </svg>
            <span className="text-xs font-medium">Ví tiền</span>
          </Link>

          {/* Tài khoản */}
          <Link
            href="/nguoi-dung/tai-khoan"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <span className="text-xs">Tài khoản</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
