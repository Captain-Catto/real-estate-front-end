const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

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
  const token = localStorage.getItem("accessToken");
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
      console.error("Error fetching active packages:", error);
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
        console.error("Error fetching all packages:", error);
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
        console.error("Error creating package:", error);
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
        console.error("Error updating package:", error);
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
        console.error("Error deleting package:", error);
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
        console.error("Error fetching package:", error);
        return { success: false, message: "Lỗi kết nối server" };
      }
    },
  },
};
