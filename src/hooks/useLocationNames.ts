import { useState, useEffect } from "react";
import { locationService, LocationNames } from "@/services/locationService";
import { showErrorToast } from "@/utils/errorHandler";

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
        // Use the new single API call (chỉ dùng province và ward)
        const names = await locationService.getLocationNames(
          provinceCode,
          wardCode // wardCode thay cho districtCode
        );

        console.log("📍 Location names from API:", names);
        setLocationNames(names);
      } catch {
        showErrorToast("Không thể tải tên địa điểm");
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
