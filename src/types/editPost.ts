export interface LocationData {
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  project?: string;
}

export interface EditPostForm {
  type: "ban" | "cho-thue";
  category: string;
  title: string;
  description: string;
  address: string;
  location: LocationData;
  area: string;
  price: string;
  currency: string;
  legalDocs: string;
  furniture: string;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  houseDirection?: string;
  balconyDirection?: string;
  roadWidth?: string;
  frontWidth?: string;
  contactName: string;
  email: string;
  phone: string;
  packageId: string;
  packageDuration: number;
  images: string[];
  project?: string; // Add project field
  [key: string]: unknown; // For dynamic form fields
}
