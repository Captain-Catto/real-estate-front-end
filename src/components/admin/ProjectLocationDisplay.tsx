"use client";
import React from "react";
import { useLocationNames } from "@/hooks/useLocationNames";

interface ProjectLocationDisplayProps {
  location?: {
    provinceCode?: string;
    districtCode?: string;
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
    location?.districtCode,
    location?.wardCode
  );
  console.log("Location props:", location);
  console.log("LocationNames result:", locationNames);
  console.log("Loading state:", loading);

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

  // Check if all required location data is available
  const hasFullLocation =
    location?.provinceCode && location?.districtCode && location?.wardCode;
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
