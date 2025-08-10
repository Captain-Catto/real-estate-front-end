import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import { AppDispatch, RootState } from "@/store";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError,
  selectUnreadNotifications,
  selectShouldFetch,
  clearError,
  Notification,
} from "@/store/slices/notificationSlice";

export function useNotifications() {
  const dispatch = useDispatch<AppDispatch>();
  const lastForceRefreshRef = useRef<number>(0);
  const THROTTLE_DELAY = 2000; // 2 seconds throttle

  // Selectors
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const shouldFetch = useSelector(selectShouldFetch);

  // Actions
  const fetchNotificationsAction = useCallback(() => {
    dispatch(fetchNotifications(false));
  }, [dispatch]);

  const forceRefreshNotifications = useCallback(() => {
    const now = Date.now();
    if (now - lastForceRefreshRef.current > THROTTLE_DELAY) {
      console.log("🔄 Force refreshing notifications");
      // Force refresh by ignoring cache
      dispatch(fetchNotifications(true));
      lastForceRefreshRef.current = now;
    } else {
      console.log("🔄 Throttling notification force refresh (too soon)");
    }
  }, [dispatch, THROTTLE_DELAY]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      dispatch(markNotificationAsRead(notificationId));
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Filter functions
  const getFilteredNotifications = useCallback(
    (filter: "ALL" | "UNREAD") => {
      if (filter === "UNREAD") {
        return unreadNotifications;
      }
      return notifications;
    },
    [notifications, unreadNotifications]
  );

  // Auto-fetch on mount if needed
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && shouldFetch) {
      fetchNotificationsAction();
    }
  }, [fetchNotificationsAction, shouldFetch]);

  return {
    // Data
    notifications,
    unreadCount,
    loading,
    error,
    unreadNotifications,
    shouldFetch,

    // Actions
    fetchNotifications: fetchNotificationsAction,
    forceRefresh: forceRefreshNotifications,
    markAsRead,
    markAllAsRead,
    clearError: clearErrorAction,
    getFilteredNotifications,

    // Computed
    hasUnread: unreadCount > 0,
    totalCount: notifications.length,
  };
}

export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
