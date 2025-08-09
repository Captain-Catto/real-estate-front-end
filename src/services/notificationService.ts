import { authService } from "./authService";

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: any[];
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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi tải thông báo",
        data: [],
      };
    }
  },

  async markAsRead(notificationId: string): Promise<MarkAsReadResponse> {
    try {
      // Mock response since we don't have the actual endpoint
      return {
        success: true,
        message: "Đã đánh dấu đọc thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi đánh dấu đã đọc",
      };
    }
  },
};
