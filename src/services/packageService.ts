import { getAccessToken } from "./authService";
import { showErrorToast } from "@/utils/errorHandler";
import { API_BASE_URL } from "@/services/authService";

export interface Package {
  _id: string; // MongoDB ObjectId
  id: string; // Custom string ID used by backend for operations
  name: string;
  price: number;
  duration: number;
  features: string[];
  priority: "normal" | "premium" | "vip";
  isActive: boolean;
  description?: string;
  canPin?: boolean;
  canHighlight?: boolean;
  canUseAI?: boolean;
  supportLevel?: "basic" | "standard" | "premium";
  displayOrder?: number;
  isPopular?: boolean;
  discountPercentage?: number;
  originalPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFormData {
  id?: string; // Optional for create, required for update
  name: string;
  price: number;
  duration: number;
  features: string[];
  priority: "normal" | "premium" | "vip";
  isActive: boolean;
  description?: string;
  canPin?: boolean;
  canHighlight?: boolean;
  canUseAI?: boolean;
  supportLevel?: "basic" | "standard" | "premium";
  displayOrder?: number;
  isPopular?: boolean;
  discountPercentage?: number;
  originalPrice?: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API calls with token refresh
const apiCall = async (url: string, options: RequestInit = {}) => {
  const makeRequest = async (headers: HeadersInit) => {
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: "include",
    });
  };

  let response = await makeRequest(getAuthHeaders());

  if (response.status === 401) {
    // Try to refresh token (implement if needed)
    // For now, just retry once
    response = await makeRequest(getAuthHeaders());
  }

  return response;
};

export const packageService = {
  // Get all packages (for public use)
  getActivePackages: async (): Promise<{
    success: boolean;
    data: { packages: Package[] };
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      showErrorToast(error, "Lấy danh sách gói dịch vụ thất bại");
      return { success: false, data: { packages: [] } };
    }
  },

  // Admin functions
  admin: {
    // Get all packages (admin only)
    getAllPackages: async (): Promise<{
      success: boolean;
      data: { packages: Package[] };
    }> => {
      try {
        const response = await apiCall(`${API_BASE_URL}/admin/packages`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        showErrorToast(error, "Lấy tất cả gói dịch vụ thất bại");
        return { success: false, data: { packages: [] } };
      }
    },

    // Create package
    createPackage: async (
      data: PackageFormData
    ): Promise<{
      success: boolean;
      message?: string;
      data?: { package: Package };
    }> => {
      try {
        const response = await apiCall(`${API_BASE_URL}/admin/packages`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        return await response.json();
      } catch (error) {
        showErrorToast(error, "Tạo gói dịch vụ thất bại");
        return { success: false, message: "Lỗi kết nối server" };
      }
    },

    // Update package
    updatePackage: async (
      id: string,
      data: PackageFormData
    ): Promise<{
      success: boolean;
      message?: string;
      data?: { package: Package };
    }> => {
      try {
        const response = await apiCall(`${API_BASE_URL}/admin/packages/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });

        return await response.json();
      } catch (error) {
        showErrorToast(error, "Cập nhật gói dịch vụ thất bại");
        return { success: false, message: "Lỗi kết nối server" };
      }
    },

    // Delete package
    deletePackage: async (
      id: string
    ): Promise<{ success: boolean; message?: string }> => {
      try {
        const response = await apiCall(`${API_BASE_URL}/admin/packages/${id}`, {
          method: "DELETE",
        });

        return await response.json();
      } catch (error) {
        showErrorToast(error, "Xóa gói dịch vụ thất bại");
        return { success: false, message: "Lỗi kết nối server" };
      }
    },

    // Get package by ID
    getPackageById: async (
      id: string
    ): Promise<{
      success: boolean;
      data?: { package: Package };
      message?: string;
    }> => {
      try {
        const response = await apiCall(`${API_BASE_URL}/admin/packages/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        showErrorToast(error, "Lấy thông tin gói dịch vụ thất bại");
        return { success: false, message: "Lỗi kết nối server" };
      }
    },
  },

  // Get unique package types from active packages (for filter dropdown)
  getPriorityTypes: async (): Promise<string[]> => {
    try {
      const response = await packageService.getActivePackages();
      if (response.success && response.data.packages) {
        // Return unique package IDs (free, basic, premium, vip)
        const packageIds = response.data.packages
          .map((pkg) => pkg.id) // Use 'id' field instead of 'priority'
          .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
          .sort((a, b) => {
            // Sort package types: vip > premium > basic > free
            const order = { vip: 4, premium: 3, basic: 2, free: 1 };
            return (
              (order[b as keyof typeof order] || 0) -
              (order[a as keyof typeof order] || 0)
            );
          });

        return packageIds;
      }
      return ["free", "basic", "premium", "vip"]; // Fallback with all 4 package types
    } catch {
      // Silent error - có fallback cho priority types
      return ["free", "basic", "premium", "vip"]; // Fallback with all 4 package types
    }
  },
};
