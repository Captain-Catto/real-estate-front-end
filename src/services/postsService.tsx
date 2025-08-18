import { fetchWithAuth } from "./authService";
import { categoryService } from "./categoryService";
import { showErrorToast } from "@/utils/errorHandler";
import { API_BASE_URL } from "@/services/authService";

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
  package?: "normal" | "premium" | "vip" | "basic" | "free";
  area: number;
  currency: string;
  status:
    | "pending"
    | "active"
    | "rejected"
    | "expired"
    | "inactive"
    | "deleted";
  priority?: "normal" | "premium" | "vip";
  views: number;
  createdAt: string;
  updatedAt: string;
  project?: string; // Add direct project reference

  // Additional fields
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
    district: string; // Keep for backend compatibility
    ward: string;
    street: string;
  };
  project?: string; // Move project to top level

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

  // Package Info
  packageId: string;
  packageDuration: number;
  package?: "free" | "basic" | "premium" | "vip"; // Add package field for backend enum

  // Images
  images?: string[]; // Add images field for updates
}

export interface PostFilters {
  status: string;
  type: string;
  category: string;
  package: string;
  search: string;
  author?: string;
  project: string;
  dateFrom: string;
  dateTo: string;
  searchMode?: string; // Add search mode filter
}

// Interface for featured properties response
export interface FeaturedPropertiesResponse {
  success: boolean;
  message?: string;
  data: {
    posts: Post[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Interface for search filters in post queries
export interface PostSearchFilters {
  project?: string;
  status?: string;
  type?: string;
  category?: string;
  price?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: string;
  [key: string]: string | number | undefined;
}

// Interface for update post response
export interface UpdatePostResponse {
  success: boolean;
  message: string;
  data?: {
    post: Post;
  };
}

// Interface for delete post response
export interface DeletePostResponse {
  success: boolean;
  message: string;
}

// Interface for extend post response
export interface ExtendPostResponse {
  success: boolean;
  message: string;
  data?: {
    post: Post;
  };
}

// Interface for packages response
export interface PackagesResponse {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    price: number;
    duration: number;
    features: string[];
    type: string;
  }>;
}

// Interface for post detail response
export interface PostDetailResponse {
  success: boolean;
  data: {
    post: Post;
  };
}

// Interface for similar posts response
export interface SimilarPostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    total: number;
    criteria?: any;
  };
}

