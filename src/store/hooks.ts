import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import { useCallback } from "react";
import {
  addFavoriteAsync,
  removeFavoriteAsync,
  fetchFavorites, // Updated to match the actual export name
} from "./slices/favoritesSlices";
import { clearError as clearAuthError } from "./slices/authSlice";
import {
  fetchWalletInfo,
  fetchTransactions,
  depositToWallet,
  getTransactionDetails,
  clearError as clearWalletError,
  setPage,
  resetTransactions,
  updateLastRefreshTime,
} from "./slices/walletSlice";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
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
  const { isAuthenticated } = useAuth();

  // Fix the function name to match the actual export
  const fetchUserFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false };
    }

    try {
      await dispatch(fetchFavorites()).unwrap(); // Updated function name
      return { success: true };
    } catch (err) {
      console.error("Failed to fetch user favorites:", err);
      return { success: false, error: err };
    }
  }, [dispatch, isAuthenticated]);

  const isFavorite = useCallback(
    (propertyId: string) => favorites.some((item) => item.id === propertyId),
    [favorites]
  );

  const addFavorite = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        // Handle unauthenticated case - perhaps redirect to login
        return false;
      }

      try {
        await dispatch(addFavoriteAsync(propertyId)).unwrap();
        return true;
      } catch (err) {
        console.error("Failed to add property to favorites:", err);
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const removeFavorite = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await dispatch(removeFavoriteAsync(propertyId)).unwrap();
        return true;
      } catch (err) {
        console.error("Failed to remove property from favorites:", err);
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (isFavorite(propertyId)) {
        return await removeFavorite(propertyId);
      } else {
        return await addFavorite(propertyId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    fetchUserFavorites,
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
      console.error("Failed to refresh wallet info:", err);
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
      console.error("Failed to refresh transactions:", err);
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
      console.error("Failed to load more transactions:", err);
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
        console.error("Failed to deposit funds:", err);
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
        console.error("Failed to get transaction details:", err);
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
      console.error("Failed to initialize wallet:", err);
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
