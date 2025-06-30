const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface AreaRange {
  _id: string;
  id: string;
  name: string;
  slug: string;
  value?: string; // Added for backward compatibility
}

export const areaService = {
  /**
   * Get all area ranges
   * @returns Promise with array of area ranges
   */
  getAll: async (): Promise<AreaRange[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/areas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching area ranges: ${response.status}`);
      }

      const result = await response.json();

      // Handle the nested response structure
      const areas = result.areas || result.data?.areas || [];

      // Transform the data to match the expected interface
      return areas.map((area) => ({
        ...area,
        value: area.slug, // Use slug as value for search params
        label: area.name, // Use name as label
      }));
    } catch (error) {
      console.error("Error in areaService.getAll:", error);
      return [];
    }
  },

  /**
   * Get area range by value (for translating URL params to human-readable labels)
   * @param value - The area range value from URL params
   * @returns Promise with matching area range or null
   */
  getByValue: async (value: string): Promise<AreaRange | null> => {
    try {
      const ranges = await areaService.getAll();
      return (
        ranges.find((range) => range.slug === value || range.value === value) ||
        null
      );
    } catch (error) {
      console.error("Error in areaService.getByValue:", error);
      return null;
    }
  },

  /**
   * Get formatted area text for display
   * @param areaValue - Value in square meters
   * @returns Formatted area text (e.g., "120 m²")
   */
  getFormattedArea: (areaValue: number | string): string => {
    if (!areaValue) return "Không xác định";

    const value =
      typeof areaValue === "string" ? parseFloat(areaValue) : areaValue;

    if (isNaN(value)) return "Không xác định";

    return `${value.toLocaleString("vi-VN")} m²`;
  },
};
