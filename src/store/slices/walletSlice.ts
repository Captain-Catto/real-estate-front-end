import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { paymentService } from "@/services/paymentService";

// Types
export interface WalletTransaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "PAYMENT" | "REFUND" | "BONUS";
  description: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  orderId?: string;
  method?: string;
  reference?: string;
}

export interface WalletInfo {
  balance: number;
  totalIncome: number;
  totalSpending: number;
  bonusEarned: number;
  lastTransaction: string | null;
  totalTransactions?: number;
}

export interface WalletState {
  walletInfo: WalletInfo;
  transactions: WalletTransaction[];
  loading: boolean;
  transactionsLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  lastRefreshTime: number;
}

// Initial state
const initialState: WalletState = {
  walletInfo: {
    balance: 0,
    totalIncome: 0,
    totalSpending: 0,
    bonusEarned: 0,
    lastTransaction: null,
    totalTransactions: 0,
  },
  transactions: [],
  loading: false,
  transactionsLoading: false,
  error: null,
  page: 1,
  hasMore: true,
  lastRefreshTime: Date.now(),
};

// Async thunks
export const fetchWalletInfo = createAsyncThunk(
  "wallet/fetchWalletInfo",
  async (_, { rejectWithValue }) => {
    try {
      // Invalidate cache để đảm bảo lấy dữ liệu mới nhất
      paymentService.invalidateWalletCache();

      const response = await paymentService.getUserWalletInfo();

      if (response.success) {
        return {
          balance: response.data.balance || 0,
          totalIncome: response.data.totalIncome || 0,
          totalSpending: response.data.totalSpending || 0,
          bonusEarned: response.data.bonusEarned || 0,
          lastTransaction: response.data.lastTransaction || null,
          totalTransactions: response.data.totalTransactions || 0,
        };
      } else {
        return rejectWithValue("Không thể tải thông tin ví");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi khi tải thông tin ví";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "wallet/fetchTransactions",
  async (
    params: { page?: number; limit?: number; reset?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 10, reset = false } = params;

      const response = await paymentService.getTransactionHistory({
        page,
        limit,
      });

      if (response.success) {
        return {
          transactions: response.data.transactions || [],
          hasMore: (response.data.transactions || []).length >= limit,
          page,
          reset,
        };
      } else {
        return rejectWithValue("Không thể tải lịch sử giao dịch");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Lỗi khi tải lịch sử giao dịch";
      return rejectWithValue(errorMessage);
    }
  }
);

export const depositToWallet = createAsyncThunk(
  "wallet/deposit",
  async (
    params: { amount: number; returnUrl?: string },
    { rejectWithValue }
  ) => {
    try {
      const { amount, returnUrl } = params;

      const response = await paymentService.createVNPayPayment({
        amount,
        orderInfo: `Nạp ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount)} vào ví`,
        returnUrl:
          returnUrl ||
          window.location.origin + "/nguoi-dung/vi-tien/payment-result",
      });

      if (response.success) {
        // Redirect to payment URL
        window.location.href = response.data.paymentUrl;
        return response.data;
      } else {
        return rejectWithValue(response.message || "Không thể tạo giao dịch");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi khi nạp tiền vào ví";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getTransactionDetails = createAsyncThunk(
  "wallet/getTransactionDetails",
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentDetails(transactionId);

      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue("Không thể lấy chi tiết giao dịch");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Lỗi khi lấy chi tiết giao dịch";
      return rejectWithValue(errorMessage);
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetTransactions: (state) => {
      state.transactions = [];
      state.page = 1;
      state.hasMore = true;
    },
    updateLastRefreshTime: (state) => {
      state.lastRefreshTime = Date.now();
    },
  },
  extraReducers: (builder) => {
    // Fetch wallet info
    builder
      .addCase(fetchWalletInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.walletInfo = action.payload;
        state.lastRefreshTime = Date.now();
      })
      .addCase(fetchWalletInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        const { transactions, hasMore, page, reset } = action.payload;

        if (reset || page === 1) {
          state.transactions = transactions;
        } else {
          state.transactions = [...state.transactions, ...transactions];
        }

        state.hasMore = hasMore;
        state.page = page;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload as string;
      });

    // Deposit to wallet
    builder
      .addCase(depositToWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(depositToWallet.fulfilled, (state) => {
        state.loading = false;
        // After successful redirect, wallet info will be refreshed on return
      })
      .addCase(depositToWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get transaction details
    builder
      .addCase(getTransactionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionDetails.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getTransactionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, setPage, resetTransactions, updateLastRefreshTime } =
  walletSlice.actions;

// Export reducer
export default walletSlice.reducer;
