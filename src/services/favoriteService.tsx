import { fetchWithAuth } from "@/services/authService";
import { showErrorToast } from "@/utils/errorHandler";
import { API_BASE_URL } from "@/services/authService";

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

      const data = await response.json();

      if (!response.ok) {
        // Return the actual error message from the server
        return {
          success: false,
          message:
            data.message || `Server responded with status: ${response.status}`,
        };
      }

      return data;
    } catch {
      showErrorToast("Không thể thêm vào yêu thích");
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

      const data = await response.json();

      if (!response.ok) {
        // Return the actual error message from the server
        return {
          success: false,
          message:
            data.message || `Server responded with status: ${response.status}`,
        };
      }

      return data;
    } catch {
      showErrorToast("Không thể bỏ yêu thích");
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
    } catch {
      showErrorToast("Không thể tải danh sách yêu thích");
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
    } catch {
      // Silent error for checking favorite status
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
    } catch {
      // Silent error for stats
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
