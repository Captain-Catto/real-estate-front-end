import { fetchWithAuth } from "@/services/authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export const favoriteService = {
  // Thêm một bài đăng vào danh sách yêu thích
  async addToFavorites(postId: string) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding to favorites:", error);
      // Trả về response giả để UI có thể xử lý mà không bị crash
      return {
        success: false,
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
      };
    }
  },

  // Xóa một bài đăng khỏi danh sách yêu thích
  async removeFromFavorites(postId: string) {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/favorites/${postId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return {
        success: false,
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
      };
    }
  },

  // Lấy danh sách các bài đăng yêu thích
  async getFavorites(page: number = 1, limit: number = 20) {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/favorites?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return {
        success: false,
        data: {
          items: [],
          total: 0,
        },
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
      };
    }
  },

  // Kiểm tra trạng thái yêu thích của một bài đăng
  async checkFavoriteStatus(postId: string) {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/favorites/check/${postId}`
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return {
        success: false,
        data: {
          isFavorited: false,
        },
        message: "Không thể kết nối đến máy chủ.",
      };
    }
  },

  // Lấy thống kê về yêu thích
  async getFavoriteStats() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/favorites/stats`);

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching favorite stats:", error);
      return {
        success: false,
        data: {
          totalFavorites: 0,
          totalProperties: 0,
          totalProjects: 0,
        },
        message: "Không thể kết nối đến máy chủ.",
      };
    }
  },
};
