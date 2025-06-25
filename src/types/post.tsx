export interface CreatePostRequest {
  type: "ban" | "cho-thue";
  category: string;
  title: string;
  description: string;
  address: string;
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
}

export interface Post {
  id: string;
  userId: string;
  type: "ban" | "cho-thue";
  category: string;
  title: string;
  description: string;
  address: string;
  area: string;
  price: string;
  currency: string;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  views: number;
  contactName: string;
  email: string;
  phone: string;
  packageId: string;
  packageDuration: number;
  author: {
    username: string;
    phoneNumber: string;
    email: string;
    avatar?: string;
  };
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  isPopular?: boolean;
  color?: string;
}
