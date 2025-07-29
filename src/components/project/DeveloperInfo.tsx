import React from "react";
import Image from "next/image";
import { Developer } from "@/types/developer";

interface DeveloperInfoProps {
  developer: Developer;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const DeveloperInfo: React.FC<DeveloperInfoProps> = ({
  developer,
  loading = false,
  error,
  className = "",
}) => {
  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-red-600 text-sm">
          Không thể tải thông tin chủ đầu tư: {error}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}
    >
      <div className="flex items-start gap-4">
        {developer.logo && (
          <div className="flex-shrink-0">
            <Image
              src={developer.logo}
              alt={developer.name}
              width={64}
              height={64}
              className="w-16 h-16 object-contain rounded-lg border border-gray-200"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Chủ đầu tư: {developer.name}
          </h3>
          {developer.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {developer.description}
            </p>
          )}
          {(developer.email || developer.phone) && (
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              {developer.email && <span>📧 {developer.email}</span>}
              {developer.phone && <span>📞 {developer.phone}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
