export interface Post {
  id: string;
  title: string;
  type: "ban" | "cho-thue";
  status: string;
  price: string;
  area: string;
  location: string;
  createdDate: string;
  expiryDate: string;
  views: number;
  image: string;
  featured: boolean;
  rejectionReason?: string;
  rejectionDate?: string;
}

export interface EditPostForm {
  // Thông tin chính
  type: "ban" | "cho-thue";
  category: string;
  area: string;
  price: string;
  currency: string;

  // Thông tin khác
  legalDocs: string;
  furniture: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  houseDirection: string;
  balconyDirection: string;
  roadWidth: string;
  frontWidth: string;

  // Thông tin liên hệ
  contactName: string;
  email: string;
  phone: string;

  // Tiêu đề & mô tả
  title: string;
  description: string;

  // Địa chỉ
  address: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  isPopular?: boolean;
}
