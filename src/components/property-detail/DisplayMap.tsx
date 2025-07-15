"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the Simple Map component (iframe-based)
const SimpleMap = dynamic(() => import("./SimpleMapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <i className="fas fa-map-marker-alt text-2xl mb-2"></i>
        <p className="text-sm">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Default coordinates (Hà Nội) nếu không có tọa độ
  const defaultLat = 21.0285;
  const defaultLng = 105.8542;

  // Sử dụng tọa độ được truyền vào hoặc tọa độ mặc định
  const mapLat = latitude || defaultLat;
  const mapLng = longitude || defaultLng;
  const mapZoom = latitude && longitude ? 15 : 10;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Vị trí trên bản đồ</h3>

      {/* Map Container */}
      <div className="h-64 rounded-lg overflow-hidden bg-gray-200 relative">
        {!isClient ? (
          // Server-side rendering fallback
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <i className="fas fa-map-marker-alt text-2xl mb-2"></i>
              <p className="text-sm">Đang tải bản đồ...</p>
            </div>
          </div>
        ) : (
          // Client-side rendering với Simple Map
          <SimpleMap
            latitude={mapLat}
            longitude={mapLng}
            zoom={mapZoom}
            title={title}
            address={address}
          />
        )}
      </div>
    </div>
  );
}
