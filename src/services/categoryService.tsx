import { getAccessToken } from "./authService";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  isProject: boolean;
  order?: number;
  isActive?: boolean;
  description?: string;
  __v?: number;
}

export interface CategoryResponse {
  data: {
    categories: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  isProject: boolean;
  order?: number;
  isActive?: boolean;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  isProject?: boolean;
  order?: number;
  isActive?: boolean;
  description?: string;
}

export const categoryService = {
  /**
   * Get all categories
   * @returns Promise with array of categories
   */
  getAll: async (): Promise<Category[]> => {
    try {
      // Use limit=all to get all categories without pagination, only active ones
      const response = await fetch(
        `${API_BASE_URL}/categories?limit=all&status=active`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.status}`);
      }

      const result = await response.json();
      // Handle the nested structure
      return result.data?.categories || result.categories || [];
    } catch {
      toast.error("Không thể tải danh sách danh mục");
      return [];
    }
  },

  /**
   * Get categories filtered by project type
   * @param isProject - Whether to get project categories or regular ones
   * @returns Promise with filtered categories
   */
  getByProjectType: async (isProject: boolean): Promise<Category[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories/isProject/${isProject}?status=active`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching categories by project type: ${response.status}`
        );
      }

      const result = await response.json();
      // Handle the nested structure
      return result.data?.categories || result.categories || [];
    } catch {
      toast.error("Không thể tải danh mục theo loại dự án");
      return [];
    }
  },

  /**
   * Get a specific category by ID
   * @param id - Category ID
   * @returns Promise with category details
   */
  getById: async (id: string): Promise<Category | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/id/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching category: ${response.status}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch {
      toast.error("Không thể tải thông tin danh mục");
      return null;
    }
  },

  /**
   * Get a specific category by slug
   * @param slug - Category slug
   * @returns Promise with category details
   */
  getBySlug: async (slug: string): Promise<Category | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${slug}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching category: ${response.status}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch {
      toast.error("Không thể tải danh mục");
      return null;
    }
  },

  // Admin functions
  admin: {
    /**
     * Get all categories for admin with pagination
     */
    getAll: async (page = 1, limit = 20): Promise<CategoryResponse> => {
      try {
        const token = getAccessToken();
        const response = await fetch(
          `${API_BASE_URL}/admin/categories?page=${page}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching admin categories: ${response.status}`
          );
        }

        return await response.json();
      } catch {
        toast.error("Không thể tải danh sách danh mục admin");
        throw new Error("Không thể tải danh sách danh mục admin");
      }
    },

    /**
     * Create a new category
     */
    create: async (data: CreateCategoryData): Promise<Category> => {
      try {
        const token = getAccessToken();
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Error creating category: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
      } catch {
        toast.error("Không thể tạo danh mục mới");
        throw new Error("Không thể tạo danh mục mới");
      }
    },

    /**
     * Update a category
     */
    update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
      try {
        const token = getAccessToken();
        const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Error updating category: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
      } catch {
        toast.error("Không thể cập nhật danh mục");
        throw new Error("Không thể cập nhật danh mục");
      }
    },

    /**
     * Delete a category
     */
    delete: async (id: string): Promise<void> => {
      try {
        const token = getAccessToken();
        const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error deleting category: ${response.status}`);
        }
      } catch {
        toast.error("Không thể xóa danh mục");
        throw new Error("Không thể xóa danh mục");
      }
    },

    /**
     * Update categories order
     */
    updateOrder: async (
      orders: { id: string; order: number }[]
    ): Promise<void> => {
      try {
        const token = getAccessToken();
        const response = await fetch(`${API_BASE_URL}/admin/categories/order`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orders }),
        });

        if (!response.ok) {
          throw new Error(
            `Error updating categories order: ${response.status}`
          );
        }
      } catch {
        toast.error("Không thể cập nhật thứ tự danh mục");
        throw new Error("Không thể cập nhật thứ tự danh mục");
      }
    },
  },

  /**
   * Get all active categories for dropdown/filter (non-project categories)
   * @returns Promise with array of active categories
   */
  getAllActiveCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories?isProject=false&limit=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching active categories: ${response.status}`);
      }

      const result = await response.json();
      const categories = result.data?.categories || result.categories || [];

      // Filter only active categories
      return categories.filter((cat: Category) => cat.isActive !== false);
    } catch {
      toast.error("Không thể tải danh sách danh mục đang hoạt động");
      return [];
    }
  },

  /**
   * Alias for getAll method to match component expectations
   * @returns Promise with array of categories
   */
  getCategories: async (): Promise<Category[]> => {
    return categoryService.getAll();
  },

  /**
   * Alias for getById method to match component expectations
   * @param id - Category ID
   * @returns Promise with category details
   */
  getCategoryById: async (id: string): Promise<Category | null> => {
    return categoryService.getById(id);
  },
};
