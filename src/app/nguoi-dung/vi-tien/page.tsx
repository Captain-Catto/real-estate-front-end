"use client";

import { useAuth } from "@/store/hooks";
import {
  useWallet,
  WalletTransaction,
  broadcastWalletUpdate,
} from "@/hooks/useWallet";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
// TEMP: Removed useNotifications to prevent infinite loop
// import { useNotifications } from "@/hooks/useNotifications";
import {
  triggerNotificationRefresh,
  useNotificationRefresh,
} from "@/hooks/useNotificationRefresh";
import {
  WalletIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// Extend WalletTransaction to include postId and orderId
interface ExtendedWalletTransaction extends WalletTransaction {
  postId?: string | null;
  orderId?: string;
}

export default function ViTienPage() {
  const { isAuthenticated } = useAuth();
  // Initialize notification refresh hook for auto-refresh on wallet events
  useNotificationRefresh();

  const isMobile = useIsMobile();

  const {
    balance,
    totalIncome,
    totalSpending,
    bonusEarned,
    formattedBalance,
    formattedIncome,
    formattedSpending,
    formattedBonus,
    transactions,
    hasMoreTransactions,
    loadMoreTransactions,
    loading,
    transactionsLoading,
    error,
    refresh,
    refreshTransactions,
    deposit,
    getTransactionDetails,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<"vnpay">("vnpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<string>("all");

  // Auto refresh wallet when page becomes visible
  useEffect(() => {
    console.log(
      "🔍 Vi-tien page useEffect triggered, isAuthenticated:",
      isAuthenticated
    );

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log("📱 Page visibility changed - refreshing");
        refresh();
        // Only trigger notification refresh when page becomes visible, not on every wallet action
        triggerNotificationRefresh();
        broadcastWalletUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial refresh when component mounts
    if (isAuthenticated) {
      console.log("🚀 Initial refresh on page load");
      refresh();
      // Initial notification refresh when page loads
      triggerNotificationRefresh();

      // Also check if we just came from a payment - check URL referrer or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const fromPayment =
        urlParams.get("from") === "payment" ||
        sessionStorage.getItem("justCompletedPayment") === "true";

      console.log("🔍 Checking payment return:", {
        fromParam: urlParams.get("from"),
        sessionFlag: sessionStorage.getItem("justCompletedPayment"),
        fromPayment,
      });

      if (fromPayment) {
        console.log(
          "🎯 Detected return from payment - forcing notification refresh"
        );
        // Clear the flag
        sessionStorage.removeItem("justCompletedPayment");
        // Force notification refresh with a slight delay to ensure backend has processed
        setTimeout(() => {
          console.log("⏰ Delayed notification refresh after payment");
          triggerNotificationRefresh();
        }, 1000);
      }
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, refresh]); // Removed forceRefreshNotifications from deps

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  // Compact currency format for mobile
  const formatCurrencyCompact = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) {
      return `${(absAmount / 1000000).toFixed(1)}M ₫`;
    } else if (absAmount >= 1000) {
      return `${(absAmount / 1000).toFixed(0)}K ₫`;
    } else {
      return `${absAmount.toLocaleString("vi-VN")} ₫`;
    }
  };

  const getTransactionIcon = (type: string) => {
    if (!type) return <WalletIcon className="h-5 w-5 text-gray-600" />;

    switch (type.toUpperCase()) {
      case "DEPOSIT":
        return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
      case "WITHDRAWAL":
        return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
      case "PAYMENT":
        return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
      case "REFUND":
        return <ArrowDownIcon className="h-5 w-5 text-blue-600" />;
      case "BONUS":
        return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
      default:
        return <WalletIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (!type) return "text-gray-600";

    const upperType = type.toUpperCase();
    if (
      upperType === "DEPOSIT" ||
      upperType === "REFUND" ||
      upperType === "BONUS" ||
      amount > 0
    ) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    if (!status) return null;

    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "PENDING":
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return "Không xác định";

    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "Hoàn thành";
      case "PENDING":
        return "Đang xử lý";
      case "FAILED":
        return "Thất bại";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await deposit(parseFloat(depositAmount));

      if (result.success && result.data?.paymentUrl) {
        // Broadcast wallet update để các component khác biết
        broadcastWalletUpdate();
        // Redirect to VNPay
        window.location.href = result.data.paymentUrl;
      } else {
        alert(result.error || "Có lỗi xảy ra khi nạp tiền");
      }
    } catch {
      alert("Có lỗi xảy ra khi nạp tiền");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper functions to check transaction type by postId
  const isDepositTransaction = (transaction: ExtendedWalletTransaction) => {
    // Nếu không có postId thì là nạp tiền
    return !transaction.postId || transaction.postId === null;
  };

  const isPaymentTransaction = (transaction: ExtendedWalletTransaction) => {
    // Nếu có postId thì là thanh toán tin đăng
    return transaction.postId && transaction.postId !== null;
  };

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter((transaction) => {
    if (transactionFilter === "all") return true;

    const extendedTransaction = transaction as ExtendedWalletTransaction;

    switch (transactionFilter) {
      case "deposit":
        return isDepositTransaction(extendedTransaction);
      case "payment":
        return isPaymentTransaction(extendedTransaction);
      default:
        return false;
    }
  });

  // Get filter text for display
  const getFilterText = (filter: string) => {
    switch (filter) {
      case "deposit":
        return "nạp tiền";
      case "payment":
        return "thanh toán";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <WalletIcon className="h-8 w-8 mr-3" />
          Ví tiền của tôi
        </h1>
        <p className="text-blue-100">Quản lý số dư và giao dịch trong ví</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <WalletIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600">Số dư khả dụng</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {isMobile ? formatCurrencyCompact(balance) : formattedBalance}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
              <ArrowDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600">Tổng đã nạp</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {isMobile
                  ? formatCurrencyCompact(totalIncome)
                  : formattedIncome}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
              <ArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600">Tổng đã chi</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {isMobile
                  ? formatCurrencyCompact(totalSpending)
                  : formattedSpending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
              <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Bonus kiếm được
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {isMobile ? formatCurrencyCompact(bonusEarned) : formattedBonus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Tổng quan
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Lịch sử giao dịch
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Actions - Deposit Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nạp tiền vào ví
                  </h3>

                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số tiền (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số tiền muốn nạp"
                        min="10000"
                        max="50000000"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tối thiểu 10,000 VNĐ - Tối đa 50,000,000 VNĐ
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phương thức thanh toán
                      </label>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-white">
                        <input
                          type="radio"
                          name="depositMethod"
                          value="vnpay"
                          checked={depositMethod === "vnpay"}
                          onChange={(e) =>
                            setDepositMethod(e.target.value as "vnpay")
                          }
                          className="mr-3"
                        />
                        <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <span className="font-medium">VNPay</span>
                          <p className="text-sm text-gray-600">
                            Thanh toán an toàn qua cổng VNPay
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDeposit}
                      disabled={isProcessing || !depositAmount}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {isProcessing ? "Đang xử lý..." : "Nạp tiền ngay"}
                    </button>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Giao dịch gần đây
                  </h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction, index) => (
                      <div
                        key={transaction.id || `recent-transaction-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
                      >
                        <div className="flex items-start sm:items-center">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-gray-600">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {(transaction as ExtendedWalletTransaction)
                              .orderId && (
                              <div className="text-xs text-gray-500 mt-1 break-all">
                                Mã GD:{" "}
                                {
                                  (transaction as ExtendedWalletTransaction)
                                    .orderId
                                }
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:block sm:text-right flex-shrink-0">
                          <div
                            className={`text-sm sm:text-base font-medium ${getTransactionColor(
                              transaction.type,
                              transaction.amount
                            )}`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {isMobile
                              ? formatCurrencyCompact(transaction.amount)
                              : formatCurrency(transaction.amount)}
                          </div>
                          <div className="flex items-center sm:justify-end">
                            {getStatusIcon(transaction.status)}
                            <span className="text-xs text-gray-600 ml-1">
                              {getStatusText(transaction.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lịch sử giao dịch ({filteredTransactions.length})
                </h3>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">
                    Tất cả giao dịch ({transactions.length})
                  </option>
                  <option value="deposit">
                    Nạp tiền (
                    {
                      transactions.filter((t) =>
                        isDepositTransaction(t as ExtendedWalletTransaction)
                      ).length
                    }
                    )
                  </option>
                  <option value="payment">
                    Thanh toán (
                    {
                      transactions.filter((t) =>
                        isPaymentTransaction(t as ExtendedWalletTransaction)
                      ).length
                    }
                    )
                  </option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id || `transaction-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-start sm:items-center flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="font-medium text-gray-900 break-words">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(transaction.createdAt).toLocaleString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                        {(transaction as ExtendedWalletTransaction).orderId && (
                          <div className="text-xs text-gray-500 mt-1 break-all">
                            Mã giao dịch:{" "}
                            {(transaction as ExtendedWalletTransaction).orderId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:block sm:text-right sm:ml-4 flex-shrink-0">
                      <div
                        className={`text-lg font-semibold ${getTransactionColor(
                          transaction.type,
                          transaction.amount
                        )}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {isMobile
                          ? formatCurrencyCompact(transaction.amount)
                          : formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex items-center sm:justify-end mt-1">
                        {getStatusIcon(transaction.status)}
                        <span className="text-sm text-gray-600 ml-1">
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreTransactions && (
                <div className="text-center mt-4">
                  <button
                    onClick={loadMoreTransactions}
                    disabled={transactionsLoading}
                    className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {transactionsLoading ? "Đang tải..." : "Tải thêm"}
                  </button>
                </div>
              )}

              {filteredTransactions.length === 0 && !loading && (
                <div className="text-center py-8">
                  <WalletIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {transactionFilter === "all"
                      ? "Chưa có giao dịch nào"
                      : `Chưa có giao dịch ${getFilterText(
                          transactionFilter
                        )} nào`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
