interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Location {
  _id: string;
  name: string;
  code: string;
  codename: string;
  division_type: string;
  phone_code: string;
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

      const res = await fetch(`${API_BASE_URL}/locations/provinces`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Thêm timeout để tránh chờ quá lâu
        signal: AbortSignal.timeout(5000), // 5 giây timeout
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (!result.success || !Array.isArray(result.data)) {
        console.error("Unexpected API response format:", result);
        return [];
      }

      // Thành công, trả về data
      console.log("Successfully fetched provinces");
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

  getDistricts: async (
    provinceCode: string,
    retryCount = 3
  ): Promise<LocationData> => {
    try {
      console.log(`Fetching districts for province: ${provinceCode}`);

      const response = await fetch(
        `${API_BASE_URL}/locations/districts/${provinceCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch districts: ${response.status}`);

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
      console.error("Error fetching districts:", error);
      if (retryCount > 0) {
        console.log(`Retrying getDistricts... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return locationService.getDistricts(provinceCode, retryCount - 1);
      }
      throw error;
    }
  },
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

  getDistrictWithSlug: async (
    provinceSlug: string,
    districtSlug: string
  ): Promise<Location | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/locations/districts/${provinceSlug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.error(`Failed to fetch districts: ${response.status}`);
        return null;
      }
      const result: ApiResponse<Location[]> = await response.json();
      if (!result.success || !Array.isArray(result.data)) {
        console.error("Unexpected API response format:", result);
        return null;
      }

      // Find the district by codename (slug)
      const district = result.data.find((d) => d.codename === districtSlug);
      return district || null;
    } catch (error) {
      console.error("Error fetching district with slug:", error);
      return null;
    }
  },

  getWardWithSlug: async (
    provinceCode: string,
    districtCode: string,
    wardSlug: string
  ): Promise<Location | null> => {
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
        return null;
      }
      const result: ApiResponse<Location[]> = await response.json();
      if (!result.success || !Array.isArray(result.data)) {
        console.error("Unexpected API response format:", result);
        return null;
      }

      // Find the ward by codename (slug)
      const ward = result.data.find((w) => w.codename === wardSlug);
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
          p.codename === provinceSlug ||
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
          d.codename === districtSlug ||
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

  // Lấy tên thật của phường/xã từ slug
  getWardNameFromSlug: async (
    provinceCode: string,
    districtCode: string,
    wardSlug: string
  ): Promise<string> => {
    try {
      const wards = await locationService.getWards(provinceCode, districtCode);
      if (!Array.isArray(wards)) return wardSlug.replace(/-/g, " ");

      // Tìm theo codename hoặc tên đã được convert
      const ward = wards.find(
        (w) =>
          w.codename === wardSlug ||
          w.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-") === wardSlug
      );

      return ward ? ward.name : wardSlug.replace(/-/g, " ");
    } catch (error) {
      console.error("Error getting ward name from slug:", error);
      return wardSlug.replace(/-/g, " ");
    }
  },

  // Lấy thông tin breadcrumb đầy đủ từ slug
  getBreadcrumbFromSlug: async (
    citySlug?: string,
    districtSlug?: string,
    wardSlug?: string
  ) => {
    try {
      let cityName = "";
      let districtName = "";
      let wardName = "";
      let provinceCode = "";
      let districtCode = "";

      // Lấy tên tỉnh/thành
      if (citySlug) {
        try {
          const provinces = await locationService.getProvinces();
          const province = provinces?.find(
            (p) =>
              p.codename === citySlug ||
              p.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-") === citySlug
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
          cityName = citySlug.replace(/-/g, " ");
        }
      }

      // Lấy tên quận/huyện
      if (districtSlug && provinceCode) {
        try {
          const districts = await locationService.getDistricts(provinceCode);
          const district = districts?.find(
            (d) =>
              d.codename === districtSlug ||
              d.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-") === districtSlug
          );

          if (district) {
            districtName = district.name;
            districtCode = district.code;
          }
        } catch (districtError) {
          console.error("Error fetching district data:", districtError);
        }

        // Fallback nếu không tìm thấy tên từ API
        if (!districtName) {
          districtName = districtSlug.replace(/-/g, " ");
        }
      }

      // Lấy tên phường/xã (chạy trong mọi môi trường, không kiểm tra isServer)
      if (wardSlug && provinceCode && districtCode) {
        try {
          const wards = await locationService.getWards(
            provinceCode,
            districtCode
          );
          const ward = wards?.find(
            (w) =>
              w.codename === wardSlug ||
              w.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-") === wardSlug
          );

          if (ward) {
            wardName = ward.name;
          }
        } catch (wardError) {
          console.error("Error fetching ward data:", wardError);
          // Log thêm thông tin để debug
          console.log("Debug info:", {
            wardSlug,
            provinceCode,
            districtCode,
          });
        }
      }

      // Fallback nếu không tìm thấy tên từ API
      if (!wardName && wardSlug) {
        wardName = wardSlug.replace(/-/g, " ");
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
        city: citySlug?.replace(/-/g, " ") || "",
        district: districtSlug?.replace(/-/g, " ") || "",
        ward: wardSlug?.replace(/-/g, " ") || "",
      };
    }
  },
};
