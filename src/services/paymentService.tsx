import { fetchWithAuth } from "./authService";
import { showErrorToast } from "@/utils/errorHandler";
import { API_BASE_URL } from "@/services/authService";

export interface CreateVNPayPaymentRequest {
  amount: number;
  orderInfo: string;
  postId?: string;
  returnUrl?: string;
}

export interface VNPayPaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentUrl: string;
    orderId: string;
    amount: number;
    description: string;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: Array<{
      _id: string;
      userId: string;
      postId?: string;
      orderId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      status: string;
      description: string;
      createdAt: string;
      completedAt?: string;
      failedAt?: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface WalletInfoResponse {
  success: boolean;
  data: {
    balance: number;
    totalIncome: number;
    totalSpending: number;
    bonusEarned: number;
    lastTransaction: string | null;
    totalTransactions: number;
    recentTransactions: Array<{
      _id: string;
      orderId: string;
      amount: number;
      status: string;
      description: string;
      createdAt: string;
    }>;
  };
}

// New interface for payment filter parameters
export interface PaymentFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  dateRange?: string;
  fromDate?: string;
  toDate?: string;
}

// Add missing interfaces for API responses
export interface PaymentStatusResponse {
  success: boolean;
  data: {
    orderId: string;
    status: string;
    amount: number;
    description: string;
    createdAt: string;
    completedAt?: string;
    failedAt?: string;
  };
}

