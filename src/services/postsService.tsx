import { refreshToken } from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface CreatePostData {
  // Basic Info
  type: "ban" | "cho-thue";
  category: string;
  title: string;
  description: string;
  area: string;
  price: string;
  currency: string;
  location: {
    province: string;
    district: string;
    ward: string;
    street: string;
  };

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
      console.log("Creating post with data:", postData);
      Object.entries(postData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "location" && typeof value === "object") {
            formData.append(key, JSON.stringify(value)); // <-- stringify location
          } else {
            formData.append(key, value as string);
          }
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

  async getUserPosts(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      search?: string;
      dateRange?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<any> {
    try {
      // Đặt giá trị mặc định
      const page = params.page || 1;
      const limit = params.limit || 10;

      // Xây dựng query string từ params
      let queryParams = `page=${page}&limit=${limit}`;

      if (params.status) queryParams += `&status=${params.status}`;
      if (params.type) queryParams += `&type=${params.type}`;
      if (params.search)
        queryParams += `&search=${encodeURIComponent(params.search)}`;
      if (params.dateRange) queryParams += `&dateRange=${params.dateRange}`;
      if (params.startDate) queryParams += `&startDate=${params.startDate}`;
      if (params.endDate) queryParams += `&endDate=${params.endDate}`;

      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/posts/my?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user posts");
      }
      const result = await response.json();
      console.log("getuserpost result", result);

      return result;
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
  // getpostbyid
  async getPostById(postId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch post");
      }
      const data = await response.json();
      console.log("Fetched post data:", data);
      return data.data.post;
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      throw error;
    }
  }
  // get posts by category (public)
  async getPostByCategory(category: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/posts/category/${category}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch posts by category");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching posts by category:", error);
      throw error;
    }
  }

  // tìm bài viết
  async searchPosts(filters = {}, page = 1, limit = 20): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            // Special handling for districts - need to join with commas
            if (key === "districts") {
              queryParams.append(key, value.join(","));
            } else {
              // Normal handling for other array values
              value.forEach((item) => {
                queryParams.append(key, String(item));
              });
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      console.log(
        "API Query:",
        `${API_BASE_URL}/posts/search?${queryParams.toString()}`
      );

      const response = await fetch(
        `${API_BASE_URL}/posts/search?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching posts:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
export const postService = new PostService();
