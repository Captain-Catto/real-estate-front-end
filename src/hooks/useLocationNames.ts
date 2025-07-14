import { useState, useEffect } from "react";
import { locationService, LocationNames } from "@/services/locationService";

export function useLocationNames(
  provinceCode?: string,
  districtCode?: string,
  wardCode?: string
) {
  const [locationNames, setLocationNames] = useState<LocationNames>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocationNames = async () => {
      console.log("🔍 useLocationNames called with:", {
        provinceCode,
        districtCode,
        wardCode,
      });

      if (!provinceCode) {
        console.log("❌ No provinceCode provided");
        setLocationNames({});
        return;
      }

      setLoading(true);
      try {
        // Use the new single API call
        const names = await locationService.getLocationNames(
          provinceCode,
          districtCode,
          wardCode
        );

        console.log("📍 Location names from API:", names);
        setLocationNames(names);
      } catch (error) {
        console.error("❌ Error fetching location names:", error);
        setLocationNames({});
      } finally {
        setLoading(false);
      }
    };

    fetchLocationNames();
  }, [provinceCode, districtCode, wardCode]);

  return { locationNames, loading };
}

// Export default cũng để đảm bảo compatibility
export default useLocationNames;
