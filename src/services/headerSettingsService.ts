import { fetchWithAuth } from "@/services/authService";
import { showErrorToast } from "@/utils/errorHandler";

export interface DropdownItem {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  children?: DropdownItem[];
}

export interface HeaderMenu {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  hasDropdown: boolean;
  dropdownItems: DropdownItem[];
}

export interface HeaderSettingsResponse {
  success: boolean;
  data: HeaderMenu[];
  message?: string;
}

export interface CreateHeaderMenuRequest {
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  hasDropdown: boolean;
  dropdownItems: Omit<DropdownItem, "id">[];
}

export interface UpdateHeaderMenuRequest extends CreateHeaderMenuRequest {
  id: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

class HeaderSettingsService {
  private baseUrl = `${API_BASE_URL}/admin/header-settings`;
  private publicUrl = `${API_BASE_URL}/header`;

  // Public method - no authentication required
  async getPublicHeaderMenus(): Promise<HeaderSettingsResponse> {
    try {
      // Add cache-busting parameter to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(`${this.publicUrl}/menus?_t=${timestamp}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache", // Prevent caching
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      showErrorToast("Lấy menu header công khai thất bại");
      throw error;
    }
  }

  // Admin method - requires authentication and permissions
  async getHeaderMenus(): Promise<HeaderSettingsResponse> {
    try {
      const response = await fetchWithAuth(this.baseUrl, {
        method: "GET",
      });

      // Parse JSON if fetchWithAuth returns Response object
      if (response instanceof Response) {
        return await response.json();
      }

      // If fetchWithAuth already returns parsed data
      return response as HeaderSettingsResponse;
    } catch (error) {
      showErrorToast("Lấy menu header thất bại");
      throw error;
    }
  }

  async createHeaderMenu(
    data: CreateHeaderMenuRequest
  ): Promise<HeaderSettingsResponse> {
    try {
      const response = await fetchWithAuth(this.baseUrl, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response instanceof Response) {
        return await response.json();
      }

      return response as HeaderSettingsResponse;
    } catch (error) {
      showErrorToast("Tạo menu header thất bại");
      throw error;
    }
  }

  async updateHeaderMenu(
    data: UpdateHeaderMenuRequest
  ): Promise<HeaderSettingsResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (response instanceof Response) {
        return await response.json();
      }

      return response as HeaderSettingsResponse;
    } catch (error) {
      showErrorToast("Cập nhật menu header thất bại");
      throw error;
    }
  }

  async deleteHeaderMenu(id: string): Promise<HeaderSettingsResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (response instanceof Response) {
        return await response.json();
      }

      return response as HeaderSettingsResponse;
    } catch (error) {
      showErrorToast("Xóa menu header thất bại");
      throw error;
    }
  }

  async updateMenuOrder(
    menus: { id: string; order: number }[]
  ): Promise<HeaderSettingsResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/reorder`, {
        method: "PUT",
        body: JSON.stringify({ menus }),
      });

      if (response instanceof Response) {
        return await response.json();
      }

      return response as HeaderSettingsResponse;
    } catch (error) {
      showErrorToast("Cập nhật thứ tự menu thất bại");
      throw error;
    }
  }

  async toggleMenuStatus(
    id: string,
    isActive: boolean
  ): Promise<HeaderSettingsResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/${id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });

      if (response instanceof Response) {
        return await response.json();
      }

      return response as HeaderSettingsResponse;
    } catch (error) {
      showErrorToast("Chuyển trạng thái menu thất bại");
      throw error;
    }
  }

  async resetToDefault(): Promise<HeaderSettingsResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/reset`, {
        method: "POST",
      });

      if (response instanceof Response) {
        return await response.json();
      }

      return response as HeaderSettingsResponse;
    } catch (error) {
      showErrorToast("Khôi phục cài đặt mặc định thất bại");
      throw error;
    }
  }
}

export const headerSettingsService = new HeaderSettingsService();
