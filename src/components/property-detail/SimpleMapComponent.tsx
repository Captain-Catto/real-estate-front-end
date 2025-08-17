"use client";

import React, { useState } from "react";
import { toast } from "sonner";

interface SimpleMapComponentProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  title?: string;
  address?: string;
}

const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({
  latitude,
  longitude,
  zoom = 15,
  title,
  address: _address,
}) => {
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // OpenStreetMap iframe URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    longitude - 0.01
  },${latitude - 0.01},${longitude + 0.01},${
    latitude + 0.01
  }&layer=mapnik&marker=${latitude},${longitude}`;

  const handleMapLoad = () => {
    setIsLoading(false);
    setMapError(false);
    console.log("✅ Simple map loaded successfully");
  };

  const handleMapError = () => {
    setIsLoading(false);
    setMapError(true);
    toast.error("Không thể tải bản đồ");
  };

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-2xl mb-2 text-red-500"></i>
          <p className="text-sm">Không thể tải bản đồ</p>
          <button
            onClick={() => {
              setMapError(false);
              setIsLoading(true);
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100 z-10">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p className="text-sm">Đang tải bản đồ...</p>
          </div>
        </div>
      )}

      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: "0.5rem" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title || "Bản đồ vị trí"}
        onLoad={handleMapLoad}
        onError={handleMapError}
        className="w-full h-full rounded-lg"
      />

      {/* Info overlay */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md text-xs">
        <div className="flex items-center mb-1">
          <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
          <span className="font-medium">{title || "Vị trí bất động sản"}</span>
        </div>

        <div className="text-gray-500">
          Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </div>
      </div>

      {/* External link */}
      <div className="absolute top-2 right-2">
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=${zoom}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white bg-opacity-90 hover:bg-opacity-100 px-2 py-1 rounded text-xs text-blue-600 hover:text-blue-800 shadow-md transition-all"
          title="Xem trên OpenStreetMap"
        >
          <i className="fas fa-external-link-alt mr-1"></i>
          Xem lớn
        </a>
      </div>
    </div>
  );
};

export default SimpleMapComponent;
