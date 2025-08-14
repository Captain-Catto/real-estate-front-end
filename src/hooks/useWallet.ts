import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { paymentService } from "@/services/paymentService";
import { toast } from "sonner";
// import { formatPrice } from "@/utils/format";

export interface WalletTransaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "PAYMENT" | "REFUND" | "BONUS";
  description: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
}

export interface WalletInfo {
  balance: number;
  totalIncome: number;
  totalSpending: number;
  bonusEarned: number;
  lastTransaction: string | null;
}

// Tạo một phiên bản global của broadcastChannel để tái sử dụng
let globalBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    globalBroadcastChannel = new BroadcastChannel("wallet_updates");
  } catch (e) {
    console.error("Could not initialize BroadcastChannel:", e);
  }
}

// Helper function để broadcast sự kiện cập nhật ví toàn cục
export const broadcastWalletUpdate = () => {
  try {
    // Cập nhật localStorage
    localStorage.setItem("wallet_updated", Date.now().toString());

    // Gửi broadcast nếu BroadcastChannel khả dụng
    if (globalBroadcastChannel) {
      globalBroadcastChannel.postMessage({
        type: "refresh",
        timestamp: Date.now(),
      });
    }

    console.log("Wallet update broadcast sent");
  } catch (e) {
    console.error("Error broadcasting wallet update:", e);
  }
};

