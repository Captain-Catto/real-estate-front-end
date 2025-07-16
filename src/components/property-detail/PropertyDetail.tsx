"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Breadcrumb } from "../project-detail/Breadcrumb";
import { PropertyGallery } from "./PropertyGallery";
import { ProjectService } from "@/services/projectService";
import { DeveloperService } from "@/services/developerService";
import { Project } from "@/types/project";
import { Developer } from "@/types/developer";
import { DisplayMap } from "./DisplayMap";
import SimilarPosts from "./SimilarPosts";

interface PropertyDetailProps {
  property: {
    id: string;
    title: string;
    price: string;
    currency?: string;
    location: string;
    fullLocation?: string;
    description?: string;
    area?: string;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    propertyType?: string;
    legalDocs?: string;
    furniture?: string;
    houseDirection?: string;
    balconyDirection?: string;
    roadWidth?: string;
    frontWidth?: string;
    postedDate?: string;
    postType?: string;
    images?: string[];
    slug: string;
    locationCode?: {
      province: string;
      district: string;
      ward: string;
    };
    latitude?: number;
    longitude?: number;
    author?: {
      username: string;
      email: string;
      phone: string;
      avatar?: string;
    };
    project?:
      | {
          _id: string;
          name: string;
          slug: string;
          address?: string;
          status?: string;
          priceRange?: string;
          area?: string;
          totalUnits?: number;
          images?: string[];
          latitude?: number;
          longitude?: number;
          developer?: {
            name: string;
            logo?: string;
          };
        }
      | string; // Can be either populated project object or ObjectId string
  };
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
  console.log("property.project:", property.project);

  // State for fetched project data
  const [fetchedProject, setFetchedProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);

  // State for fetched developer data
  const [fetchedDeveloper, setFetchedDeveloper] = useState<Developer | null>(
    null
  );
  const [developerLoading, setDeveloperLoading] = useState(false);

  // Type guard to check if project is populated object
  const isProjectPopulated = (project: unknown): project is Project => {
    return Boolean(
      project &&
        typeof project === "object" &&
        project !== null &&
        "name" in project &&
        "slug" in project
    );
  };

  // Type guard to check if developer is populated object
  const isDeveloperPopulated = (developer: unknown): developer is Developer => {
    return Boolean(
      developer &&
        typeof developer === "object" &&
        developer !== null &&
        "name" in developer &&
        "_id" in developer
    );
  };

  // Effect to fetch project data if only ObjectId is provided
  useEffect(() => {
    const fetchProjectData = async () => {
      if (
        property.project &&
        typeof property.project === "string" &&
        !fetchedProject
      ) {
        setProjectLoading(true);
        try {
          console.log("Fetching project data for ID:", property.project);
          const projectData = await ProjectService.getProjectById(
            property.project
          );
          if (projectData) {
            setFetchedProject(projectData);
            console.log("Project data fetched:", projectData);
          }
        } catch (error) {
          console.error("Error fetching project data:", error);
        } finally {
          setProjectLoading(false);
        }
      }
    };

    fetchProjectData();
  }, [property.project, fetchedProject]);

  // Effect to fetch developer data when we have project with developer ID
  useEffect(() => {
    const fetchDeveloperData = async () => {
      // Get populated project (either from property or fetched)
      const currentProject =
        property.project && isProjectPopulated(property.project)
          ? property.project
          : fetchedProject;

      if (
        currentProject?.developer &&
        typeof currentProject.developer === "string"
      ) {
        setDeveloperLoading(true);
        try {
          console.log(
            "Fetching developer data for ID:",
            currentProject.developer
          );
          const developerData = await DeveloperService.getDeveloperById(
            currentProject.developer
          );
          if (developerData) {
            setFetchedDeveloper(developerData);
            console.log("Developer data fetched:", developerData);
          }
        } catch (error) {
          console.error("Error fetching developer data:", error);
        } finally {
          setDeveloperLoading(false);
        }
      }
    };

    fetchDeveloperData();
  }, [property.project, fetchedProject]);

  // Check if we have a populated project (either from property or fetched)
  const populatedProject =
    property.project && isProjectPopulated(property.project)
      ? property.project
      : fetchedProject;

  console.log("Populated project:", populatedProject);

  // Check if we have a populated developer (either from project or fetched)
  const populatedDeveloper = (() => {
    // If project has populated developer, use it
    if (
      populatedProject?.developer &&
      isDeveloperPopulated(populatedProject.developer)
    ) {
      return populatedProject.developer;
    }
    // Otherwise use fetched developer
    return fetchedDeveloper;
  })();

  console.log("Populated developer:", populatedDeveloper);

