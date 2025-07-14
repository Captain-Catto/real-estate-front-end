import { useState, useEffect } from "react";
import { ProjectService } from "@/services/projectService";

interface UseProjectsOptions {
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

interface ProjectListItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  location: {
    provinceCode: string;
    districtCode: string;
    wardCode?: string;
  };
  developer: {
    name: string;
  };
  status: string;
  totalUnits: number;
  area: string;
  priceRange: string;
  images: string[];
}

interface UseProjectsResult {
  projects: ProjectListItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  refetch: () => void;
}

export function useProjects(
  options: UseProjectsOptions = {}
): UseProjectsResult {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);

  const {
    provinceCode,
    districtCode,
    wardCode,
    page = 1,
    limit = 12,
    sortBy = "newest",
  } = options;

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use real API call with location filtering
      const response = await ProjectService.getProjectsWithFilters({
        page,
        limit,
        provinceCode,
        districtCode,
        wardCode,
        sortBy,
      });

      // Transform data to match expected format
      const transformedProjects: ProjectListItem[] = response.projects.map(
        (project) => ({
          id: project.id,
          name: project.name,
          slug: project.slug,
          address: project.address,
          location: project.location || {
            provinceCode: "",
            districtCode: "",
            wardCode: "",
          },
          developer: project.developer || { name: "" },
          status: project.status,
          totalUnits: project.totalUnits,
          area: project.area,
          priceRange: project.priceRange,
          images: project.images || [],
        })
      );

      setProjects(transformedProjects);
      setTotalCount(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Có lỗi xảy ra khi tải danh sách dự án");
      setProjects([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode, districtCode, wardCode, page, limit, sortBy]);

  const refetch = () => {
    fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    refetch,
  };
}