export const useWallet = () => {
  const { isAuthenticated } = useAuth();

  // Memoize formatPrice to avoid dependency issues in useCallback hooks
  const formatPrice = useCallback((amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Wallet state
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    balance: 0,
    totalIncome: 0,
    totalSpending: 0,
    bonusEarned: 0,
    lastTransaction: null,
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // References for polling and focus tracking
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format shortcuts
  const formattedBalance = formatPrice(walletInfo.balance);
  const formattedIncome = formatPrice(walletInfo.totalIncome);
  const formattedSpending = formatPrice(walletInfo.totalSpending);
  const formattedBonus = formatPrice(walletInfo.bonusEarned);

  // Fetch wallet information - corrected function name
  const fetchWalletInfo = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      // Xóa cache để đảm bảo lấy dữ liệu mới nhất khi có yêu cầu rõ ràng
      paymentService.invalidateWalletCache();

      // Fixed: Using the correct function name as exported from paymentService
      const response = await paymentService.getUserWalletInfo();

      if (response.success) {
        setWalletInfo({
          balance: response.data.balance || 0,
          totalIncome: response.data.totalIncome || 0,
          totalSpending: response.data.totalSpending || 0,
          bonusEarned: response.data.bonusEarned || 0,
          lastTransaction: response.data.lastTransaction || null,
        });

        return response.data;
      } else {
        // Handle error with a generic message since response might not have message property
        const errorMessage = "Không thể tải thông tin ví";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error fetching wallet info:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi tải thông tin ví";
      setError(errorMessage);
      toast.error("Lỗi khi tải thông tin ví");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch transaction history - corrected function name
  const fetchTransactions = useCallback(
    async (pageNum = 1, reset = false) => {
      if (!isAuthenticated) return;

      setTransactionsLoading(true);

      try {
        // Fixed: Using the correct function name from paymentService
        const response = await paymentService.getPaymentHistory({
          page: pageNum,
          limit: 10,
        });

        console.log("Fetched transactions:", response);

        if (response.success) {
          const newTransactions = (response.data.payments || []).map(
            (payment) => ({
              id: payment._id,
              _id: payment._id,
              type:
                payment.amount > 0
                  ? ("DEPOSIT" as const)
                  : ("PAYMENT" as const),
              amount: Math.abs(payment.amount),
              description: payment.description,
              date: payment.createdAt,
              createdAt: payment.createdAt,
              status: payment.status as
                | "PENDING"
                | "COMPLETED"
                | "FAILED"
                | "CANCELLED",
              orderId: payment.orderId,
              paymentMethod: payment.paymentMethod,
            })
          );

          if (reset) {
            setTransactions(newTransactions);
          } else {
            setTransactions((prev) => [...prev, ...newTransactions]);
          }

          setHasMore(newTransactions.length > 0);
          setPage(pageNum);
        } else {
          toast.error("Không thể tải lịch sử giao dịch");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        toast.error("Lỗi khi tải lịch sử giao dịch");
      } finally {
        setTransactionsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Load more transactions
  const loadMoreTransactions = useCallback(() => {
    if (!transactionsLoading && hasMore) {
      fetchTransactions(page + 1);
    }
  }, [page, transactionsLoading, hasMore, fetchTransactions]);

  // Deposit money to wallet
  const deposit = useCallback(
    async (amount: number) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để thực hiện giao dịch");
        return { success: false };
      }

      try {
        // Create payment URL with VNPay
        const response = await paymentService.createVNPayPayment({
          amount,
          orderInfo: `Nạp ${formatPrice(amount)} vào ví`,
          returnUrl:
            window.location.origin + "/nguoi-dung/vi-tien/payment-result",
        });

        if (response.success) {
          // Redirect to payment URL
          window.location.href = response.data.paymentUrl;
          return { success: true, data: response.data };
        } else {
          toast.error(response.message || "Không thể tạo giao dịch");
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error depositing funds:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi khi nạp tiền vào ví";
        toast.error("Lỗi khi nạp tiền vào ví");
        return { success: false, error: errorMessage };
      }
    },
    [isAuthenticated, formatPrice]
  );

  // Interface for bank info
  interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountName: string;
    [key: string]: string; // Allow for additional properties
  }

  // Withdraw money from wallet - implementation compatible with backend
  const withdraw = useCallback(
    async (amount: number, bankInfo: BankInfo) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để thực hiện giao dịch");
        return { success: false };
      }

      try {
        // This is a placeholder since withdrawFromWallet doesn't exist in paymentService
        // In a real implementation, you would call the appropriate API endpoint
        toast.info(
          `Chức năng rút ${formatPrice(amount)} vào tài khoản ${
            bankInfo.bankName
          } đang được phát triển`
        );

        // Simulate a withdrawal response - implement actual withdrawal API when available
        const response = {
          success: false,
          message: "Chức năng rút tiền chưa được hỗ trợ",
        };

        if (response.success) {
          toast.success("Yêu cầu rút tiền đã được gửi!");
          fetchWalletInfo(); // Refresh wallet info
          return { success: true, data: {} };
        } else {
          toast.error(response.message || "Rút tiền không thành công");
          return { success: false, error: response.message };
        }
      } catch (err) {
        console.error("Error withdrawing funds:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi khi rút tiền từ ví";
        toast.error("Lỗi khi rút tiền từ ví");
        return { success: false, error: errorMessage };
      }
    },
    [isAuthenticated, formatPrice, fetchWalletInfo]
  );

  // Get transaction details
  const getTransactionDetails = useCallback(async (transactionId: string) => {
    try {
      // Fixed: Use the proper function from paymentService
      const response = await paymentService.getPaymentDetails(transactionId);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Không thể lấy chi tiết giao dịch");
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Error getting transaction details:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi lấy chi tiết giao dịch";
      toast.error("Lỗi khi lấy chi tiết giao dịch");
      return { success: false, error: errorMessage };
    }
  }, []);

  // Load wallet data on component mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletInfo();
      fetchTransactions(1, true);
    } else {
      // Reset wallet state when logged out
      setWalletInfo({
        balance: 0,
        totalIncome: 0,
        totalSpending: 0,
        bonusEarned: 0,
        lastTransaction: null,
      });
      setTransactions([]);
      setPage(1);
      setHasMore(true);
    }
  }, [isAuthenticated, fetchTransactions, fetchWalletInfo]);

  // Set up window focus event listener and polling mechanism
  useEffect(() => {
    // EMERGENCY FIX: Temporarily disable all polling to stop infinite loops
    // Only allow initial data fetch, no continuous polling

    // Skip if not authenticated
    if (!isAuthenticated) return;

    // Simple cleanup function
    return () => {
      // Clear any existing polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return {
    // Wallet data
    ...walletInfo,

    // Formatted values
    formattedBalance,
    formattedIncome,
    formattedSpending,
    formattedBonus,

    // Transactions
    transactions,
    hasMoreTransactions: hasMore,
    loadMoreTransactions,

    // Loading states
    loading,
    transactionsLoading,

    // Error handling
    error,

    // Methods
    refresh: fetchWalletInfo,
    refreshTransactions: () => fetchTransactions(1, true),
    deposit,
    withdraw,
    getTransactionDetails,
  };
};

export default useWallet;
