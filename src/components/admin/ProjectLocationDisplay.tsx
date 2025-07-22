"use client";
import React from "react";
import { useLocationNames } from "@/hooks/useLocationNames";

interface ProjectLocationDisplayProps {
  location?: {
    provinceCode?: string;
    wardCode?: string;
  };
  address?: string;
  variant?: "full" | "compact";
}

export function ProjectLocationDisplay({
  location,
  address,
  variant = "compact",
}: ProjectLocationDisplayProps) {
  const { locationNames, loading } = useLocationNames(
    location?.provinceCode,
    undefined, // không có district
    location?.wardCode
  );

  // Debug logs để kiểm tra dữ liệu
  console.log("🏗️ ProjectLocationDisplay - Location props:", location);
  console.log(
    "🏗️ ProjectLocationDisplay - LocationNames result:",
    locationNames
  );
  console.log("🏗️ ProjectLocationDisplay - Loading state:", loading);
  console.log("🏗️ ProjectLocationDisplay - Address:", address);

  // Build complete location display
  const getCompleteLocation = () => {
    if (loading) {
      return "Đang tải...";
    }

    const locationParts = [];

    // Thêm địa chỉ chi tiết nếu có và khác "ahihi"
    if (address && address !== "ahihi") {
      locationParts.push(address);
    }

    // Thêm các cấp hành chính theo thứ tự ward -> province (không có district)
    if (locationNames.wardName) {
      locationParts.push(locationNames.wardName);
    }
    if (locationNames.provinceName) {
      locationParts.push(locationNames.provinceName);
    }

    // Nếu có dữ liệu từ API
    if (locationParts.length > 0) {
      return locationParts.join(", ");
    }

    // Fallback: sử dụng fullLocationName từ API nếu có
    if (locationNames.fullLocationName) {
      return locationNames.fullLocationName;
    }

    // Debug fallback: hiển thị mã codes để debug
    if (location?.provinceCode || location?.wardCode) {
      const debugParts = [];
      if (location.wardCode) debugParts.push(`Ward: ${location.wardCode}`);
      if (location.provinceCode)
        debugParts.push(`Province: ${location.provinceCode}`);
      return `🔍 ${debugParts.join(", ")}`;
    }

    return "Chưa có thông tin vị trí đầy đủ";
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        <i className="fas fa-spinner fa-spin mr-1"></i>
        Đang tải...
      </div>
    );
  }

  // Check if all required location data is available (chỉ cần province và ward)
  const hasFullLocation = location?.provinceCode && location?.wardCode;
  const hasMissingLocation = !hasFullLocation;

  if (variant === "full") {
    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-600">{getCompleteLocation()}</div>
        {hasMissingLocation && (
          <div className="flex items-center text-xs text-amber-600">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            Thiếu thông tin phường/xã
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div className="space-y-1">
      <div className="text-sm">{getCompleteLocation()}</div>
      {hasMissingLocation && (
        <div className="flex items-center text-xs text-amber-600">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          Thiếu P/X
        </div>
      )}
    </div>
  );
}
