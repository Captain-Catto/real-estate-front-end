import React from "react";
import Image from "next/image";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    status: string;
    area: string;
    units?: number;
    location: string;
    summary: string;
    images: any[];
    imageCount: number;
    developer?: string;
    developerLogo?: any;
    slug: string;
  };
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "open":
      return { label: "Đang mở bán", className: "bg-green-100 text-green-800" };
    case "finished":
      return { label: "Đã bàn giao", className: "bg-blue-100 text-blue-800" };
    case "upcoming":
      return {
        label: "Sắp mở bán",
        className: "bg-yellow-100 text-yellow-800",
      };
    default:
      return { label: "Đang cập nhật", className: "bg-gray-100 text-gray-800" };
  }
};

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig = getStatusConfig(project.status);

  // Format units number consistently
  const formatUnits = (units: number) => {
    return new Intl.NumberFormat("vi-VN").format(units);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <a href={`/du-an/${project.slug}`} className="flex flex-col sm:flex-row">
        {/* Project Images */}
        <div className="w-full sm:w-60 flex-shrink-0">
          <div className="relative h-48 sm:h-full">
            <div className="grid grid-cols-3 h-full gap-1">
              {project.images.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className={`relative ${
                    index === 0 ? "col-span-3 sm:col-span-2" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${project.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    fill
                    sizes={
                      index === 0 ? "(max-width: 640px) 100vw, 160px" : "80px"
                    }
                  />
                </div>
              ))}
            </div>

            {/* Image Count Badge */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              {project.imageCount}
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="flex-1 p-4">
          <div className="flex flex-col h-full">
            {/* Status Badge */}
            <div className="mb-3">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
              {project.title}
            </h3>

            {/* Config Info */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600 mb-3">
              <span>{project.area}</span>
              {project.units && (
                <>
                  <span>·</span>
                  <span className="flex items-center">
                    {formatUnits(project.units)}
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L9 4.414V17a1 1 0 102 0V4.414l7.293 7.293a1 1 0 001.414-1.414l-9-9z" />
                    </svg>
                  </span>
                </>
              )}
            </div>

            {/* Location */}
            <div className="flex items-start text-gray-600 mb-3">
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{project.location}</span>
            </div>

            {/* Summary */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
              {project.summary}
            </p>

            {/* Developer Info */}
            {project.developer && (
              <div className="flex items-center mt-auto">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                  {project.developerLogo ? (
                    <Image
                      src={project.developerLogo}
                      alt={project.developer}
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="text-gray-600 text-xs font-medium">
                      {project.developer.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 line-clamp-1">
                  {project.developer}
                </span>
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
