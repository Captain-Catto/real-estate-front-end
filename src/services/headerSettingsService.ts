import { fetchWithAuth } from "@/services/authService";

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

class HeaderSettingsService {
  private baseUrl = "http://localhost:8080/api/admin/header-settings";

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
      console.error("Error fetching header menus:", error);
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
      console.error("Error creating header menu:", error);
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
      console.error("Error updating header menu:", error);
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
      console.error("Error deleting header menu:", error);
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
      console.error("Error updating menu order:", error);
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
      console.error("Error toggling menu status:", error);
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
      console.error("Error resetting to default:", error);
      throw error;
    }
  }
}

export const headerSettingsService = new HeaderSettingsService();
