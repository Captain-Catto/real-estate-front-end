import { fetchWithAuth } from "./authService";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Location {
  _id: string;
  name: string;
  code: string;
  slug: string;
  codename?: string; // Optional for backward compatibility
  division_type?: string;
  phone_code?: string;
  type?: string;
  name_with_type?: string;
  path?: string;
  path_with_type?: string;
  parent_code?: string;
}

export interface LocationNames {
  provinceName?: string;
  provinceCode?: string | number;
  districtName?: string;
  districtCode?: string | number;
  wardName?: string;
  wardCode?: string | number;
  fullLocationName?: string;
}

// Admin types for CRUD operations
export interface AdminProvince {
  _id: string;
  name: string;
  code: number | string;
  codename: string; // Maps to slug in backend
  division_type: string; // Maps to type in backend
  // Thêm các trường mới từ backend
  type?: string; // Loại: thanh-pho, tinh
  name_with_type?: string; // Tên đầy đủ: Thành phố Hồ Chí Minh
  districts: AdminDistrict[];
}

export interface AdminDistrict {
  _id: string;
  name: string;
  code: number;
  codename: string;
  division_type: string;
  short_codename: string;
  wards: AdminWard[];
}

export interface AdminWard {
  _id: string;
  name: string;
  code: number | string;
  codename: string; // Maps to slug in backend
  division_type: string; // Maps to type in backend
  short_codename: string; // Maps to slug in backend (for compatibility)
}