export interface PaymentDetailsResponse {
  success: boolean;
  data: {
    _id: string;
    orderId: string;
    userId: string;
    amount: number;
    status: string;
    description: string;
    paymentMethod: string;
    vnpayData?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

export interface VNPayData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface SyncWalletResponse {
  success: boolean;
  data: {
    balance: number;
    totalIncome: number;
    totalSpending: number;
    bonusEarned: number;
    message: string;
  };
}

export interface DeductResponse {
  success: boolean;
  message: string;
  data: {
    postId: string;
    packageId: string;
    amount: number;
    balance?: number;
  };
}

export interface WalletCacheData {
  balance: number;
  totalIncome: number;
  totalSpending: number;
  bonusEarned: number;
  lastTransaction: string | null;
  totalTransactions: number;
  recentTransactions: Array<{
    _id: string;
    orderId: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
  }>;
}

// Helper function để xử lý response
const handleResponse = async (response: Response) => {
  console.log("Response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;

    try {
      errorData = JSON.parse(errorText);
    } catch (error) {
      showErrorToast(error, "Lỗi không xác định");
    }

    // Silent error for debugging API response

    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

// Improved cache mechanism to prevent excessive wallet info calls
let walletInfoCache: {
  data: WalletInfoResponse;
  timestamp: number;
} | null = null;

// Increase cache duration to prevent frequent requests
const CACHE_DURATION = 10000;

// Add a flag to track if we're already fetching wallet info to prevent duplicate calls
let isWalletFetching = false;

export const paymentService = {
  // Xóa cache của ví để đảm bảo lấy dữ liệu mới nhất
  invalidateWalletCache() {
    walletInfoCache = null;
    console.log("Wallet cache invalidated");
  },

  // Tạo URL thanh toán VNPay
  async createVNPayPayment(
    data: CreateVNPayPaymentRequest
  ): Promise<VNPayPaymentResponse> {
    console.log("Creating VNPay payment URL:", data);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/vnpay/create-payment-url`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response) {
      throw new Error("No response received");
    }

    return handleResponse(response);
  },

  // Lấy lịch sử thanh toán
  async getPaymentHistory(
    filters: PaymentFilterParams = {}
  ): Promise<PaymentHistoryResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      dateRange,
      fromDate,
      toDate,
    } = filters;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (status && status !== "all") queryParams.append("status", status);
    if (type && type !== "all") queryParams.append("type", type);
    if (search && search.trim() !== "")
      queryParams.append("search", search.trim());
    if (dateRange && dateRange !== "all")
      queryParams.append("dateRange", dateRange);
    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);

    const queryString = queryParams.toString();

    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/history${queryString ? `?${queryString}` : ""}`
    );

    if (!response) {
      throw new Error("No response received");
    }

    return handleResponse(response);
  },

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/check-status/${orderId}`
    );

    if (!response) {
      throw new Error("No response received");
    }

    return handleResponse(response);
  },

  // Lấy chi tiết thanh toán
  async getPaymentDetails(orderId: string): Promise<PaymentDetailsResponse> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/details/${orderId}`
    );

    if (!response) {
      throw new Error("No response received");
    }

    return handleResponse(response);
  },

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(
    orderId: string,
    vnpayData: VNPayData
  ): Promise<PaymentDetailsResponse> {
    // Invalidate wallet cache to ensure fresh data after payment status update
    walletInfoCache = null;

    // Sau khi cập nhật thanh toán, broadcast thay đổi ví để các tab khác biết
    try {
      if (typeof window !== "undefined") {
        // Sử dụng localStorage để thông báo cho các tab khác
        localStorage.setItem("wallet_updated", Date.now().toString());

        // Sử dụng BroadcastChannel nếu có sẵn
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("wallet_updates");
          bc.postMessage({ type: "refresh", timestamp: Date.now() });
          bc.close();
        }
      }
    } catch {
      // Silent error for debugging - broadcasting wallet update không quan trọng
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/update-status/${orderId}`,
      {
        method: "POST",
        body: JSON.stringify(vnpayData),
      }
    );

    if (!response) {
      throw new Error("No response received");
    }

    return handleResponse(response);
  },

  // Lấy thông tin ví của người dùng - enhanced caching mechanism
  async getUserWalletInfo(): Promise<WalletInfoResponse> {
    // Return cached data if it's still valid
    if (
      walletInfoCache &&
      Date.now() - walletInfoCache.timestamp < CACHE_DURATION
    ) {
      return walletInfoCache.data;
    }

    // Prevent concurrent fetches
    if (isWalletFetching) {
      // If another fetch is in progress, wait until cache is populated or timeout
      const startTime = Date.now();
      while (isWalletFetching && Date.now() - startTime < 3000) {
        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // If cache was populated during wait, return it
      if (walletInfoCache) {
        return walletInfoCache.data;
      }
    }

    try {
      isWalletFetching = true;
      const response = await fetchWithAuth(
        `${API_BASE_URL}/payments/wallet-info`
      );

      if (!response) {
        throw new Error("No response received");
      }

      const data = await handleResponse(response);

      // Cache successful response
      walletInfoCache = {
        data,
        timestamp: Date.now(),
      };

      return data;
    } catch (error) {
      showErrorToast("Lấy thông tin ví thất bại");

      // If we have old cached data, return it as fallback
      if (walletInfoCache) {
        return walletInfoCache.data;
      }

      // Otherwise, propagate the error
      throw error;
    } finally {
      isWalletFetching = false;
    }
  },

  // Sync wallet with payment history
  async syncWallet(): Promise<SyncWalletResponse> {
    // Invalidate wallet cache to ensure fresh data
    walletInfoCache = null;

    const response = await fetchWithAuth(`${API_BASE_URL}/wallet/sync`, {
      method: "POST",
    });

    if (!response) {
      throw new Error("No response received");
    }

    // Broadcast wallet update
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("wallet_updated", Date.now().toString());

        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("wallet_updates");
          bc.postMessage({ type: "refresh", timestamp: Date.now() });
          bc.close();
        }
      }
    } catch {
      // Silent error for debugging - broadcasting wallet update không quan trọng
    }

    return handleResponse(response);
  },

  // Process a specific payment for wallet
  async processWalletPayment(data: {
    orderId: string;
    amount: number;
    bonus?: number;
    type: "topup" | "spend";
  }): Promise<SyncWalletResponse> {
    // Invalidate wallet cache
    walletInfoCache = null;

    const response = await fetchWithAuth(
      `${API_BASE_URL}/wallet/process-payment`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response) {
      throw new Error("No response received");
    }

    // Broadcast wallet update
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("wallet_updated", Date.now().toString());

        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("wallet_updates");
          bc.postMessage({ type: "refresh", timestamp: Date.now() });
          bc.close();
        }
      }
    } catch {
      // Silent error for debugging - broadcasting wallet update không quan trọng
    }

    return handleResponse(response);
  },

  // Get transaction history with filters
  async getTransactionHistory(
    filters: {
      page?: number;
      limit?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<PaymentHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    const queryString = queryParams.toString();
    const response = await fetchWithAuth(
      `${API_BASE_URL}/wallet/transactions${
        queryString ? `?${queryString}` : ""
      }`
    );

    if (!response) {
      throw new Error("No response received");
    }

    return handleResponse(response);
  },

  /**
   * Deduct money from wallet for post payment
   */
  async deductForPost(data: {
    amount: number;
    postId: string;
    packageId: string;
    description?: string;
  }): Promise<DeductResponse> {
    // Skip deduction for free packages
    if (data.amount === 0 || data.packageId === "free") {
      return {
        success: true,
        message: "Free package applied successfully",
        data: {
          postId: data.postId,
          packageId: data.packageId,
          amount: 0,
        },
      };
    }

    // Invalidate cache since the balance will change
    walletInfoCache = null;

    const response = await fetchWithAuth(
      `${API_BASE_URL}/wallet/deduct-for-post`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response) {
      throw new Error("No response received");
    }

    // Broadcast wallet update
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("wallet_updated", Date.now().toString());

        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("wallet_updates");
          bc.postMessage({ type: "refresh", timestamp: Date.now() });
          bc.close();
        }
      }
    } catch {
      // Silent error for debugging - broadcasting wallet update không quan trọng
    }

    return handleResponse(response);
  },
};
