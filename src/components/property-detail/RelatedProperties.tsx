"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/common/FavoriteButton";

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  images: string[];
  slug: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  postedDate: string;
}

interface RelatedPropertiesProps {
  currentPropertyId: string;
}

export function RelatedProperties({
  currentPropertyId,
}: RelatedPropertiesProps) {
  const [visibleCount, setVisibleCount] = useState(6); // Desktop: 3x4 = 12, Mobile: 4x3 = 12

  // Mock data - thay thế bằng API call thực tế
  const allProperties: Property[] = [
    {
      id: "1",
      title: "Nhà phố 3 tầng, khu vực Cầu Giấy",
      price: "5.2 tỷ",
      location: "Cầu Giấy, Hà Nội",
      images: ["/images/property-1.jpg"],
      slug: "nha-pho-cau-giay-1",
      area: "85 m²",
      bedrooms: 3,
      bathrooms: 2,
      propertyType: "Nhà phố",
      postedDate: "2 ngày trước",
    },
    {
      id: "2",
      title: "Chung cư cao cấp Vinhomes",
      price: "3.8 tỷ",
      location: "Ba Đình, Hà Nội",
      images: ["/images/property-2.jpg"],
      slug: "chung-cu-vinhomes-2",
      area: "75 m²",
      bedrooms: 2,
      bathrooms: 2,
      propertyType: "Chung cư",
      postedDate: "1 tuần trước",
    },
    // Thêm nhiều properties để test
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 3}`,
      title: `Bất động sản ${i + 3}`,
      price: `${(Math.random() * 5 + 2).toFixed(1)} tỷ`,
      location: "Hà Nội",
      images: ["/images/default-property.jpg"],
      slug: `property-${i + 3}`,
      area: `${Math.floor(Math.random() * 50 + 50)} m²`,
      bedrooms: Math.floor(Math.random() * 3 + 1),
      bathrooms: Math.floor(Math.random() * 3 + 1),
      propertyType: ["Nhà phố", "Chung cư", "Biệt thự"][
        Math.floor(Math.random() * 3)
      ],
      postedDate: `${Math.floor(Math.random() * 30 + 1)} ngày trước`,
    })),
  ];

  // Filter ra property hiện tại
  const relatedProperties = allProperties.filter(
    (p) => p.id !== currentPropertyId
  );
  const visibleProperties = relatedProperties.slice(0, visibleCount);
  const hasMore = visibleCount < relatedProperties.length;

  const handleLoadMore = () => {
    // Desktop: thêm 8 cards (3 + 3 + 2), Mobile: thêm 4 cards
    const increment = window.innerWidth >= 1024 ? 6 : 4;
    setVisibleCount((prev) => prev + increment);
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const favoriteItem = {
      id: property.id,
      type: "property" as const,
      title: property.title,
      price: property.price,
      location: property.location,
      image: property.images[0],
      slug: property.slug,
      area: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      propertyType: property.propertyType,
    };

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image
            src={property.images[0] || "/images/default-property.jpg"}
            alt={property.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <FavoriteButton item={favoriteItem} />
          </div>
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            {property.propertyType}
          </div>
        </div>

        <div className="p-4">
          <Link href={`/mua-ban/ha-noi/${property.slug}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
              {property.title}
            </h3>
          </Link>

          <div className="text-red-600 font-bold text-lg mb-2">
            {property.price}
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-3">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span className="truncate">{property.location}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <i className="fas fa-ruler-combined mr-1"></i>
                {property.area}
              </span>
              <span className="flex items-center">
                <i className="fas fa-bed mr-1"></i>
                {property.bedrooms}
              </span>
              <span className="flex items-center">
                <i className="fas fa-bath mr-1"></i>
                {property.bathrooms}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400">{property.postedDate}</div>
        </div>
      </div>
    );
  };

  if (relatedProperties.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-semibold mb-6">Bất động sản dành cho bạn</h3>

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {visibleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Xem thêm bất động sản
          </button>
        </div>
      )}
    </div>
  );
}
