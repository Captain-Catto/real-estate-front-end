import { getAccessToken } from "./authService";
import { toast } from "sonner";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return getAccessToken();
  }
  return null;
};

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
  };
  message?: string;
}

export const UploadService = {
  // Upload multiple images
  uploadImages: async (files: FileList): Promise<UploadResponse[]> => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      // Add all files to form data
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const response = await fetch(`${API_BASE_URL}/upload/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // If multiple files, return array of results
        if (Array.isArray(result.data)) {
          return result.data.map((item: { url: string; filename: string }) => ({
            success: true,
            data: {
              url: item.url,
              filename: item.filename,
            },
          }));
        } else {
          return [
            {
              success: true,
              data: {
                url: result.data.url,
                filename: result.data.filename,
              },
            },
          ];
        }
      } else {
        throw new Error(result.message || "Failed to upload images");
      }
    } catch (error) {
      toast.error("Upload hình ảnh thất bại");
      return [
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to upload images",
        },
      ];
    }
  },

  // Upload single image
  uploadImage: async (file: File): Promise<UploadResponse> => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          data: {
            url: result.data.url,
            filename: result.data.filename,
          },
        };
      } else {
        throw new Error(result.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Upload hình ảnh thất bại");
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  },

  // Delete image
  deleteImage: async (
    imageUrl: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/upload/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true };
      } else {
        throw new Error(result.message || "Failed to delete image");
      }
    } catch (error) {
      toast.error("Xóa hình ảnh thất bại");
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete image",
      };
    }
  },
};