// Interface for search results response
export interface SearchPostsResponse {
  success: boolean;
  message?: string;
  data: {
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface PostsStats {
  total: number;
  active: number;
  pending: number;
  rejected: number;
  expired: number;
  deleted: number; // Add deleted count
}

export interface UploadImageResponse {
  success: boolean;
  data: {
    url: string;
    fileName: string;
  };
  message?: string;
}

// Add response interfaces for various API calls
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PostResponse {
  success: boolean;
  data: Post;
  message?: string;
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

export interface PackageResponse {
  success: boolean;
  data: {
    packages: Array<{
      _id: string;
      name: string;
      duration: number;
      price: number;
      description: string;
      features: string[];
    }>;
  };
  message?: string;
}

export interface PostUpdateData {
  type?: "ban" | "cho-thue";
  category?: string;
  title?: string;
  description?: string;
  area?: string;
  price?: string;
  currency?: string;
  location?: {
    province: string;
    district: string;
    ward: string;
    street: string;
  };
  project?: string;
  legalDocs?: string;
  furniture?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  houseDirection?: string;
  balconyDirection?: string;
  roadWidth?: string;
  frontWidth?: string;
  packageId?: string;
  [key: string]: unknown;
}

class PostService {
  // Helper function để handle response và hiển thị toast
  private handleResponse(
    response: Response | null,
    errorMessage: string = "Đã xảy ra lỗi"
  ) {
    if (!response) {
      showErrorToast("Không thể kết nối đến server");
      return null;
    }

    if (!response.ok) {
      showErrorToast(errorMessage);
      return null;
    }

    return response;
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

  async createPost(
    postData: CreatePostData,
    imageFiles: File[]
  ): Promise<PostResponse> {
    try {
      const formData = new FormData();
      console.log("Creating post with data:", postData);

      // Ensure package is always set to a valid value
      const safePostData = {
        ...postData,
        package: postData.package || "free", // Fallback to "free" if package is null/undefined
        // Lọc bỏ empty string cho direction fields để tránh enum validation error
        houseDirection:
          postData.houseDirection && postData.houseDirection.trim() !== ""
            ? postData.houseDirection
            : undefined,
        balconyDirection:
          postData.balconyDirection && postData.balconyDirection.trim() !== ""
            ? postData.balconyDirection
            : undefined,
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

      const response = await fetchWithAuth(`${API_BASE_URL}/posts`, {
        method: "POST",
        body: formData,
      });

      if (!response || !response.ok) {
        const error = response
          ? await response.json()
          : { message: "Lỗi kết nối mạng" };
        showErrorToast(error.message || "Tạo tin đăng thất bại");
        throw new Error(error.message || "Failed to create post");
      }

      return await response.json();
    } catch (error) {
      showErrorToast(error, "Tạo tin đăng thất bại");
      throw error;
    }
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
  ): Promise<PostsResponse> {
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

      const response = await fetchWithAuth(
        `${API_BASE_URL}/posts/my?${queryParams}`
      );

      if (!response) {
        showErrorToast("Không thể kết nối đến server");
        throw new Error("Cannot connect to server");
      }

      if (!response.ok) {
        showErrorToast("Lấy danh sách tin đăng thất bại");
        throw new Error("Failed to fetch user posts");
      }
      const result = await response.json();
      console.log("getuserpost result", result);

      return result;
    } catch (error) {
      showErrorToast(error, "Đã xảy ra lỗi khi lấy danh sách tin đăng");
      throw error;
    }
  }

  async updatePost(
    postId: string,
    postData: Partial<CreatePostData>,
    imageUrls?: string[]
  ): Promise<UpdatePostResponse> {
    try {
      const updateData: Partial<CreatePostData> & { images?: string[] } = {
        ...postData,
      };
      if (imageUrls !== undefined) {
        updateData.images = imageUrls;
      }

      console.log("🔄 POSTING UPDATE REQUEST");
      console.log("📄 Post ID:", postId);
      console.log("📦 Update data:", JSON.stringify(updateData, null, 2));
      console.log("🏠 houseDirection in update:", updateData.houseDirection);
      console.log(
        "🌅 balconyDirection in update:",
        updateData.balconyDirection
      );
      console.log("🛣️ roadWidth in update:", updateData.roadWidth);
      console.log("🏠 frontWidth in update:", updateData.frontWidth);
      console.log("🛏️ bedrooms in update:", updateData.bedrooms);
      console.log("🚿 bathrooms in update:", updateData.bathrooms);
      console.log("🏢 floors in update:", updateData.floors);
      console.log("📄 legalDocs in update:", updateData.legalDocs);
      console.log("🪑 furniture in update:", updateData.furniture);

      // Đảm bảo postId là một chuỗi hợp lệ
      if (!postId || typeof postId !== "string") {
        throw new Error("Invalid post ID");
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response) {
        showErrorToast("Không thể kết nối đến server");
        return { success: false, message: "Không thể kết nối đến server" };
      }

      // Log full response for debugging
      console.log(`Update response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = "Cập nhật tin đăng thất bại";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } else {
            // If not JSON, just get text
            const text = await response.text();
            // Silent error for debugging
          }
        } catch {
          // Silent error for debugging
        }
        showErrorToast(errorMessage);
        return { success: false, message: errorMessage };
      }

      try {
        return await response.json();
      } catch {
        // Silent error for debugging
        const text = await response.text();
        console.log("Raw response:", text);
        return { success: true, message: "Post updated successfully" };
      }
    } catch (error) {
      showErrorToast(error, "Đã xảy ra lỗi khi cập nhật tin đăng");
      return { success: false, message: "Đã xảy ra lỗi khi cập nhật tin đăng" };
    }
  }

  async resubmitPost(
    postId: string,
    postData: Partial<CreatePostData>,
    imageUrls?: string[]
  ): Promise<UpdatePostResponse> {
    try {
      const updateData: Partial<CreatePostData> & { images?: string[] } = {
        ...postData,
      };
      if (imageUrls !== undefined) {
        updateData.images = imageUrls;
      }

      console.log("Resubmitting post with ID:", postId);
      console.log("Resubmit data:", JSON.stringify(updateData, null, 2));

      // Đảm bảo postId là một chuỗi hợp lệ
      if (!postId || typeof postId !== "string") {
        throw new Error("Invalid post ID");
      }

      const response = await fetchWithAuth(
        `${API_BASE_URL}/posts/${postId}/resubmit`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

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
            // Silent error for debugging
          }
        } catch {
          // Silent error for debugging
        }
        throw new Error(errorMessage);
      }

      try {
        return await response.json();
      } catch {
        // Silent error for debugging
        const text = await response.text();
        console.log("Raw response:", text);
        return { success: true, message: "Post resubmitted successfully" };
      }
    } catch (error) {
      showErrorToast(error, "Gửi lại tin đăng thất bại");
      throw error;
    }
  }

  async deletePost(postId: string): Promise<DeletePostResponse> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response) {
        return { success: false, message: "No response received" };
      }

      const validResponse = this.handleResponse(
        response,
        "Xóa tin đăng thất bại"
      );
      if (!validResponse)
        return { success: false, message: "Xóa tin đăng thất bại" };

      return await validResponse.json();
    } catch (error) {
      showErrorToast(error, "Đã xảy ra lỗi khi xóa tin đăng");
      return { success: false, message: "Đã xảy ra lỗi khi xóa tin đăng" };
    }
  }

  // Extend/renew post - change status from expired to active
  async extendPost(
    postId: string,
    packageId: string
  ): Promise<ExtendPostResponse> {
    try {
      console.log("Extending post with ID:", postId, "Package ID:", packageId);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/posts/${postId}/extend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ packageId }),
        }
      );

      if (!response) {
        return { success: false, message: "No response received" };
      }

      const validResponse = this.handleResponse(
        response,
        "Gia hạn tin đăng thất bại"
      );
      if (!validResponse)
        return { success: false, message: "Gia hạn tin đăng thất bại" };

      return await validResponse.json();
    } catch (error) {
      showErrorToast(error, "Đã xảy ra lỗi khi gia hạn tin đăng");
      return { success: false, message: "Đã xảy ra lỗi khi gia hạn tin đăng" };
    }
  }

  async getPackages(): Promise<PackagesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages`);

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      return await response.json();
    } catch (error) {
      showErrorToast(error, "Lấy danh sách gói dịch vụ thất bại");
      throw error;
    }
  }
  // getpostbyid
  async getPostById(postId: string): Promise<PostDetailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch post");
      }
      const data = await response.json();
      console.log("Fetched post data:", data);
      return data;
    } catch (error) {
      showErrorToast(error, "Lấy thông tin tin đăng thất bại");
      throw error;
    }
  }

  // Get similar posts
  async getSimilarPosts(
    postId: string,
    limit: number = 6
  ): Promise<SimilarPostsResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/posts/${postId}/similar?limit=${limit}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch similar posts");
      }

