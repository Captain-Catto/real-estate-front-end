// API service cho sidebar configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken")
        : null;

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
      console.error("❌ Error fetching sidebar config:", error);
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
      console.error("❌ Error fetching all configs:", error);
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
      console.error("❌ Error creating config:", error);
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
      console.error("❌ Error updating config:", error);
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
      console.error("❌ Error deleting config:", error);
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
      console.error("❌ Error setting default config:", error);
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
      console.error("❌ Error reordering items:", error);
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
      console.error("❌ Error adding menu item:", error);
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
      console.error("❌ Error removing menu item:", error);
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
