export interface PropertyData {
  _id: string;
  title: string;
  price?: string | number;
  currency?: string;
  location?: {
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
  images?: string[];
  slug?: string;
  area?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  category?: string | { name: string };
  description?: string;
  packageId?: string;
  createdAt?: string;
}
