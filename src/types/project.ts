export interface Developer {
  name: string;
  logo: string;
  phone: string;
  email: string;
}

export interface LocationInsight {
  name: string;
  distance: string;
}

export interface LocationInsights {
  schools: LocationInsight[];
  hospitals: LocationInsight[];
  supermarkets: LocationInsight[];
  parks: LocationInsight[];
  restaurants: LocationInsight[];
}

export interface ProjectFAQ {
  question: string;
  answer: string;
}

export interface ProjectSpecifications {
  [key: string]: string;
}

export interface ProjectContact {
  hotline: string;
  email: string;
}

export interface ProjectMap {
  lat: number;
  lng: number;
}

export interface IProjectLocation {
  provinceCode: string;
  wardCode: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  address: string;
  fullLocation?: string;
  location: IProjectLocation;
  latitude: number;
  longitude: number;
  developer: Developer;
  category?: { _id: string; name: string; isProject: boolean }; // Single category for project type
  images: string[];
  videos?: string[];
  totalUnits: number;
  area: string;
  numberOfTowers?: number;
  density?: string;
  status: "Đang cập nhật" | "Sắp mở bán" | "Đã bàn giao" | "Đang bán";
  priceRange: string;
  description: string;
  facilities: string[];
  specifications: ProjectSpecifications;
  locationInsights: LocationInsights;
  faqs: ProjectFAQ[];
  contact: ProjectContact;
  map: ProjectMap;
  isFeatured: boolean; // Dự án nổi bật
}

export interface CreateProjectRequest {
  name: string;
  slug: string;
  address: string;
  location: IProjectLocation;
  latitude: number;
  longitude: number;
  developer: Developer | string; // Can be Developer object or developer ID
  category: string; // Add category field
  images: string[];
  videos?: string[];
  totalUnits: number;
  area: string;
  numberOfTowers?: number;
  density?: string;
  status: "Đang cập nhật" | "Sắp mở bán" | "Đã bàn giao" | "Đang bán";
  priceRange: string;
  description: string;
  facilities: string[];
  specifications: ProjectSpecifications;
  locationInsights: LocationInsights;
  faqs: ProjectFAQ[];
  contact: ProjectContact;
  map: ProjectMap;
  isFeatured: boolean; // Dự án nổi bật
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  address?: string; // Địa chỉ chi tiết
  location: string; // Keep string for backward compatibility
  locationObj?: IProjectLocation; // Add new field for object
  developer: string;
  status: "Đang cập nhật" | "Sắp mở bán" | "Đã bàn giao" | "Đang bán";
  totalUnits: number;
  area: string;
  priceRange?: string;
  isFeatured: boolean; // Thêm trường nổi bật
}
