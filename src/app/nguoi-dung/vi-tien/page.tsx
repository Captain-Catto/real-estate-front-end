"use client";

import { useState, useRef, useEffect } from "react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import UserHeader from "@/components/user/UserHeader";
import { useAuth } from "@/store/hooks";
import { paymentService } from "@/services/paymentService";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";

export default function ViTienPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Use the wallet hook with safeguards
  const {
    balance,
    totalIncome,
    totalSpending,
    formattedBalance,
    bonusEarned,
    loading: walletLoading,
    error: walletError,
    refresh: refreshWallet,
  } = useWallet();

  console.log("Wallet bonusEarned:", bonusEarned);

  // User data
  const userData = {
    name: user?.username || "User",
    avatar: user?.username?.charAt(0).toUpperCase() || "U",
    greeting: getGreeting(),
  };

  // State for notifications
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  // Payment state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // API data state
  const [apiTransactions, setApiTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Use refs to track fetch status and prevent infinite loops
  const transactionsFetched = useRef(false);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng 🌅";
    if (hour < 18) return "Chào buổi chiều ☀️";
    return "Chào buổi tối 🌙";
  }

  // Fetch recent transactions - with safeguards against infinite loops
  useEffect(() => {
    const fetchTransactions = async () => {
      // Skip if not authenticated, already fetching, or already fetched
      if (
        !isAuthenticated ||
        isLoadingTransactions ||
        transactionsFetched.current
      ) {
        return;
      }

      setIsLoadingTransactions(true);
      transactionsFetched.current = true;

      try {
        const response = await paymentService.getPaymentHistory({
          page: 1,
          limit: 5,
          status: "completed",
        });

        if (response.success && response.data && response.data.payments) {
          setApiTransactions(response.data.payments);
        } else {
          setTransactionError("Không thể tải dữ liệu giao dịch");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactionError("Lỗi khi tải dữ liệu giao dịch");
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    // Only fetch if authenticated and haven't fetched yet
    if (isAuthenticated && !transactionsFetched.current) {
      fetchTransactions();
    }
  }, [isAuthenticated]); // Depend only on isAuthenticated

  // Predefined amounts with bonus
  const predefinedAmounts = [
    { value: 100000, label: "100.000 đ", bonus: 0 },
    { value: 500000, label: "500.000 đ", bonus: 50000 },
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Format date from ISO string to readable date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
    return type === "deposit" || type === "topup" ? "📥" : "📤";
  };

  // Determine transaction type from description or amount
  const determineTransactionType = (transaction: any) => {
    const desc = transaction.description.toLowerCase();
    if (desc.includes("nap") || desc.includes("nạp")) return "topup";
    if (
      desc.includes("thanh toan") ||
      desc.includes("thanh toán") ||
      transaction.amount < 0
    )
      return "payment";
    return "topup"; // Default to topup if can't determine
  };

  // Get transaction status in Vietnamese
  const getTransactionStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "Thành công";
      case "pending":
        return "Đang xử lý";
      case "failed":
      case "failure":
        return "Thất bại";
      default:
        return "Không xác định";
    }
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "failure":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const unreadCount = notifications.filter((n) => !n.read).length;

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
            href="/dang-nhap"
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
              <UserHeader
                userData={userData}
                showNotificationButton={true}
                showWalletButton={false}
              />

              {/* Content - Update to display wallet information */}
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

                  {/* Wallet Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Số dư khả dụng
                          </p>
                          <p className="text-lg font-semibold text-blue-900">
                            {walletLoading ? "Đang tải..." : formattedBalance}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">
                            Tổng nạp
                          </p>
                          <p className="text-lg font-semibold text-green-900">
                            {walletLoading
                              ? "Đang tải..."
                              : formatCurrency(totalIncome)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z"
                              clipRule="evenodd"
                              transform="rotate(180 10 10)"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-700">
                            Tổng chi
                          </p>
                          <p className="text-lg font-semibold text-red-900">
                            {walletLoading
                              ? "Đang tải..."
                              : formatCurrency(totalSpending)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-yellow-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-yellow-700">
                            Thưởng nhận được
                          </p>
                          <p className="text-lg font-semibold text-yellow-900">
                            {walletLoading
                              ? "Đang tải..."
                              : formatCurrency(bonusEarned)}
                          </p>
                        </div>
                      </div>
                    </div>
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

                    {/* Right Column - Recent Transactions */}
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                          Giao dịch gần đây
                        </h2>

                        <div className="divide-y divide-gray-200">
                          {isLoadingTransactions ? (
                            <div className="py-8 text-center">
                              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                              <p className="mt-2 text-gray-600">
                                Đang tải dữ liệu giao dịch...
                              </p>
                            </div>
                          ) : transactionError ? (
                            <div className="py-6 text-center">
                              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-500">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"
                                  />
                                </svg>
                              </div>
                              <p className="text-red-600">{transactionError}</p>
                              <button
                                onClick={() => window.location.reload()}
                                className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Tải lại trang
                              </button>
                            </div>
                          ) : apiTransactions.length > 0 ? (
                            apiTransactions.map((transaction) => {
                              const transactionType =
                                determineTransactionType(transaction);
                              return (
                                <div key={transaction._id} className="py-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-lg">
                                          {getTypeIcon(transactionType)}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900 mb-1 line-clamp-1">
                                          {transaction.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatDate(transaction.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span
                                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColorClass(
                                          transaction.status
                                        )}`}
                                      >
                                        {getTransactionStatus(
                                          transaction.status
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  {transaction.orderId && (
                                    <div className="mt-2 text-xs text-gray-500">
                                      Mã giao dịch: {transaction.orderId}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-8 text-center">
                              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-gray-400"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <p className="text-gray-500">
                                Bạn chưa có giao dịch nào
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 text-center">
                          <Link
                            href="/nguoi-dung/vi-tien/lich-su-giao-dich"
                            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                          >
                            <span>Xem tất cả giao dịch</span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-blue-600"
                            >
                              <path
                                fill="currentColor"
                                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Thông tin thanh toán
                        </h2>
                        <div className="space-y-4">
                          <p className="text-gray-600">
                            Tiền trong ví của bạn được sử dụng để:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>Thanh toán đăng tin BĐS</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>Mua các gói dịch vụ nâng cao</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>Đẩy tin, làm mới tin đăng</span>
                            </li>
                          </ul>

                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
                            <div className="flex items-start gap-2">
                              <div className="text-yellow-600 mt-0.5">⚠️</div>
                              <p className="text-sm text-yellow-700">
                                Lưu ý: Số tiền trong ví chỉ được sử dụng trong
                                hệ thống và không thể rút ra ngoài
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Help Section */}
                  <div className="lg:hidden mt-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Cần hỗ trợ?
                      </h2>
                      <div className="space-y-4">
                        <a
                          href="tel:1900123456"
                          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                fill="currentColor"
                                d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Hotline hỗ trợ
                            </div>
                            <div className="text-gray-600 text-sm">
                              1900 123 456 (8:00 - 18:00)
                            </div>
                          </div>
                        </a>

                        <a
                          href="mailto:support@example.com"
                          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                fill="currentColor"
                                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Email hỗ trợ
                            </div>
                            <div className="text-gray-600 text-sm">
                              support@example.com
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 lg:hidden z-10">
        <div className="flex justify-around py-3">
          <Link
            href="/nguoi-dung/dashboard"
            className="flex flex-col items-center text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs">Trang chủ</span>
          </Link>
          <Link
            href="/nguoi-dung/yeu-thich"
            className="flex flex-col items-center text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Yêu thích</span>
          </Link>
          <Link
            href="/nguoi-dung/vi-tien"
            className="flex flex-col items-center text-indigo-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Ví tiền</span>
          </Link>
          <Link
            href="/nguoi-dung/tai-khoan"
            className="flex flex-col items-center text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
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
