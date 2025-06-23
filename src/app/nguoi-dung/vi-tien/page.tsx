"use client";

import { useState, Fragment, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import { useAuth } from "@/store/hooks";
import { paymentService } from "@/services/paymentService";

export default function ViTienPage() {
  const { user, isAuthenticated, loading } = useAuth();

  // Mock user data - replace with real user data when available
  const userData = {
    name: user?.username || "User",
    avatar: user?.username?.charAt(0).toUpperCase() || "U",
    balance: "450.000 đ", // This should come from backend
    greeting: "Chào buổi sáng 🌤",
  };

  // State for notifications
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  // Payment state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock notifications data - should come from backend
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

  // Recent transactions for preview - should come from backend
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

  // Updated payment handler with VNPay integration
  const handlePayment = async () => {
    const amount = getFinalAmount();
    const totalAmount = getTotalAmount();
    const bonus = getBonusAmount(amount);

    // Validation
    if (amount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000đ");
      return;
    }

    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để thực hiện giao dịch");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order description
      let orderInfo = `Nap tien vao vi ${formatCurrency(amount)}`;
      if (bonus > 0) {
        orderInfo += ` (tang ${formatCurrency(bonus)})`;
      }

      // Create VNPay payment URL
      const paymentData = {
        amount: amount,
        orderInfo: orderInfo,
        returnUrl: `${window.location.origin}/nguoi-dung/vi-tien/payment-result`,
      };

      console.log("Creating VNPay payment:", paymentData);

      const response = await paymentService.createVNPayPayment(paymentData);

      if (response.success && response.data.paymentUrl) {
        // Store payment info in localStorage for result page
        localStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            orderId: response.data.orderId,
            amount: amount,
            bonus: bonus,
            totalAmount: totalAmount,
            description: response.data.description,
            timestamp: Date.now(),
          })
        );

        // Redirect to VNPay
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.message || "Không thể tạo URL thanh toán");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo giao dịch VNPay!");
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

  // Show loading if auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Bạn cần đăng nhập để sử dụng tính năng này
          </p>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

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

                    {/* Mobile notification - same as before */}
                    <div className="lg:hidden">
                      {/* Notification popup code stays the same */}
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

              {/* Content - same structure but updated payment button */}
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

                        {/* Predefined Amounts - same as before */}
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

                        {/* Custom Amount - same as before */}
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

                        {/* Payment Methods - same as before */}
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

                        {/* Payment Summary - same as before */}
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

                        {/* Updated Payment Button */}
                        <button
                          onClick={handlePayment}
                          disabled={getFinalAmount() < 10000 || isProcessing}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Đang tạo liên kết VNPay...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span>💳</span>
                              Thanh toán qua VNPay
                            </div>
                          )}
                        </button>

                        {/* Additional Info */}
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-blue-600"
                            >
                              <path
                                fill="currentColor"
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                              />
                            </svg>
                            <span>
                              Bạn sẽ được chuyển đến trang VNPay để hoàn tất
                              thanh toán an toàn
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Recent Transactions - same as before */}
                    <div className="space-y-6">
                      {/* Recent transactions code stays the same */}
                    </div>
                  </div>

                  {/* Mobile section - same as before */}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation - same as before */}

      {/* Footer */}
      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
