"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { locationService } from "@/services/locationService";
import { Location } from "@/types/location";

interface LocationSearchProps {
  currentProvinceCode?: string;
  currentDistrictCode?: string;
  currentWardCode?: string;
}

export function LocationSearch({
  currentProvinceCode,
  currentDistrictCode,
  currentWardCode,
}: LocationSearchProps) {
  const router = useRouter();
  const [provinces, setProvinces] = React.useState<Location[]>([]);
  const [districts, setDistricts] = React.useState<Location[]>([]);
  const [wards, setWards] = React.useState<Location[]>([]);
  const [selectedProvince, setSelectedProvince] = useState(
    currentProvinceCode || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    currentDistrictCode || ""
  );
  const [selectedWard, setSelectedWard] = useState(currentWardCode || "");
  const [loading, setLoading] = useState(false);

  // Load provinces on mount
  React.useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  React.useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        try {
          const data = await locationService.getDistricts(selectedProvince);
          setDistricts(data);
        } catch (error) {
          console.error("Error loading districts:", error);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Load wards when district changes
  React.useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      const loadWards = async () => {
        try {
          const data = await locationService.getWards(
            selectedProvince,
            selectedDistrict
          );
          setWards(data);
        } catch (error) {
          console.error("Error loading wards:", error);
        }
      };
      loadWards();
    } else {
      setWards([]);
    }
  }, [selectedProvince, selectedDistrict]);

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    setSelectedWard("");
  };

  const handleWardChange = (wardCode: string) => {
    setSelectedWard(wardCode);
  };

  const handleSearch = () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (selectedProvince) params.append("provinceCode", selectedProvince);
    if (selectedDistrict) params.append("districtCode", selectedDistrict);
    if (selectedWard) params.append("wardCode", selectedWard);

    const queryString = params.toString();
    const url = queryString ? `/du-an?${queryString}` : "/du-an";

    router.push(url);
  };

  const handleReset = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    router.push("/du-an");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Tìm dự án theo khu vực
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tỉnh/Thành phố
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quận/Huyện
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedProvince}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phường/Xã
          </label>
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!selectedDistrict}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-search mr-2"></i>
                Tìm kiếm
              </>
            )}
          </button>

          {(selectedProvince || selectedDistrict || selectedWard) && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">Khu vực phổ biến:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "TP. Hồ Chí Minh", code: "79" },
            { name: "Hà Nội", code: "01" },
            { name: "Đà Nẵng", code: "48" },
            { name: "Hải Phòng", code: "31" },
            { name: "Cần Thơ", code: "92" },
          ].map((province) => (
            <button
              key={province.code}
              onClick={() => {
                setSelectedProvince(province.code);
                setSelectedDistrict("");
                setSelectedWard("");
                const params = new URLSearchParams();
                params.append("provinceCode", province.code);
                router.push(`/du-an?${params.toString()}`);
              }}
              className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              {province.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LocationSearch;
