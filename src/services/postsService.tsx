import { refreshToken } from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Xác nhận API URL
console.log("Posts Service API URL:", API_BASE_URL);

// Post interface
export interface Post {
  _id: string;
  type: "ban" | "cho-thue";
  title: string;
  description: string;
  content?: string;
  price: number;
  location: {
    province: string;
    district: string;
    ward: string;
    street?: string;
    project?: string;
  };
  category: string;
  tags?: string[];
  author: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  images: string[];
  package?: "normal" | "premium" | "vip";
  area: number;
  currency: string;
  status: "pending" | "active" | "rejected" | "expired" | "inactive";
  priority?: "normal" | "premium" | "vip";
  views: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  // Property details
  legalDocs?: string;
  furniture?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  houseDirection?: string;
  balconyDirection?: string;
  roadWidth?: string;
  frontWidth?: string;
  // Contact info
  contactName?: string;
  email?: string;
  phone?: string;
  packageId?: string;
  packageDuration?: number;
}

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
    project?: string;
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
  package?: "free" | "basic" | "premium" | "vip"; // Add package field for backend enum
}

export interface PostFilters {
  status: string;
  type: string;
  category: string;
  priority: string;
  search: string;
  author?: string;
  dateFrom: string;
  dateTo: string;
}

export interface PostsStats {
  total: number;
  active: number;
  pending: number;
  rejected: number;
  expired: number;
  vip: number;
  premium: number;
  normal: number;
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
    try {
      const token = localStorage.getItem("accessToken");

      console.log(`Fetching ${url} with method ${options.method || "GET"}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      console.error(`Network error when fetching ${url}:`, error);
      throw error;
    }
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

      // Ensure package is always set to a valid value
      const safePostData = {
        ...postData,
        package: postData.package || "free", // Fallback to "free" if package is null/undefined
      };

      Object.entries(safePostData).forEach(([key, value]) => {
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
      if (imageUrls && imageUrls.length > 0) {
        updateData.images = imageUrls;
      }

      console.log("Updating post with ID:", postId);
      console.log("Update data:", JSON.stringify(updateData, null, 2));

      // Đảm bảo postId là một chuỗi hợp lệ
      if (!postId || typeof postId !== "string") {
        throw new Error("Invalid post ID");
      }

      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/posts/${postId}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      // Log full response for debugging
      console.log(`Update response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = "Failed to update post";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } else {
            // If not JSON, just get text
            const text = await response.text();
            console.error("Non-JSON error response:", text);
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      try {
        return await response.json();
      } catch (jsonError) {
        console.error("Error parsing success response as JSON:", jsonError);
        const text = await response.text();
        console.log("Raw response:", text);
        return { success: true, message: "Post updated successfully" };
      }
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  async resubmitPost(
    postId: string,
    postData: Partial<CreatePostData>,
    imageUrls?: string[]
  ): Promise<any> {
    try {
      const updateData: any = { ...postData };
      if (imageUrls && imageUrls.length > 0) {
        updateData.images = imageUrls;
      }

      console.log("Resubmitting post with ID:", postId);
      console.log("Resubmit data:", JSON.stringify(updateData, null, 2));

      // Đảm bảo postId là một chuỗi hợp lệ
      if (!postId || typeof postId !== "string") {
        throw new Error("Invalid post ID");
      }

      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/posts/${postId}/resubmit`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      // Log full response for debugging
      console.log(`Resubmit response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = "Failed to resubmit post";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } else {
            // If not JSON, just get text
            const text = await response.text();
            console.error("Non-JSON error response:", text);
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      try {
        return await response.json();
      } catch (jsonError) {
        console.error("Error parsing success response as JSON:", jsonError);
        const text = await response.text();
        console.log("Raw response:", text);
        return { success: true, message: "Post resubmitted successfully" };
      }
    } catch (error) {
      console.error("Error resubmitting post:", error);
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

  async getPostsByFilter(filter: any = {}, page = 1, limit = 20): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));

      // Add filter params
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/posts/search?${queryParams.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch posts");
      }

      const result = await response.json();
      console.log("API Response:", result);

      return result.data.posts; // Trả về mảng posts từ data
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }
}
export const postService = new PostService();

// Admin Posts Service
export class AdminPostsService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle token refresh if needed
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = localStorage.getItem("accessToken");
        return fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...options.headers,
          },
        });
      } else {
        localStorage.removeItem("accessToken");
        window.location.href = "/dang-nhap";
        throw new Error("Phiên đăng nhập đã hết hạn");
      }
    }

    return response;
  }

  // Get all posts for admin with filters and pagination
  async getPosts(
    filters: Partial<PostFilters> = {},
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));

      // Add filters
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.type && filters.type !== "all") {
        queryParams.append("type", filters.type);
      }
      if (filters.category && filters.category !== "all") {
        queryParams.append("category", filters.category);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      if (filters.author) {
        queryParams.append("author", filters.author);
      }

      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/posts?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const result = await response.json();
      return {
        posts: result.data.posts,
        total: result.data.pagination.totalItems,
        page: result.data.pagination.currentPage,
        totalPages: result.data.pagination.totalPages,
        hasNext:
          result.data.pagination.currentPage <
          result.data.pagination.totalPages,
        hasPrev: result.data.pagination.currentPage > 1,
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }

  // Get posts statistics for admin dashboard
  async getPostsStats(): Promise<PostsStats> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/posts/stats`
      );

      if (!response.ok) {
        // If no specific stats endpoint, calculate from posts data
        const allPosts = await this.getPosts({}, 1, 1000); // Get all posts
        const posts: Post[] = allPosts.posts;

        const stats: PostsStats = {
          total: posts.length,
          active: posts.filter((p: Post) => p.status === "active").length,
          pending: posts.filter((p: Post) => p.status === "pending").length,
          rejected: posts.filter((p: Post) => p.status === "rejected").length,
          expired: posts.filter((p: Post) => p.status === "expired").length,
          vip: posts.filter((p: Post) => p.package === "vip").length,
          premium: posts.filter((p: Post) => p.package === "premium").length,
          normal: posts.filter(
            (p: Post) => !p.package || p.package === "normal"
          ).length,
        };

        return stats;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching posts stats:", error);
      // Return default stats if error
      return {
        total: 0,
        active: 0,
        pending: 0,
        rejected: 0,
        expired: 0,
        vip: 0,
        premium: 0,
        normal: 0,
      };
    }
  }

  // Get single post by ID
  async getPostById(postId: string): Promise<Post> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }

      const result = await response.json();
      return result.data.post;
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      throw error;
    }
  }

  // Approve post (admin only)
  async approvePost(postId: string) {
    try {
      console.log("Approving post with ID:", postId);
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}/approve`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve post");
      }

      return await response.json();
    } catch (error) {
      console.error("Error approving post:", error);
      throw error;
    }
  }

  // Reject post (admin only)
  async rejectPost(postId: string, reason: string) {
    try {
      console.log("Rejecting post with ID:", postId);
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}/reject`,
        {
          method: "PUT",
          body: JSON.stringify({
            reason: reason,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject post");
      }

      return await response.json();
    } catch (error) {
      console.error("Error rejecting post:", error);
      throw error;
    }
  }

  // Delete post (admin only)
  async deletePost(postId: string) {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}`,
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

  // Update post status (admin only)
  async updatePostStatus(postId: string, status: string) {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/posts/${postId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating post status:", error);
      throw error;
    }
  }
}

export const adminPostsService = new AdminPostsService();

// Export for backward compatibility
export const PostsService = adminPostsService;
