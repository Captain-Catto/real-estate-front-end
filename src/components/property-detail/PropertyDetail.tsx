"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Breadcrumb } from "../project-detail/Breadcrumb";

interface PropertyDetailProps {
  property: any;
  breadcrumbData?: {
    city: string;
    district: string;
    ward: string;
  };
  transactionType?: string;
}

export function PropertyDetail({
  property,
  breadcrumbData,
  transactionType,
}: PropertyDetailProps) {
  console.log("Rendering PropertyDetail with property:", property);
  console.log("breadcrumbData:", breadcrumbData);
  console.log("transactionType:", transactionType);

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

  // ⭐ Tạo breadcrumb từ breadcrumbData hoặc fallback từ property.locationCode
  const createBreadcrumbFromProperty = () => {
    if (
      property.locationCode?.province &&
      property.locationCode?.district &&
      property.locationCode?.ward
    ) {
      return {
        city: property.locationCode.province,
        district: property.locationCode.district,
        ward: property.locationCode.ward,
      };
    }
    return null;
  };

  // Use breadcrumbData if available, otherwise try to create from property data
  const finalBreadcrumbData = breadcrumbData || createBreadcrumbFromProperty();
  const finalTransactionType = transactionType || "mua-ban"; // Default fallback

  console.log("Final breadcrumb data:", finalBreadcrumbData);
  console.log("Final transaction type:", finalTransactionType);

  // Prepare favorite item data
  const favoriteItem = {
    id: property.id,
    type: "property" as const,
    title: property.title,
    price: property.price,
    location: property.location,
    image: property.images?.[0] || "/placeholder.jpg",
    slug: property.slug,
    area: property.area,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    propertyType: property.propertyType,
  };

  // Generate breadcrumb items
  const breadcrumbItems = finalBreadcrumbData
    ? [
        { label: "Trang chủ", href: "/" },
        {
          label: finalTransactionType === "mua-ban" ? "Mua bán" : "Cho thuê",
          href: `/${finalTransactionType}`,
        },
        {
          label: finalBreadcrumbData.city,
          href: `/${finalTransactionType}/${createSlug(
            finalBreadcrumbData.city
          )}`,
        },
        {
          label: finalBreadcrumbData.district,
          href: `/${finalTransactionType}/${createSlug(
            finalBreadcrumbData.city
          )}/${createSlug(finalBreadcrumbData.district)}`,
        },
        {
          label: finalBreadcrumbData.ward,
          href: `/${finalTransactionType}/${createSlug(
            finalBreadcrumbData.city
          )}/${createSlug(finalBreadcrumbData.district)}/${createSlug(
            finalBreadcrumbData.ward
          )}`,
        },
        { label: property.title, href: "#", isActive: true },
      ]
    : [
        // Fallback breadcrumb when no location data available
        { label: "Trang chủ", href: "/" },
        { label: "Bất động sản", href: "/mua-ban" },
        { label: property.title, href: "#", isActive: true },
      ];

  // Generate SEO schema for structured data
  useEffect(() => {
    // Tạo schema data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: property.title,
      description: property.description,
      url: window.location.href,
      image: property.images,
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: property.currency || "VND",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: breadcrumbData?.city || property.location,
        addressRegion: breadcrumbData?.district,
        streetAddress: property.fullLocation,
      },
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.area?.replace(" m²", ""),
        unitCode: "MTK",
      },
      numberOfRooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
    };

    // Tạo script element
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.textContent = JSON.stringify(schemaData);

    // Thêm vào head
    document.head.appendChild(script);

    // Cleanup khi component unmount
    return () => {
      document.head.removeChild(script);
    };
  }, [property, breadcrumbData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add padding bottom for mobile fixed contact box */}
      <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative">
                {property.images && property.images.length > 0 ? (
                  <div className="relative h-96 w-full">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />
                    {/* Image Counter */}
                    {property.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                        1 / {property.images.length}
                      </div>
                    )}
                    {/* Favorite Button */}
                    <div className="absolute top-4 right-4">
                      <FavoriteButton item={favoriteItem} />
                    </div>
                  </div>
                ) : (
                  <div className="h-96 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Không có hình ảnh</span>
                  </div>
                )}

                {/* Additional Images Grid */}
                {property.images && property.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {property.images
                      .slice(1, 5)
                      .map((image: string, index: number) => (
                        <div
                          key={index}
                          className="relative h-20 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <Image
                            src={image}
                            alt={`${property.title} - ${index + 2}`}
                            fill
                            className="object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                          {index === 3 && property.images.length > 5 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                              <span className="text-white text-sm font-medium">
                                +{property.images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Property Title and Price */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-0">
                  {property.title}
                </h1>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-red-600">
                    {property.price}
                  </div>
                  {property.currency && (
                    <div className="text-sm text-gray-500">
                      {property.currency}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-4">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>{property.fullLocation || property.location}</span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                {property.area && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.area}
                    </div>
                    <div className="text-sm text-gray-500">Diện tích</div>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.bedrooms}
                    </div>
                    <div className="text-sm text-gray-500">Phòng ngủ</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.bathrooms}
                    </div>
                    <div className="text-sm text-gray-500">Phòng tắm</div>
                  </div>
                )}
                {property.floors && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.floors}
                    </div>
                    <div className="text-sm text-gray-500">Số tầng</div>
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Chi tiết bất động sản</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.propertyType && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Loại hình:</span>
                    <span className="font-medium">{property.propertyType}</span>
                  </div>
                )}
                {property.legalDocs && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Giấy tờ pháp lý:</span>
                    <span className="font-medium">{property.legalDocs}</span>
                  </div>
                )}
                {property.furniture && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Nội thất:</span>
                    <span className="font-medium">{property.furniture}</span>
                  </div>
                )}
                {property.houseDirection && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Hướng nhà:</span>
                    <span className="font-medium">
                      {property.houseDirection}
                    </span>
                  </div>
                )}
                {property.balconyDirection && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Hướng ban công:</span>
                    <span className="font-medium">
                      {property.balconyDirection}
                    </span>
                  </div>
                )}
                {property.roadWidth && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Đường vào:</span>
                    <span className="font-medium">{property.roadWidth}</span>
                  </div>
                )}
                {property.frontWidth && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mặt tiền:</span>
                    <span className="font-medium">{property.frontWidth}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ngày đăng:</span>
                  <span className="font-medium">{property.postedDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Loại tin:</span>
                  <span className="font-medium">{property.postType}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Mô tả</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              </div>
            )}

            {/* Map */}
            {property.locationCode && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Vị trí trên bản đồ</h2>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">
                    Bản đồ sẽ được hiển thị tại đây
                  </span>
                </div>
              </div>
            )}

            {/* Similar Properties */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Tin đăng tương tự</h3>
              <div className="space-y-4">
                {/* Placeholder cho similar properties */}
                <div className="text-center text-gray-500 py-8">
                  Đang tải các tin đăng tương tự...
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>

              {/* Author Info */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  {property.author?.avatar ? (
                    <Image
                      src={property.author.avatar}
                      alt={property.author.username}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {property.author?.username?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {property.author?.username || "Không rõ"}
                  </div>
                  <div className="text-sm text-gray-500">Người đăng</div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                {property.author?.phone && (
                  <div className="flex items-center">
                    <i className="fas fa-phone text-gray-400 w-5"></i>
                    <a
                      href={`tel:${property.author.phone}`}
                      className="ml-3 text-blue-600 hover:text-blue-700"
                    >
                      {property.author.phone}
                    </a>
                  </div>
                )}
                {property.author?.email && (
                  <div className="flex items-center">
                    <i className="fas fa-envelope text-gray-400 w-5"></i>
                    <a
                      href={`mailto:${property.author.email}`}
                      className="ml-3 text-blue-600 hover:text-blue-700"
                    >
                      {property.author.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  <i className="fas fa-phone mr-2"></i>
                  Gọi điện tư vấn
                </button>
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  <i className="fab fa-whatsapp mr-2"></i>
                  Chat Zalo
                </button>
                <button className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  <i className="fas fa-share mr-2"></i>
                  Chia sẻ
                </button>
              </div>

              {/* Report */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  <i className="fas fa-flag mr-1"></i>
                  Báo cáo tin đăng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Contact Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium">
            <i className="fas fa-phone mr-2"></i>
            Gọi ngay
          </button>
          <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium">
            <i className="fab fa-whatsapp mr-2"></i>
            Chat
          </button>
          <div className="flex items-center">
            <FavoriteButton item={favoriteItem} />
          </div>
        </div>
      </div>
    </div>
  );
}
