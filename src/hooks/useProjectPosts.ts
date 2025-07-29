import { useState, useEffect } from "react";
import { postService } from "@/services/postsService";

export interface ProjectPostFilters {
  type?: "ban" | "cho-thue";
  category?: string;
  priceRange?: string;
  areaRange?: string;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: string;
  status?: string;
}

export interface ProjectPost {
  id: string;
  type: "ban" | "cho-thue";
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  direction?: string;
  images: string[];
  postedDate: string;
  agent: {
    name: string;
    phone: string;
    avatar?: string;
  };
  slug: string;
  category?: string;
  furniture?: string;
  legalDocs?: string;
  priority?: string;
  views?: number;
}

export interface UseProjectPostsResult {
  posts: ProjectPost[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  refetch: () => void;
}

export function useProjectPosts(
  projectId: string,
  filters: ProjectPostFilters = {},
  page = 1,
  limit = 20
): UseProjectPostsResult {
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchPosts = async () => {
    if (!projectId) {
      setPosts([]);
      setTotalCount(0);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postService.getPostsByProjectWithFilters(
        projectId,
        filters,
        page,
        limit
      );

      if (response.success) {
        setPosts(response.data.posts);
        setTotalCount(response.data.total);
        setTotalPages(response.data.pagination?.totalPages || 0);
        setCurrentPage(response.data.pagination?.currentPage || page);
      } else {
        setError(
          response.message || "Có lỗi xảy ra khi tải danh sách tin đăng"
        );
        setPosts([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Error fetching project posts:", err);
      setError("Có lỗi xảy ra khi tải danh sách tin đăng");
      setPosts([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    filters.type,
    filters.category,
    filters.priceRange,
    filters.areaRange,
    filters.bedrooms,
    filters.bathrooms,
    filters.sortBy,
    filters.status,
    page,
    limit,
  ]);

  const refetch = () => {
    fetchPosts();
  };

  return {
    posts,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    refetch,
  };
}
