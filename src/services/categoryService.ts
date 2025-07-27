const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  isProject: boolean; // Use isProject instead of type
  isActive: boolean;
  order: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

class CategoryService {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      console.log(
        `🔍 Calling API: ${API_BASE_URL}/categories/id/${categoryId}`
      );
      const response = await fetch(
        `${API_BASE_URL}/categories/id/${categoryId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📡 API Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📋 API Response data:`, data);
      return data.data || data || null;
    } catch (error) {
      console.error("❌ Error fetching category by ID:", error);
      return null;
    }
  }

  async getByProjectType(isProject: boolean): Promise<Category[]> {
    try {
      console.log(
        `🔍 Calling API: ${API_BASE_URL}/categories/isProject/${isProject}`
      );
      const response = await fetch(
        `${API_BASE_URL}/categories/isProject/${isProject}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📡 API Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📋 API Response data for isProject=${isProject}:`, data);
      return data.data || [];
    } catch (error) {
      console.error(
        `❌ Error fetching categories by isProject=${isProject}:`,
        error
      );
      return [];
    }
  }
}

export const categoryService = new CategoryService();
