import { getAccessToken } from "./authService";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/authService";

export interface SidebarMenuItem {
  id: string;
  title: string;
  path: string;
  parentId?: string;
  order: number;
  isVisible: boolean;
  allowedRoles: ("admin" | "employee")[];
  metadata?: {
    isGroup?: boolean;
    [key: string]: unknown;
  };
}

export interface SidebarConfig {
  _id: string;
  name: string;
  items: SidebarMenuItem[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SidebarAPIResponse<T = SidebarConfig> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ConfigListResponse {
  success: boolean;
  data: SidebarConfig[];
  message?: string;
}

export class SidebarAPI {
  private static getAuthHeaders() {
    const token = typeof window !== "undefined" ? getAccessToken() : null;

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Lấy cấu hình sidebar từ backend
  static async getSidebarConfig(): Promise<SidebarAPIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sidebar/config`, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Sidebar config loaded from API:", data);
      return data;
    } catch (error) {
      toast.error("Lỗi khi tải cấu hình sidebar");
      return {
        success: false,
        data: {
          _id: "",
          name: "Error",
          items: [],
          isDefault: false,
          createdAt: "",
          updatedAt: "",
        },
        message: "Lỗi khi tải cấu hình sidebar",
      };
    }
  }

  // Lấy tất cả cấu hình (admin only)
  static async getAllConfigs(): Promise<ConfigListResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sidebar/configs`, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi tải danh sách cấu hình");
      return {
        success: false,
        data: [],
        message: "Lỗi khi tải danh sách cấu hình",
      };
    }
  }

  // Tạo cấu hình mới (admin only)
  static async createConfig(
    configData: Partial<SidebarConfig>
  ): Promise<SidebarAPIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sidebar/configs`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi tạo cấu hình");
      return {
        success: false,
        data: {
          _id: "",
          name: "Error",
          items: [],
          isDefault: false,
          createdAt: "",
          updatedAt: "",
        },
        message: "Lỗi khi tạo cấu hình",
      };
    }
  }

  // Cập nhật cấu hình (admin only)
  static async updateConfig(
    id: string,
    configData: Partial<SidebarConfig>
  ): Promise<SidebarAPIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sidebar/configs/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi cập nhật cấu hình");
      return {
        success: false,
        data: {
          _id: "",
          name: "Error",
          items: [],
          isDefault: false,
          createdAt: "",
          updatedAt: "",
        },
        message: "Lỗi khi cập nhật cấu hình",
      };
    }
  }

  // Xóa cấu hình (admin only)
  static async deleteConfig(id: string): Promise<SidebarAPIResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL}/sidebar/configs/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi xóa cấu hình");
      return {
        success: false,
        data: false,
        message: "Lỗi khi xóa cấu hình",
      };
    }
  }

  // Đặt cấu hình mặc định (admin only)
  static async setDefaultConfig(id: string): Promise<SidebarAPIResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sidebar/configs/${id}/default`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi đặt cấu hình mặc định");
      return {
        success: false,
        data: {
          _id: "",
          name: "Error",
          items: [],
          isDefault: false,
          createdAt: "",
          updatedAt: "",
        },
        message: "Lỗi khi đặt cấu hình mặc định",
      };
    }
  }

  // Sắp xếp lại thứ tự items (admin only)
  static async reorderItems(
    configId: string,
    itemOrders: Array<{ id: string; order: number }>
  ): Promise<SidebarAPIResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sidebar/configs/${configId}/reorder-items`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ itemOrders }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi sắp xếp menu");
      return {
        success: false,
        data: {
          _id: "",
          name: "Error",
          items: [],
          isDefault: false,
          createdAt: "",
          updatedAt: "",
        },
        message: "Lỗi khi sắp xếp menu",
      };
    }
  }

  // Thêm menu item (admin only)
  static async addMenuItem(
    configId: string,
    itemData: Partial<SidebarMenuItem>
  ): Promise<SidebarAPIResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sidebar/configs/${configId}/items`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify(itemData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi thêm menu item");
      return {
        success: false,
        data: {
          _id: "",
          name: "Error",
          items: [],
          isDefault: false,
          createdAt: "",
          updatedAt: "",
        },
        message: "Lỗi khi thêm menu item",
      };
    }
  }

  // Xóa menu item (admin only)
  static async removeMenuItem(
    configId: string,
    itemId: string
  ): Promise<SidebarAPIResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sidebar/configs/${configId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Lỗi khi xóa menu item");
      return {
        success: false,
        data: {
          _id: "",
          name: "Error",
          items: [],
          isDefault: false,
          createdAt: "",
          updatedAt: "",
        },
        message: "Lỗi khi xóa menu item",
      };
    }
  }
}
