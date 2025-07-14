export interface Developer {
  _id: string;
  name: string;
  logo: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  description?: string;
  foundedYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperForSelection {
  _id: string;
  name: string;
  logo: string;
  phone: string;
  email: string;
}

export interface DeveloperListItem {
  _id: string;
  name: string;
  logo: string;
  phone: string;
  email: string;
  foundedYear?: number;
  isActive: boolean;
}

export interface CreateDeveloperRequest {
  name: string;
  logo: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  description?: string;
  foundedYear?: number;
  isActive?: boolean;
}

export interface UpdateDeveloperRequest
  extends Partial<CreateDeveloperRequest> {
  _id: string;
}
