import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectListItem,
} from "@/types/project";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// Helper function for authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export const ProjectService = {
  // Get all projects with filters and pagination (public access)
  getProjectsWithFilters: async (
    options: {
      page?: number;
      limit?: number;
      provinceCode?: string;
      wardCode?: string;
      status?: string;
      search?: string;
      sortBy?: string;
    } = {}
  ): Promise<{
    projects: Project[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const params = new URLSearchParams();

      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.provinceCode)
        params.append("provinceCode", options.provinceCode);
      if (options.wardCode) params.append("wardCode", options.wardCode);
      if (options.status) params.append("status", options.status);
      if (options.search) params.append("search", options.search);
      if (options.sortBy) params.append("sortBy", options.sortBy);

      const queryString = params.toString();
      const url = queryString
        ? `${API_BASE_URL}/projects?${queryString}`
        : `${API_BASE_URL}/projects`;

      console.log("🌐 Calling Projects API:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Transform projects to match frontend interface
        const transformedProjects = result.data.projects.map(
          (project: Project & { _id: string }) => ({
            ...project,
            id: project._id,
            specifications: project.specifications || {},
            facilities: project.facilities || [],
            faqs: project.faqs || [],
            videos: project.videos || [],
            locationInsights: project.locationInsights || {
              schools: [],
              hospitals: [],
              supermarkets: [],
              parks: [],
              restaurants: [],
            },
            developer: project.developer || {
              name: "",
              logo: "",
              phone: "",
              email: "",
            },
            contact: project.contact || {
              hotline: "",
              email: "",
            },
            map: project.map || {
              lat: project.latitude || 0,
              lng: project.longitude || 0,
            },
          })
        );

        return {
          projects: transformedProjects,
          pagination: result.data.pagination,
        };
      }

      return {
        projects: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 12,
        },
      };
    } catch (error) {
      console.error("Error fetching projects with filters:", error);
      throw error;
    }
  },

  // Get all projects (for admin listing)
  getProjects: async (): Promise<ProjectListItem[]> => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/projects/admin/list`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.projects) {
        return result.data.projects.map(
          (project: {
            _id: string;
            name: string;
            address?: string;
            fullLocation?: string;
            location?: {
              provinceCode: string;
              wardCode?: string;
            };
            developer?: { name?: string };
            status: string;
            totalUnits: number;
            area: string;
            priceRange: string;
          }) => ({
            id: project._id,
            name: project.name,
            address: project.address, // Thêm field address
            location:
              project.fullLocation ||
              `${project.location?.wardCode || ""} - ${
                project.location?.provinceCode || ""
              }`,
            locationObj: project.location, // Add full location object for checking ward
            developer: project.developer?.name || "",
            status: project.status,
            totalUnits: project.totalUnits,
            area: project.area,
            priceRange: project.priceRange,
          })
        );
      }

      return [];
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  // Get project by ID (full details)
  getProjectById: async (id: string): Promise<Project | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const project = result.data;
        // Ensure all required properties are initialized
        return {
          ...project,
          id: project._id,
          specifications: project.specifications || {},
          facilities: project.facilities || [],
          faqs: project.faqs || [],
          videos: project.videos || [],
          locationInsights: project.locationInsights || {
            schools: [],
            hospitals: [],
            supermarkets: [],
            parks: [],
            restaurants: [],
          },
          developer: project.developer || {
            name: "",
            logo: "",
            phone: "",
            email: "",
          },
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching project by ID:", error);
      throw error;
    }
  },

  // Get project by slug (full details)
  getProjectBySlug: async (slug: string): Promise<Project | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/slug/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const project = result.data;
        // Ensure all required properties are initialized and convert _id to id
        return {
          ...project,
          id: project._id,
          specifications: project.specifications || {},
          facilities: project.facilities || [],
          faqs: project.faqs || [],
          videos: project.videos || [],
          locationInsights: project.locationInsights || {
            schools: [],
            hospitals: [],
            supermarkets: [],
            parks: [],
            restaurants: [],
          },
          developer: project.developer || {
            name: "",
            logo: "",
            phone: "",
            email: "",
          },
          contact: project.contact || {
            hotline: "",
            email: "",
          },
          map: project.map || {
            lat: 0,
            lng: 0,
          },
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching project by slug:", error);
      throw error;
    }
  },

  // Create new project
  addProject: async (
    projectData: CreateProjectRequest
  ): Promise<{ success: boolean; data?: Project }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/projects/admin`, {
        method: "POST",
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          data: {
            ...result.data,
            id: result.data._id,
          },
        };
      } else {
        throw new Error(result.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  },

  // Update existing project
  updateProject: async (
    projectData: UpdateProjectRequest
  ): Promise<{ success: boolean; data?: Project }> => {
    try {
      const { id, ...updateData } = projectData;
      const response = await fetchWithAuth(
        `${API_BASE_URL}/projects/admin/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          data: {
            ...result.data,
            id: result.data._id,
          },
        };
      } else {
        throw new Error(result.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/projects/admin/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true };
      } else {
        throw new Error(result.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  // Get simplified list of projects for dropdown selection
  getProjectsForSelection: async (
    provinceCode?: string,
    wardCode?: string
  ): Promise<
    {
      _id: string;
      name: string;
      address: string;
      fullLocation: string;
      location: {
        provinceCode: string;
        wardCode?: string;
      };
    }[]
  > => {
    try {
      const params = new URLSearchParams();

      if (provinceCode) params.append("provinceCode", provinceCode);
      if (wardCode) params.append("wardCode", wardCode);

      const queryString = params.toString();
      const url = queryString
        ? `${API_BASE_URL}/projects/for-selection?${queryString}`
        : `${API_BASE_URL}/projects/for-selection`;

      console.log("🌐 Calling ProjectService API:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("📦 ProjectService API Response:", result);

      // Handle both array response and object response
      const projects = Array.isArray(result)
        ? result
        : result.data || result.projects || [];

      return projects;
    } catch (error) {
      console.error("❌ Error fetching projects for selection:", error);
      return [];
    }
  },
};
