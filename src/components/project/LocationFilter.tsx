"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { locationService } from "@/services/locationService";
import { Location } from "@/types/location";

interface LocationFilterProps {
  onLocationChange?: (
    province?: string,
    district?: string,
    ward?: string
  ) => void;
}

export function LocationFilter({ onLocationChange }: LocationFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);

  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get("province") || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    searchParams.get("district") || ""
  );
  const [selectedWard, setSelectedWard] = useState(
    searchParams.get("ward") || ""
  );

  const [loading, setLoading] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        setLoading(true);
        try {
          // Find province by slug to get code
          const province = provinces.find((p) => p.slug === selectedProvince);
          if (province) {
            const data = await locationService.getDistricts(province.code);
            setDistricts(data);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince, provinces]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      const fetchWards = async () => {
        setLoading(true);
        try {
          // Find province and district by slug to get codes
          const province = provinces.find((p) => p.slug === selectedProvince);
          const district = districts.find((d) => d.slug === selectedDistrict);
          if (province && district) {
            const data = await locationService.getWards(
              province.code,
              district.code
            );
            setWards(data);
          }
        } catch (error) {
          console.error("Error fetching wards:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [selectedProvince, selectedDistrict, provinces, districts]);

  const updateURL = (province?: string, district?: string, ward?: string) => {
    const params = new URLSearchParams();

    if (province) params.set("province", province);
    if (district) params.set("district", district);
    if (ward) params.set("ward", ward);

    const queryString = params.toString();
    const newURL = queryString ? `/du-an?${queryString}` : "/du-an";

    router.push(newURL);

    // Call callback if provided
    if (onLocationChange) {
      onLocationChange(province, district, ward);
    }
  };

  const handleProvinceChange = (provinceSlug: string) => {
    setSelectedProvince(provinceSlug);
    setSelectedDistrict("");
    setSelectedWard("");

    updateURL(provinceSlug || undefined);
  };

  const handleDistrictChange = (districtSlug: string) => {
    setSelectedDistrict(districtSlug);
    setSelectedWard("");

    updateURL(selectedProvince || undefined, districtSlug || undefined);
  };

  const handleWardChange = (wardSlug: string) => {
    setSelectedWard(wardSlug);

    updateURL(
      selectedProvince || undefined,
      selectedDistrict || undefined,
      wardSlug || undefined
    );
  };

  const handleClearFilters = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    router.push("/du-an");

    if (onLocationChange) {
      onLocationChange();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Lọc theo khu vực</h3>
        {(selectedProvince || selectedDistrict || selectedWard) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.slug}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận/Huyện
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedProvince || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Tất cả quận/huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.slug}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ward Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã
          </label>
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!selectedDistrict || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Tất cả phường/xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.slug}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="mt-2 text-sm text-gray-500">Đang tải...</div>}
    </div>
  );
}

export default LocationFilter;
