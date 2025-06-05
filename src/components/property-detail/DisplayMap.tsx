"use client";
import React, { useState, useEffect } from "react";

interface MapWithSearchProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  address?: string;
}

export function DisplayMap({
  latitude,
  longitude,
  title,
  address,
}: MapWithSearchProps) {
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issue - chỉ render iframe sau khi client mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Tạo embed URL cho vị trí gốc
  const getEmbedUrl = () => {
    if (address) {
      // Sử dụng địa chỉ nếu có
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        address
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    } else if (latitude && longitude) {
      // Sử dụng tọa độ nếu không có địa chỉ
      return `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return "";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Vị trí trên bản đồ</h3>

      {/* Map Container */}
      <div className="h-64 rounded-lg overflow-hidden bg-gray-200">
        {!isClient ? (
          // Server-side rendering fallback
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <i className="fas fa-map-marker-alt text-2xl mb-2"></i>
              <p className="text-sm">Đang tải bản đồ...</p>
            </div>
          </div>
        ) : getEmbedUrl() ? (
          // Client-side rendering với iframe
          <iframe
            src={getEmbedUrl()}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Bản đồ ${title || "Vị trí bất động sản"}`}
            className="rounded-lg"
          />
        ) : (
          // Fallback khi không có location
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <i className="fas fa-map-marker-alt text-2xl mb-2"></i>
              <p className="text-sm">Không có thông tin vị trí</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
