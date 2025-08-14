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
};
