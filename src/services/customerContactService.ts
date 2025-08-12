import { fetchWithAuth, API_BASE_URL } from "./authService";

export interface CustomerContact {
  _id: string;
  user: {
    _id: string;
    username: string;
    phoneNumber: string;
    email?: string;
  };
  post: {
    _id: string;
    title: string;
    price: number;
    type?: string;
    location?: {
      province?: string | { name: string };
      ward?: string | { name: string };
      district?: string | { name: string };
      street?: string;
    };
  };
  contactType: "interested" | "viewing" | "consultation" | "other";
  status: "pending" | "contacted" | "completed" | "cancelled";
  message?: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  contactedAt?: string;
  contactedBy?: {
    _id: string;
    username: string;
    role: string;
  };
  deletedAt?: string;
  deletedBy?: {
    _id: string;
    username: string;
    role: string;
  };
}

export interface ContactFilters {
  page?: number;
  limit?: number;
  status?: string;
  contactType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
  userId?: string;
}

export interface ContactResponse {
  success: boolean;
  data: {
    contacts: CustomerContact[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  };
  message?: string;
}

export interface SingleContactResponse {
  success: boolean;
  data?: CustomerContact;
  message?: string;
}

export interface CreateContactRequest {
  postId: string;
  contactType: "interested" | "viewing" | "consultation" | "other";
  message?: string;
}

class CustomerContactService {
  private baseUrl = `${API_BASE_URL}/customer-contacts`;

  // Tạo yêu cầu callback mới (cho người dùng thường)
  async createCallBackRequest(
    postId: string,
    notes?: string
  ): Promise<SingleContactResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/callback`, {
        method: "POST",
        body: JSON.stringify({
          postId,
          notes,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating callback request:", error);
      throw error;
    }
  }

  // Tạo liên hệ mới
  async createContact(
    data: CreateContactRequest
  ): Promise<SingleContactResponse> {
    try {
      const response = await fetchWithAuth(this.baseUrl, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  // Lấy danh sách liên hệ của user hiện tại
  async getUserContacts(
    filters: ContactFilters = {}
  ): Promise<ContactResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.contactType && filters.contactType !== "all")
        params.append("contactType", filters.contactType);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.includeDeleted) params.append("includeDeleted", "true");

      const response = await fetchWithAuth(
        `${this.baseUrl}/my-contacts?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching user contacts:", error);
      throw error;
    }
  }

  // Lấy tất cả liên hệ (chỉ admin)
  async getAllContacts(filters: ContactFilters = {}): Promise<ContactResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.contactType && filters.contactType !== "all")
        params.append("contactType", filters.contactType);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.includeDeleted) params.append("includeDeleted", "true");
      if (filters.userId) params.append("userId", filters.userId);

      const response = await fetchWithAuth(
        `${this.baseUrl}/all?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching all contacts:", error);
      throw error;
    }
  }

  // Lấy liên hệ theo user ID (cho admin xem lịch sử liên hệ của user cụ thể)
  async getContactsByUserId(
    userId: string,
    filters: ContactFilters = {}
  ): Promise<ContactResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.contactType && filters.contactType !== "all")
        params.append("contactType", filters.contactType);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.includeDeleted) params.append("includeDeleted", "true");

      const response = await fetchWithAuth(
        `${this.baseUrl}/user/${userId}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching contacts by user ID:", error);
      throw error;
    }
  }

  // Universal method để lấy contacts dựa trên context
  async getContacts(filters: ContactFilters = {}): Promise<ContactResponse> {
    try {
      if (filters.userId) {
        // Nếu có userId, lấy contacts của user đó (dành cho admin)
        return await this.getContactsByUserId(filters.userId, filters);
      } else {
        // Nếu không có userId, lấy contacts của user hiện tại
        return await this.getUserContacts(filters);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  }

  // Cập nhật trạng thái liên hệ
  async updateStatus(
    contactId: string,
    status: string
  ): Promise<SingleContactResponse> {
    try {
      const response = await fetchWithAuth(
        `${this.baseUrl}/${contactId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error updating contact status:", error);
      throw error;
    }
  }

  // Cập nhật ghi chú
  async updateNotes(
    contactId: string,
    notes: string
  ): Promise<SingleContactResponse> {
    try {
      const response = await fetchWithAuth(
        `${this.baseUrl}/${contactId}/notes`,
        {
          method: "PATCH",
          body: JSON.stringify({
            notes,
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error updating contact notes:", error);
      throw error;
    }
  }

  // Xóa mềm liên hệ
  async softDelete(contactId: string): Promise<SingleContactResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/${contactId}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.error("Error soft deleting contact:", error);
      throw error;
    }
  }

  // Khôi phục liên hệ đã xóa
  async restore(contactId: string): Promise<SingleContactResponse> {
    try {
      const response = await fetchWithAuth(
        `${this.baseUrl}/${contactId}/restore`,
        {
          method: "PUT",
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error restoring contact:", error);
      throw error;
    }
  }

  // Alias for restore method to match UserContactTab usage
  async restoreContact(contactId: string): Promise<SingleContactResponse> {
    return this.restore(contactId);
  }

  // Alias for updateStatus method to match UserContactTab usage
  async updateContactStatus(
    contactId: string,
    status: string
  ): Promise<SingleContactResponse> {
    return this.updateStatus(contactId, status);
  }

  // Hard delete contact (admin only)
  async hardDeleteContact(contactId: string): Promise<SingleContactResponse> {
    try {
      const response = await fetchWithAuth(
        `${this.baseUrl}/${contactId}/hard-delete`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error hard deleting contact:", error);
      throw error;
    }
  }

  // Lấy chi tiết một liên hệ
  async getContactById(
    contactId: string
  ): Promise<{ success: boolean; data: CustomerContact; message?: string }> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/${contactId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching contact details:", error);
      throw error;
    }
  }
}

export const customerContactService = new CustomerContactService();
export default customerContactService;
