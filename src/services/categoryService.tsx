const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  isProject: boolean;
  parentId?: string;
  __v?: number;
}

export interface CategoryResponse {
  categories: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
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
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
};