      const data = await response.json();
      console.log("Fetched similar posts:", data);
      return data;
    } catch (error) {
      showErrorToast(error, "Lấy danh sách tin đăng tương tự thất bại");
      throw error;
    }
  }

  // Increment post views
  async incrementViews(postId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to increment views for post:", postId);
      }
    } catch {}
  }

  // get posts by category (public)
  async getPostByCategory(category: string): Promise<SearchPostsResponse> {
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
      showErrorToast(error, "Lấy tin đăng theo danh mục thất bại");
      throw error;
    }
  }

  // tìm bài viết
  async searchPosts(
    filters: Record<string, unknown> = {},
    page = 1,
    limit = 20
  ): Promise<SearchPostsResponse> {
    try {
      console.log("SearchPosts input filters:", filters);
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            // Special handling for districts and wards - need to join with commas
            if (key === "districts" || key === "wards") {
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

      const result = await response.json();
      console.log("SearchPosts API Response:", result);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await result;
    } catch (error) {
      showErrorToast(error, "Tìm kiếm tin đăng thất bại");
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: {
          posts: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 20,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    }
  }

  async getPostsByFilter(
    filter: Record<string, unknown> = {},
    page = 1,
    limit = 20
  ): Promise<SearchPostsResponse> {
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
      showErrorToast(error, "Lấy danh sách tin đăng thất bại");
      throw error;
    }
  }

  // Helper function to get category name by ID
  async getCategoryName(categoryId: string): Promise<string> {
    try {
      const category = await categoryService.getById(categoryId);
      return category?.name || "Không xác định";
    } catch (error) {
      showErrorToast(error, "Lấy tên danh mục thất bại");
      return "Không xác định";
    }
  }

  // Helper function to get multiple category names efficiently
  async getCategoryNames(
    categoryIds: string[]
  ): Promise<{ [key: string]: string }> {
    try {
      const categories = await categoryService.getAll();
      const categoryMap: { [key: string]: string } = {};

      categoryIds.forEach((id) => {
        const category = categories.find(
          (cat) => cat._id === id || cat.id === id
        );
        categoryMap[id] = category?.name || "Không xác định";
      });

      return categoryMap;
    } catch (error) {
      showErrorToast(error, "Lấy tên danh mục thất bại");
      return categoryIds.reduce((acc, id) => {
        acc[id] = "Không xác định";
        return acc;
      }, {} as { [key: string]: string });
    }
  }

  // Helper function to get user name by ID
  async getUserName(userId: string): Promise<string> {
    try {
      const { getUserById } = await import("./userService");
      const response = await getUserById(userId);
      return response.success && response.data?.user
        ? response.data.user.username
        : "Không xác định";
    } catch (error) {
      showErrorToast(error, "Lấy tên người dùng thất bại");
      return "Không xác định";
    }
  }

  // Helper function to get multiple user names efficiently
  async getUserNames(userIds: string[]): Promise<{ [key: string]: string }> {
    try {
      const { getUserById } = await import("./userService");
      const userMap: { [key: string]: string } = {};

      // Fetch all users in parallel
      const userPromises = userIds.map(async (id) => {
        try {
          const response = await getUserById(id);
          return {
            id,
            name:
              response.success && response.data?.user
                ? response.data.user.username
                : "Không xác định",
          };
        } catch (error) {
          return { id, name: "Không xác định" };
        }
      });

      const users = await Promise.all(userPromises);
      users.forEach(({ id, name }) => {
        userMap[id] = name;
      });

      return userMap;
    } catch (error) {
      showErrorToast(error, "Lấy tên người dùng thất bại");
      return userIds.reduce((acc, id) => {
        acc[id] = "Không xác định";
        return acc;
      }, {} as { [key: string]: string });
    }
  }

  // Get posts by project ID
  async getPostsByProject(projectId: string, page = 1, limit = 20) {
    try {
      console.log("🔍 getPostsByProject called with:", {
        projectId,
        projectIdType: typeof projectId,
        projectIdLength: projectId?.length,
        page,
        limit,
      });

      const filters = {
        project: projectId, // Backend will map this to location.project
        status: "active", // Only get active posts
      };

      console.log("🔍 Calling searchPosts with filters:", filters);

      const response = await this.searchPosts(filters, page, limit);

      console.log("🔍 searchPosts response:", {
        success: response.success,
        hasData: !!response.data,
        postsCount: response.data?.posts?.length || 0,
        totalItems: response.data?.pagination?.totalItems || 0,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch posts");
      }

      // Transform data to match expected format for ProjectListings component
      const posts = response.data?.posts || [];
      const transformedPosts = posts.map((post: Post) => ({
        id: post._id,
        type: post.type,
        title: post.title,
        price: post.price,
        area: post.area,
        bedrooms: post.bedrooms || 0,
        bathrooms: post.bathrooms || 0,
        floor: post.floors || undefined,
        direction: post.houseDirection || post.balconyDirection,
        images: post.images || [],
        postedDate: post.createdAt,
        agent: {
          name: post.author?.username || "N/A",
          phone: "N/A", // Phone not available in Post interface, would need contact endpoint
          avatar: post.author?.avatar,
        },
        slug: `${post._id}-${post.title.toLowerCase().replace(/\s+/g, "-")}`,
      }));

      return {
        success: true,
        data: {
          posts: transformedPosts,
          pagination: response.data?.pagination,
          total: response.data?.pagination?.totalItems || 0,
        },
      };
    } catch (error) {
      showErrorToast(error, "Lấy tin đăng theo dự án thất bại");
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: { posts: [], total: 0 },
      };
    }
  }

  // Get posts by project ID with advanced filters
  async getPostsByProjectWithFilters(
    projectId: string,
    filters: {
      type?: "ban" | "cho-thue"; // Transaction type filter
      category?: string; // Category filter
      priceRange?: string; // Price range filter
      areaRange?: string; // Area range filter
      bedrooms?: number; // Number of bedrooms
      bathrooms?: number; // Number of bathrooms
      sortBy?: string; // Sort option
      status?: string; // Post status
    } = {},
    page = 1,
    limit = 20
  ) {
    try {
      console.log("🔍 getPostsByProjectWithFilters called with:", {
        projectId,
        filters,
        page,
        limit,
      });

      // Build search filters object
      const searchFilters: PostSearchFilters = {
        project: projectId, // Backend will map this to location.project
        status: filters.status || "active", // Only get active posts by default
      };

      // Add transaction type filter
      if (filters.type) {
        searchFilters.type = filters.type;
      }

      // Add category filter
      if (filters.category && filters.category !== "") {
        searchFilters.category = filters.category;
      }

      // Add price range filter
      if (filters.priceRange && filters.priceRange !== "") {
        searchFilters.price = filters.priceRange;
      }

      // Add area range filter
      if (filters.areaRange && filters.areaRange !== "") {
        searchFilters.area = filters.areaRange;
      }

      // Add bedrooms filter
      if (filters.bedrooms && filters.bedrooms > 0) {
        searchFilters.bedrooms = filters.bedrooms;
      }

      // Add bathrooms filter
      if (filters.bathrooms && filters.bathrooms > 0) {
        searchFilters.bathrooms = filters.bathrooms;
      }

      // Add sort parameter
      if (filters.sortBy) {
        searchFilters.sortBy = filters.sortBy;
      }

      console.log(
        "🔍 Calling searchPosts with advanced filters:",
        searchFilters
      );

      const response = await this.searchPosts(searchFilters, page, limit);

      console.log("🔍 searchPosts response:", {
        success: response.success,
        hasData: !!response.data,
        postsCount: response.data?.posts?.length || 0,
        totalItems: response.data?.pagination?.totalItems || 0,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch posts");
      }

      // Transform data to match expected format for ProjectListings component
      const posts = response.data?.posts || [];
      const transformedPosts = posts.map((post: Post) => ({
        id: post._id,
        type: post.type,
        title: post.title,
        price: post.price,
        area: post.area,
        bedrooms: post.bedrooms || 0,
        bathrooms: post.bathrooms || 0,
        floor: post.floors || undefined,
        direction: post.houseDirection || post.balconyDirection,
        images: post.images || [],
        postedDate: post.createdAt,
        agent: {
          name: post.author?.username || "N/A",
          phone: "N/A", // Phone not available in Post interface, would need contact endpoint
          avatar: post.author?.avatar,
        },
        slug: `${post._id}-${post.title.toLowerCase().replace(/\s+/g, "-")}`,
        category: post.category,
        furniture: post.furniture,
        legalDocs: post.legalDocs,
        priority: post.priority,
        views: post.views,
      }));

      return {
        success: true,
        data: {
          posts: transformedPosts,
          pagination: response.data?.pagination,
          total: response.data?.pagination?.totalItems || 0,
        },
      };
    } catch (error) {
      showErrorToast(error, "Lấy tin đăng theo dự án có lọc thất bại");
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: { posts: [], total: 0 },
      };
    }
  }

  // Method to get VIP/Premium featured properties
  async getFeaturedProperties(limit = 8): Promise<FeaturedPropertiesResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/posts/featured?limit=${limit}`,
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

      const result = await response.json();

      if (result.success && result.data && result.data.posts) {
        return {
          success: true,
          data: {
            posts: result.data.posts,
            pagination: result.data.pagination,
          },
        };
      }

      return {
        success: false,
        message: "No posts found",
        data: { posts: [] },
      };
    } catch (error) {
      showErrorToast(error, "Lấy tin đăng nổi bật thất bại");

      // Fallback to search API if featured endpoint fails
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", "1");
        queryParams.append("limit", String(limit * 2));
        queryParams.append("status", "active");

        const fallbackResponse = await fetch(
          `${API_BASE_URL}/posts/search?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!fallbackResponse.ok) {
          throw new Error(
            `Fallback API error! Status: ${fallbackResponse.status}`
          );
        }

        const fallbackResult = await fallbackResponse.json();

        if (
          fallbackResult.success &&
          fallbackResult.data &&
          fallbackResult.data.posts
        ) {
          // Filter and sort posts by priority and package for VIP features
          const vipPosts = fallbackResult.data.posts.filter((post: Post) => {
            return (
              post.priority === "vip" ||
              post.priority === "premium" ||
              post.package === "vip" ||
              post.package === "premium"
            );
          });

          const normalPosts = fallbackResult.data.posts.filter((post: Post) => {
            return (
              post.priority === "normal" &&
              post.package !== "vip" &&
              post.package !== "premium"
            );
          });

          const combinedPosts = [...vipPosts, ...normalPosts].slice(0, limit);

          // Sort posts by priority
          const sortedPosts = combinedPosts.sort((a: Post, b: Post) => {
            const priorityOrder = {
              vip: 4,
              premium: 3,
              basic: 2,
              normal: 1,
              free: 1,
            };

            const aPriority =
              priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
            const bPriority =
              priorityOrder[b.priority as keyof typeof priorityOrder] || 1;

            if (aPriority !== bPriority) {
              return bPriority - aPriority;
            }

            const aPackage =
              priorityOrder[a.package as keyof typeof priorityOrder] || 1;
            const bPackage =
              priorityOrder[b.package as keyof typeof priorityOrder] || 1;

            if (aPackage !== bPackage) {
              return bPackage - aPackage;
            }

            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          return {
            success: true,
            data: {
              posts: sortedPosts,
              pagination: fallbackResult.data.pagination,
            },
          };
        }
      } catch {
        // Silent error for debugging
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: {
          posts: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    }
  }
}
export const postService = new PostService();

