"use client";
import React from "react";
import Link from "next/link";
import { useLocationNames } from "@/hooks/useLocationNames";

interface LocationNavigationBarProps {
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  currentCount?: number;
}

export function LocationNavigationBar({
  provinceCode,
  districtCode,
  wardCode,
  currentCount = 0,
}: LocationNavigationBarProps) {
  const { locationNames } = useLocationNames(
    provinceCode,
    districtCode,
    wardCode
  );

  if (!provinceCode) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>
          <span>Xem dự án theo khu vực:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Province Level */}
          {provinceCode && locationNames.provinceName && (
            <div className="flex items-center">
              <Link
                href={`/du-an?provinceCode=${provinceCode}`}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !districtCode
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                <i className="fas fa-city mr-1.5 text-xs"></i>
                {locationNames.provinceName}
              </Link>
              {districtCode && (
                <i className="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
              )}
            </div>
          )}

          {/* District Level */}
          {districtCode && locationNames.districtName && (
            <div className="flex items-center">
              <Link
                href={`/du-an?provinceCode=${provinceCode}&districtCode=${districtCode}`}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !wardCode
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                <i className="fas fa-building mr-1.5 text-xs"></i>
                {locationNames.districtName}
              </Link>
              {wardCode && (
                <i className="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
              )}
            </div>
          )}

          {/* Ward Level */}
          {wardCode && locationNames.wardName && (
            <div className="flex items-center">
              <Link
                href={`/du-an?provinceCode=${provinceCode}&districtCode=${districtCode}&wardCode=${wardCode}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white"
              >
                <i className="fas fa-home mr-1.5 text-xs"></i>
                {locationNames.wardName}
              </Link>
            </div>
          )}
        </div>

        {/* Location Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-blue-200">
          <div className="text-sm text-gray-600">
            {wardCode && locationNames.wardName ? (
              <>
                Đang xem dự án tại{" "}
                <span className="font-medium text-gray-900">
                  {locationNames.wardName}
                </span>
              </>
            ) : districtCode && locationNames.districtName ? (
              <>
                Đang xem dự án tại{" "}
                <span className="font-medium text-gray-900">
                  {locationNames.districtName}
                </span>
              </>
            ) : (
              <>
                Đang xem dự án tại{" "}
                <span className="font-medium text-gray-900">
                  {locationNames.provinceName}
                </span>
              </>
            )}
          </div>

          <div className="text-sm font-medium text-blue-600">
            {currentCount} dự án
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {/* View All in Province */}
          {(districtCode || wardCode) && (
            <Link
              href={`/du-an?provinceCode=${provinceCode}`}
              className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
            >
              <i className="fas fa-expand-alt mr-1"></i>
              Xem tất cả tại {locationNames.provinceName}
            </Link>
          )}

          {/* View All in District */}
          {wardCode && districtCode && (
            <Link
              href={`/du-an?provinceCode=${provinceCode}&districtCode=${districtCode}`}
              className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
            >
              <i className="fas fa-expand-alt mr-1"></i>
              Xem tất cả tại {locationNames.districtName}
            </Link>
          )}

          {/* View All Projects */}
          <Link
            href="/du-an"
            className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <i className="fas fa-globe mr-1"></i>
            Tất cả dự án
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LocationNavigationBar;
