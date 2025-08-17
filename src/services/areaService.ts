import { getAccessToken } from "./authService";
import { toast } from "sonner";

export interface AreaRange {
  _id?: string;
  id: string;
  name: string;
  slug?: string;
  minValue: number;
  maxValue: number;
  type?: "property" | "project";
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAreaData {
  name: string;
  slug: string;
  type: "property" | "project";
  minValue: number;
  maxValue: number;
  order: number;
}

export interface UpdateAreaData {
  name: string;
  slug: string;
  type: "property" | "project";
  minValue: number;
  maxValue: number;
  order: number;
}

export interface AreaListResponse {
  success: boolean;
  data: AreaRange[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface AreaResponse {
  success: boolean;
  data: AreaRange;
  message?: string;
}

export interface GetAreasParams {
  page?: number;
  limit?: number;
  type?: "property" | "project";
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const areaService = {
  // Get areas with pagination and filters (for admin)
  async getAreas(params: GetAreasParams = {}): Promise<AreaListResponse> {
    const { page = 1, limit = 10, type } = params;
    const typeParam = type ? `&type=${type}` : "";

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/areas?page=${page}&limit=${limit}${typeParam}`,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log("Error fetching areas (logged for debugging):", error);
      toast.error("Lỗi khi tải danh sách khu vực");
      throw error;
    }
  },

  async getAll(): Promise<AreaRange[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/areas`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        console.log(
          "Invalid API response format (logged for debugging):",
          result
        );
        toast.error("Định dạng dữ liệu không hợp lệ");
        return [];
      }
    } catch (error) {
      console.log("Error fetching area ranges (logged for debugging):", error);
      toast.error("Lỗi khi tải khoảng diện tích");
      throw error;
    }
  },

  async getByType(type: "property" | "project"): Promise<AreaRange[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/areas/type/${type}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        console.log(
          "Invalid API response format (logged for debugging):",
          result
        );
        toast.error("Định dạng dữ liệu không hợp lệ");
        return [];
      }
    } catch (error) {
      console.log(
        `Error fetching area ranges for type ${type} (logged for debugging):`,
        error
      );
      toast.error(`Lỗi khi tải khoảng diện tích cho loại ${type}`);
      throw error;
    }
  },

  async getById(id: string): Promise<AreaRange | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/areas/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        return null;
      }
    } catch (error) {
      toast.error("Lỗi khi tải khoảng diện tích");
      throw error;
    }
  },

  // Admin methods with authentication
  async create(data: CreateAreaData): Promise<AreaResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/areas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      toast.error("Lỗi khi tạo khu vực");
      throw error;
    }
  },

  async update(id: string, data: UpdateAreaData): Promise<AreaResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/areas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      toast.error("Lỗi khi cập nhật khu vực");
      throw error;
    }
  },

  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/areas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      toast.error("Lỗi khi xóa khu vực");
      throw error;
    }
  },

  async toggleStatus(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/areas/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái khu vực");
      throw error;
    }
  },
};

export default areaService;
