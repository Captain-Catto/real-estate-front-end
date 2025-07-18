import { fetchWithAuth } from "@/services/authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface SidebarMenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: ("admin" | "employee")[];
  description?: string;
  parentId?: string;
  children?: SidebarMenuItem[];
}

export interface SidebarConfigResponse {
  success: boolean;
  data: SidebarMenuItem[];
  message?: string;
}

export interface UpdateSidebarConfigRequest {
  menuItems: SidebarMenuItem[];
}

export class SidebarConfigService {
  /**
   * Get current sidebar configuration
   */
  static async getSidebarConfig(): Promise<SidebarConfigResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/sidebar-config`
      );
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(
          data.message || "Failed to fetch sidebar configuration"
        );
      }
    } catch (error) {
      console.error("Error fetching sidebar config:", error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update sidebar configuration
   */
  static async updateSidebarConfig(
    menuItems: SidebarMenuItem[]
  ): Promise<SidebarConfigResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/sidebar-config`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ menuItems }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(
          data.message || "Failed to update sidebar configuration"
        );
      }
    } catch (error) {
      console.error("Error updating sidebar config:", error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reset sidebar configuration to default
   */
  static async resetSidebarConfig(): Promise<SidebarConfigResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/sidebar-config/reset`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(
          data.message || "Failed to reset sidebar configuration"
        );
      }
    } catch (error) {
      console.error("Error resetting sidebar config:", error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get sidebar configuration for a specific role
   */
  static async getSidebarConfigByRole(
    role: "admin" | "employee"
  ): Promise<SidebarConfigResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/sidebar-config/role/${role}`
      );
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(
          data.message || "Failed to fetch sidebar configuration by role"
        );
      }
    } catch (error) {
      console.error("Error fetching sidebar config by role:", error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default SidebarConfigService;
