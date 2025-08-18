// Component mới để hiển thị danh sách bất động sản theo địa điểm

"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Breadcrumb, BreadcrumbItem } from "../project-detail/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import SearchSection from "@/components/home/SearchSection";
import { locationService } from "@/services/locationService";
import { PropertyData } from "@/types/property";
import { formatPriceByType } from "@/utils/format";
import { getPackageBadge, shouldShowBadge } from "@/utils/packageBadgeUtils";
import { showErrorToast } from "@/utils/errorHandler";
import { MdLocationOn } from "react-icons/md";

interface PropertyListingProps {
  properties: PropertyData[];
  location: {
    city: string;
    district: string;
    ward: string;
  };
  transactionType: string;
  level: "city" | "district" | "ward";
  searchParams?: {
    city?: string;
    province?: string; // Add support for province parameter
    districts?: string;
    ward?: string;
    category?: string;
    price?: string;
    area?: string;
    [key: string]: string | string[] | undefined;
  };
}

export function PropertyListing({
  properties,
  location,
  transactionType,
  level,
  searchParams = {},
}: PropertyListingProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ref for articles section to scroll to
  const articlesRef = useRef<HTMLDivElement>(null);

  // Sử dụng interface Location từ locationService
  interface BasicLocation {
    code: string;
    name: string;
    codename?: string;
  }

  const [locationData, setLocationData] = useState<{
    initialCity: BasicLocation | null;
    initialDistricts: BasicLocation[];
    initialWard: BasicLocation | null;
  }>({
    initialCity: null,
    initialDistricts: [],
    initialWard: null,
  });

  // Fetch location data để populate vào SearchSection
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Convert location names thành proper Location objects với codes
        let cityData: BasicLocation | null = null;
        let districtsData: BasicLocation[] = [];
        let wardData: BasicLocation | null = null;

        // Fetch city data nếu có
        if (location.city) {
          // Sử dụng locationService để tìm city theo tên
          const provinces = await locationService.getProvinces();

          console.log("DEBUG: Looking for province:", location.city);
          console.log(
            "DEBUG: Available provinces:",
            provinces
              .map((p) => ({
                name: p.name,
                code: p.code,
                slug: p.slug,
                codename: p.codename,
              }))
              .slice(0, 5)
          );

          // Tìm kiếm theo nhiều tiêu chí
          const cityName = location.city; // Tên gốc (ví dụ: "Đồng Tháp")
          const citySlug = location.city
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-"); // dong-thap

          // Thử tìm theo tên chính xác
          const foundCity = provinces.find((p) => p.name === cityName);

          // Nếu không tìm thấy, thử tìm theo các cách khác
          if (!foundCity) {
            cityData =
              provinces.find(
                (p) =>
                  p.slug === citySlug ||
                  p.codename === searchParams.city ||
                  p.codename === searchParams.province || // Support province param
                  p.name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "-") === citySlug ||
                  p.codename
                    ?.replace(/^tinh-/, "")
                    .replace(/^thanh-pho-/, "") === citySlug ||
                  // Thêm các trường hợp so sánh thêm
                  p.slug === "tinh-" + citySlug ||
                  p.slug === "thanh-pho-" + citySlug
              ) || null;
          } else {
            cityData = foundCity;
          }

          console.log(
            "City search: Looking for",
            location.city,
            "found:",
            cityData?.name
          );
        }

        // Fetch districts data nếu có
        if (location.district && cityData) {
          const districts = await locationService.getDistricts(cityData.code);
          const districtData = districts.find(
            (d) =>
              d.name === location.district ||
              d.codename === searchParams.districts
          );
          if (districtData) {
            districtsData = [districtData];
          }
        }

        // Fetch ward data nếu có - sử dụng API mới chỉ cần province code
        if (location.ward && cityData) {
          const wards = await locationService.getWardsFromProvince(
            cityData.code
          );

          console.log("DEBUG: Looking for ward:", location.ward);
          console.log(
            "DEBUG: Available wards:",
            wards.slice(0, 5).map((w) => ({
              name: w.name,
              code: w.code,
              slug: w.slug,
              codename: w.codename,
            }))
          );

          // Tìm kiếm theo nhiều tiêu chí
          const wardName = location.ward; // Tên gốc (ví dụ: "Tam Nông")
          const wardSlug = location.ward
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-"); // tam-nong

          // Thử tìm theo tên chính xác
          const foundWard = wards.find((w) => w.name === wardName);

          if (foundWard) {
            wardData = foundWard;
          } else {
            wardData =
              wards.find(
                (w) =>
                  w.slug === wardSlug ||
                  w.codename === searchParams.ward ||
                  w.name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "-") === wardSlug ||
                  w.codename
                    ?.replace(/^xa-/, "")
                    .replace(/^phuong-/, "")
                    .replace(/^thi-tran-/, "") === wardSlug ||
                  // Thêm các trường hợp so sánh thêm
                  w.slug === "xa-" + wardSlug ||
                  w.slug === "phuong-" + wardSlug ||
                  w.slug === "thi-tran-" + wardSlug
              ) || null;
          }

          console.log(
            "Ward search: Looking for",
            location.ward,
            "found:",
            wardData?.name
          );
        }

        setLocationData({
          initialCity: cityData,
          initialDistricts: districtsData,
          initialWard: wardData,
        });
      } catch {
        showErrorToast("Không thể tải thông tin địa điểm");
        // Fallback to simple objects if API fails
        setLocationData({
          initialCity: location.city
            ? { code: "", name: location.city, codename: "" }
            : null,
          initialDistricts: location.district
            ? [{ code: "", name: location.district, codename: "" }]
            : [],
          initialWard: location.ward
            ? { code: "", name: location.ward, codename: "" }
            : null,
        });
      }
    };

    fetchLocationData();
  }, [location, searchParams]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Debug log để kiểm tra category data
  console.log("=== SEARCH SECTION DEBUG ===", {
    initialCategory: searchParams.category,
    locationData,
    searchParams,
  });

  // Debug log để kiểm tra data nhận được
  console.log("=== PROPERTY LISTING COMPONENT DEBUG ===");
  console.log("Received location prop:", location);
  console.log("Received transactionType:", transactionType);
  console.log("Received level:", level);
  console.log("Properties count:", properties.length);
  console.log("=== END PROPERTY LISTING DEBUG ===");

  // Utility function để tạo slug
  const createSlug = (text: string): string => {
    if (!text) return "";

    // Chuyển về chuỗi nếu không phải string
    const textStr = String(text);

    return textStr
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Helper function để tạo URL - được sử dụng trong PropertyCard

  // Generate breadcrumb items following new URL structure: /type/province/ward/postid-title
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/" },
    {
      label: transactionType === "mua-ban" ? "Mua bán" : "Cho thuê",
      href: `/${transactionType}`,
    },
  ];

  if (location.city) {
    breadcrumbItems.push({
      label: location.city,
      href: `/${transactionType}/${createSlug(location.city)}`,
      isActive: level === "city",
    });
  }

  // Skip district level according to new URL structure
  // Only add ward if it exists and is not empty
  if (location.ward && location.ward.trim() !== "") {
    // New URL structure: /type/province/ward (skip district)
    const wardUrl = `/${transactionType}/${createSlug(
      location.city
    )}/${createSlug(location.ward)}`;

    // Log the URL being created for debugging
    console.log("Creating ward URL:", {
      city: location.city,
      ward: location.ward,
      result: wardUrl,
    });

    breadcrumbItems.push({
      label: location.ward,
      href: wardUrl,
      isActive: level === "ward",
    });
  }

  // Log breadcrumb items for debugging
  console.log("Final breadcrumb items:", breadcrumbItems);

  // Pagination logic - đảm bảo properties là một mảng
  const propertiesArray = Array.isArray(properties) ? properties : [];
  const totalPages = Math.ceil(propertiesArray.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = propertiesArray.slice(startIndex, endIndex);

  // Handle page change with scroll to articles section
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Scroll to articles section instead of top of page
    if (articlesRef.current) {
      articlesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // Fallback to top if ref not available
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page title
  const getPageTitle = () => {
    const transactionText =
      transactionType === "mua-ban" ? "Mua bán" : "Cho thuê";
    if (level === "ward" && location.ward) {
      return `${transactionText} bất động sản tại ${location.ward}, ${location.district}, ${location.city}`;
    } else if (level === "district" && location.district) {
      return `${transactionText} bất động sản tại ${location.district}, ${location.city}`;
    } else if (level === "city" && location.city) {
      return `${transactionText} bất động sản tại ${location.city}`;
    }
    return `${transactionText} bất động sản`;
  };

  // Tạo JSON schema một lần ở bên ngoài render để tránh hydration mismatch
  const pageTitle = getPageTitle();
  const seoData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListings",
    name: pageTitle,
    description: `Danh sách ${properties.length} bất động sản ${
      transactionType === "mua-ban" ? "bán" : "cho thuê"
    } tại ${location.ward ? `${location.ward}, ` : ""}${
      location.district ? `${location.district}, ` : ""
    }${location.city}`,
    numberOfItems: properties.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto">
      {/* SEO Structured Data */}
      <Script id="property-listing-schema" type="application/ld+json">
        {JSON.stringify(seoData)}
      </Script>

      <div className="container mx-auto px-4 py-6">
        {/* Search Section */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <SearchSection
            searchType={transactionType === "mua-ban" ? "buy" : "rent"}
            initialSearch={searchParams.search as string}
            initialProvince={
              // Priority: searchParams > URL location > empty
              ((searchParams.province || searchParams.city) as string) ||
              createSlug(location.city) ||
              ""
            }
            initialWard={
              // Priority: searchParams > URL location > empty
              (searchParams.ward as string) || createSlug(location.ward) || ""
            }
            initialCategory={searchParams.category as string}
            initialPrice={searchParams.price as string}
            initialArea={searchParams.area as string}
            showSearchTypeToggle={true}
          />
        </div>

        {/* Breadcrumb */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {properties.length === 0 ? (
          // No properties found
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-home text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy bất động sản
            </h3>
            <p className="text-gray-600 mb-4">
              Hiện tại chưa có bất động sản nào tại khu vực này.
            </p>
            <Link
              href={`/${transactionType}`}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả bất động sản
            </Link>
          </div>
        ) : (
          <>
            {/* Controls and Stats */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex justify-end items-center">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 whitespace-nowrap">
                    Hiển thị:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700 whitespace-nowrap">
                    / trang
                  </span>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div
              ref={articlesRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {currentProperties.map((property: PropertyData) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  transactionType={transactionType}
                />
              ))}
            </div>

            {/* Results summary and Pagination */}
            {propertiesArray.length > 0 && (
              <div className="mt-8 space-y-4">
                {/* Pagination - always show if there are results */}
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Property Card Component
const PropertyCard = React.memo(
  ({
    property,
    transactionType,
  }: {
    property: PropertyData;
    transactionType: string;
  }) => {
    const createSlug = (text: string | undefined): string => {
      if (!text) return "";
      return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    };

    const generatePropertyUrl = (property: PropertyData): string => {
      const titleSlug = createSlug(property.title);
      const idSlug = `${property._id}-${titleSlug}`;

      // Cập nhật đường dẫn URL theo cấu trúc 2 cấp (tỉnh/thành phố + phường/xã)
      if (property.location?.province && property.location?.ward) {
        return `/${transactionType}/${createSlug(
          property.location.province
        )}/${createSlug(property.location.ward)}/${idSlug}`;
      }

      // Fallback: Nếu chỉ có province (tỉnh/thành)
      if (property.location?.province) {
        return `/${transactionType}/${createSlug(
          property.location.province
        )}/${idSlug}`;
      }

      return `/${transactionType}/chi-tiet/${property._id}`;
    };

    // Tạo location string theo yêu cầu của FavoriteItem
    const locationString = [
      property.location?.ward,
      property.location?.district,
      property.location?.province,
    ]
      .filter(Boolean)
      .join(", ");

    const favoriteItem = {
      id: property._id,
      type: "property" as const,
      title: property.title || "",
      price: property.price ? String(property.price) : "",
      location: locationString, // Convert location object to string
      image: property.images?.[0] || "/placeholder.jpg",
      slug: property.slug || property._id,
      area: property.area ? String(property.area) : "",
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      propertyType:
        typeof property.category === "object"
          ? property.category?.name
          : (property.category as string) || "",
    };

    console.log("property.description:", property.description);

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <Link href={generatePropertyUrl(property)}>
            <div className="relative h-48">
              <Image
                src={property.images?.[0] || "/placeholder.jpg"}
                alt={property.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />
            </div>
          </Link>
          <div className="absolute top-2 right-2">
            <FavoriteButton item={favoriteItem} />
          </div>
          {shouldShowBadge(property.packageId) && (
            <div className="absolute top-2 left-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  getPackageBadge(property.packageId).className
                }`}
              >
                {getPackageBadge(property.packageId).text}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <Link href={generatePropertyUrl(property)}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
          </Link>

          <div className="text-lg font-bold text-red-600 mb-2">
            {(() => {
              if (!property.price || property.price === 0) return "Thỏa thuận";

              const numericPrice =
                typeof property.price === "string"
                  ? parseFloat(property.price.replace(/[^\d]/g, "")) || 0
                  : property.price;

              if (numericPrice === 0) return "Thỏa thuận";

              const priceType =
                transactionType === "cho-thue" ? "cho-thue" : "ban";
              return formatPriceByType(numericPrice, priceType);
            })()}
          </div>

          {/* Địa chỉ và thông tin căn bản cùng hàng */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center flex-1 min-w-0">
              <MdLocationOn className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1 flex-1">
                {[
                  property.location?.ward,
                  property.location?.district,
                  property.location?.province,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            {/* Thông tin area, bed, bath */}
            <div className="flex items-center gap-3 ml-2 flex-shrink-0">
              {property.area && (
                <div className="hidden sm:flex items-center gap-1">
                  <i className="fas fa-ruler-combined text-xs"></i>
                  <span className="text-xs font-medium">{property.area}</span>
                </div>
              )}
              {property.bedrooms !== undefined &&
                property.bedrooms !== null && (
                  <div className="flex items-center gap-1">
                    <i className="fas fa-bed text-xs"></i>
                    <span className="text-xs font-medium">
                      {property.bedrooms}
                    </span>
                  </div>
                )}
              {property.bathrooms !== undefined &&
                property.bathrooms !== null && (
                  <div className="flex items-center gap-1">
                    <i className="fas fa-bath text-xs"></i>
                    <span className="text-xs font-medium">
                      {property.bathrooms}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="text-sm text-gray-500 line-clamp-2 mb-2">
              {property.description}
            </div>
          )}
        </div>
      </div>
    );
  }
);

PropertyCard.displayName = "PropertyCard";
