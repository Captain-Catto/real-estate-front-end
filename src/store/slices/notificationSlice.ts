import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { toast } from "sonner";
import type { RootState } from "../index";

// Types
export interface NotificationData {
  actionButton?: {
    text: string;
    link?: string;
    style?: "primary" | "secondary" | "success" | "warning" | "danger";
  };
  [key: string]: unknown;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type:
    | "PAYMENT"
    | "ORDER"
    | "SYSTEM"
    | "PROMOTION"
    | "ACCOUNT"
    | "POST_APPROVED"
    | "POST_REJECTED";
  read: boolean;
  createdAt: string;
  userId: string;
  data: NotificationData;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  lastFetch: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetch: 0,
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const CACHE_TIME = 5000; // 5 seconds

// Helper function for authenticated requests
async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  getState: any
) {
  const state = getState() as RootState;
  const token = state.auth.accessToken;

  if (!token) {
    throw new Error("Access denied. No token provided.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Network error");
  }

  return response;
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      // Check if user is authenticated first
      if (!state.auth.isAuthenticated || !state.auth.accessToken) {
        return rejectWithValue("User not authenticated");
      }

      const now = Date.now();

      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Fetch notifications called:", {
          forceRefresh,
          lastFetch: state.notifications.lastFetch,
          timeDiff: now - state.notifications.lastFetch,
        });
      }

      // Check cache only if not forcing refresh
      if (!forceRefresh && now - state.notifications.lastFetch < CACHE_TIME) {
        if (process.env.NODE_ENV === "development") {
          console.log("📋 Using cached notifications");
        }
        return {
          notifications: state.notifications.notifications,
          unreadCount: state.notifications.unreadCount,
        };
      }

      if (process.env.NODE_ENV === "development") {
        console.log("🌐 Fetching fresh notifications from API");
      }
      const response = await fetchWithAuth(
        `${API_BASE_URL}/notifications`,
        {},
        getState
      );
      const data = await response.json();

      if (process.env.NODE_ENV === "development") {
        console.log("📧 Notification API response:", data);
      }

      // Return structured data
      const result = {
        notifications: data.data?.notifications || data.data || [],
        unreadCount: data.data?.unreadCount || 0,
      };

      if (process.env.NODE_ENV === "development") {
        console.log("📝 Processed notification result:", result);
      }
      return result;
    } catch (error) {
      toast.error("Không thể tải thông báo");
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      // Check if user is authenticated first
      if (!state.auth.isAuthenticated || !state.auth.accessToken) {
        return rejectWithValue("User not authenticated");
      }

      await fetchWithAuth(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
        },
        getState
      );
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      // Check if user is authenticated first
      if (!state.auth.isAuthenticated || !state.auth.accessToken) {
        return rejectWithValue("User not authenticated");
      }

      await fetchWithAuth(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "PUT",
        },
        getState
      );
      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read"
      );
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload
      );
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        if (process.env.NODE_ENV === "development") {
          console.log("📧 Processing notification payload:", payload);
        }

        // Handle structured response from our async thunk
        if (payload && payload.notifications) {
          const newNotifications = Array.isArray(payload.notifications)
            ? payload.notifications
            : [];

          // Remove duplicates by ID before setting
          const uniqueNotifications = newNotifications.filter(
            (
              notification: Notification,
              index: number,
              arr: Notification[]
            ) => {
              return arr.findIndex((n) => n._id === notification._id) === index;
            }
          );

          if (process.env.NODE_ENV === "development") {
            console.log("🔄 Setting notifications:", {
              original: newNotifications.length,
              unique: uniqueNotifications.length,
            });
          }

          state.notifications = uniqueNotifications;
          state.unreadCount =
            payload.unreadCount ||
            uniqueNotifications.filter((n: Notification) => !n.read).length;
        } else if (Array.isArray(payload)) {
          // Fallback for direct array response
          const uniquePayload = payload.filter(
            (
              notification: Notification,
              index: number,
              arr: Notification[]
            ) => {
              return arr.findIndex((n) => n._id === notification._id) === index;
            }
          );
          state.notifications = uniquePayload;
          state.unreadCount = uniquePayload.filter(
            (n: Notification) => !n.read
          ).length;
        } else {
          toast.error("Định dạng dữ liệu thông báo không hợp lệ");
          state.notifications = [];
          state.unreadCount = 0;
        }
        state.lastFetch = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.pending, (state, action) => {
        // Optimistic update - mark as read immediately
        const notificationId = action.meta.arg;
        const notification = state.notifications.find(
          (n) => n._id === notificationId
        );
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        // Already updated in pending, just ensure consistency
        const notification = state.notifications.find(
          (n) => n._id === action.payload
        );
        if (notification) {
          notification.read = true;
          // Don't update unreadCount again since it was updated in pending
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
        // Rollback optimistic update
        const notificationId = action.meta.arg;
        const notification = state.notifications.find(
          (n) => n._id === notificationId
        );
        if (notification && notification.read) {
          notification.read = false;
          state.unreadCount += 1;
        }
      });

    // Mark all as read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        // Optimistic update - mark all as read immediately
        state.notifications.forEach((notification) => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        // Already updated in pending, just ensure consistency
        state.notifications.forEach((notification) => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
        // For simplicity, we won't rollback mark all - user can refresh
      });
  },
});

// Actions
export const {
  clearError,
  addNotification,
  removeNotification,
  updateUnreadCount,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: {
  notifications: NotificationState;
}) => state.notifications.notifications;
export const selectUnreadCount = (state: {
  notifications: NotificationState;
}) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: {
  notifications: NotificationState;
}) => state.notifications.loading;
export const selectNotificationsError = (state: {
  notifications: NotificationState;
}) => state.notifications.error;

// Memoized selectors to prevent unnecessary re-renders
export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((n) => !n.read)
);

export const selectShouldFetch = createSelector(
  [
    (state: { notifications: NotificationState }) =>
      state.notifications.lastFetch,
  ],
  (lastFetch) => Date.now() - lastFetch > CACHE_TIME
);

export default notificationSlice.reducer;
