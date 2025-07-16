// Component mới để hiển thị danh sách bất động sản theo địa điểm

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Breadcrumb } from "../project-detail/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import SearchSection from "@/components/home/SearchSection";
import { locationService } from "@/services/locationService";

interface PropertyListingProps {
  properties: any[];
  location: {
    city: string;
    district: string;
    ward: string;
  };
  transactionType: string;
  level: "city" | "district" | "ward";
  searchParams?: {
    city?: string;
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
  const [locationData, setLocationData] = useState<{
    initialCity: any | null;
    initialDistricts: any[];
    initialWard: any | null;
  }>({
    initialCity: null,
    initialDistricts: [],
    initialWard: null,
  });
  const itemsPerPage = 20;

  // Fetch location data để populate vào SearchSection
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Convert location names thành proper Location objects với codes
        let cityData = null;
        let districtsData: any[] = [];
        let wardData = null;

        // Fetch city data nếu có
        if (location.city) {
          // Sử dụng locationService để tìm city theo tên
          const provinces = await locationService.getProvinces();
          cityData = provinces.find(
            (p) => p.name === location.city || p.codename === searchParams.city
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

        // Fetch ward data nếu có
        if (location.ward && districtsData.length > 0) {
          const wards = await locationService.getWards(
            cityData?.code || "",
            districtsData[0].code
          );
          wardData = wards.find(
            (w) => w.name === location.ward || w.codename === searchParams.ward
          );
        }

        setLocationData({
          initialCity: cityData,
          initialDistricts: districtsData,
          initialWard: wardData,
        });
      } catch (error) {
        console.error("Error fetching location data:", error);
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
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Generate URL cho property detail
  const generatePropertyUrl = (property: any): string => {
    const titleSlug = createSlug(property.title);
    const idSlug = `${property._id}-${titleSlug}`;

    if (
      property.location?.province &&
      property.location?.district &&
      property.location?.ward
    ) {
      return `/${transactionType}/${createSlug(
        property.location.province
      )}/${createSlug(property.location.district)}/${createSlug(
        property.location.ward
      )}/${idSlug}`;
    }

    return `/mua-ban/${property._id}`;
  };

  // Generate breadcrumb items
  const breadcrumbItems = [
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

  if (location.district) {
    breadcrumbItems.push({
      label: location.district,
      href: `/${transactionType}/${createSlug(location.city)}/${createSlug(
        location.district
      )}`,
      isActive: level === "district",
    });
  }

  if (location.ward) {
    breadcrumbItems.push({
      label: location.ward,
      href: `/${transactionType}/${createSlug(location.city)}/${createSlug(
        location.district
      )}/${createSlug(location.ward)}`,
      isActive: level === "ward",
    });
  }

  // Pagination logic
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListings",
            name: getPageTitle(),
            description: `Danh sách ${properties.length} bất động sản ${
              transactionType === "mua-ban" ? "bán" : "cho thuê"
            } tại ${location.ward ? `${location.ward}, ` : ""}${
              location.district ? `${location.district}, ` : ""
            }${location.city}`,
            numberOfItems: properties.length,
            itemListElement: currentProperties.map((property, index) => ({
              "@type": "RealEstateListing",
              position: startIndex + index + 1,
              name: property.title,
              url: `${
                typeof window !== "undefined" ? window.location.origin : ""
              }${generatePropertyUrl(property)}`,
            })),
          }),
        }}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <SearchSection
            initialSearchType={transactionType === "mua-ban" ? "buy" : "rent"}
            initialCity={locationData.initialCity}
            initialDistricts={locationData.initialDistricts}
            initialWard={locationData.initialWard}
            initialCategory={searchParams.category as string}
            initialPrice={searchParams.price as string}
            initialArea={searchParams.area as string}
          />
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
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentProperties.map((property: any) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  transactionType={transactionType}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
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
    property: any;
    transactionType: string;
  }) => {
    const createSlug = (text: string): string => {
      if (!text) return "";
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    };

    const generatePropertyUrl = (property: any): string => {
      const titleSlug = createSlug(property.title);
      const idSlug = `${property._id}-${titleSlug}`;

      if (
        property.location?.province &&
        property.location?.district &&
        property.location?.ward
      ) {
        return `/${transactionType}/${createSlug(
          property.location.province
        )}/${createSlug(property.location.district)}/${createSlug(
          property.location.ward
        )}/${idSlug}`;
      }

      return `/mua-ban/${property._id}`;
    };

    const favoriteItem = {
      id: property._id,
      type: "property" as const,
      title: property.title,
      price: property.price,
      location: property.location,
      image: property.images?.[0] || "/placeholder.jpg",
      slug: property.slug || property._id, // Added missing slug
      area: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      propertyType:
        typeof property.category === "object"
          ? property.category?.name
          : property.category,
    };

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
          {property.packageId && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                VIP
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
            {property.price
              ? `${property.price} ${property.currency || "VND"}`
              : "Thỏa thuận"}
          </div>

          <div className="flex items-center text-gray-600 text-sm mb-3">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span className="line-clamp-1">
              {[
                property.location?.ward,
                property.location?.district,
                property.location?.province,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            {property.area && (
              <div className="text-center">
                <div className="font-medium">{property.area} m²</div>
              </div>
            )}
            {property.bedrooms && (
              <div className="text-center">
                <div className="font-medium">{property.bedrooms} PN</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center">
                <div className="font-medium">{property.bathrooms} PT</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PropertyCard.displayName = "PropertyCard";
