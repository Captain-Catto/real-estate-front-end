import { getAccessToken } from "./authService";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: ServiceNotification[];
}

export interface ServiceNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  isRead: boolean;
  createdAt: string;
  userId: string;
  data: Record<string, unknown>;
}

export interface ActionButton {
  text: string;
  link: string;
  style: "primary" | "secondary" | "success" | "warning" | "info" | "danger";
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt: string;
}

export interface SystemNotificationPayload {
  title: string;
  message: string;
  targetType: "all" | "specific" | "role";
  targetUsers: string[];
  userRole: string;
  actionButton?: ActionButton;
}

export interface PreviewResponse {
  success: boolean;
  data: {
    targetCount: number;
    previewUsers: User[];
    hasMore: boolean;
  };
  message?: string;
}

export interface UserSearchResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
}

export const notificationService = {
  async getUserNotifications(): Promise<NotificationResponse> {
    try {
      // Mock response since we don't have the actual endpoint
      return {
        success: true,
        data: [],
      };
    } catch (error: unknown) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Lỗi khi tải thông báo",
        data: [],
      };
    }
  },

  async markAsRead(notificationId: string): Promise<MarkAsReadResponse> {
    try {
      // Mock response since we don't have the actual endpoint
      console.log("Mark notification as read:", notificationId);
      return {
        success: true,
        message: "Đã đánh dấu đọc thành công",
      };
    } catch (error: unknown) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Lỗi khi đánh dấu đã đọc",
      };
    }
  },

  // Admin functions
  admin: {
    async previewNotificationTargets(
      targetType: string,
      targetUsers?: string[],
      userRole?: string
    ): Promise<PreviewResponse> {
      try {
        const token = getAccessToken();
        const params = new URLSearchParams({ targetType });

        if (targetType === "specific" && targetUsers) {
          targetUsers.forEach((userId) => params.append("targetUsers", userId));
        } else if (targetType === "role" && userRole) {
          params.append("userRole", userRole);
        }

        const response = await fetch(
          `${API_BASE_URL}/admin/notifications/preview?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        toast.error("Xem trước mục tiêu thông báo thất bại");
        throw error;
      }
    },

    async searchUsers(query: string): Promise<UserSearchResponse> {
      try {
        const token = getAccessToken();
        const response = await fetch(
          `${API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        toast.error("Tìm kiếm người dùng thất bại");
        throw error;
      }
    },

    async sendSystemNotification(
      payload: SystemNotificationPayload
    ): Promise<{ success: boolean; message?: string }> {
      try {
        const token = getAccessToken();
        const response = await fetch(
          `${API_BASE_URL}/admin/notifications/system`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        toast.error("Gửi thông báo hệ thống thất bại");
        throw error;
      }
    },
  },
};
