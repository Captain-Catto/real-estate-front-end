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
      return areas.map((area: any) => ({
        _id: area._id || area.id,
        id: area.id || area._id,
        name: area.name,
        slug: area.slug,
        value: area.value,
      }));
    } catch (error) {
      console.error("Failed to fetch area ranges:", error);
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
      const areas = await areaService.getAll();
      const area = areas.find((a) => a.value === value || a.slug === value);
      return area || null;
    } catch (error) {
      console.error("Error getting area by value:", error);
      return null;
    }
  },

  /**
   * Get formatted area text for display
   * @param areaValue - Value in square meters
   * @returns Formatted area text (e.g., "120 m²")
   */
  getFormattedArea: (areaValue: number | string): string => {
    const numValue =
      typeof areaValue === "string" ? parseFloat(areaValue) : areaValue;

    if (isNaN(numValue)) {
      return "Đang cập nhật";
    }

    return `${numValue} m²`;
  },
};
