import { SidebarGroup } from "@/hooks/useSidebarConfig";

// API service cho sidebar configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface SidebarAPIResponse {
  success: boolean;
  data: {
    id: string;
    groups: SidebarGroup[];
    lastModified: string;
    version: number;
  };
  message?: string;
}

export interface ConfigHistoryItem {
  _id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  isDefault: boolean;
}

export class SidebarAPI {
  // Lấy cấu hình sidebar từ backend
  static async getSidebarConfig(): Promise<SidebarAPIResponse> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken")
          : null;

      const response = await fetch(`${API_BASE_URL}/sidebar/config`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
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
      throw error;
    }
  }

  // Cập nhật cấu hình sidebar (Admin only)
  static async updateSidebarConfig(
    groups: SidebarGroup[]
  ): Promise<SidebarAPIResponse> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken")
          : null;

      const response = await fetch(`${API_BASE_URL}/sidebar/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify({ groups }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Sidebar config updated via API:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating sidebar config:", error);
      throw error;
    }
  }

  // Reset về cấu hình mặc định (Admin only)
  static async resetSidebarConfig(): Promise<SidebarAPIResponse> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken")
          : null;

      const response = await fetch(`${API_BASE_URL}/sidebar/config/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Sidebar config reset via API:", data);
      return data;
    } catch (error) {
      console.error("❌ Error resetting sidebar config:", error);
      throw error;
    }
  }

  // Lấy lịch sử thay đổi (Admin only)
  static async getConfigHistory(): Promise<{
    success: boolean;
    data: ConfigHistoryItem[];
  }> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken")
          : null;

      const response = await fetch(`${API_BASE_URL}/sidebar/config/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Config history loaded from API:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching config history:", error);
      throw error;
    }
  }
}
