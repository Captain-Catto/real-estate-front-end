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
  // Updated method to get wards directly from province without district
  getWards: async (
    provinceCode: string,
    districtCode?: string, // Optional for backward compatibility
    retryCount = 3
  ): Promise<LocationData> => {
    try {
      console.log(
        "getWards: Redirecting to getWardsFromProvince for consistency"
      );
      // Delegate to the new method to maintain consistency
      return await locationService.getWardsFromProvince(
        provinceCode,
        retryCount
      );
    } catch (error) {
      console.error("Error in getWards:", error);
      if (retryCount > 0) {
        console.log(`Retrying getWards... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return locationService.getWards(
          provinceCode,
          districtCode,
          retryCount - 1
        );
      }
      return [];
    }
  },

  // Enhanced method to get wards directly from province code with multiple endpoints and fallbacks
  getWardsFromProvince: async (
    provinceCode: string,
    retryCount = 3
  ): Promise<LocationData> => {
    try {
      console.log(`Fetching wards for province: ${provinceCode}`);

      // Danh sách các endpoint theo thứ tự ưu tiên
      const endpoints = [
        `${API_BASE_URL}/locations/wards-by-province/${provinceCode}`,
        `${API_BASE_URL}/locations/wards/${provinceCode}`,
        `${API_BASE_URL}/locations/districts/${provinceCode}`, // Endpoint cũ cho khả năng tương thích
      ];

      // Thử lần lượt các endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });

          if (!response.ok) {
            console.log(
              `Endpoint ${endpoint} returned status ${response.status}`
            );
            continue; // Thử endpoint tiếp theo
          }

          const result = await response.json();

          if (!result.success || !Array.isArray(result.data)) {
            console.log(`Endpoint ${endpoint} returned invalid data format`);
            continue; // Thử endpoint tiếp theo
          }

          console.log(
            `Successfully fetched ${result.data.length} wards for province ${provinceCode} from ${endpoint}`
          );
          return result.data;
        } catch (error) {
          console.error(`Error with endpoint ${endpoint}:`, error);
        }
      }

      // Nếu tất cả các endpoint đều thất bại và là trường hợp đặc biệt - Đồng Tháp province
      if (provinceCode === "24") {
        // Đồng Tháp province
        console.log("Using hardcoded ward data for Đồng Tháp province");

        // Danh sách các ward cho Đồng Tháp (vùng Tam Nông)
        return [
          {
            _id: "tam_nong_dong_thap_id",
            name: "Tam Nông",
            code: "24001",
            slug: "tam-nong",
            type: "huyen",
            name_with_type: "Huyện Tam Nông",
            path: "Tam Nông, Đồng Tháp",
            path_with_type: "Huyện Tam Nông, Tỉnh Đồng Tháp",
            parent_code: "24",
          },
          // Thêm các ward khác nếu cần
        ];
      }

      // Nếu tất cả đều thất bại và còn retry, thử lại
      if (retryCount > 0) {
        console.log(
          `Retrying getWardsFromProvince... (${retryCount} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Đợi 1 giây
        return locationService.getWardsFromProvince(
          provinceCode,
          retryCount - 1
        );
      }

      // Return empty array instead of throwing to avoid breaking SSR
      console.error(
        "All methods to fetch wards failed for province:",
        provinceCode
      );
      return [];
    } catch (error) {
      console.error("Error in getWardsFromProvince:", error);
      if (retryCount > 0) {
        console.log(`Retrying... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Đợi 1 giây
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

  // Lấy thông tin location dựa trên slug từ API mới
  getLocationBySlug: async (
    provinceSlug: string,
    wardSlug?: string
  ): Promise<{
    provinceName?: string;
    provinceCode?: string;
    provinceType?: string;
    provinceSlug?: string;
    wardName?: string;
    wardCode?: string;
    wardType?: string;
    wardSlug?: string;
  } | null> => {
    try {
      console.log(
        `Getting location by slug: province=${provinceSlug}, ward=${
          wardSlug || ""
        }`
      );

      let url = `${API_BASE_URL}/locations/location-by-slug/${provinceSlug}`;
      if (wardSlug) {
        url += `/${wardSlug}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Error fetching location by slug: ${response.status}`);
        return null;
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        console.error("Invalid response format or no data returned");
        return null;
      }

      return result.data;
    } catch (error) {
      console.error("Error in getLocationBySlug:", error);
      return null;
    }
  },

  // Lấy thông tin breadcrumb từ API mới
  getBreadcrumbFromSlugApi: async (provinceSlug: string, wardSlug?: string) => {
    try {
      console.log(
        `Getting breadcrumb from API: province=${provinceSlug}, ward=${
          wardSlug || ""
        }`
      );

      let url = `${API_BASE_URL}/locations/breadcrumb-from-slug?provinceSlug=${provinceSlug}`;
      if (wardSlug) {
        url += `&wardSlug=${wardSlug}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Error fetching breadcrumb from API: ${response.status}`);
        return null;
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        console.error("Invalid response format or no data returned");
        return null;
      }

      return result.data;
    } catch (error) {
      console.error("Error in getBreadcrumbFromSlugApi:", error);
      return null;
    }
  },

  // Lấy thông tin breadcrumb đầy đủ từ slug - updated for two-tier structure
  getBreadcrumbFromSlug: async (
    citySlug?: string,
    districtSlug?: string | null, // Giữ tham số này cho tương thích ngược
    wardSlug?: string // Tham số mới - có thể được truyền vào vị trí thứ 3 hoặc thứ 2 nếu không có district
  ) => {
    console.log("=== getBreadcrumbFromSlug CALLED ===");
    console.log("Input parameters:", { citySlug, districtSlug, wardSlug });

    // Xử lý trường hợp gọi với 2 tham số (citySlug, wardSlug)
    if (!wardSlug && districtSlug && typeof districtSlug === "string") {
      console.log("Detected two-tier call pattern, adjusting parameters");
      wardSlug = districtSlug;
      districtSlug = null;
    }

    // Không sử dụng bảng tra cứu dấu tiếng Việt nữa
    // Đi thẳng đến API để lấy tên địa điểm

    // Thử lấy thông tin từ API mới nếu không có trong bảng tra cứu
    try {
      if (citySlug) {
        const apiResult = await locationService.getBreadcrumbFromSlugApi(
          citySlug,
          wardSlug
        );

        if (apiResult && apiResult.breadcrumb) {
          console.log(
            "Successfully retrieved breadcrumb from new API",
            apiResult
          );
          return {
            city: apiResult.province?.name || "",
            district: "", // Không còn district trong cấu trúc mới
            ward: apiResult.ward?.name || "",
            provinceCode: apiResult.province?.code || "",
          };
        }
      }
    } catch (error) {
      console.error(
        "Error using new breadcrumb API, falling back to legacy method:",
        error
      );
    }
    try {
      // Hàm chuẩn hóa các slug để so sánh chính xác hơn
      const normalizeSlugForComparison = (slug: string | undefined): string => {
        if (!slug) return "";

        return slug
          .trim()
          .replace(/[_-]/g, "-") // Chuyển cả _ và - thành -
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      };

      // Chuẩn bị kết quả trả về
      const result = {
        city: "",
        ward: "",
        district: "", // Luôn trống trong cấu trúc mới
        provinceCode: "", // Để lưu code tỉnh/thành khi tìm được
      };

      // XỬ LÝ TỈNH/THÀNH PHỐ
      if (citySlug) {
        try {
          // Tải danh sách tỉnh/thành
          const provinces = await locationService.getProvinces();
          if (
            !provinces ||
            !Array.isArray(provinces) ||
            provinces.length === 0
          ) {
            throw new Error("Không lấy được danh sách tỉnh/thành");
          }

          // Chuẩn hóa slug tỉnh/thành để tìm kiếm
          const normalizedCitySlug = normalizeSlugForComparison(citySlug);
          console.log(`Slug tỉnh/thành đã chuẩn hóa: ${normalizedCitySlug}`);

          // Chuẩn bị các slug tìm kiếm với/không có tiền tố
          const searchSlugs = [normalizedCitySlug];

          // Thêm phiên bản không có tiền tố
          if (normalizedCitySlug.startsWith("tinh-")) {
            searchSlugs.push(normalizedCitySlug.substring(5));
          } else if (normalizedCitySlug.startsWith("thanh-pho-")) {
            searchSlugs.push(normalizedCitySlug.substring(10));
          }
          // Thêm phiên bản có tiền tố
          else {
            // Danh sách thành phố trực thuộc trung ương
            const centralCities = [
              "ha-noi",
              "ho-chi-minh",
              "da-nang",
              "can-tho",
              "hai-phong",
              "ha-noi-city",
              "ho-chi-minh-city",
              "da-nang-city",
              "can-tho-city",
              "hai-phong-city",
            ];

            if (
              centralCities.some((city) => normalizedCitySlug.includes(city))
            ) {
              searchSlugs.push(`thanh-pho-${normalizedCitySlug}`);
            } else {
              searchSlugs.push(`tinh-${normalizedCitySlug}`);
            }
          }

          console.log("Các slug tìm kiếm:", searchSlugs);

          // Tạo map các normalized slug -> province để tìm kiếm nhanh
          const provinceMap = new Map();
          provinces.forEach((p) => {
            // Thêm tất cả các dạng slug có thể của province vào map
            if (p.codename)
              provinceMap.set(normalizeSlugForComparison(p.codename), p);
            if (p.slug) provinceMap.set(normalizeSlugForComparison(p.slug), p);
            provinceMap.set(normalizeSlugForComparison(p.name), p);

            // Thêm phiên bản không có tiền tố
            let nameWithoutPrefix = p.name;
            if (p.name.startsWith("Tỉnh ")) {
              nameWithoutPrefix = p.name.substring(5);
              provinceMap.set(normalizeSlugForComparison(nameWithoutPrefix), p);
            } else if (p.name.startsWith("Thành phố ")) {
              nameWithoutPrefix = p.name.substring(10);
              provinceMap.set(normalizeSlugForComparison(nameWithoutPrefix), p);
            }
          });

          // Tìm province từ các slug đã chuẩn bị
          let province = null;
          for (const slug of searchSlugs) {
            if (provinceMap.has(slug)) {
              province = provinceMap.get(slug);
              console.log(
                `Tìm thấy tỉnh/thành: ${province.name} (${province.code})`
              );
              break;
            }
          }

          // Nếu không tìm thấy, thử tìm kiếm một phần
          if (!province) {
            console.log(
              "Không tìm thấy tỉnh/thành chính xác, thử tìm một phần..."
            );
            for (const p of provinces) {
              const pCodename = p.codename
                ? normalizeSlugForComparison(p.codename)
                : "";
              const pSlug = p.slug ? normalizeSlugForComparison(p.slug) : "";
              const pName = normalizeSlugForComparison(p.name);

              // Tìm kiếm một phần
              for (const slug of searchSlugs) {
                if (
                  (pCodename &&
                    (pCodename.includes(slug) || slug.includes(pCodename))) ||
                  (pSlug && (pSlug.includes(slug) || slug.includes(pSlug))) ||
                  (pName && (pName.includes(slug) || slug.includes(pName)))
                ) {
                  province = p;
                  console.log(
                    `Tìm thấy tỉnh/thành một phần: ${p.name} (${p.code})`
                  );
                  break;
                }
              }

              if (province) break;
            }
          }

          // Lưu kết quả nếu tìm thấy
          if (province) {
            result.city = province.name;
            result.provinceCode = province.code;
          } else {
            // Fallback - Định dạng slug thành tên hiển thị
            result.city = citySlug
              .replace(/^tinh-/, "")
              .replace(/^thanh-pho-/, "")
              .replace(/-/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            console.log(
              `Không tìm thấy tỉnh/thành, sử dụng fallback: ${result.city}`
            );
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu tỉnh/thành:", error);
          // Fallback
          result.city = citySlug
            .replace(/^tinh-/, "")
            .replace(/^thanh-pho-/, "")
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }

      // XỬ LÝ PHƯỜNG/XÃ
      if (wardSlug && result.provinceCode) {
        try {
          // Lấy danh sách phường/xã theo tỉnh/thành
          const wards = await locationService.getWardsFromProvince(
            result.provinceCode
          );
          if (!wards || !Array.isArray(wards) || wards.length === 0) {
            throw new Error(
              `Không lấy được danh sách phường/xã cho tỉnh: ${result.provinceCode}`
            );
          }
          console.log(
            `Đã lấy ${wards.length} phường/xã cho tỉnh: ${result.provinceCode}`
          );

          // Chuẩn hóa slug phường/xã để tìm kiếm
          const normalizedWardSlug = normalizeSlugForComparison(wardSlug);
          console.log(`Slug phường/xã đã chuẩn hóa: ${normalizedWardSlug}`);

          // Chuẩn bị các slug tìm kiếm với/không có tiền tố
          const searchWardSlugs = [normalizedWardSlug];

          // Thêm phiên bản không có tiền tố
          if (normalizedWardSlug.startsWith("xa-")) {
            searchWardSlugs.push(normalizedWardSlug.substring(3));
          } else if (normalizedWardSlug.startsWith("phuong-")) {
            searchWardSlugs.push(normalizedWardSlug.substring(7));
          }

          console.log("Các slug phường/xã tìm kiếm:", searchWardSlugs);

          // Tạo map các normalized slug -> ward để tìm kiếm nhanh
          const wardMap = new Map();
          wards.forEach((w) => {
            if (w.codename)
              wardMap.set(normalizeSlugForComparison(w.codename), w);
            if (w.slug) wardMap.set(normalizeSlugForComparison(w.slug), w);
            wardMap.set(normalizeSlugForComparison(w.name), w);

            // Thêm phiên bản không có tiền tố
            let nameWithoutPrefix = w.name;
            if (w.name.startsWith("Xã ")) {
              nameWithoutPrefix = w.name.substring(3);
              wardMap.set(normalizeSlugForComparison(nameWithoutPrefix), w);
            } else if (w.name.startsWith("Phường ")) {
              nameWithoutPrefix = w.name.substring(7);
              wardMap.set(normalizeSlugForComparison(nameWithoutPrefix), w);
            } else if (w.name.startsWith("Thị trấn ")) {
              nameWithoutPrefix = w.name.substring(9);
              wardMap.set(normalizeSlugForComparison(nameWithoutPrefix), w);
            }
          });

          // Tìm ward từ các slug đã chuẩn bị
          let ward = null;
          for (const slug of searchWardSlugs) {
            if (wardMap.has(slug)) {
              ward = wardMap.get(slug);
              console.log(`Tìm thấy phường/xã chính xác: ${ward.name}`);
              break;
            }
          }

          // Nếu không tìm thấy, thử tìm kiếm một phần
          if (!ward) {
            console.log(
              "Không tìm thấy phường/xã chính xác, thử tìm một phần..."
            );

            // Sắp xếp wards theo độ dài tên tăng dần để ưu tiên kết quả ngắn gọn hơn
            const sortedWards = [...wards].sort(
              (a, b) => (a.name?.length || 0) - (b.name?.length || 0)
            );

            for (const w of sortedWards) {
              const wCodename = w.codename
                ? normalizeSlugForComparison(w.codename)
                : "";
              const wSlug = w.slug ? normalizeSlugForComparison(w.slug) : "";
              const wName = normalizeSlugForComparison(w.name);

              // Tìm kiếm một phần với các slug
              for (const slug of searchWardSlugs) {
                if (
                  slug &&
                  ((wCodename &&
                    (wCodename.includes(slug) || slug.includes(wCodename))) ||
                    (wSlug && (wSlug.includes(slug) || slug.includes(wSlug))) ||
                    (wName && (wName.includes(slug) || slug.includes(wName))))
                ) {
                  ward = w;
                  console.log(
                    `Tìm thấy phường/xã một phần: ${w.name} (${w.code})`
                  );
                  break;
                }
              }

              if (ward) break;
            }
          }

          // Lưu kết quả nếu tìm thấy
          if (ward) {
            result.ward = ward.name;
          } else {
            // Fallback - Định dạng slug thành tên hiển thị
            result.ward = wardSlug
              .replace(/^xa-/, "")
              .replace(/^phuong-/, "")
              .replace(/^thi-tran-/, "")
              .replace(/-/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            console.log(
              `Không tìm thấy phường/xã, sử dụng fallback: ${result.ward}`
            );
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu phường/xã:", error);
          // Fallback
          result.ward = wardSlug
            .replace(/^xa-/, "")
            .replace(/^phuong-/, "")
            .replace(/^thi-tran-/, "")
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }

      // Log kết quả để debug
      console.log("Kết quả breadcrumb:", {
        city: result.city,
        ward: result.ward,
      });

      return {
        city: result.city,
        ward: result.ward,
        district: result.district, // Luôn trống trong cấu trúc mới
      };
    } catch (error) {
      console.error("Lỗi xử lý breadcrumb:", error);

      // Fallback an toàn
      const fallbackCity = citySlug
        ? citySlug
            .replace(/^tinh-/, "")
            .replace(/^thanh-pho-/, "")
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "";

      const fallbackWard = wardSlug
        ? wardSlug
            .replace(/^xa-/, "")
            .replace(/^phuong-/, "")
            .replace(/^thi-tran-/, "")
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "";

      return {
        city: fallbackCity,
        ward: fallbackWard,
        district: "", // Không còn district trong cấu trúc mới
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

  // Get location names in one API call - với caching để tránh gọi lại
  getLocationNames: async (
    provinceCode?: string,
    wardCode?: string
  ): Promise<LocationNames> => {
    try {
      if (!provinceCode) {
        return {};
      }

      // Tạo cache key
      const cacheKey = `${provinceCode}_${wardCode || "none"}`;

      // Check cache trước (simple in-memory cache)
      if (typeof window !== "undefined") {
        const windowGlobal = window as typeof window & {
          locationCache?: Record<
            string,
            { data: LocationNames; timestamp: number }
          >;
        };
        const cached = windowGlobal.locationCache?.[cacheKey];
        if (cached && Date.now() - cached.timestamp < 300000) {
          // 5 phút cache
          console.log("🔄 Using cached location names for:", cacheKey);
          return cached.data;
        }
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

      // Cache result
      if (typeof window !== "undefined") {
        const windowGlobal = window as typeof window & {
          locationCache?: Record<
            string,
            { data: LocationNames; timestamp: number }
          >;
        };
        if (!windowGlobal.locationCache) {
          windowGlobal.locationCache = {};
        }
        windowGlobal.locationCache[cacheKey] = {
          data: result.data,
          timestamp: Date.now(),
        };
      }

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
