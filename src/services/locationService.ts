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

interface LocationResponse extends ApiResponse<Location[]> {}

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

      if (res.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "/dang-nhap";
        throw new Error("Session expired. Please login again.");
      }

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
        } catch (e) {
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(
        `${API_BASE_URL}/locations/wards/${provinceCode}/${districtCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/dang-nhap";
        throw new Error("Session expired. Please login again.");
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log("Wards result:", result);

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
      throw error;
    }
  },
};
