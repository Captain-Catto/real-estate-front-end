"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "./FavoriteButton";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    image: string;
    slug: string;
    area?: string;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const favoriteItem = {
    id: property.id,
    type: "property" as const,
    title: property.title,
    price: property.price,
    location: property.location,
    image: property.image,
    slug: property.slug,
    area: property.area,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    propertyType: property.propertyType,
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link href={`/chi-tiet/${property.slug}`}>
          <div className="relative h-48">
            <Image
              src={property.image}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
          <FavoriteButton item={favoriteItem} />
        </div>
      </div>

      <div className="p-4">
        <Link href={`/chi-tiet/${property.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        <div className="text-red-600 font-semibold mb-2 text-lg">
          {property.price}
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <i className="fas fa-map-marker-alt mr-1 text-xs"></i>
          <span className="text-sm">{property.location}</span>
        </div>

        {(property.area || property.bedrooms || property.bathrooms) && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {property.area && (
              <span className="flex items-center">
                <i className="fas fa-ruler-combined mr-1"></i>
                {property.area}
              </span>
            )}
            {property.bedrooms && (
              <span className="flex items-center">
                <i className="fas fa-bed mr-1"></i>
                {property.bedrooms} PN
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center">
                <i className="fas fa-bath mr-1"></i>
                {property.bathrooms} WC
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
