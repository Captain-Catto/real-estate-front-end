"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocationNames } from "@/hooks/useLocationNames";

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  address: string;
  location: {
    provinceCode: string;
    wardCode?: string;
  };
  developer: {
    name: string;
    logo?: string;
  };
  status: string;
  totalUnits: number;
  area: string;
  priceRange: string;
  images: string[];
}

interface ProjectListCardProps {
  project: ProjectData;
  variant?: "grid" | "list";
}

export function ProjectListCard({
  project,
  variant = "list",
}: ProjectListCardProps) {
  // Use location names hook to get readable location names
  const { locationNames, loading: locationLoading } = useLocationNames(
    project.location?.provinceCode,
    undefined, // No districtCode in simplified structure
    project.location?.wardCode
  );

  console.log("project:", project);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang cập nhật":
        return "bg-gray-100 text-gray-600";
      case "Sắp mở bán":
        return "bg-yellow-100 text-yellow-600";
      case "Đã bàn giao":
        return "bg-green-100 text-green-600";
      case "Đang bán":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const imageUrl =
    project.images && project.images.length > 0
      ? project.images[0]
      : "/images/default-project.jpg";

  // Build complete location display
  const getCompleteLocation = () => {
    if (locationLoading) {
      return "Đang tải...";
    }

    const locationParts = [];

    // Thêm địa chỉ chi tiết nếu có và khác "ahihi"
    if (project?.address && project.address !== "ahihi") {
      locationParts.push(project.address);
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

    // Final fallback: use address only
    return project.address || "Địa chỉ chưa cập nhật";
  };

  // Display location with fallback to address
  const displayLocation = getCompleteLocation();

  if (variant === "grid") {
    return (
      <Link href={`/du-an/${project.slug}`} className="group block">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 border border-gray-200 overflow-hidden">
          {/* Project Image */}
          <div className="relative h-48">
            <Image
              src={imageUrl}
              alt={project.name}
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
          </div>

          {/* Project Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {project.name}
            </h3>

            <p className="text-sm text-gray-600 mb-3 flex items-center">
              <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
              <span className="line-clamp-1">{displayLocation}</span>
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold text-red-600">
                {project.priceRange || "Liên hệ"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-3">
              <div className="flex items-center">
                <i className="fas fa-building mr-1 text-gray-400"></i>
                <span>{project.totalUnits?.toLocaleString() || "N/A"} căn</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-expand-arrows-alt mr-1 text-gray-400"></i>
                <span>{project.area || "N/A"}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-user-tie mr-2 text-gray-400"></i>
                <span className="font-medium text-blue-600 truncate">
                  {project.developer?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List variant (default)
  return (
    <Link href={`/du-an/${project.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
        <div className="flex gap-6">
          {/* Project Image */}
          <div className="relative w-48 h-32 flex-shrink-0">
            <Image
              src={imageUrl}
              alt={project.name}
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
          </div>

          {/* Project Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <div className="text-lg font-bold text-red-600">
                {project.priceRange || "Liên hệ"}
              </div>
            </div>

            <p className="text-gray-600 mb-3 flex items-center">
              <i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>
              {displayLocation}
            </p>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <i className="fas fa-building mr-2 text-gray-400"></i>
                <span>{project.totalUnits?.toLocaleString() || "N/A"} căn</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-expand-arrows-alt mr-2 text-gray-400"></i>
                <span>{project.area || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-user-tie mr-2 text-gray-400"></i>
                <span className="truncate">
                  {project.developer?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProjectListCard;
