import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface PriceRange {
  _id: string;
  id: string;
  name: string;
  slug: string;
  type: "ban" | "cho-thue" | "project";
  value?: string; // Added for backward compatibility
  label?: string; // Added for backward compatibility
}

export const priceRangeService = {
  /**
   * Get all price ranges
   * @returns Promise with array of price ranges
   */
  getAll: async (): Promise<PriceRange[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/price-ranges`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching price ranges: ${response.status}`);
      }

      const result = await response.json();

      // Handle the nested structure
      const priceRanges = result.priceRanges || result.data?.priceRanges || [];

      // Transform the data to match the expected interface
      return priceRanges.map(
        (price: {
          slug: string;
          name: string;
          _id: string;
          minPrice?: number;
          maxPrice?: number;
        }) => ({
          ...price,
          value: price.slug, // Use slug as value for search params
          label: price.name, // Use name as label
        })
      );
    } catch {
      toast.error("Lỗi khi tải khoảng giá");
      return [];
    }
  },

  /**
   * Get price ranges by type (sell, rent, project)
   * @param type - The type of listing
   * @returns Promise with filtered price ranges
   */
  getByType: async (
    type: "ban" | "cho-thue" | "project"
  ): Promise<PriceRange[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/price-ranges/type/${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching price ranges by type: ${response.status}`
        );
      }

      const result = await response.json();

      // Handle the nested structure
      const priceRanges = result.priceRanges || result.data?.priceRanges || [];

      // Transform the data to match the expected interface
      return priceRanges.map(
        (price: {
          slug: string;
          name: string;
          _id: string;
          minPrice?: number;
          maxPrice?: number;
        }) => ({
          ...price,
          value: price.slug, // Use slug as value for search params
          label: price.name, // Use name as label
        })
      );
    } catch {
      toast.error("Lỗi khi tải khoảng giá theo loại");
      return [];
    }
  },

  /**
   * Get price range by value (for translating URL params to human-readable labels)
   * @param value - The price range value from URL params
   * @param type - The type of listing
   * @returns Promise with matching price range or null
   */
  getByValue: async (
    value: string,
    type: "ban" | "cho-thue" | "project"
  ): Promise<PriceRange | null> => {
    try {
      const ranges = await priceRangeService.getByType(type);
      return (
        ranges.find((range) => range.slug === value || range.value === value) ||
        null
      );
    } catch {
      toast.error("Lỗi khi tìm khoảng giá");
      return null;
    }
  },
};
