export interface Location {
  _id: string;
  name: string;
  code: string;
  codename: string;
  division_type: string;
  phone_code: string;
}

export interface Province extends Location {
  nameEn: string;
  divisionType: string;
  codeName: string;
  administrativeUnit: string;
  region: string;
  regionCode: string;
  latitude: number;
  longitude: number;
  fullCode: string;
}

export interface LocationResponse<T = Location> {
  success: boolean;
  data: T[];
}

export type LocationData = Location[];
