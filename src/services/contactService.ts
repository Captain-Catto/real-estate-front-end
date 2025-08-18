import { getAccessToken } from "./authService";
import { showErrorToast } from "@/utils/errorHandler";
import { API_BASE_URL } from "@/services/authService";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  createdAt: string;
  updatedAt: string;
  repliedAt?: string;
  repliedBy?: string;
  replyMessage?: string;
}

export interface CreateContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
}

class ContactService {
  // Public method - send contact message
  async sendContactMessage(data: CreateContactMessage): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log("Sending contact message:", data);

      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send contact message");
      }

      return {
        success: true,
        message: result.message || "Contact message sent successfully",
      };
    } catch (error) {
      showErrorToast("Gửi tin nhắn liên hệ thất bại");
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Admin methods - require authentication
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
      const token = getAccessToken();

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      showErrorToast("Lỗi kết nối mạng");
      throw error;
    }
  }

  // Get all contact messages for admin
  async getContactMessages(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<{
    messages: ContactMessage[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append("page", String(params.page || 1));
      queryParams.append("limit", String(params.limit || 20));

      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status);
      }
      if (params.search) {
        queryParams.append("search", params.search);
      }
      if (params.dateFrom) {
        queryParams.append("dateFrom", params.dateFrom);
      }
      if (params.dateTo) {
        queryParams.append("dateTo", params.dateTo);
      }

      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contact messages");
      }

      const result = await response.json();
      return {
        messages: result.data.messages || [],
        pagination: result.data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 20,
        },
      };
    } catch (error) {
      showErrorToast("Lấy danh sách tin nhắn liên hệ thất bại");
      throw error;
    }
  }

  // Get contact message by ID
  async getContactMessageById(messageId: string): Promise<ContactMessage> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/${messageId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contact message");
      }

      const result = await response.json();
      return result.data.message;
    } catch (error) {
      showErrorToast("Lấy tin nhắn liên hệ thất bại");
      throw error;
    }
  }

  // Update contact message status
  async updateContactMessageStatus(
    messageId: string,
    status: "new" | "read" | "replied" | "closed",
    note?: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/${messageId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status, note }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to update contact message status"
        );
      }

      return { success: true };
    } catch (error) {
      showErrorToast("Cập nhật trạng thái tin nhắn thất bại");
      throw error;
    }
  }

  // Reply to contact message
  async replyToContactMessage(
    messageId: string,
    replyMessage: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/${messageId}/reply`,
        {
          method: "POST",
          body: JSON.stringify({ replyMessage }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reply to contact message");
      }

      return { success: true };
    } catch (error) {
      showErrorToast("Trả lời tin nhắn liên hệ thất bại");
      throw error;
    }
  }

  // Delete contact message
  async deleteContactMessage(messageId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/${messageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete contact message");
      }

      return { success: true };
    } catch (error) {
      showErrorToast("Xóa tin nhắn liên hệ thất bại");
      throw error;
    }
  }

  // Get contact statistics
  async getContactStats(): Promise<ContactStats> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/stats`
      );

      if (!response.ok) {
        // If no specific stats endpoint, calculate from messages data
        const allMessages = await this.getContactMessages({ limit: 1000 });
        const messages = allMessages.messages;

        const stats: ContactStats = {
          total: messages.length,
          new: messages.filter((m) => m.status === "new").length,
          read: messages.filter((m) => m.status === "read").length,
          replied: messages.filter((m) => m.status === "replied").length,
          closed: messages.filter((m) => m.status === "closed").length,
        };

        return stats;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      showErrorToast("Lấy thống kê tin nhắn liên hệ thất bại");
      // Return default stats if error
      return {
        total: 0,
        new: 0,
        read: 0,
        replied: 0,
        closed: 0,
      };
    }
  }

  // Create contact log
  async createContactLog(logData: {
    contactId: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    description: string;
  }) {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/logs`,
        {
          method: "POST",
          body: JSON.stringify(logData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create contact log");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      showErrorToast("Tạo log liên hệ thất bại");
      throw error;
    }
  }

  // Get contact logs
  async getContactLogs(contactId: string) {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/${contactId}/logs`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get contact logs");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      showErrorToast("Lấy danh sách log liên hệ thất bại");
      throw error;
    }
  }

  // Update contact log note
  async updateContactLogNote(
    logId: string,
    note: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/contact/logs/${logId}`,
        {
          method: "PUT",
          body: JSON.stringify({ note }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update contact log note");
      }

      return { success: true };
    } catch (error) {
      showErrorToast("Cập nhật ghi chú log liên hệ thất bại");
      throw error;
    }
  }
}

export const contactService = new ContactService();
