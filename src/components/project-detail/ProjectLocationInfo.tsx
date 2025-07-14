"use client";
import React from "react";
import { Project } from "@/types/project";
import { useLocationNames } from "@/hooks/useLocationNames";

interface ProjectLocationInfoProps {
  project: Project;
}

export function ProjectLocationInfo({ project }: ProjectLocationInfoProps) {
  const { locationNames, loading: locationLoading } = useLocationNames(
    project.location?.provinceCode,
    project.location?.districtCode,
    project.location?.wardCode
  );

  // Build location display string
  const getLocationDisplay = () => {
    if (locationLoading) {
      return "Đang tải thông tin vị trí...";
    }

    // Hiển thị location đầy đủ: [address], [ward], [district], [province]
    const locationParts = [];

    // Thêm địa chỉ chi tiết nếu có (bao gồm cả "ahihi")
    if (project?.address) {
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

    // Show location codes if available (for debugging)
    if (project.location) {
      const { provinceCode, districtCode, wardCode } = project.location;
      return `Mã vị trí: ${wardCode ? `${wardCode}, ` : ""}${
        districtCode ? `${districtCode}, ` : ""
      }${provinceCode || "N/A"}`;
    }

    return "Thông tin vị trí chưa được cập nhật";
  };

  const locationInsights = project.locationInsights || {
    schools: [],
    hospitals: [],
    supermarkets: [],
    parks: [],
    restaurants: [],
  };

  const insightCategories = [
    {
      key: "schools",
      label: "Trường học",
      icon: "fas fa-graduation-cap",
      color: "blue",
      data: locationInsights.schools,
    },
    {
      key: "hospitals",
      label: "Bệnh viện",
      icon: "fas fa-hospital",
      color: "red",
      data: locationInsights.hospitals,
    },
    {
      key: "supermarkets",
      label: "Siêu thị",
      icon: "fas fa-shopping-cart",
      color: "green",
      data: locationInsights.supermarkets,
    },
    {
      key: "parks",
      label: "Công viên",
      icon: "fas fa-tree",
      color: "emerald",
      data: locationInsights.parks,
    },
    {
      key: "restaurants",
      label: "Nhà hàng",
      icon: "fas fa-utensils",
      color: "orange",
      data: locationInsights.restaurants,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      red: "bg-red-50 text-red-600 border-red-200",
      green: "bg-green-50 text-green-600 border-green-200",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Vị trí & Tiện ích xung quanh
      </h2>

      {/* Location Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin vị trí
        </h3>

        <div className="space-y-3">
          {/* Complete Location - show full location including address */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-map-marker-alt text-blue-600 text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Địa chỉ đầy đủ
              </p>
              <p className="text-sm text-gray-900">{getLocationDisplay()}</p>
              {locationLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  Đang tải thông tin địa danh...
                </p>
              )}
            </div>
          </div>

          {project.map && (project.map.lat !== 0 || project.map.lng !== 0) && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <i className="fas fa-crosshairs text-purple-600 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tọa độ</p>
                <p className="text-sm text-gray-900">
                  {project.map.lat}, {project.map.lng}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Insights */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tiện ích xung quanh
        </h3>

        {insightCategories.some((category) => category.data.length > 0) ? (
          <div className="space-y-6">
            {insightCategories.map((category) => {
              if (category.data.length === 0) return null;

              return (
                <div key={category.key}>
                  <div className="flex items-center space-x-2 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(
                        category.color
                      )}`}
                    >
                      <i className={`${category.icon} text-sm`}></i>
                    </div>
                    <h4 className="font-medium text-gray-900">
                      {category.label}
                    </h4>
                    <span className="text-sm text-gray-500">
                      ({category.data.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-10">
                    {category.data.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {item.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-map-marker-alt text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-500 text-sm">
              Chưa có thông tin về tiện ích xung quanh dự án
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectLocationInfo;
