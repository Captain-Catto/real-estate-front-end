"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { locationService } from "@/services/locationService";
import { Location } from "@/types/location";

interface LocationFilterProps {
  onLocationChange?: (
    provinceCode?: string,
    districtCode?: string,
    wardCode?: string
  ) => void;
}

export function LocationFilter({ onLocationChange }: LocationFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);

  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get("provinceCode") || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    searchParams.get("districtCode") || ""
  );
  const [selectedWard, setSelectedWard] = useState(
    searchParams.get("wardCode") || ""
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
          const data = await locationService.getDistricts(selectedProvince);
          setDistricts(data);
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
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      const fetchWards = async () => {
        setLoading(true);
        try {
          const data = await locationService.getWards(
            selectedProvince,
            selectedDistrict
          );
          setWards(data);
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
  }, [selectedProvince, selectedDistrict]);

  const updateURL = (
    provinceCode?: string,
    districtCode?: string,
    wardCode?: string
  ) => {
    const params = new URLSearchParams();

    if (provinceCode) params.set("provinceCode", provinceCode);
    if (districtCode) params.set("districtCode", districtCode);
    if (wardCode) params.set("wardCode", wardCode);

    const queryString = params.toString();
    const newURL = queryString ? `/du-an?${queryString}` : "/du-an";

    router.push(newURL);

    // Call callback if provided
    if (onLocationChange) {
      onLocationChange(provinceCode, districtCode, wardCode);
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");

    updateURL(provinceCode || undefined);
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    setSelectedWard("");

    updateURL(selectedProvince || undefined, districtCode || undefined);
  };

  const handleWardChange = (wardCode: string) => {
    setSelectedWard(wardCode);

    updateURL(
      selectedProvince || undefined,
      selectedDistrict || undefined,
      wardCode || undefined
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
              <option key={province.code} value={province.code}>
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
              <option key={district.code} value={district.code}>
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
              <option key={ward.code} value={ward.code}>
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
