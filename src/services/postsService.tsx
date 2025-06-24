import { refreshToken } from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface CreatePostData {
  // Basic Info
  type: "ban" | "cho-thue";
  category: string;
  title: string;
  description: string;
  address: string;
  area: string;
  price: string;
  currency: string;

  // Property Details
  legalDocs: string;
  furniture: string;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  houseDirection?: string;
  balconyDirection?: string;
  roadWidth?: string;
  frontWidth?: string;

  // Contact Info
  contactName: string;
  email: string;
  phone: string;

  // Package Info
  packageId: string;
  packageDuration: number;
}

export interface UploadImageResponse {
  success: boolean;
  data: {
    url: string;
    fileName: string;
  };
  message?: string;
}

class PostService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("accessToken");

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }

  // async uploadImages(images: File[]): Promise<string[]> {
  //   const uploadedUrls: string[] = [];

  //   for (const image of images) {
  //     const formData = new FormData();
  //     formData.append("image", image);

  //     try {
  //       const response = await fetch(`${API_BASE_URL}/posts/upload-image`, {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //         },
  //         body: formData,
  //       });

  //       if (response.ok) {
  //         const result: UploadImageResponse = await response.json();
  //         if (result.success) {
  //           uploadedUrls.push(result.data.url);
  //         }
  //       } else {
  //         throw new Error(`Failed to upload image: ${image.name}`);
  //       }
  //     } catch (error) {
  //       console.error(`Error uploading image ${image.name}:`, error);
  //       throw error;
  //     }
  //   }

  //   return uploadedUrls;
  // }

  async createPost(postData: CreatePostData, imageFiles: File[]): Promise<any> {
    const makeRequest = async () => {
      const formData = new FormData();
      Object.entries(postData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      for (const file of imageFiles) {
        formData.append("images", file);
      }
      const token = localStorage.getItem("accessToken");
      return fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    };

    let response = await makeRequest();

    // Nếu token hết hạn, thử refresh
    if (response.status === 401) {
      const refreshed = await refreshToken(); // Hàm này gọi API /auth/refresh và lưu accessToken mới vào localStorage
      if (refreshed) {
        response = await makeRequest();
      } else {
        // Nếu refresh cũng fail, logout
        localStorage.removeItem("accessToken");
        window.location.href = "/dang-nhap";
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create post");
    }

    return await response.json();
  }

  async getUserPosts(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/posts/my-posts?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user posts");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  }

  async updatePost(
    postId: string,
    postData: Partial<CreatePostData>,
    imageUrls?: string[]
  ): Promise<any> {
    try {
      const updateData: any = { ...postData };
      if (imageUrls) {
        updateData.images = imageUrls;
      }

      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/posts/${postId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<any> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/posts/${postId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete post");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  async getPackages(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages`);

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  }
}

export const postService = new PostService();
