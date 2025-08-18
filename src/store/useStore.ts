import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import { useCallback } from "react";
import { showErrorToast } from "@/utils/errorHandler";

// Import all slices
import {
  toggleFavoriteAsync,
  fetchFavoritesAsync,
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
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearError as clearNotificationError,
} from "./slices/notificationSlice";
import {
  fetchSidebarConfig,
  updateSidebarItem,
  addSidebarItem,
  deleteSidebarItem,
  reorderSidebarItems,
  clearError as clearSidebarError,
} from "./slices/sidebarSlice";

// Base hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Unified Store Hook - combines all functionality
export const useStore = () => {
  const dispatch = useAppDispatch();

  // Auth state
  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);
  const authError = useAppSelector((state) => state.auth.error);

  // Favorites state
  const favorites = useAppSelector((state) => state.favorites.items);
  const favoritesLoading = useAppSelector((state) => state.favorites.isLoading);
  const favoritesError = useAppSelector((state) => state.favorites.error);

  // Wallet state
  const walletInfo = useAppSelector((state) => state.wallet.walletInfo);
  const transactions = useAppSelector((state) => state.wallet.transactions);
  const walletLoading = useAppSelector((state) => state.wallet.loading);
  const transactionsLoading = useAppSelector(
    (state) => state.wallet.transactionsLoading
  );
  const walletError = useAppSelector((state) => state.wallet.error);
  const page = useAppSelector((state) => state.wallet.page);

  // Notifications state
  const notifications = useAppSelector(
    (state) => state.notifications.notifications
  );
  const notificationsLoading = useAppSelector(
    (state) => state.notifications.loading
  );
  const notificationsError = useAppSelector(
    (state) => state.notifications.error
  );
  const unreadCount = useAppSelector(
    (state) => state.notifications.unreadCount
  );

  // Sidebar state
  const sidebarConfig = useAppSelector((state) => state.sidebar.config);
  const sidebarLoading = useAppSelector((state) => state.sidebar.loading);
  const sidebarError = useAppSelector((state) => state.sidebar.error);

  // Auth actions
  const clearAuthErrorAction = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Favorites actions
  const fetchUserFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false };
    }

    try {
      await dispatch(fetchFavoritesAsync(true)).unwrap();
      return { success: true };
    } catch (err) {
      console.log(
        "Failed to fetch user favorites (logged for debugging):",
        err
      );
      showErrorToast("Không thể tải danh sách yêu thích");
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
        return false;
      }

      try {
        await dispatch(toggleFavoriteAsync(propertyId)).unwrap();
        return true;
      } catch (err) {
        console.log(
          "Failed to add property to favorites (logged for debugging):",
          err
        );
        showErrorToast("Không thể thêm vào danh sách yêu thích");
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
        await dispatch(toggleFavoriteAsync(propertyId)).unwrap();
        return true;
      } catch (err) {
        console.log(
          "Failed to remove property from favorites (logged for debugging):",
          err
        );
        showErrorToast("Không thể xóa khỏi danh sách yêu thích");
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

  // Wallet actions
  const fetchWalletInfoAction = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false };
    }

    try {
      await dispatch(fetchWalletInfo()).unwrap();
      return { success: true };
    } catch (err) {
      showErrorToast("Không thể tải thông tin ví");
      return { success: false, error: err };
    }
  }, [dispatch, isAuthenticated]);

  const fetchTransactionsAction = useCallback(
    async (page = 1, limit = 10) => {
      if (!isAuthenticated) {
        return { success: false };
      }

      try {
        await dispatch(fetchTransactions({ page, limit })).unwrap();
        return { success: true };
      } catch (err) {
        showErrorToast("Không thể tải lịch sử giao dịch");
        return { success: false, error: err };
      }
    },
    [dispatch, isAuthenticated]
  );

  const depositToWalletAction = useCallback(
    async (amount: number, _method: string, _description?: string) => {
      if (!isAuthenticated) {
        return { success: false };
      }

      try {
        const result = await dispatch(depositToWallet({ amount })).unwrap();
        return { success: true, data: result };
      } catch (err) {
        showErrorToast("Không thể nạp tiền vào ví");
        return { success: false, error: err };
      }
    },
    [dispatch, isAuthenticated]
  );

  const getTransactionDetailsAction = useCallback(
    async (transactionId: string) => {
      if (!isAuthenticated) {
        return { success: false };
      }

      try {
        const result = await dispatch(
          getTransactionDetails(transactionId)
        ).unwrap();
        return { success: true, data: result };
      } catch (err) {
        showErrorToast("Không thể tải chi tiết giao dịch");
        return { success: false, error: err };
      }
    },
    [dispatch, isAuthenticated]
  );

  const clearWalletErrorAction = useCallback(() => {
    dispatch(clearWalletError());
  }, [dispatch]);

  const setWalletPage = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const resetWalletTransactions = useCallback(() => {
    dispatch(resetTransactions());
  }, [dispatch]);

  const updateWalletLastRefreshTime = useCallback(() => {
    dispatch(updateLastRefreshTime());
  }, [dispatch]);

  // Notifications actions
  const fetchNotificationsAction = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false };
    }

    try {
      await dispatch(fetchNotifications(false)).unwrap();
      return { success: true };
    } catch (err) {
      showErrorToast("Không thể tải thông báo");
      return { success: false, error: err };
    }
  }, [dispatch, isAuthenticated]);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await (dispatch as any)(
          markNotificationAsRead(notificationId)
        ).unwrap();
        return true;
      } catch {
        showErrorToast("Không thể đánh dấu thông báo đã đọc");
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await (dispatch as any)(markAllNotificationsAsRead()).unwrap();
      return true;
    } catch {
      showErrorToast("Không thể đánh dấu tất cả thông báo đã đọc");
      return false;
    }
  }, [dispatch, isAuthenticated]);

  const clearNotificationErrorAction = useCallback(() => {
    dispatch(clearNotificationError());
  }, [dispatch]);

  // Sidebar actions
  const fetchSidebarConfigAction = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false };
    }

    try {
      await dispatch(fetchSidebarConfig()).unwrap();
      return { success: true };
    } catch {
      showErrorToast("Không thể tải cấu hình sidebar");
      return { success: false };
    }
  }, [dispatch, isAuthenticated]);

  const updateSidebarItemAction = useCallback(
    async (itemId: string, updates: any) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await dispatch(
          updateSidebarItem({ itemId, itemData: updates })
        ).unwrap();
        return true;
      } catch {
        showErrorToast("Không thể cập nhật mục sidebar");
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const addSidebarItemAction = useCallback(
    async (item: any) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await dispatch(addSidebarItem(item)).unwrap();
        return true;
      } catch {
        showErrorToast("Không thể thêm mục sidebar");
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const removeSidebarItemAction = useCallback(
    async (itemId: string) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await dispatch(deleteSidebarItem(itemId)).unwrap();
        return true;
      } catch {
        showErrorToast("Không thể xóa mục sidebar");
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const reorderSidebarItemsAction = useCallback(
    async (items: any[]) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await dispatch(reorderSidebarItems(items)).unwrap();
        return true;
      } catch {
        showErrorToast("Không thể sắp xếp lại sidebar");
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const clearSidebarErrorAction = useCallback(() => {
    dispatch(clearSidebarError());
  }, [dispatch]);

  return {
    // Auth
    user: authUser,
    isAuthenticated,
    authLoading,
    isInitialized,
    sessionExpired,
    authError,
    clearAuthError: clearAuthErrorAction,

    // Favorites
    favorites,
    favoritesLoading,
    favoritesError,
    fetchUserFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,

    // Wallet
    walletInfo,
    transactions,
    walletLoading,
    transactionsLoading,
    walletError,
    page: page,
    fetchWalletInfo: fetchWalletInfoAction,
    fetchTransactions: fetchTransactionsAction,
    depositToWallet: depositToWalletAction,
    getTransactionDetails: getTransactionDetailsAction,
    clearWalletError: clearWalletErrorAction,
    setWalletPage,
    resetWalletTransactions,
    updateWalletLastRefreshTime,

    // Notifications
    notifications,
    notificationsLoading,
    notificationsError,
    unreadCount,
    fetchNotifications: fetchNotificationsAction,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    // deleteNotification: deleteNotificationAction,
    clearNotificationError: clearNotificationErrorAction,

    // Sidebar
    sidebarConfig,
    // processedGroups,
    // flatMenuItems,
    sidebarLoading,
    sidebarError,
    fetchSidebarConfig: fetchSidebarConfigAction,
    updateSidebarItem: updateSidebarItemAction,
    addSidebarItem: addSidebarItemAction,
    removeSidebarItem: removeSidebarItemAction,
    reorderSidebarItems: reorderSidebarItemsAction,
    clearSidebarError: clearSidebarErrorAction,
  };
};

// Legacy individual hooks for backward compatibility
export const useAuth = () => {
  const store = useStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    loading: store.authLoading,
    isInitialized: store.isInitialized,
    sessionExpired: store.sessionExpired,
    error: store.authError,
    clearError: store.clearAuthError,
  };
};

export const useFavorites = () => {
  const store = useStore();
  return {
    favorites: store.favorites,
    loading: store.favoritesLoading,
    error: store.favoritesError,
    fetchUserFavorites: store.fetchUserFavorites,
    isFavorite: store.isFavorite,
    addFavorite: store.addFavorite,
    removeFavorite: store.removeFavorite,
    toggleFavorite: store.toggleFavorite,
  };
};

export const useWallet = () => {
  const store = useStore();
  return {
    walletInfo: store.walletInfo,
    transactions: store.transactions,
    loading: store.walletLoading,
    transactionsLoading: store.transactionsLoading,
    error: store.walletError,
    page: store.page,
    fetchWalletInfo: store.fetchWalletInfo,
    fetchTransactions: store.fetchTransactions,
    depositToWallet: store.depositToWallet,
    getTransactionDetails: store.getTransactionDetails,
    clearError: store.clearWalletError,
    setPage: store.setWalletPage,
    resetTransactions: store.resetWalletTransactions,
    updateLastRefreshTime: store.updateWalletLastRefreshTime,
  };
};

export const useNotifications = () => {
  const store = useStore();
  return {
    notifications: store.notifications,
    loading: store.notificationsLoading,
    error: store.notificationsError,
    unreadCount: store.unreadCount,
    fetchNotifications: store.fetchNotifications,
    markAsRead: store.markNotificationAsRead,
    markAllAsRead: store.markAllNotificationsAsRead,
    // deleteNotification: store.deleteNotification,
    clearError: store.clearNotificationError,
  };
};

export const useSidebar = () => {
  const store = useStore();
  return {
    config: store.sidebarConfig,
    // processedGroups: store.processedGroups,
    // flatMenuItems: store.flatMenuItems,
    loading: store.sidebarLoading,
    error: store.sidebarError,
    fetchSidebarConfig: store.fetchSidebarConfig,
    updateItem: store.updateSidebarItem,
    addItem: store.addSidebarItem,
    removeItem: store.removeSidebarItem,
    reorderItems: store.reorderSidebarItems,
    clearError: store.clearSidebarError,
  };
};

// Management hooks for admin functionality
export const useSidebarManagement = () => {
  const store = useStore();
  return {
    updateItem: store.updateSidebarItem,
    addItem: store.addSidebarItem,
    removeItem: store.removeSidebarItem,
    reorderItems: store.reorderSidebarItems,
  };
};
