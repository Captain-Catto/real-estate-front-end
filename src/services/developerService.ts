import { fetchWithAuth } from "./authService";
import { showErrorToast } from "@/utils/errorHandler";
import {
  Developer,
  DeveloperForSelection,
  CreateDeveloperRequest,
  UpdateDeveloperRequest,
  DeveloperListItem,
} from "@/types/developer";
import { API_BASE_URL } from "@/services/authService";

export const DeveloperService = {
  // Get all developers with filters and pagination (public access)
  getDevelopers: async (
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{
    developers: Developer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.search) params.append("search", options.search);

      const url = `${API_BASE_URL}/developers?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return {
          developers: result.data.developers,
          pagination: result.data.pagination,
        };
      }

      return {
        developers: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 20,
        },
      };
    } catch (error) {
      showErrorToast("Không thể tải danh sách chủ đầu tư");
      throw error;
    }
  },

  // Get all developers (for admin listing)
  getAdminDevelopers: async (
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}
  ): Promise<{
    developers: DeveloperListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.search) params.append("search", options.search);
      if (options.isActive !== undefined)
        params.append("isActive", options.isActive.toString());

      const url = `${API_BASE_URL}/developers/admin/list?${params.toString()}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return {
          developers: result.data.developers,
          pagination: result.data.pagination,
        };
      }

      return {
        developers: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 20,
        },
      };
    } catch (error) {
      showErrorToast("Không thể tải danh sách chủ đầu tư");
      throw error;
    }
  },

  // Get developer by ID
  getDeveloperById: async (id: string): Promise<Developer | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/developers/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      showErrorToast("Không thể tải thông tin chủ đầu tư");
      throw error;
    }
  },

  // Create new developer (admin only)
  createDeveloper: async (
    developerData: CreateDeveloperRequest
  ): Promise<{ success: boolean; data?: Developer }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/developers`, {
        method: "POST",
        body: JSON.stringify(developerData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || "Failed to create developer");
      }
    } catch (error) {
      showErrorToast("Không thể tạo chủ đầu tư");
      throw error;
    }
  },

  // Update developer (admin only)
  updateDeveloper: async (
    developerData: UpdateDeveloperRequest
  ): Promise<{ success: boolean; data?: Developer }> => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/developers/${developerData._id}`,
        {
          method: "PUT",
          body: JSON.stringify(developerData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || "Failed to update developer");
      }
    } catch (error) {
      showErrorToast("Không thể cập nhật chủ đầu tư");
      throw error;
    }
  },

  // Delete developer (admin only)
  deleteDeveloper: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/developers/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true };
      } else {
        throw new Error(result.message || "Failed to delete developer");
      }
    } catch (error) {
      showErrorToast("Không thể xóa chủ đầu tư");
      throw error;
    }
  },

  // Get developers for selection dropdown
  getDevelopersForSelection: async (): Promise<DeveloperForSelection[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/developers/for-selection`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const developers = await response.json();
      return developers;
    } catch (error) {
      showErrorToast("Không thể tải danh sách chủ đầu tư");
      throw error;
    }
  },
};
