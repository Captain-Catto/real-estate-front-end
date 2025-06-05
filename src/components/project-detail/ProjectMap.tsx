"use client";
import React, { useState, useEffect } from "react";

interface LocationInsight {
  schools: Array<{ name: string; distance: string }>;
  hospitals: Array<{ name: string; distance: string }>;
  supermarkets: Array<{ name: string; distance: string }>;
  parks: Array<{ name: string; distance: string }>;
  restaurants: Array<{ name: string; distance: string }>;
}

interface ProjectMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  locationInsights: LocationInsight;
}

export function ProjectMap({
  latitude,
  longitude,
  title,
  address,
  locationInsights,
}: ProjectMapProps) {
  const [activeInsightTab, setActiveInsightTab] = useState("schools");
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Google Maps Embed API URL
  const getMapEmbedUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn("Google Maps API key not found");
      return "";
    }

    // Use address if available, otherwise use coordinates
    const query = address
      ? encodeURIComponent(address)
      : `${latitude},${longitude}`;

    return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${query}&zoom=15`;
  };

  // Get directions URL
  const getDirectionsUrl = () => {
    const query = address
      ? encodeURIComponent(address)
      : `${latitude},${longitude}`;

    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  };

  const insightTabs = [
    {
      key: "schools",
      label: "Trường học",
      icon: "fa-graduation-cap",
      data: locationInsights.schools,
    },
    {
      key: "hospitals",
      label: "Bệnh viện",
      icon: "fa-hospital",
      data: locationInsights.hospitals,
    },
    {
      key: "supermarkets",
      label: "Siêu thị",
      icon: "fa-shopping-cart",
      data: locationInsights.supermarkets,
    },
    {
      key: "parks",
      label: "Công viên",
      icon: "fa-tree",
      data: locationInsights.parks,
    },
    {
      key: "restaurants",
      label: "Nhà hàng",
      icon: "fa-utensils",
      data: locationInsights.restaurants,
    },
  ];

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const mapUrl = getMapEmbedUrl();

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="relative">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="384"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
            title={`Bản đồ ${title}`}
          />
        ) : (
          // Fallback khi không có API key
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <i className="fas fa-map-marker-alt text-4xl mb-2"></i>
              <p>Bản đồ {title}</p>
              <p className="text-sm">{address}</p>
              <p className="text-xs mt-2">
                Tọa độ: {latitude}, {longitude}
              </p>
              <p className="text-xs text-red-500 mt-2">
                Cần Google Maps API key để hiển thị bản đồ
              </p>
            </div>
          </div>
        )}

        {/* Directions Button */}
        <div className="absolute bottom-4 right-4">
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <i className="fas fa-directions mr-2"></i>
            Chỉ đường
          </a>
        </div>
      </div>

      {/* Location Insights */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Tiện ích xung quanh</h3>

        {/* Insight Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {insightTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveInsightTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                activeInsightTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                {tab.data.length}
              </span>
            </button>
          ))}
        </div>

        {/* Insight Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insightTabs
            .find((tab) => tab.key === activeInsightTab)
            ?.data.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-blue-600">
                      <i className="fas fa-walking mr-1"></i>
                      {item.distance}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(
                        `${item.name} near ${address}`
                      );
                      window.open(
                        `https://www.google.com/maps/search/${query}`,
                        "_blank"
                      );
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-directions"></i>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              const query = encodeURIComponent(`tiện ích near ${address}`);
              window.open(
                `https://www.google.com/maps/search/${query}`,
                "_blank"
              );
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tất cả tiện ích xung quanh
            <i className="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>

      {/* Transportation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Giao thông công cộng</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-bus text-blue-600 text-sm"></i>
              </div>
              <div>
                <div className="font-medium">Trạm xe buýt</div>
                <div className="text-sm text-gray-600">
                  Cách 200m - Tuyến 03, 18, 32
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const query = encodeURIComponent(
                  `trạm xe buýt near ${address}`
                );
                window.open(
                  `https://www.google.com/maps/search/${query}`,
                  "_blank"
                );
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <i className="fas fa-directions"></i>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-subway text-green-600 text-sm"></i>
              </div>
              <div>
                <div className="font-medium">Ga tàu điện</div>
                <div className="text-sm text-gray-600">
                  Cách 1.2km - Tuyến Cat Linh - Hà Đông
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const query = encodeURIComponent(`ga tàu điện near ${address}`);
                window.open(
                  `https://www.google.com/maps/search/${query}`,
                  "_blank"
                );
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <i className="fas fa-directions"></i>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-taxi text-yellow-600 text-sm"></i>
              </div>
              <div>
                <div className="font-medium">Điểm taxi</div>
                <div className="text-sm text-gray-600">Có sẵn tại tòa nhà</div>
              </div>
            </div>
            <button
              onClick={() => {
                const query = encodeURIComponent(`taxi near ${address}`);
                window.open(
                  `https://www.google.com/maps/search/${query}`,
                  "_blank"
                );
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <i className="fas fa-directions"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