// Admin Posts Service
export class AdminPostsService {
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
      if (filters.package && filters.package !== "all") {
        queryParams.append("package", filters.package);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      if (filters.author) {
        queryParams.append("author", filters.author);
      }
      if (filters.dateFrom) {
        queryParams.append("dateFrom", filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.append("dateTo", filters.dateTo);
      }
      if (filters.project && filters.project !== "all") {
        queryParams.append("project", filters.project);
      }
      if (filters.searchMode) {
        queryParams.append("searchMode", filters.searchMode);
      }

      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/posts?${queryParams.toString()}`
      );

      if (!response) {
        throw new Error("No response received");
      }

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
      showErrorToast(error, "Lấy danh sách tin đăng thất bại");
      throw error;
    }
  }

  // Get posts statistics for admin dashboard
  async getPostsStats(): Promise<PostsStats> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/admin/posts/stats`);

      if (!response) {
        // If no response, calculate stats from posts data
        const allPosts = await this.getPosts({}, 1, 1000); // Get all posts
        const posts: Post[] = allPosts.posts;
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(
          (p) => p.status === "active"
        ).length;
        const draftPosts = posts.filter((p) => p.status === "inactive").length;
        const pendingPosts = posts.filter((p) => p.status === "pending").length;

        return {
          total: totalPosts,
          active: publishedPosts,
          pending: pendingPosts,
          rejected: posts.filter((p) => p.status === "rejected").length,
          expired: posts.filter((p) => p.status === "expired").length,
          deleted: posts.filter((p) => p.status === "deleted").length,
        };
      }

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
          deleted: posts.filter((p: Post) => p.status === "deleted").length,
        };

