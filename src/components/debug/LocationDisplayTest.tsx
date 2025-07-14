"use client";
import React from "react";
import { useLocationNames } from "@/hooks/useLocationNames";

export function LocationDisplayTest() {
  // Test với location codes từ project "Sunrise City View"
  const { locationNames, loading } = useLocationNames("79", "778", "27475");

  // Build complete location display như trong các component khác
  const getCompleteLocation = () => {
    if (loading) {
      return "Đang tải...";
    }

    const locationParts = [];

    // Thêm một địa chỉ demo
    const mockAddress = "123 Đường ABC";
    if (mockAddress) {
      locationParts.push(mockAddress);
    }

    // Thêm các cấp hành chính theo thứ tự ward -> district -> province
    if (locationNames.wardName) locationParts.push(locationNames.wardName);
    if (locationNames.districtName)
      locationParts.push(locationNames.districtName);
    if (locationNames.provinceName)
      locationParts.push(locationNames.provinceName);

    if (locationParts.length > 0) {
      return locationParts.join(", ");
    }

    // Fallback: sử dụng fullLocationName từ API nếu có
    if (locationNames.fullLocationName) {
      return locationNames.fullLocationName;
    }

    return "Địa chỉ chưa cập nhật";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">🧪 Location Display Test</h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            Input Location Codes:
          </h4>
          <p className="text-sm text-gray-600">
            Province: 79, District: 778, Ward: 27475
            <br />
            (Tương ứng: TP. Hồ Chí Minh, Quận 7, Phường Tân Hưng)
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Raw API Response:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(locationNames, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            Formatted Location Display:
          </h4>
          <div className="text-lg font-medium text-blue-600 border-2 border-blue-200 p-3 rounded bg-blue-50">
            {getCompleteLocation()}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Expected Format:</h4>
          <div className="text-sm text-gray-600 italic">
            "123 Đường ABC, Phường Tân Hưng, Quận 7, Thành phố Hồ Chí Minh"
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Loading: {loading ? "true" : "false"}
        </div>
      </div>
    </div>
  );
}
