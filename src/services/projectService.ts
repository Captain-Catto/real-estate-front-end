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
            location: {
              provinceCode: string;
              districtCode: string;
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
            location: `${project.location?.districtCode || ""} - ${
              project.location?.provinceCode || ""
            }`,
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
    districtCode?: string,
    wardCode?: string
  ): Promise<
    {
      _id: string;
      name: string;
      address: string;
      fullLocation: string;
      location: {
        provinceCode: string;
        districtCode: string;
        wardCode?: string;
      };
    }[]
  > => {
    try {
      const params = new URLSearchParams();

      if (provinceCode) params.append("provinceCode", provinceCode);
      if (districtCode) params.append("districtCode", districtCode);
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
