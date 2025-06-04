import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import testCardImg from "@/assets/images/card-img.jpg";

const allProperties = [
  {
    id: 1,
    title: "Căn hộ cao cấp Vinhomes Central Park",
    price: "3.2 tỷ",
    location: "Quận Bình Thạnh, TP.HCM",
    bedrooms: 2,
    bathrooms: 2,
    area: 75,
    image: testCardImg,
    featured: true,
    createdAt: "2025-06-01",
  },
  {
    id: 2,
    title: "Nhà phố hiện đại khu Thảo Điền",
    price: "8.5 tỷ",
    location: "Quận 2, TP.HCM",
    bedrooms: 4,
    bathrooms: 3,
    area: 120,
    image: testCardImg,
    featured: true,
    createdAt: "2025-06-04",
  },
  {
    id: 3,
    title: "Biệt thự compound Riviera Cove",
    price: "15 tỷ",
    location: "Quận 9, TP.HCM",
    bedrooms: 5,
    bathrooms: 4,
    area: 300,
    image: testCardImg,
    featured: true,
    createdAt: "2025-02-15",
  },
  {
    id: 4,
    title: "Căn hộ chung cư The Gold View",
    price: "4.8 tỷ",
    location: "Quận 4, TP.HCM",
    bedrooms: 3,
    bathrooms: 2,
    area: 90,
    image: testCardImg,
    featured: true,
    createdAt: "2025-05-28",
  },
  {
    id: 5,
    title: "Shophouse Saigon Mystery Villas",
    price: "12 tỷ",
    location: "Quận 2, TP.HCM",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: testCardImg,
    featured: true,
    createdAt: "2025-05-25",
  },
  {
    id: 6,
    title: "Penthouse Diamond Island",
    price: "18 tỷ",
    location: "Quận 2, TP.HCM",
    bedrooms: 4,
    bathrooms: 4,
    area: 250,
    image: testCardImg,
    featured: true,
    createdAt: "2025-05-20",
  },
  {
    id: 7,
    title: "Căn hộ Landmark 81",
    price: "6.5 tỷ",
    location: "Quận Bình Thạnh, TP.HCM",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    image: testCardImg,
    featured: true,
    createdAt: "2025-05-18",
  },
  {
    id: 8,
    title: "Villa Park Riverside",
    price: "22 tỷ",
    location: "Quận 9, TP.HCM",
    bedrooms: 6,
    bathrooms: 5,
    area: 400,
    image: "/assets/properties/property2.jpg",
    featured: true,
    createdAt: "2025-05-15",
  },
];

export function FeaturedProperties() {
  const [visibleCount, setVisibleCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  // Function để tính thời gian đăng
  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Đăng hôm nay";
    } else if (diffDays === 1) {
      return "Đăng hôm qua";
    } else if (diffDays < 7) {
      return `Đăng ${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "Đăng 1 tuần trước" : `Đăng ${weeks} tuần trước`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? "Đăng 1 tháng trước" : `Đăng ${months} tháng trước`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? "Đăng 1 năm trước" : `Đăng ${years} năm trước`;
    }
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 4, allProperties.length));
      setIsLoading(false);
    }, 500);
  };

  const visibleProperties = allProperties.slice(0, visibleCount);
  const hasMore = visibleCount < allProperties.length;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Bất Động Sản Nổi Bật
          </h2>
          <p className="text-gray-600">
            Những dự án và căn hộ được quan tâm nhất
          </p>
        </div>

        {/* Grid 4 cards per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 row-gap-8">
          {visibleProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    VIP
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle favorite logic here
                      alert(`Đã thêm ${property.title} vào yêu thích!`);
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-gray-600 hover:text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Rest of the content remains the same */}
                <h3 className="font-semibold text-base mb-2 line-clamp-2 h-12">
                  {property.title}
                </h3>
                <div className="text-xl font-bold text-red-600 mb-2">
                  {property.price}
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm truncate">{property.location}</span>
                </div>

                {/* Time ago */}
                <div className="mb-3">
                  <span className="text-sm text-gray-500">
                    {getTimeAgo(property.createdAt)}
                  </span>
                </div>

                {/* Property details */}
                <div className="flex justify-between text-sm text-gray-500 border-t pt-3">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                    </svg>
                    {property.bedrooms} PN
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                    {property.bathrooms} WC
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    {property.area}m²
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button hoặc Navigate Button */}
        <div className="text-center mt-8">
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-8 py-3 border-2 text-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2 border-gray-300 hover:border-gray-400 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Đang tải...
                </>
              ) : (
                <>
                  Xem thêm
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <Link
              href="/mua-ban"
              className="px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center mx-auto gap-2 border w-[200px] mx-auto border-gray-300 hover:border-gray-400"
            >
              Xem tất cả
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
