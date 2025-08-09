"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "./FavoriteButton";
import { formatPriceByType } from "@/utils/format";
import { MdLocationOn, MdSquareFoot, MdBed, MdBathtub } from "react-icons/md";

interface PropertyCardProps {
  property: {
    id?: string;
    _id?: string;
    title: string;
    price: string | number;
    location:
      | string
      | {
          province?: string;
          district?: string;
          ward?: string;
          street?: string;
        };
    images: string[] | string;
    slug?: string;
    area?: string | number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    category?: string | { name: string; slug: string; _id: string };
    createdAt?: string;
    status?: string;
  };
  transactionType?: string; // Added to determine price format type
}

export function PropertyCard({
  property,
  transactionType = "ban",
}: PropertyCardProps) {
  console.log("Rendering PropertyCard for:", property);
  // Xử lý id
  const id = property.id || property._id || "";

  // Xử lý location
  const locationText =
    typeof property.location === "string"
      ? property.location
      : [property.location?.district, property.location?.province]
          .filter(Boolean)
          .join(", ");

  // Xử lý images
  const imageUrl = Array.isArray(property.images)
    ? property.images.length > 0
      ? property.images[0]
      : "/placeholder.jpg"
    : property.images || "/placeholder.jpg";

  // Xử lý slug
  const slug = property.slug || id;

  // Xử lý price
  const formattedPrice = (() => {
    if (typeof property.price === "number") {
      // Determine the price type from transactionType
      const priceType = transactionType === "cho-thue" ? "cho-thue" : "ban";
      return formatPriceByType(property.price, priceType);
    } else if (typeof property.price === "string") {
      // Check if it's a numeric string
      const numericPrice =
        parseFloat(property.price.replace(/[^\d]/g, "")) || 0;
      if (numericPrice > 0) {
        const priceType = transactionType === "cho-thue" ? "cho-thue" : "ban";
        return formatPriceByType(numericPrice, priceType);
      }
      // Return the original string if it's not numeric (e.g., "Thỏa thuận")
      return property.price;
    }
    return "Thỏa thuận";
  })();

  // Xử lý area
  const formattedArea = property.area
    ? typeof property.area === "number"
      ? `${property.area} m²`
      : property.area
    : undefined;

  const favoriteItem = {
    id,
    type: "property" as const,
    title: property.title,
    price: formattedPrice,
    location: locationText,
    image: imageUrl, // Changed from images to image
    slug,
    area: formattedArea,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    propertyType:
      property.propertyType ||
      (typeof property.category === "object"
        ? property.category?.name
        : property.category) ||
      "Chưa xác định",
  };

  // Format ngày đăng
  const formattedDate = property.createdAt
    ? `Đăng ${new Date(property.createdAt).toLocaleDateString("vi-VN")}`
    : "";

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex border border-gray-200 hover:shadow-md transition-shadow">
      {/* Left side - Image */}
      <div className="relative w-1/3 md:w-1/4">
        <Link href={`/chi-tiet/${slug}`}>
          <div className="relative h-full min-h-[140px]">
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              className="object-cover"
            />
            {/* Status overlay if needed */}
            {property.status === "expired" && (
              <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-black bg-opacity-70 text-white px-4 py-2 text-sm font-semibold rounded">
                  Tin đã hết hạn
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Right side - Information */}
      <div className="flex-1 p-3 md:p-4">
        <Link href={`/chi-tiet/${slug}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-base md:text-lg hover:text-blue-600">
            {property.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          {/* Price */}
          <div className="text-red-600 font-semibold text-base md:text-lg">
            {formattedPrice}
          </div>

          {/* Area */}
          {formattedArea && (
            <div className="text-gray-700 text-base flex items-center">
              <MdSquareFoot className="w-5 h-5 mr-2" />
              <span className="text-lg font-semibold">{formattedArea}</span>
            </div>
          )}

          {/* Bedrooms */}
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <div className="text-gray-700 text-base flex items-center">
              <MdBed className="w-5 h-5 mr-2" />
              <span className="text-lg font-semibold">{property.bedrooms}</span>
            </div>
          )}

          {/* Bathrooms */}
          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <div className="text-gray-700 text-base flex items-center">
              <MdBathtub className="w-5 h-5 mr-2" />
              <span className="text-lg font-semibold">
                {property.bathrooms}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-start text-gray-600 mb-3">
          <MdLocationOn className="h-5 w-5 mr-1 mt-0.5 shrink-0" />
          <span className="text-sm line-clamp-1">{locationText}</span>
        </div>

        {/* Date */}
        <div className="text-xs text-gray-500">{formattedDate}</div>
      </div>

      {/* Favorite Button */}
      <div className="self-start p-2">
        <FavoriteButton item={favoriteItem} />
      </div>
    </div>
  );
}
