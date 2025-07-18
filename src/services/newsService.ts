import { fetchWithAuth } from "@/services/authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface NewsAuthor {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  category: "mua-ban" | "cho-thue" | "tai-chinh" | "phong-thuy" | "chung";
  author: NewsAuthor;
  status: "draft" | "pending" | "published" | "rejected";
  publishedAt?: string;
  views: number;
  readTime: number;
  isHot: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  success: boolean;
  data: {
    news: NewsItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface NewsDetailResponse {
  success: boolean;
  data: {
    news: NewsItem;
    relatedNews: NewsItem[];
  };
}

export interface NewsCategoriesResponse {
  success: boolean;
  data: NewsCategory[];
}

export interface NewsStatsResponse {
  success: boolean;
  data: {
    statusStats: { _id: string; count: number }[];
    categoryStats: { _id: string; count: number }[];
    totalViews: number;
    topViewedNews: NewsItem[];
  };
}

export interface CreateNewsData {
  title: string;
  content: string;
  featuredImage?: string;
  category: "mua-ban" | "cho-thue" | "tai-chinh" | "phong-thuy" | "chung";
  status?: "draft" | "pending" | "published" | "rejected";
  isHot?: boolean;
  isFeatured?: boolean;
}

// Helper function để build query string
const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (
      params[key] !== undefined &&
      params[key] !== null &&
      params[key] !== ""
    ) {
      searchParams.append(key, params[key]!.toString());
    }
  });
  return searchParams.toString();
};

export const newsService = {
  // ===== PUBLIC METHODS =====

  // Get published news with pagination and filters
  async getPublishedNews(
    params: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      featured?: boolean;
      hot?: boolean;
      sort?: string;
      order?: "asc" | "desc";
    } = {}
  ): Promise<NewsListResponse> {
    try {
      const queryString = buildQueryString(params);
      const url = `${API_BASE_URL}/api/news${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching published news:", error);
      return {
        success: false,
        data: {
          news: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }
  },

  // Get single news by slug
  async getNewsBySlug(slug: string): Promise<NewsDetailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/slug/${slug}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching news by slug:", error);
      return {
        success: false,
        data: {
          news: {} as NewsItem,
          relatedNews: [],
        },
      };
    }
  },

  // Get news categories with counts
  async getNewsCategories(): Promise<NewsCategoriesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/categories`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching news categories:", error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // Get featured news for homepage
  async getFeaturedNews(
    limit: number = 6
  ): Promise<{ success: boolean; data: NewsItem[] }> {
    try {
      const queryString = buildQueryString({ limit });
      const response = await fetch(
        `${API_BASE_URL}/api/news/featured?${queryString}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching featured news:", error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // Get hot news
  async getHotNews(
    limit: number = 10
  ): Promise<{ success: boolean; data: NewsItem[] }> {
    try {
      const queryString = buildQueryString({ limit });
      const response = await fetch(
        `${API_BASE_URL}/api/news/hot?${queryString}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching hot news:", error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // ===== ADMIN METHODS =====

  // Get all news for admin with filters (alias for getAdminNews)
  async getAllNews(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      author?: string;
      search?: string;
      sort?: string;
      order?: "asc" | "desc";
    } = {}
  ): Promise<NewsListResponse> {
    return this.getAdminNews(params);
  },

  // Get all news for admin with filters
  async getAdminNews(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      author?: string;
      search?: string;
      sort?: string;
      order?: "asc" | "desc";
    } = {}
  ): Promise<NewsListResponse> {
    try {
      const queryString = buildQueryString(params);
      const url = `${API_BASE_URL}/api/news/admin${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetchWithAuth(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching admin news:", error);
      return {
        success: false,
        data: {
          news: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }
  },

  // Create new news
  async createNews(
    data: CreateNewsData
  ): Promise<{ success: boolean; message: string; data: NewsItem }> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/news/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating news:", error);
      return {
        success: false,
        message: "Không thể tạo tin tức. Vui lòng thử lại sau.",
        data: {} as NewsItem,
      };
    }
  },

  // Get single news for editing
  async getNewsById(id: string): Promise<{ success: boolean; data: NewsItem }> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/news/admin/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching news by id:", error);
      return {
        success: false,
        data: {} as NewsItem,
      };
    }
  },

  // Update news
  async updateNews(
    id: string,
    data: Partial<CreateNewsData>
  ): Promise<{ success: boolean; message: string; data: NewsItem }> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/news/admin/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating news:", error);
      return {
        success: false,
        message: "Không thể cập nhật tin tức. Vui lòng thử lại sau.",
        data: {} as NewsItem,
      };
    }
  },

  // Delete news
  async deleteNews(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/news/admin/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting news:", error);
      return {
        success: false,
        message: "Không thể xóa tin tức. Vui lòng thử lại sau.",
      };
    }
  },

  // Update news status (admin only)
  async updateNewsStatus(
    id: string,
    status: "draft" | "pending" | "published" | "rejected"
  ): Promise<{ success: boolean; message: string; data: NewsItem }> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/news/admin/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating news status:", error);
      return {
        success: false,
        message: "Không thể cập nhật trạng thái tin tức. Vui lòng thử lại sau.",
        data: {} as NewsItem,
      };
    }
  },

  // Get news statistics (admin only)
  async getNewsStats(): Promise<NewsStatsResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/news/admin/stats`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching news stats:", error);
      return {
        success: false,
        data: {
          statusStats: [],
          categoryStats: [],
          totalViews: 0,
          topViewedNews: [],
        },
      };
    }
  },

  // Helper methods for category mapping
  getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      "mua-ban": "Mua bán",
      "cho-thue": "Cho thuê",
      "tai-chinh": "Tài chính",
      "phong-thuy": "Phong thủy",
      chung: "Chung",
    };
    return categoryNames[category] || category;
  },

  getCategorySlug(category: string): string {
    const categoryMap: { [key: string]: string } = {
      "Mua bán": "mua-ban",
      "Cho thuê": "cho-thue",
      "Tài chính": "tai-chinh",
      "Phong thủy": "phong-thuy",
      Chung: "chung",
    };
    return categoryMap[category] || category.toLowerCase().replace(/\s+/g, "-");
  },

  getStatusName(status: string): string {
    const statusNames: { [key: string]: string } = {
      draft: "Bản nháp",
      pending: "Chờ duyệt",
      published: "Đã xuất bản",
      rejected: "Từ chối",
    };
    return statusNames[status] || status;
  },

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  },
};

// Export default để tương thích với code hiện tại
export default newsService;
