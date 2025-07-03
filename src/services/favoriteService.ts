import { apiClient } from "@/lib/apiClient";
import { FavoriteItem } from "@/components/common/FavoriteButton";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export const favoriteService = {
  // Get user favorites - make sure the function name matches what's called in hooks
  getUserFavorites: async (): Promise<
    ApiResponse<{ favorites: FavoriteItem[] }>
  > => {
    try {
      const response = await apiClient.get("/favorites");
      return response.data;
    } catch (error: any) {
      // Handle API errors consistently
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Có lỗi xảy ra khi lấy danh sách yêu thích",
        data: { favorites: [] },
      };
    }
  },

  // For backward compatibility, also keep the old function name if it exists elsewhere
  getFavorites: async (): Promise<
    ApiResponse<{ favorites: FavoriteItem[] }>
  > => {
    // Call the primary implementation to avoid code duplication
    return favoriteService.getUserFavorites();
  },

  // Add to favorites
  addToFavorites: async (
    itemId: string
  ): Promise<ApiResponse<{ favorite: FavoriteItem }>> => {
    try {
      const response = await apiClient.post("/favorites", { itemId });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Không thể thêm vào danh sách yêu thích",
        data: { favorite: {} as FavoriteItem },
      };
    }
  },

  // Remove from favorites
  removeFromFavorites: async (itemId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/favorites/${itemId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Không thể xóa khỏi danh sách yêu thích",
        data: {},
      };
    }
  },

  // Check if item is in favorites
  checkFavoriteStatus: async (
    itemId: string
  ): Promise<ApiResponse<{ isFavorited: boolean }>> => {
    try {
      const response = await apiClient.get(`/favorites/check/${itemId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Không thể kiểm tra trạng thái yêu thích",
        data: { isFavorited: false },
      };
    }
  },
};
