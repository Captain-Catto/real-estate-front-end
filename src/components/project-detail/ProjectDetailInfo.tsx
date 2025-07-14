"use client";
import React from "react";
import { Project } from "@/types/project";
import { useLocationNames } from "@/hooks/useLocationNames";

interface ProjectDetailInfoProps {
  project: Project;
}

export function ProjectDetailInfo({ project }: ProjectDetailInfoProps) {
  const { locationNames, loading: locationLoading } = useLocationNames(
    project.location?.provinceCode,
    project.location?.districtCode,
    project.location?.wardCode
  );

  // Build complete location display
  const getCompleteLocation = () => {
    if (locationLoading) {
      return "Đang tải vị trí...";
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

    return "Đang cập nhật";
  };

  const infoItems = [
    {
      label: "Địa chỉ đầy đủ",
      value: getCompleteLocation(),
      icon: "fas fa-map-marker-alt",
    },
    {
      label: "Chủ đầu tư",
      value: project.developer?.name || "N/A",
      icon: "fas fa-building",
    },
    {
      label: "Tổng số căn",
      value: project.totalUnits?.toLocaleString() || "N/A",
      icon: "fas fa-home",
    },
    {
      label: "Diện tích",
      value: project.area || "N/A",
      icon: "fas fa-expand-arrows-alt",
    },
    {
      label: "Số tòa nhà",
      value: project.numberOfTowers?.toString() || "N/A",
      icon: "fas fa-city",
    },
    {
      label: "Mật độ",
      value: project.density || "N/A",
      icon: "fas fa-chart-pie",
    },
    {
      label: "Trạng thái",
      value: project.status,
      icon: "fas fa-info-circle",
    },
    {
      label: "Khoảng giá",
      value: project.priceRange || "Liên hệ",
      icon: "fas fa-dollar-sign",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang cập nhật":
        return "text-gray-600";
      case "Sắp mở bán":
        return "text-yellow-600";
      case "Đã bàn giao":
        return "text-green-600";
      case "Đang bán":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Thông tin tổng quan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className={`${item.icon} text-blue-600 text-sm`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {item.label}
              </p>
              <p
                className={`text-sm ${
                  item.label === "Trạng thái"
                    ? getStatusColor(item.value)
                    : item.label === "Khoảng giá"
                    ? "text-red-600 font-semibold"
                    : "text-gray-900"
                }`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      {project.contact && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thông tin liên hệ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.contact.hotline && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <i className="fas fa-phone text-green-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Hotline</p>
                  <a
                    href={`tel:${project.contact.hotline}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {project.contact.hotline}
                  </a>
                </div>
              </div>
            )}
            {project.contact.email && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <i className="fas fa-envelope text-blue-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <a
                    href={`mailto:${project.contact.email}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {project.contact.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mô tả dự án
          </h3>
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: project.description.replace(/\n/g, "<br>"),
            }}
          />
        </div>
      )}

      {/* Facilities */}
      {project.facilities && project.facilities.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tiện ích nổi bật
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.facilities.map((facility, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-sm text-gray-700"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span>{facility}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specifications */}
      {project.specifications &&
        Object.keys(project.specifications).length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Thông số kỹ thuật
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(project.specifications).map(
                ([key, value], index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-gray-100"
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {key}
                    </span>
                    <span className="text-sm text-gray-900">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export default ProjectDetailInfo;
