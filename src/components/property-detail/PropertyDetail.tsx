"use client";
import React from "react";
import Image from "next/image";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Breadcrumb } from "./Breadcrumb";
import { PropertySpecs } from "./PropertySpecs";
import { PropertyDescription } from "./PropertyDescription";
import { ContactBox } from "./ContactBox";
import { PropertyGallery } from "./PropertyGallery";
import { DisplayMap } from "./DisplayMap";
import { RelatedProperties } from "./RelatedProperties";

export function PropertyDetail({ property }: PropertyDetailProps) {
  console.log("Rendering PropertyDetail with property:", property);
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

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Bán", href: "/ban" },
    { label: "Hà Nội", href: "/ban-ha-noi" },
    { label: property.title, href: "#", isActive: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add padding bottom for mobile fixed contact box */}
      <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <PropertyGallery images={property.images} title={property.title} />

            {/* Breadcrumb */}
            <div className="bg-white rounded-lg p-4 mt-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Property Title & Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex-1">
                  {property.title}
                </h1>
                <FavoriteButton item={favoriteItem} />
              </div>

              <p className="text-gray-600 mb-4">{property.fullLocation}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {property.price}
                  </div>
                  <div className="text-sm text-gray-500">Mức giá</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {property.area}
                  </div>
                  <div className="text-sm text-gray-500">Diện tích</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {property.bedrooms}
                  </div>
                  <div className="text-sm text-gray-500">Phòng ngủ</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {property.bathrooms}
                  </div>
                  <div className="text-sm text-gray-500">Phòng tắm</div>
                </div>
              </div>
            </div>

            {/* Project Info for Mobile/Tablet - ĐỂ LÊN ĐẦU */}
            {property.project && (
              <div className="lg:hidden bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">Thông tin dự án</h3>
                <div className="flex items-start space-x-4">
                  <Image
                    src={property.project.image}
                    alt={property.project.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {property.project.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {property.project.developer}
                    </p>
                    <div className="text-sm text-gray-500">
                      <div>Trạng thái: {property.project.status}</div>
                      <div>Tổng số căn: {property.project.totalUnits}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <PropertyDescription description={property.description} />

            {/* Property Specifications */}
            <PropertySpecs property={property} />

            {/* Map */}
            <DisplayMap
              latitude={property.latitude}
              longitude={property.longitude}
              title={property.title}
              address={property.fullLocation}
            />

            {/* Property Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Thông tin bổ sung</h3>

              {/* Desktop - 1 row */}
              <div className="hidden md:grid md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs mb-1">Ngày đăng</div>
                  <div className="font-medium">{property.postedDate}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs mb-1">Ngày hết hạn</div>
                  <div className="font-medium">{property.expiredDate}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs mb-1">Loại tin</div>
                  <div className="font-medium">{property.postType}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 text-xs mb-1">Mã tin</div>
                  <div className="font-medium">{property.code}</div>
                </div>
              </div>

              {/* Mobile - 2 columns như cũ */}
              <div className="md:hidden grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Ngày đăng:</span>
                  <span className="font-medium">{property.postedDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Ngày hết hạn:</span>
                  <span className="font-medium">{property.expiredDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Loại tin:</span>
                  <span className="font-medium">{property.postType}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Mã tin:</span>
                  <span className="font-medium">{property.code}</span>
                </div>
              </div>
            </div>

            {/* Related Properties */}
            <RelatedProperties currentPropertyId={property.id} />
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="lg:col-span-1">
            {/* Contact Box - Desktop Version */}
            <div className="hidden lg:block">
              <ContactBox
                author={{
                  username: property.author.username,
                  phone: property.author.phoneNumber || "Không rõ",
                  email: property.author.email,
                  avatar: property.author.avatar || "/default-avatar.png",
                  totalListings: property.author.totalListings || 0,
                }}
                propertyId={property.id}
              />
            </div>

            {/* Project Info - Desktop Only */}
            {property.project && (
              <div className="hidden lg:block bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">Thông tin dự án</h3>
                <div className="flex items-start space-x-4">
                  <Image
                    src={property.project.image}
                    alt={property.project.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {property.project.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {property.project.developer}
                    </p>
                    <div className="text-sm text-gray-500">
                      <div>Trạng thái: {property.project.status}</div>
                      <div>Tổng số căn: {property.project.totalUnits}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Box - Mobile/Tablet Version Fixed Bottom */}
      <div className="lg:hidden">
        <ContactBox
          author={{
            username: property.author.username,
            phone: property.author.phoneNumber || "Không rõ",
            email: property.author.email,
            avatar: property.author.avatar || "/default-avatar.png",
            totalListings: property.author.totalListings || 0,
          }}
          propertyId={property.id}
        />
      </div>
    </div>
  );
}