type LocationData = Location[];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export const locationService = {
  getProvinces: async (retryCount = 3): Promise<LocationData> => {
    try {
      // Thêm log để kiểm tra số lần thử lại
      console.log(
        `Attempting to fetch provinces (attempts left: ${retryCount})`
      );
      console.log(`API URL: ${API_BASE_URL}/locations/provinces`);

      const res = await fetch(`${API_BASE_URL}/locations/provinces`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Thêm timeout để tránh chờ quá lâu
        signal: AbortSignal.timeout(5000), // 5 giây timeout
      });

      console.log(`Response status: ${res.status}`);
      const result = await res.json();
      console.log(`Response data:`, result);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (!result.success || !Array.isArray(result.data)) {
        console.error("Unexpected API response format:", result);
        return [];
      }

      // Thành công, trả về data
      console.log("Successfully fetched provinces", result.data.length);
      return result.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);

      // Chỉ retry trong trường hợp có lỗi mạng thực sự
      if (
        retryCount > 0 &&
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        console.log(`Retrying getProvinces... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return locationService.getProvinces(retryCount - 1);
      }

      // Nếu đã hết số lần thử hoặc không phải lỗi mạng, trả về mảng rỗng thay vì throw error
      console.error(
        "Max retries reached or non-network error. Returning empty array."
      );
      return [];
    }
  },

  getProvinceWithSlug: async (
    provinceSlug: string
  ): Promise<Location | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/locations/provinces/${provinceSlug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.error(`Failed to fetch province: ${response.status}`);
        return null;
      }
      const result: ApiResponse<Location> = await response.json();
      if (!result.success || !result.data) {
        console.error("Unexpected API response format:", result);
        return null;
      }
      return result.data;
    } catch (error) {
      console.error("Error fetching province with slug:", error);
      return null;
    }
  },

  // This now fetches wards directly from province, keeping the name for compatibility
  getDistricts: async (
    provinceCode: string,
    retryCount = 3
  ): Promise<LocationData> => {
    try {
      console.log(
        `Fetching wards for province (via getDistricts): ${provinceCode}`
      );

      const response = await fetch(
        `${API_BASE_URL}/locations/wards/${provinceCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch wards: ${response.status}`);

        // For debugging, try to get the error response body
        try {
          const errorBody = await response.text();
          console.error("Error response:", errorBody);
        } catch {
          console.error("Could not parse error response");
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        console.error("Unexpected API response format:", result);
        return [];
      }

      return result.data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      if (retryCount > 0) {
        console.log(`Retrying getDistricts... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return locationService.getDistricts(provinceCode, retryCount - 1);
      }
      // Return empty array instead of throwing to avoid breaking SSR
      return [];
    }
  },
  // Legacy method for backward compatibility
  getWards: async (
    provinceCode: string,
    districtCode: string,
    retryCount = 3
  ): Promise<LocationData> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/locations/wards/${provinceCode}/${districtCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch wards: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        console.error("Unexpected API response format:", result);
        return [];
      }

      return result.data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      if (retryCount > 0) {
        console.log(`Retrying getWards... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return locationService.getWards(
          provinceCode,
          districtCode,
          retryCount - 1
        );
      }
      // Return empty array instead of throwing to avoid breaking SSR
      return [];
    }
  },

  // New method to get wards directly from province code
  getWardsFromProvince: async (
    provinceCode: string,
    retryCount = 3
  ): Promise<LocationData> => {
    try {
      console.log(`Fetching wards for province: ${provinceCode}`);

      const response = await fetch(
        `${API_BASE_URL}/locations/wards/${provinceCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch wards for province: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        console.error("Unexpected API response format:", result);
        return [];
      }

      console.log(
        `Successfully fetched ${result.data.length} wards for province ${provinceCode}`
      );
      return result.data;
    } catch (error) {
      console.error("Error fetching wards from province:", error);
      if (retryCount > 0) {
        console.log(
          `Retrying getWardsFromProvince... (${retryCount} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return locationService.getWardsFromProvince(
          provinceCode,
          retryCount - 1
        );
      }
      // Return empty array instead of throwing to avoid breaking SSR
      return [];
    }
  },

  // Modified to support two-tier structure - now gets a ward directly
  getDistrictWithSlug: async (
    provinceSlug: string,
    wardSlug: string
  ): Promise<Location | null> => {
    try {
      // First, get the province by slug to find its code
      const provinceResponse = await fetch(
        `${API_BASE_URL}/locations/province/${provinceSlug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!provinceResponse.ok) {
        console.error(`Failed to fetch province: ${provinceResponse.status}`);
        return null;
      }

      const provinceResult: ApiResponse<Location> =
        await provinceResponse.json();
      if (!provinceResult.success || !provinceResult.data) {
        console.error(
          "Unexpected province API response format:",
          provinceResult
        );
        return null;
      }

      const provinceCode = provinceResult.data.code;

      // Now fetch all wards for this province
      const wardsResponse = await fetch(
        `${API_BASE_URL}/locations/wards/${provinceCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!wardsResponse.ok) {
        console.error(`Failed to fetch wards: ${wardsResponse.status}`);
        return null;
      }

      const wardsResult: ApiResponse<Location[]> = await wardsResponse.json();
      if (!wardsResult.success || !Array.isArray(wardsResult.data)) {
        console.error("Unexpected wards API response format:", wardsResult);
        return null;
      }

      // Find the ward by slug (previously called districtSlug in the interface)
      const ward = wardsResult.data.find(
        (w) => w.slug === wardSlug || (w.codename && w.codename === wardSlug)
      );

      // Return the ward as "district" for backward compatibility
      return ward || null;
    } catch (error) {
      console.error(
        "Error fetching ward with slug (via getDistrictWithSlug):",
        error
      );
      return null;
    }
  },

  // Updated to support two-tier structure - no more districtCode needed
  getWardWithSlug: async (
    provinceCode: string,
    wardSlug: string,
    districtCode?: string // Optional for backward compatibility
  ): Promise<Location | null> => {
    try {
      // Log parameters for debugging
      console.log(
        `getWardWithSlug called with: province=${provinceCode}, ward=${wardSlug}${
          districtCode ? ", district=" + districtCode : ""
        }`
      );

      // New API endpoint just needs provinceCode
      const response = await fetch(
        `${API_BASE_URL}/locations/wards/${provinceCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch wards: ${response.status}`);
        return null;
      }

      const result: ApiResponse<Location[]> = await response.json();
      if (!result.success || !Array.isArray(result.data)) {
        console.error("Unexpected API response format:", result);
        return null;
      }

      let ward = null;

      // If districtCode is provided (legacy use case), attempt to find ward with matching parent_code
      if (districtCode) {
        ward = result.data.find(
          (w) =>
            (w.slug === wardSlug || (w.codename && w.codename === wardSlug)) &&
            w.parent_code === districtCode
        );
      }

      // If no ward found with districtCode or districtCode not provided, find by slug/codename only
      if (!ward) {
        ward = result.data.find(
          (w) => w.slug === wardSlug || (w.codename && w.codename === wardSlug)
        );
      }

      return ward || null;
    } catch (error) {
      console.error("Error fetching ward with slug:", error);
      return null;
    }
  },

  // Lấy tên thật của tỉnh/thành từ slug
  getProvinceNameFromSlug: async (provinceSlug: string): Promise<string> => {
    try {
      const provinces = await locationService.getProvinces();
      if (!Array.isArray(provinces)) return provinceSlug.replace(/-/g, " ");

      // Tìm theo codename hoặc tên đã được convert
      const province = provinces.find(
        (p) =>
          (p.codename && p.codename === provinceSlug) ||
          p.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-") === provinceSlug
      );

      return province ? province.name : provinceSlug.replace(/-/g, " ");
    } catch (error) {
      console.error("Error getting province name from slug:", error);
      return provinceSlug.replace(/-/g, " ");
    }
  },

  // Lấy tên thật của quận/huyện từ slug
  getDistrictNameFromSlug: async (
    provinceCode: string,
    districtSlug: string
  ): Promise<string> => {
    try {
      const districts = await locationService.getDistricts(provinceCode);
      if (!Array.isArray(districts)) return districtSlug.replace(/-/g, " ");

      // Tìm theo codename hoặc tên đã được convert
      const district = districts.find(
        (d) =>
          (d.codename && d.codename === districtSlug) ||
          d.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-") === districtSlug
      );

      return district ? district.name : districtSlug.replace(/-/g, " ");
    } catch (error) {
      console.error("Error getting district name from slug:", error);
      return districtSlug.replace(/-/g, " ");
    }
  },

  // Lấy tên thật của phường/xã từ slug - updated for two-tier structure
  getWardNameFromSlug: async (
    provinceCode: string,
    wardSlug: string,
    districtCode?: string // Optional for backward compatibility
  ): Promise<string> => {
    try {
      // Get wards directly from province - new two-tier structure
      const wards = await locationService.getWardsFromProvince(provinceCode);
      if (!Array.isArray(wards)) return wardSlug.replace(/-/g, " ");

      // Helper function to normalize slug for comparison
      const normalizeForComparison = (str: string) => {
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
      };

      const normalizedWardSlug = normalizeForComparison(wardSlug);

      // Tìm theo codename hoặc tên đã được convert
      let ward = null;

      // If districtCode is provided (legacy), try to find ward with matching parent_code
      if (districtCode) {
        ward = wards.find(
          (w) =>
            ((w.codename &&
              normalizeForComparison(w.codename) === normalizedWardSlug) ||
              normalizeForComparison(w.name) === normalizedWardSlug) &&
            w.parent_code === districtCode
        );
      }

      // If not found or districtCode not provided, find by slug/codename only
      if (!ward) {
        ward = wards.find(
          (w) =>
            (w.codename &&
              normalizeForComparison(w.codename) === normalizedWardSlug) ||
            normalizeForComparison(w.name) === normalizedWardSlug
        );
      }

      return ward ? ward.name : wardSlug.replace(/-/g, " ");
    } catch (error) {
      console.error("Error getting ward name from slug:", error);
      return wardSlug.replace(/-/g, " ");
    }
  },

  // Lấy thông tin breadcrumb đầy đủ từ slug - updated for two-tier structure
  getBreadcrumbFromSlug: async (
    citySlug?: string,
    wardSlug?: string, // This is now the second parameter (was district)
    districtSlug?: string // This is kept for backward compatibility
  ) => {
    console.log("=== getBreadcrumbFromSlug CALLED ===");
    console.log("Input parameters:", { citySlug, wardSlug, districtSlug });

    try {
      let cityName = "";
      let wardName = "";
      let provinceCode = "";
      let districtName = ""; // Keep for backward compatibility

      // Helper function để normalize slug cho comparison
      const normalizeSlugForComparison = (slug: string) => {
        return slug
          .replace(/[_-]/g, "-") // Chuyển cả _ và - thành -
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      };

      // Lấy tên tỉnh/thành
      if (citySlug) {
        try {
          const provinces = await locationService.getProvinces();
          const normalizedCitySlug = normalizeSlugForComparison(citySlug);
          const province = provinces?.find(
            (p) =>
              (p.codename && p.codename === normalizedCitySlug) ||
              (p.slug && p.slug === normalizedCitySlug) ||
              normalizeSlugForComparison(p.name) === normalizedCitySlug
          );

          if (province) {
            cityName = province.name;
            provinceCode = province.code;
          }
        } catch (provinceError) {
          console.error("Error fetching province data:", provinceError);
        }

        // Fallback nếu không tìm thấy tên từ API
        if (!cityName) {
          cityName = citySlug.replace(/[_-]/g, " ");
        }
      }

      // Handle both cases: either wardSlug is provided directly or we're using the old format with districtSlug
      // If both wardSlug and districtSlug are provided, wardSlug takes precedence

      // In the two-tier structure, the second parameter is actually a ward
      if (wardSlug && provinceCode) {
        try {
          const wards = await locationService.getWardsFromProvince(
            provinceCode
          );
          const normalizedWardSlug = normalizeSlugForComparison(wardSlug);
          const ward = wards?.find(
            (w) =>
              (w.codename && w.codename === normalizedWardSlug) ||
              (w.slug && w.slug === normalizedWardSlug) ||
              normalizeSlugForComparison(w.name) === normalizedWardSlug
          );

          if (ward) {
            wardName = ward.name;
          }
        } catch (wardError) {
          console.error("Error fetching ward data:", wardError);
        }

        // Fallback nếu không tìm thấy tên từ API
        if (!wardName) {
          wardName = wardSlug.replace(/[_-]/g, " ");
        }
      }
      // Legacy support for the old 3-tier structure (if districtSlug is provided)
      else if (districtSlug && provinceCode) {
        try {
          // In the new structure, this actually gets all wards
          const districts = await locationService.getDistricts(provinceCode);
          const normalizedDistrictSlug =
            normalizeSlugForComparison(districtSlug);

          // Try to find by matching the slug or name
          const district = districts?.find(
            (d) =>
              (d.codename && d.codename === normalizedDistrictSlug) ||
              (d.slug && d.slug === normalizedDistrictSlug) ||
              normalizeSlugForComparison(d.name) === normalizedDistrictSlug
          );

          if (district) {
            // This is actually a ward in the new structure
            districtName = district.name;
          }
        } catch (districtError) {
          console.error(
            "Error fetching ward data (from district slug):",
            districtError
          );
        }

        // Fallback nếu không tìm thấy tên từ API
        if (!districtName) {
          districtName = districtSlug.replace(/[_-]/g, " ");
        }
      }

      // Log kết quả để debug
      console.log("Breadcrumb result:", {
        city: cityName,
        district: districtName,
        ward: wardName,
      });

      return {
        city: cityName,
        district: districtName,
        ward: wardName,
      };
    } catch (error) {
      console.error("Error getting breadcrumb from slug:", error);
      return {
        city: citySlug?.replace(/[_-]/g, " ") || "",
        district:
          wardSlug?.replace(/[_-]/g, " ") ||
          districtSlug?.replace(/[_-]/g, " ") ||
          "",
        ward: wardSlug ? "" : "", // Only set ward if we used the old 3-tier structure
      };
    }
  },

  // ===== ADMIN CRUD OPERATIONS =====
  // These methods require admin authentication

  admin: {
    // Lấy tất cả provinces với districts và wards (for admin)
    getProvinces: async (): Promise<{
      success: boolean;
      data: AdminProvince[];
    }> => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/locations`);
        return await response.json();
      } catch (error) {
        console.error("Error fetching provinces:", error);
        return { success: false, data: [] };
      }
    },

    // Thêm province mới
    addProvince: async (data: {
      name: string;
      code?: string;
      codename?: string;
      division_type?: string;
      type?: string;
      name_with_type?: string;
    }): Promise<{ success: boolean }> => {
      try {
        // Transform frontend data to backend format
        const backendData = {
          name: data.name,
          code: data.code,
          slug: data.codename, // codename -> slug
          type: data.type || data.division_type, // Ưu tiên type từ form
          name_with_type:
            data.name_with_type ||
            (data.type === "tinh" || data.division_type === "province"
              ? `Tỉnh ${data.name}`
              : `Thành phố ${data.name}`), // Generate name_with_type nếu không có
        };

        const response = await fetchWithAuth(`${API_BASE_URL}/locations`, {
          method: "POST",
          body: JSON.stringify(backendData),
        });
        return await response.json();
      } catch (error) {
        console.error("Error adding province:", error);
        return { success: false };
      }
    },

    // Cập nhật province
    updateProvince: async (
      id: string,
      data: {
        name: string;
        code?: string;
        codename?: string;
        division_type?: string;
        type?: string;
        name_with_type?: string;
      }
    ): Promise<{ success: boolean }> => {
      try {
        // Transform frontend data to backend format
        const backendData = {
          name: data.name,
          code: data.code,
          slug: data.codename, // codename -> slug
          type: data.type || data.division_type, // Ưu tiên type từ form
          name_with_type:
            data.name_with_type ||
            (data.type === "tinh" || data.division_type === "province"
              ? `Tỉnh ${data.name}`
              : `Thành phố ${data.name}`), // Generate name_with_type nếu không có
        };

        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(backendData),
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error updating province:", error);
        return { success: false };
      }
    },

    // Xóa province
    deleteProvince: async (id: string): Promise<{ success: boolean }> => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/${id}`,
          {
            method: "DELETE",
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error deleting province:", error);
        return { success: false };
      }
    },

    // Thêm district
    addDistrict: async (
      provinceId: string,
      data: {
        name: string;
        code?: number;
        codename: string;
        division_type?: string;
        short_codename?: string;
      }
    ): Promise<{ success: boolean }> => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/${provinceId}/districts`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error adding district:", error);
        return { success: false };
      }
    },

    // Cập nhật district
    updateDistrict: async (
      provinceId: string,
      districtId: string,
      data: {
        name: string;
        code?: number;
        codename: string;
        division_type?: string;
        short_codename?: string;
      }
    ): Promise<{ success: boolean }> => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/${provinceId}/districts/${districtId}`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error updating district:", error);
        return { success: false };
      }
    },

    // Xóa district
    deleteDistrict: async (
      provinceId: string,
      districtId: string
    ): Promise<{ success: boolean }> => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/${provinceId}/districts/${districtId}`,
          {
            method: "DELETE",
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error deleting district:", error);
        return { success: false };
      }
    },

    // Thêm ward
    addWard: async (
      provinceId: string,
      districtId: string, // Không sử dụng nhưng giữ để tương thích
      data: {
        name: string;
        code?: string;
        codename?: string;
        division_type?: string;
        short_codename?: string;
      }
    ): Promise<{ success: boolean }> => {
      try {
        // Transform frontend data to backend format
        const backendData = {
          name: data.name,
          code: data.code || `${Date.now()}`, // Generate code if not provided
          slug: data.codename || data.name.toLowerCase().replace(/\s+/g, "-"), // Generate slug if not provided
          type: data.division_type || "ward", // division_type -> type
          name_with_type: `${data.division_type === "ward" ? "Phường" : "Xã"} ${
            data.name
          }`,
          path: data.name, // Backend expects path
          path_with_type: `${data.division_type === "ward" ? "Phường" : "Xã"} ${
            data.name
          }`,
          // parent_code sẽ được backend tự set từ provinceId
        };

        console.log("Sending ward data to backend:", backendData);

        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/${provinceId}/wards`,
          {
            method: "POST",
            body: JSON.stringify(backendData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error("Backend error response:", result);
        }

        return result;
      } catch (error) {
        console.error("Error adding ward:", error);
        return { success: false };
      }
    },

    // Cập nhật ward
    updateWard: async (
      provinceId: string,
      districtId: string, // Không sử dụng nhưng giữ để tương thích
      wardId: string,
      data: {
        name: string;
        code?: string;
        codename?: string;
        division_type?: string;
        short_codename?: string;
      }
    ): Promise<{ success: boolean }> => {
      try {
        // Transform frontend data to backend format
        const backendData = {
          name: data.name,
          code: data.code,
          slug: data.codename, // codename -> slug
          type: data.division_type || "ward", // division_type -> type
          name_with_type: `${data.division_type === "ward" ? "Phường" : "Xã"} ${
            data.name
          }`,
          path: data.name, // Backend expects path
          path_with_type: `${data.division_type === "ward" ? "Phường" : "Xã"} ${
            data.name
          }`,
          // parent_code không cần update
        };

        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/wards/${wardId}`,
          {
            method: "PUT",
            body: JSON.stringify(backendData),
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error updating ward:", error);
        return { success: false };
      }
    },

    // Xóa ward
    deleteWard: async (
      provinceId: string,
      districtId: string, // Không sử dụng nhưng giữ để tương thích
      wardId: string
    ): Promise<{ success: boolean }> => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/locations/wards/${wardId}`,
          {
            method: "DELETE",
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error deleting ward:", error);
        return { success: false };
      }
    },
  },

  // Get location names in one API call
  // Sửa hàm getLocationNames để bỏ districtCode
  getLocationNames: async (
    provinceCode?: string,
    wardCode?: string
  ): Promise<LocationNames> => {
    try {
      if (!provinceCode) {
        return {};
      }

      console.log("🔍 Fetching location names with:", {
        provinceCode,
        wardCode,
      });

      const params = new URLSearchParams();
      params.append("provinceCode", provinceCode);
      if (wardCode) params.append("wardCode", wardCode);

      const res = await fetch(
        `${API_BASE_URL}/locations/names?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000), // 10 giây timeout
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.error("API error:", result);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (!result.success) {
        console.error("API returned error:", result.message);
        return {};
      }

      console.log("📍 Successfully fetched location names:", result.data);
      return result.data;
    } catch (error) {
      console.error("❌ Error fetching location names:", error);
      return {};
    }
  },

  // Hàm helper để lấy tên địa chỉ từ province và ward code
  getLocationName: async (
    provinceCode: string,
    wardCode?: string
  ): Promise<string> => {
    try {
      console.log("🔍 Getting location name for:", { provinceCode, wardCode });

      // Lấy tên tỉnh
      const provinces = await locationService.getProvinces();
      const province = provinces.find((p) => p.code === provinceCode);
      const provinceName = province?.name || provinceCode;

      // Nếu không có ward code, chỉ trả về tên tỉnh
      if (!wardCode) {
        return provinceName;
      }

      // Lấy tên phường/xã
      const wards = await locationService.getWardsFromProvince(provinceCode);
      const ward = wards.find((w) => w.code === wardCode);
      const wardName = ward?.name || wardCode;

      // Tạo địa chỉ đầy đủ: Ward, Province
      const fullAddress = `${wardName}, ${provinceName}`;

      console.log("📍 Location name result:", fullAddress);
      return fullAddress;
    } catch (error) {
      console.error("❌ Error getting location name:", error);
      // Fallback: trả về code nếu không lấy được tên
      return wardCode ? `${wardCode}, ${provinceCode}` : provinceCode;
    }
  },
};
