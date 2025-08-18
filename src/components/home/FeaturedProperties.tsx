import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { postService, Post } from "@/services/postsService";
import { locationService } from "@/services/locationService";
import {
  FavoriteButton,
  FavoriteItem,
} from "@/components/common/FavoriteButton";
import { showErrorToast } from "@/utils/errorHandler";
import testCardImg from "@/assets/images/card-img.jpg";
import { formatPriceByType } from "@/utils/format";
import { getPackageBadge, shouldShowBadge } from "@/utils/packageBadgeUtils";
import { createPostSlug } from "@/utils/postSlug";

interface FeaturedProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  featured: boolean;
  createdAt: string;
  priority: string;
  package: string;
  type: string;
  slug: string;
  url: string; // Full URL for the property
  favoriteItem: FavoriteItem; // Data for FavoriteButton
}

export function FeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState<
    FeaturedProperty[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured properties from API
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi API để lấy featured properties với VIP cao nhất
        const response = await postService.getFeaturedProperties(8);

        if (response.success && response.data?.posts) {
          // Transform posts to FeaturedProperty format
          const transformedProperties = await Promise.all(
            response.data.posts.map(async (post: Post) => {
              let locationName = "Chưa xác định";
              let provinceName = "";
              let wardName = "";

              // Get location names if available
              if (post.location) {
                try {
                  const locationNames = await locationService.getLocationNames(
                    post.location.province,
                    post.location.ward
                  );
                  provinceName = locationNames.provinceName || "";
                  wardName = locationNames.wardName || "";
                  locationName = `${wardName || ""}, ${
                    provinceName || ""
                  }`.replace(/^,\s*/, "");
                } catch {
                  // Silent error for location names
                  locationName =
                    post.location.street ||
                    post.location.province ||
                    "Chưa xác định";
                }
              }

              // Generate slug and URL
              const titleSlug = generateSlug(post._id, post.title);

              // Create full URL using createPostSlug utility
              const propertyUrl = createPostSlug({
                _id: post._id,
                title: post.title,
                type: post.type,
                location: {
                  province: provinceName,
                  ward: wardName,
                },
              });

              // Create favorite item data
              const favoriteItem: FavoriteItem = {
                id: post._id,
                type: "property",
                title: post.title,
                price: formatPrice(
                  post.price,
                  post.currency || "VND",
                  post.type || "ban"
                ),
                location: locationName,
                image:
                  post.images && post.images.length > 0
                    ? post.images[0]
                    : testCardImg.src,
                slug: titleSlug,
                area:
                  typeof post.area === "string"
                    ? post.area
                    : post.area?.toString() || "",
                bedrooms: post.bedrooms || 0,
                bathrooms: post.bathrooms || 0,
                propertyType: post.type === "cho-thue" ? "Cho thuê" : "Bán",
              };

              return {
                id: post._id,
                title: post.title,
                price: formatPrice(
                  post.price,
                  post.currency || "VND",
                  post.type || "ban"
                ),
                location: locationName,
                bedrooms: post.bedrooms || 0,
                bathrooms: post.bathrooms || 0,
                area:
                  typeof post.area === "string"
                    ? parseInt(post.area)
                    : post.area || 0,
                image:
                  post.images && post.images.length > 0
                    ? post.images[0]
                    : testCardImg.src,
                featured: true,
                createdAt: post.createdAt,
                priority: post.priority || "normal",
                package: post.package || "free",
                type: post.type,
                slug: titleSlug,
                url: propertyUrl,
                favoriteItem,
              };
            })
          );

          setFeaturedProperties(transformedProperties);
        }
      } catch {
        showErrorToast("Không thể tải dữ liệu bất động sản nổi bật");
        setError("Không thể tải dữ liệu bất động sản nổi bật");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Helper function to format price
  const formatPrice = (
    price: number,
    currency: string = "VND",
    type: string = "ban"
  ): string => {
    if (currency === "VND") {
      return formatPriceByType(price, type);
    }
    return `${price.toLocaleString()} ${currency}`;
  };

  // Helper function to generate slug for property link
  const generateSlug = (id: string, title: string): string => {
    const titleSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return `${titleSlug}-${id}`;
  };

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

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header với tiêu đề và link */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 md:mb-12">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Bất Động Sản Nổi Bật
            </h2>
          </div>

          {/* Nút xem thêm bên phải */}
          <div className="self-start sm:self-auto">
            <Link
              href="/mua-ban"
              className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2 transition-colors duration-200 text-sm md:text-base"
            >
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-32 md:h-48 bg-gray-300"></div>
                <div className="p-3 md:p-4">
                  <div className="h-3 md:h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-4 md:h-6 bg-gray-300 rounded mb-2 w-1/2"></div>
                  <div className="h-3 md:h-4 bg-gray-300 rounded mb-3 w-2/3"></div>
                  <div className="flex justify-between pt-2 md:pt-3 border-t">
                    <div className="h-3 md:h-4 bg-gray-300 rounded w-8 md:w-12"></div>
                    <div className="h-3 md:h-4 bg-gray-300 rounded w-8 md:w-12"></div>
                    <div className="h-3 md:h-4 bg-gray-300 rounded w-8 md:w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Grid 8 cards - 2 cards per row on mobile, 4 on desktop */}
        {!loading && !error && featuredProperties.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {featuredProperties.map((property) => (
              <Link
                key={property.id}
                href={property.url}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-32 md:h-48">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  {shouldShowBadge(property.package) && (
                    <div className="absolute top-2 md:top-3 left-2 md:left-3">
                      <span
                        className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium ${
                          getPackageBadge(property.package).className
                        }`}
                      >
                        {getPackageBadge(property.package).text}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 md:top-3 right-2 md:right-3">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="inline-block"
                    >
                      <FavoriteButton
                        item={property.favoriteItem}
                        className="backdrop-blur-sm shadow-md"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[3rem]">
                    {property.title}
                  </h3>
                  <div className="text-lg md:text-xl font-bold text-red-600 mb-1 md:mb-2">
                    {property.price}
                  </div>
                  <div className="flex items-center text-gray-600 mb-2 md:mb-3">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0"
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
                    <span className="text-xs md:text-sm truncate">
                      {property.location}
                    </span>
                  </div>

                  {/* Time ago */}
                  <div className="mb-2 md:mb-3">
                    <span className="text-xs md:text-sm text-gray-500">
                      {getTimeAgo(property.createdAt)}
                    </span>
                  </div>

                  {/* Property details */}
                  <div className="flex gap-4 text-xs md:text-sm text-gray-500 border-t pt-2 md:pt-3">
                    {property.bedrooms !== undefined &&
                      property.bedrooms !== null && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-bed"></i>
                          {property.bedrooms} PN
                        </span>
                      )}
                    {property.bathrooms !== undefined &&
                      property.bathrooms !== null && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-bath"></i>
                          {property.bathrooms} WC
                        </span>
                      )}
                    {property.area && (
                      <span className="flex items-center gap-1">
                        <i className="fas fa-ruler-combined"></i>
                        {property.area}m²
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && featuredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Hiện tại chưa có bất động sản nổi bật
            </p>
            <Link
              href="/mua-ban"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Xem tất cả bất động sản
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
