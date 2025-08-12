import { useState, useEffect } from "react";
import { locationService } from "@/services/locationService";

interface LocationNameCache {
  [key: string]: string;
}

const locationCache: LocationNameCache = {};

export const useLocationName = (provinceCode?: string, wardCode?: string) => {
  const [locationName, setLocationName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocationName = async () => {
      if (!provinceCode) {
        setLocationName("");
        return;
      }

      const cacheKey = `${provinceCode}_${wardCode || ""}`;

      // Check cache first
      if (locationCache[cacheKey]) {
        setLocationName(locationCache[cacheKey]);
        return;
      }

      setLoading(true);
      try {
        const result = await locationService.getLocationNames(
          provinceCode,
          wardCode
        );

        let name = "";
        if (result.provinceName) {
          name = result.provinceName;
          if (result.wardName) {
            name = `${result.wardName}, ${result.provinceName}`;
          }
        } else {
          // Fallback to province/ward codes if names not available
          if (wardCode) {
            name = `${wardCode}, ${provinceCode}`;
          } else {
            name = provinceCode;
          }
        }

        // Cache the result
        locationCache[cacheKey] = name;
        setLocationName(name);
      } catch (error) {
        console.error("Error fetching location name:", error);
        // Fallback to codes
        const fallback = wardCode
          ? `${wardCode}, ${provinceCode}`
          : provinceCode;
        setLocationName(fallback);
        locationCache[cacheKey] = fallback;
      } finally {
        setLoading(false);
      }
    };

    fetchLocationName();
  }, [provinceCode, wardCode]);

  return { locationName, loading };
};
