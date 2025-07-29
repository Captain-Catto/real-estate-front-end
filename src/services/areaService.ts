export interface AreaRange {
  _id?: string;
  id: string;
  name: string;
  slug?: string;
  minValue: number;
  maxValue: number;
  type?: "property" | "project";
  order?: number;
  isActive: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export const areaService = {
  async getAll(): Promise<AreaRange[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/areas`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        console.error("Invalid API response format:", result);
        return [];
      }
    } catch (error) {
      console.error("Error fetching area ranges:", error);
      throw error;
    }
  },

  async getByType(type: "property" | "project"): Promise<AreaRange[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/areas/type/${type}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        console.error("Invalid API response format:", result);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching area ranges for type ${type}:`, error);
      throw error;
    }
  },

  async getById(id: string): Promise<AreaRange | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/areas/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching area range ${id}:`, error);
      throw error;
    }
  },
};

export default areaService;
