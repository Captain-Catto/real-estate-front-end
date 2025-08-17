import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  fetchFavoritesAsync,
  toggleFavoriteAsync,
} from "./slices/favoritesSlices";
import { clearError as clearAuthError } from "./slices/authSlice";
import {
  fetchWalletInfo,
  fetchTransactions,
  depositToWallet,
  getTransactionDetails,
  clearError as clearWalletError,
  resetTransactions,
} from "./slices/walletSlice";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loading = useAppSelector((state) => state.auth.loading);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);
  const error = useAppSelector((state) => state.auth.error);

  // Add the clearError function
  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    user,
    accessToken,
    isAuthenticated,
    loading,
    isInitialized,
    sessionExpired,
    error,
    clearError,
  };
};

// Favorites hook
export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const loading = useAppSelector((state) => state.favorites.isLoading);
  const error = useAppSelector((state) => state.favorites.error);

  // Fetch favorites from server
  const fetchUserFavorites = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        await dispatch(fetchFavoritesAsync(forceRefresh)).unwrap();
        return true;
      } catch (err) {
        console.log(
          "Failed to fetch user favorites (logged for debugging):",
          err
        );
        toast.error("Không thể tải danh sách yêu thích");
        return false;
      }
    },
    [dispatch]
  );

  // Check if an item is favorited
  const isFavorite = useCallback(
    (propertyId: string) => favorites.some((item) => item.id === propertyId),
    [favorites]
  );

  // Toggle favorite status (add/remove)
  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      try {
        const result = await dispatch(toggleFavoriteAsync(propertyId));
        if (toggleFavoriteAsync.fulfilled.match(result)) {
          return true;
        }
        return false;
      } catch (err) {
        console.log("Failed to toggle favorite (logged for debugging):", err);
        toast.error("Không thể cập nhật trạng thái yêu thích");
        return false;
      }
    },
    [dispatch]
  );

  // Legacy compatibility functions (deprecated - use toggleFavorite instead)
  const addFavorite = useCallback(
    async (propertyId: string) => {
      const isCurrentlyFavorited = favorites.some(
        (item) => item.id === propertyId
      );
      if (!isCurrentlyFavorited) {
        return await toggleFavorite(propertyId);
      }
      return true; // Already favorited
    },
    [favorites, toggleFavorite]
  );

  const removeFavorite = useCallback(
    async (propertyId: string) => {
      const isCurrentlyFavorited = favorites.some(
        (item) => item.id === propertyId
      );
      if (isCurrentlyFavorited) {
        return await toggleFavorite(propertyId);
      }
      return true; // Already not favorited
    },
    [favorites, toggleFavorite]
  );

  return {
    favorites,
    loading,
    error,
    fetchUserFavorites,
    isFavorite,
    toggleFavorite,
    // Legacy functions for backward compatibility
    addFavorite,
    removeFavorite,
  };
};

// Wallet hook
export const useWallet = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  // Selectors
  const walletInfo = useAppSelector((state) => state.wallet.walletInfo);
  const transactions = useAppSelector((state) => state.wallet.transactions);
  const loading = useAppSelector((state) => state.wallet.loading);
  const transactionsLoading = useAppSelector(
    (state) => state.wallet.transactionsLoading
  );
  const error = useAppSelector((state) => state.wallet.error);
  const page = useAppSelector((state) => state.wallet.page);
  const hasMore = useAppSelector((state) => state.wallet.hasMore);
  const lastRefreshTime = useAppSelector(
    (state) => state.wallet.lastRefreshTime
  );

  // Format currency helper
  const formatPrice = useCallback((amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Formatted values
  const formattedBalance = formatPrice(walletInfo.balance);
  const formattedIncome = formatPrice(walletInfo.totalIncome);
  const formattedSpending = formatPrice(walletInfo.totalSpending);
  const formattedBonus = formatPrice(walletInfo.bonusEarned);

  // Actions
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return { success: false };

    try {
      await dispatch(fetchWalletInfo()).unwrap();
      return { success: true };
    } catch (err) {
      toast.error("Không thể làm mới thông tin ví");
      return { success: false, error: err };
    }
  }, [dispatch, isAuthenticated]);

  const refreshTransactions = useCallback(async () => {
    if (!isAuthenticated) return { success: false };

    try {
      dispatch(resetTransactions());
      await dispatch(fetchTransactions({ page: 1, limit: 10 })).unwrap();
      return { success: true };
    } catch (err) {
      toast.error("Không thể làm mới giao dịch");
      return { success: false, error: err };
    }
  }, [dispatch, isAuthenticated]);

  const loadMoreTransactions = useCallback(async () => {
    if (!isAuthenticated || transactionsLoading || !hasMore)
      return { success: false };

    try {
      await dispatch(fetchTransactions({ page: page + 1, limit: 10 })).unwrap();
      return { success: true };
    } catch (err) {
      toast.error("Lỗi không thể tải thêm giao dịch");
      return { success: false, error: err };
    }
  }, [dispatch, isAuthenticated, transactionsLoading, hasMore, page]);

  const deposit = useCallback(
    async (amount: number) => {
      if (!isAuthenticated)
        return {
          success: false,
          error: "Vui lòng đăng nhập để thực hiện giao dịch",
        };

      try {
        const result = await dispatch(
          depositToWallet({
            amount,
            returnUrl:
              window.location.origin + "/nguoi-dung/vi-tien/payment-result",
          })
        ).unwrap();

        return { success: true, data: result };
      } catch (err) {
        toast.error("Lỗi không thể nạp tiền");
        return { success: false, error: err };
      }
    },
    [dispatch, isAuthenticated]
  );

  const getTransactionDetailsAction = useCallback(
    async (transactionId: string) => {
      try {
        const result = await dispatch(
          getTransactionDetails(transactionId)
        ).unwrap();
        return { success: true, data: result };
      } catch (err) {
        toast.error("Lỗi không thể lấy chi tiết giao dịch");
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearWalletError());
  }, [dispatch]);

  // Initialize wallet data when authenticated
  const initializeWallet = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await Promise.all([
        dispatch(fetchWalletInfo()).unwrap(),
        dispatch(fetchTransactions({ page: 1, limit: 10 })).unwrap(),
      ]);
    } catch (err) {
      toast.error("Lỗi không thể khởi tạo ví");
    }
  }, [dispatch, isAuthenticated]);

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

    // Loading states
    loading,
    transactionsLoading,

    // Error handling
    error,
    clearError,

    // Pagination
    page,
    lastRefreshTime,

    // Methods
    refresh,
    refreshTransactions,
    loadMoreTransactions,
    deposit,
    getTransactionDetails: getTransactionDetailsAction,
    initializeWallet,
  };
};
