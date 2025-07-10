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
  districtCode: string;
  wardCode?: string;
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
}

export interface CreateProjectRequest {
  name: string;
  slug: string;
  address: string;
  location: IProjectLocation;
  latitude: number;
  longitude: number;
  developer: Developer;
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
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  location: string;
  developer: string;
  status: "Đang cập nhật" | "Sắp mở bán" | "Đã bàn giao" | "Đang bán";
  totalUnits: number;
  area: string;
  priceRange?: string;
}