  // Check if we should show project section (when project ID exists or populated project is available)
  const shouldShowProject =
    Boolean(property.project) && (populatedProject || projectLoading);

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
            <div className="relative mb-6">
              <PropertyGallery
                images={property.images || []}
                title={property.title}
              />
              {/* Favorite Button Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <FavoriteButton item={favoriteItem} />
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
                {property.bedrooms !== undefined &&
                  property.bedrooms !== null && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {property.bedrooms}
                      </div>
                      <div className="text-sm text-gray-500">Phòng ngủ</div>
                    </div>
                  )}
                {property.bathrooms !== undefined &&
                  property.bathrooms !== null && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {property.bathrooms}
                      </div>
                      <div className="text-sm text-gray-500">Phòng tắm</div>
                    </div>
                  )}
                {property.floors !== undefined && property.floors !== null && (
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

            {/* Project Information - Only show if property has project */}
            {shouldShowProject && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Thông tin dự án</h2>

                {projectLoading || developerLoading ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-lg bg-gray-300 h-24 w-32"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ) : populatedProject ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Project Header with Image */}
                    <div className="flex flex-col lg:flex-row">
                      {/* Project Image */}
                      {populatedProject.images &&
                        populatedProject.images.length > 0 && (
                          <div className="w-full h-64 relative lg:flex-1">
                            <Image
                              src={populatedProject.images[0]}
                              alt={populatedProject.name}
                              fill
                              className="object-cover rounded-t-lg"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/default-project.jpg";
                              }}
                            />
                          </div>
                        )}

                      {/* Project Main Info */}
                      <div className="flex-1 p-4">
                        {/* Project Name and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <h3 className="text-xl font-bold">
                            <Link
                              href={`/du-an/${populatedProject.slug}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {populatedProject.name}
                            </Link>
                          </h3>
                          {populatedProject.status && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap max-w-fit ${
                                populatedProject.status === "Đang bán"
                                  ? "bg-green-100 text-green-800"
                                  : populatedProject.status === "Sắp mở bán"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : populatedProject.status === "Đã bàn giao"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {populatedProject.status}
                            </span>
                          )}
                        </div>

                        {/* Chủ đầu tư: chỉ tên và logo dưới tên dự án */}
                        {populatedDeveloper && (
                          <div className="flex items-center mt-2 mb-2">
                            {populatedDeveloper.logo && (
                              <Image
                                src={populatedDeveloper.logo}
                                alt={populatedDeveloper.name}
                                width={28}
                                height={28}
                                className="inline-block align-middle rounded-full border border-gray-200 bg-white mr-2"
                                unoptimized
                              />
                            )}
                            <Link
                              href={`/chu-dau-tu/${populatedDeveloper._id}`}
                              className="font-semibold text-blue-700 text-sm align-middle hover:underline"
                            >
                              {populatedDeveloper.name}
                            </Link>
                          </div>
                        )}

                        {/* Location */}
                        {populatedProject.address && (
                          <div className="flex items-start mb-3">
                            <i className="fas fa-map-marker-alt text-gray-400 mt-1 mr-2 flex-shrink-0"></i>
                            <span className="text-gray-600 text-sm leading-relaxed">
                              {populatedProject.address}
                            </span>
                          </div>
                        )}

                        {/* Key Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {populatedProject.priceRange && (
                            <div className="flex items-center">
                              <i className="fas fa-tag text-gray-400 mr-2 w-4"></i>
                              <div>
                                <span className="text-gray-600 text-sm">
                                  Giá từ:{" "}
                                </span>
                                <span className="font-semibold text-red-600">
                                  {populatedProject.priceRange}
                                </span>
                              </div>
                            </div>
                          )}

                          {populatedProject.area && (
                            <div className="flex items-center">
                              <i className="fas fa-expand-arrows-alt text-gray-400 mr-2 w-4"></i>
                              <div>
                                <span className="text-gray-600 text-sm">
                                  Diện tích:{" "}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {populatedProject.area}
                                </span>
                              </div>
                            </div>
                          )}

                          {populatedProject.totalUnits && (
                            <div className="flex items-center">
                              <i className="fas fa-building text-gray-400 mr-2 w-4"></i>
                              <div>
                                <span className="text-gray-600 text-sm">
                                  Tổng số căn:{" "}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {populatedProject.totalUnits}
                                </span>
                              </div>
                            </div>
                          )}
                          {/* Mật độ xây dựng */}
                          {populatedProject.density && (
                            <div className="flex items-center">
                              <i className="fas fa-th-large text-gray-400 mr-2 w-4"></i>
                              <div>
                                <span className="text-gray-600 text-sm">
                                  Mật độ xây dựng:{" "}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {populatedProject.density}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                    <p>Không thể tải thông tin dự án</p>
                  </div>
                )}
              </div>
            )}

            {/* Map - Show if property has coordinates OR project has coordinates */}
            {(property.latitude && property.longitude) ||
            (populatedProject?.latitude && populatedProject?.longitude) ? (
              <DisplayMap
                latitude={property.latitude || populatedProject?.latitude}
                longitude={property.longitude || populatedProject?.longitude}
                title={
                  populatedProject
                    ? `${property.title} - ${populatedProject.name}`
                    : property.title
                }
                address={
                  populatedProject?.address ||
                  property.fullLocation ||
                  property.location
                }
              />
            ) : null}

            {/* Similar Properties */}
            <SimilarPosts postId={property.id} limit={6} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-18">
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
