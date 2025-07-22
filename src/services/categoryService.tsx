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
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.status}`);
      }

      const result = await response.json();
      // Handle the nested structure
      return result.data?.categories || result.categories || [];
    } catch (error) {
      console.error("Error in categoryService.getAll:", error);
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
        `${API_BASE_URL}/categories/isProject/${isProject}`,
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
    } catch (error) {
      console.error("Error in categoryService.getByProjectType:", error);
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
    } catch (error) {
      console.error("Error in categoryService.getById:", error);
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
        const token = localStorage.getItem("accessToken");
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
      } catch (error) {
        console.error("Error in categoryService.admin.getAll:", error);
        throw error;
      }
    },

    /**
     * Create a new category
     */
    create: async (data: CreateCategoryData): Promise<Category> => {
      try {
        const token = localStorage.getItem("accessToken");
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
      } catch (error) {
        console.error("Error in categoryService.admin.create:", error);
        throw error;
      }
    },

    /**
     * Update a category
     */
    update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
      try {
        const token = localStorage.getItem("accessToken");
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
      } catch (error) {
        console.error("Error in categoryService.admin.update:", error);
        throw error;
      }
    },

    /**
     * Delete a category
     */
    delete: async (id: string): Promise<void> => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error deleting category: ${response.status}`);
        }
      } catch (error) {
        console.error("Error in categoryService.admin.delete:", error);
        throw error;
      }
    },

    /**
     * Update categories order
     */
    updateOrder: async (
      orders: { id: string; order: number }[]
    ): Promise<void> => {
      try {
        const token = localStorage.getItem("accessToken");
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
      } catch (error) {
        console.error("Error in categoryService.admin.updateOrder:", error);
        throw error;
      }
    },
  },
};
