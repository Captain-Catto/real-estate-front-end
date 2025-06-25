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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(`${API_BASE_URL}/locations/provinces`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();

      if (res.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (!result.success || !Array.isArray(result.data)) {
        console.error("Unexpected API response format:", result);
        return [];
      }
      return result.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      if (retryCount > 0) {
        console.log(`Retrying getProvinces... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return locationService.getProvinces(retryCount - 1);
      }
      throw error;
    }
  },
  getDistricts: async (
    provinceCode: string,
    retryCount = 3
  ): Promise<LocationData> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(
        `${API_BASE_URL}/locations/districts/${provinceCode}`,
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
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log("Districts result:", result);

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
        window.location.href = "/login";
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
