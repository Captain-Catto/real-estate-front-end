import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectListItem,
} from "@/types/project";
import { fetchWithAuth } from "./authService";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export const ProjectService = {
  // Get all projects with filters and pagination (public access)
  getProjectsWithFilters: async (
    options: {
      page?: number;
      limit?: number;
      search?: string;
      provinceCode?: string;
      wardCode?: string;
      categoryId?: string;
      priceRange?: string;
      areaRange?: string;
      status?: string;
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
      if (options.search) params.append("search", options.search);
      if (options.provinceCode)
        params.append("provinceCode", options.provinceCode);
      if (options.wardCode) params.append("wardCode", options.wardCode);
      if (options.categoryId) params.append("categoryId", options.categoryId);
      if (options.priceRange) params.append("priceRange", options.priceRange);
      if (options.areaRange) params.append("areaRange", options.areaRange);
      if (options.status) params.append("status", options.status);
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
        const transformedProjects = await Promise.all(
          result.data.projects.map(
            async (project: Project & { _id: string }) => {
              // Fetch developer data if developer is an ID string
              let developerData = {
                name: "",
                logo: "",
                phone: "",
                email: "",
              };

              if (project.developer) {
                if (typeof project.developer === "string") {
                  // Developer is an ID, fetch the full data
                  try {
                    const developerResponse = await fetch(
                      `${API_BASE_URL}/developers/${project.developer}`
                    );
                    if (developerResponse.ok) {
                      const developerResult = await developerResponse.json();
                      if (developerResult.success && developerResult.data) {
                        developerData = {
                          name: developerResult.data.name || "",
                          logo: developerResult.data.logo || "",
                          phone: developerResult.data.phone || "",
                          email: developerResult.data.email || "",
                        };
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching developer data:", error);
                  }
                } else if (typeof project.developer === "object") {
                  // Developer is already an object
                  developerData = {
                    name: project.developer.name || "",
                    logo: project.developer.logo || "",
                    phone: project.developer.phone || "",
                    email: project.developer.email || "",
                  };
                }
              }

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
                developer: developerData,
                contact: project.contact || {
                  hotline: "",
                  email: "",
                },
                map: project.map || {
                  lat: project.latitude || 0,
                  lng: project.longitude || 0,
                },
              };
            }
          )
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
      // Set a high limit to get all projects for admin management
      const response = await fetchWithAuth(
        `${API_BASE_URL}/projects/admin/list?limit=1000`
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
      console.log("🔍 ProjectService.getProjectBySlug called with slug:", slug);
      const url = `${API_BASE_URL}/projects/slug/${slug}`;
      console.log("🌐 API URL:", url);

      const response = await fetch(url);
      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("❌ Project not found (404) for slug:", slug);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 API result:", {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : null,
      });

      if (result.success && result.data) {
        const project = result.data;
        console.log("🏗️ Project data from API:", {
          _id: project._id,
          name: project.name,
          slug: project.slug,
        });

        // Ensure all required properties are initialized and convert _id to id
        const transformedProject = {
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

        console.log("✅ Transformed project:", {
          id: transformedProject.id,
          name: transformedProject.name,
          slug: transformedProject.slug,
        });

        return transformedProject;
      }

      console.warn("❌ No project data in response");
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
    wardCode?: string,
    page?: number,
    limit?: number,
    search?: string,
    includePagination?: boolean,
    status?: string, // Add status parameter to control filtering
    categoryId?: string // Add categoryId parameter to filter by project category
  ): Promise<
    | {
        _id: string;
        name: string;
        address: string;
        fullLocation: string;
        location: {
          provinceCode: string;
          wardCode?: string;
        };
      }[]
    | {
        projects: {
          _id: string;
          name: string;
          address: string;
          fullLocation: string;
          location: {
            provinceCode: string;
            wardCode?: string;
          };
        }[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
          hasMore: boolean;
        };
      }
  > => {
    try {
      const params = new URLSearchParams();

      if (provinceCode) params.append("provinceCode", provinceCode);
      if (wardCode) params.append("wardCode", wardCode);
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (includePagination) params.append("includePagination", "true");
      if (status) params.append("status", status);
      if (categoryId) params.append("categoryId", categoryId);
      // Add parameter to get all projects regardless of status
      else params.append("status", "all");

      const queryString = params.toString();
      const url = queryString
        ? `${API_BASE_URL}/projects/for-selection?${queryString}`
        : `${API_BASE_URL}/projects/for-selection`;

      console.log("🌐 Calling ProjectService API:", url);
      console.log("📋 With status parameter:", status || "all");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("📦 ProjectService API Response:", result);

      // Handle both array response and object response with pagination
      if (includePagination && result.success && result.data) {
        console.log(
          `✅ Found ${
            result.data.projects?.length || 0
          } projects with pagination`
        );
        return {
          projects: result.data.projects || [],
          pagination: result.data.pagination,
        };
      }

      // For backward compatibility, return array
      const projects = Array.isArray(result)
        ? result
        : result.data?.projects || result.projects || [];

      console.log(`✅ Found ${projects.length} projects (array format)`);

      return projects;
    } catch (error) {
      console.error("❌ Error fetching projects for selection:", error);
      return includePagination
        ? {
            projects: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: 50,
              hasMore: false,
            },
          }
        : [];
    }
  },
};
