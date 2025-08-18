import { fetchWithAuth } from "../services/authService";
import { API_BASE_URL } from "@/services/authService";

export interface NewsCategory {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsCategoryFormData {
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface NewsCategoryResponse {
  success: boolean;
  data: NewsCategory[];
  message?: string;
}

export interface SingleNewsCategoryResponse {
  success: boolean;
  data: NewsCategory;
  message?: string;
}

export const newsCategoryService = {
  // Lấy danh sách news categories công khai (có count)
  async getPublicNewsCategories(): Promise<NewsCategoryResponse> {
    const response = await fetch("/api/news/categories");
    return response.json();
  },

  // Lấy danh sách news categories cho admin
  async getAdminNewsCategories(): Promise<NewsCategoryResponse> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/news/admin/categories`
    );
    if (!response) {
      throw new Error("No response received");
    }
    return response.json();
  },

  // Tạo news category mới
  async createNewsCategory(
    data: NewsCategoryFormData
  ): Promise<SingleNewsCategoryResponse> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/news/admin/categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response) {
      throw new Error("No response received");
    }
    return response.json();
  },

  // Cập nhật news category
  async updateNewsCategory(
    id: string,
    data: Partial<NewsCategoryFormData>
  ): Promise<SingleNewsCategoryResponse> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/news/admin/categories/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response) {
      throw new Error("No response received");
    }
    return response.json();
  },

  // Toggle active status (optimized)
  async toggleNewsActive(
    id: string,
    isActive: boolean
  ): Promise<SingleNewsCategoryResponse> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/news/admin/categories/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      }
    );
    if (!response) {
      throw new Error("No response received");
    }
    return response.json();
  },

  // Xóa news category
  async deleteNewsCategory(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/news/admin/categories/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response) {
      throw new Error("No response received");
    }
    return response.json();
  },

  // Cập nhật thứ tự news categories
  async updateNewsCategoriesOrder(
    orders: Array<{ id: string; order: number }>
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/news/admin/categories/order`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders }),
      }
    );
    if (!response) {
      throw new Error("No response received");
    }
    return response.json();
  },

  // Generate slug từ name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  },
};