        return stats;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      showErrorToast(error, "Lấy thống kê tin đăng thất bại");
      // Return default stats if error
      return {
        total: 0,
        active: 0,
        pending: 0,
        rejected: 0,
        expired: 0,
        deleted: 0,
      };
    }
  }

  // Get single post by ID
  async getPostById(postId: string): Promise<Post> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}`
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }

      const result = await response.json();
      return result.data.post;
    } catch (error) {
      showErrorToast(error, "Lấy thông tin tin đăng thất bại");
      throw error;
    }
  }

  // Approve post (admin only)
  async approvePost(postId: string) {
    try {
      console.log("Approving post with ID:", postId);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}/approve`,
        {
          method: "PUT",
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve post");
      }

      return await response.json();
    } catch (error) {
      showErrorToast(error, "Duyệt tin đăng thất bại");
      throw error;
    }
  }

  // Reject post (admin only)
  async rejectPost(postId: string, reason: string) {
    try {
      console.log("Rejecting post with ID:", postId);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}/reject`,
        {
          method: "PUT",
          body: JSON.stringify({
            reason: reason,
          }),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject post");
      }

      return await response.json();
    } catch (error) {
      showErrorToast(error, "Từ chối tin đăng thất bại");
      throw error;
    }
  }

  // Delete post (admin only)
  async deletePost(postId: string) {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}`,
        {
          method: "DELETE",
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete post");
      }

      return await response.json();
    } catch (error) {
      showErrorToast(error, "Xóa tin đăng thất bại");
      throw error;
    }
  }

  // Update post (admin can edit all fields, employee can only change status)
  async updateAdminPost(
    postId: string,
    postData: Partial<CreatePostData & { status: string; reason?: string }>
  ) {
    try {
      console.log("Updating admin post with ID:", postId);
      console.log("Update data:", JSON.stringify(postData, null, 2));

      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}`,
        {
          method: "PUT",
          body: JSON.stringify(postData),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post");
      }

      try {
        return await response.json();
      } catch {
        // Silent error for debugging
        const text = await response.text();
        console.log("Raw response:", text);
        return { success: true, message: "Post updated successfully" };
      }
    } catch (error) {
      showErrorToast(error, "Cập nhật tin đăng thất bại");
      throw error;
    }
  }

  // Update post status (admin only)
  async updatePostStatus(postId: string, status: string) {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/admin/posts/${postId}`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        let errorMessage = "Failed to update post status";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } else {
            // If not JSON, just get text
            // const text = await response.text();
            // Silent error for debugging
          }
        } catch {
          // Silent error for debugging
        }
        throw new Error(errorMessage);
      }

      try {
        return await response.json();
      } catch {
        // Silent error for debugging
        const text = await response.text();
        console.log("Raw response:", text);
        return { success: true, message: "Post status updated successfully" };
      }
    } catch (error) {
      showErrorToast(error, "Cập nhật trạng thái tin đăng thất bại");
      throw error;
    }
  }

  // Get public user posts (for user profile page)
  async getPublicUserPosts(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
    } = {}
  ): Promise<PostsResponse> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 12;
      const status = params.status || "active";

      let queryParams = `page=${page}&limit=${limit}&status=${status}`;
      if (params.type) queryParams += `&type=${params.type}`;

      const response = await fetch(
        `${API_BASE_URL}/posts/public/user/${userId}?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      showErrorToast(error, "Lấy tin đăng công khai của người dùng thất bại");
      throw error;
    }
  }
}

export const adminPostsService = new AdminPostsService();

// Export for backward compatibility
export const PostsService = adminPostsService;
