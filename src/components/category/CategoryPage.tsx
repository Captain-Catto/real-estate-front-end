"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Breadcrumb } from "@/components/property-detail/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import testCardImg from "@/assets/images/card-img.jpg";
import { Menu, Transition, Disclosure } from "@headlessui/react";

interface CategoryPageProps {
  title: string;
  totalCount: number;
  categoryType: "ban" | "cho-thue";
  location?: string;
}

// Mock data for properties with multiple images
const mockProperties = [
  {
    id: "1",
    title: "Bán căn hộ 1PN + 1, 1WC tại The Sapphire 1, 43m2, 2,45 tỷ",
    price: "2,45 tỷ",
    location: "Gia Lâm, Hà Nội",
    images: [
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
    ],
    slug: "ban-can-ho-the-sapphire-1",
    area: "43m²",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "Chung cư",
  },
  {
    id: "2",
    title: "Trực tiếp CĐT Vinhomes - Quỹ căn cuối cùng dự án Vinhomes Cổ Loa",
    price: "23 tỷ",
    location: "Đông Anh, Hà Nội",
    images: [testCardImg, testCardImg, testCardImg, testCardImg, testCardImg],
    slug: "ban-biet-thu-vinhomes-co-loa",
    area: "75m²",
    bedrooms: 4,
    bathrooms: 4,
    propertyType: "Biệt thự",
  },
  {
    id: "3",
    title: "Quỹ căn giá rẻ nhất tại Vinhomes Wonder City cơ hội vàng",
    price: "13,2 tỷ",
    location: "Đan Phượng, Hà Nội",
    images: [
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
    ],
    slug: "ban-lien-ke-vinhomes-wonder-city",
    area: "88m²",
    bedrooms: 4,
    bathrooms: 3,
    propertyType: "Liền kề",
  },
  {
    id: "4",
    title: "Chỉ Từ 700 Triệu Sở Hữu Căn Hộ View Biển Mỹ Khê",
    price: "2,45 tỷ",
    location: "Sơn Trà, Đà Nẵng",
    images: [testCardImg, testCardImg, testCardImg],
    slug: "ban-can-ho-view-bien-my-khe",
    area: "34m²",
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "Condotel",
  },
  {
    id: "5",
    title: "Mở bán căn hộ Citi Grand, Quận 2, TP. HCM",
    price: "2,9 tỷ",
    location: "Quận 2, Hồ Chí Minh",
    images: [
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
      testCardImg,
    ],
    slug: "ban-can-ho-citi-grand",
    area: "55m²",
    bedrooms: 2,
    bathrooms: 2,
    propertyType: "Chung cư",
  },
  {
    id: "6",
    title: "Căn hộ cao cấp The Felix giá chỉ từ 1tỷ5/căn",
    price: "1,5 tỷ",
    location: "Thuận An, Bình Dương",
    images: [testCardImg, testCardImg, testCardImg, testCardImg],
    slug: "ban-can-ho-the-felix",
    area: "46m²",
    bedrooms: 2,
    bathrooms: 1,
    propertyType: "Chung cư",
  },
];

const sortOptions = [
  { value: "0", label: "Mặc định" },
  { value: "8", label: "Tin xác thực xếp trước" },
  { value: "2", label: "Giá thấp đến cao" },
  { value: "3", label: "Giá cao đến thấp" },
  { value: "6", label: "Giá/m² thấp đến cao" },
  { value: "7", label: "Giá/m² cao đến thấp" },
  { value: "4", label: "Diện tích nhỏ đến lớn" },
  { value: "5", label: "Diện tích lớn đến nhỏ" },
];

const priceOptions = [
  { label: "Thỏa thuận", href: "#" },
  { label: "Dưới 500 triệu", href: "#" },
  { label: "500 - 800 triệu", href: "#" },
  { label: "800 triệu - 1 tỷ", href: "#" },
  { label: "1 - 2 tỷ", href: "#" },
  { label: "2 - 3 tỷ", href: "#" },
  { label: "3 - 5 tỷ", href: "#" },
  { label: "5 - 7 tỷ", href: "#" },
  { label: "7 - 10 tỷ", href: "#" },
  { label: "10 - 20 tỷ", href: "#" },
  { label: "20 - 30 tỷ", href: "#" },
  { label: "30 - 40 tỷ", href: "#" },
  { label: "40 - 60 tỷ", href: "#" },
  { label: "Trên 60 tỷ", href: "#" },
];

const areaOptions = [
  { label: "Dưới 30 m²", href: "#" },
  { label: "30 - 50 m²", href: "#" },
  { label: "50 - 80 m²", href: "#" },
  { label: "80 - 100 m²", href: "#" },
  { label: "100 - 150 m²", href: "#" },
  { label: "150 - 200 m²", href: "#" },
  { label: "200 - 250 m²", href: "#" },
  { label: "250 - 300 m²", href: "#" },
  { label: "300 - 500 m²", href: "#" },
  { label: "Trên 500 m²", href: "#" },
];

const bedroomOptions = [
  { label: "1 phòng ngủ", href: "#" },
  { label: "2 phòng ngủ", href: "#" },
  { label: "3 phòng ngủ", href: "#" },
  { label: "4 phòng ngủ", href: "#" },
  { label: "5+ phòng ngủ", href: "#" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function CategoryPage({
  title,
  totalCount,
  categoryType,
  location,
}: CategoryPageProps) {
  const [sortBy, setSortBy] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [formattedCount, setFormattedCount] = useState(totalCount.toString());
  const [weeklyViews, setWeeklyViews] = useState("0");

  const itemsPerPage = 20;

  // Format numbers consistently on client side to avoid hydration mismatch
  useEffect(() => {
    setFormattedCount(new Intl.NumberFormat("vi-VN").format(totalCount));
    // Mock weekly views calculation (in real app, this would come from API)
    const weeklyViewCount = Math.floor(totalCount * 0.15);
    setWeeklyViews(new Intl.NumberFormat("vi-VN").format(weeklyViewCount));
  }, [totalCount]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    {
      label: categoryType === "ban" ? "Bán" : "Cho thuê",
      href: categoryType === "ban" ? "/mua-ban" : "/cho-thue",
    },
    ...(location ? [{ label: location, href: "#" }] : []),
    { label: "Tất cả BĐS trên toàn quốc", href: "#", isActive: true },
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const getCurrentSortLabel = () => {
    return (
      sortOptions.find((option) => option.value === sortBy)?.label || "Mặc định"
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        {/* Total Count, Weekly Views and Sort in one row */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Left side - Count and Views */}
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">
                  Hiện có{" "}
                  <span className="font-semibold text-gray-900">
                    {formattedCount}
                  </span>{" "}
                  bất động sản.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">
                    {weeklyViews}
                  </span>{" "}
                  lượt xem trong tuần này
                </span>
              </div>
            </div>

            {/* Right side - Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="text-sm text-gray-700">
                      {getCurrentSortLabel()}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0"
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
                  </Menu.Button>
                </div>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 sm:right-0 z-50 mt-2 w-full sm:w-64 origin-top-left sm:origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <Menu.Item key={option.value}>
                          {({ active }) => (
                            <button
                              onClick={() => handleSortChange(option.value)}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                sortBy === option.value
                                  ? "bg-blue-50 text-blue-600"
                                  : "",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              {option.label}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Property Listings */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 gap-4 mb-8">
              {mockProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <a href={`/property/${property.slug}`} className="block">
                      {/* Main Image */}
                      <div className="relative h-48 w-full">
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          priority={property.id === "1"}
                        />
                        {/* VIP Badge */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                            VIP VÀNG
                          </span>
                        </div>
                        {/* Image Count Badge */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {property.images.length}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Title */}
                        <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {property.title}
                        </h3>

                        {/* Price and Details */}
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600 mb-3">
                          <span className="text-red-600 font-semibold text-lg whitespace-nowrap">
                            {property.price}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="whitespace-nowrap">
                            {property.area}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="whitespace-nowrap text-xs">
                            26,38 triệu/m²
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-start text-gray-600 mb-3">
                          <svg
                            className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm leading-tight">
                            {property.location}
                          </span>
                        </div>

                        {/* Bottom Contact Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500">
                              Đăng hôm nay
                            </p>
                          </div>
                          <div>
                            <button
                              className="border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Handle favorite logic here
                              }}
                              aria-label="Thêm vào yêu thích"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
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
                      </div>
                    </a>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex">
                    <a
                      href={`/property/${property.slug}`}
                      className="flex w-full"
                    >
                      {/* Property Images */}
                      <div className="w-48 flex-shrink-0">
                        {/* Main Image */}
                        <div className="relative h-32">
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                            fill
                            sizes="192px"
                          />
                          {/* VIP Badge */}
                          <div className="absolute top-2 left-2">
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                              VIP VÀNG
                            </span>
                          </div>
                          {/* Image Count Badge */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {property.images.length}
                          </div>
                        </div>
                        {/* Thumbnail images */}
                        <div className="grid grid-cols-3 h-16 gap-1 mt-1">
                          {property.images.slice(1, 4).map((image, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={image}
                                alt={`${property.title} - ${index + 2}`}
                                className="w-full h-full object-cover"
                                fill
                                sizes="64px"
                              />
                              {/* Overlay for last image if there are more than 4 images */}
                              {index === 2 && property.images.length > 4 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    +{property.images.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="flex-1 p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          <span className="line-clamp-2">{property.title}</span>
                        </h3>

                        {/* Price and Details */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                          <span className="text-red-600 font-semibold text-lg">
                            {property.price}
                          </span>
                          <span>·</span>
                          <span>{property.area}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline">
                            {property.bedrooms} PN
                          </span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline">
                            {property.bathrooms} WC
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-3">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm">{property.location}</span>
                        </div>

                        {/* Description - Hidden on mobile */}
                        <p className="text-gray-600 text-sm mb-3 hidden sm:block">
                          <span className="line-clamp-2">
                            Căn hộ chung cư cao cấp với đầy đủ tiện nghi, vị trí
                            thuận lợi, giao thông kết nối dễ dàng. Căn hộ được
                            thiết kế hiện đại, phù hợp cho gia đình trẻ và nhà
                            đầu tư.
                          </span>
                        </p>

                        {/* Agent Info and Contact */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-xs font-medium">
                                A
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Nguyễn Văn A
                              </p>
                              <p className="text-xs text-gray-500">
                                Đăng hôm nay
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              className="border border-gray-300 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Handle favorite logic here
                              }}
                              aria-label="Thêm vào yêu thích"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
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
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          </div>

          {/* Sidebar Filters - Hidden on tablet and below */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            {/* Price Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div>
                    <Disclosure.Button className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Lọc theo khoảng giá
                      </h2>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
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
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="mt-4 space-y-1">
                        {priceOptions.map((item, index) => (
                          <a
                            key={index}
                            href={item.href}
                            className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            {item.label}
                          </a>
                        ))}
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            </div>

            {/* Area Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div>
                    <Disclosure.Button className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Lọc theo diện tích
                      </h2>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
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
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="mt-4 space-y-1">
                        {areaOptions.map((item, index) => (
                          <a
                            key={index}
                            href={item.href}
                            className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            {item.label}
                          </a>
                        ))}
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            </div>

            {/* Bedroom Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div>
                    <Disclosure.Button className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Lọc theo số phòng ngủ
                      </h2>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
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
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="mt-4 space-y-1">
                        {bedroomOptions.map((item, index) => (
                          <a
                            key={index}
                            href={item.href}
                            className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            {item.label}
                          </a>
                        ))}
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            </div>
          </div>
        </div>

        {/* SEO Description */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {title} Trên Batdongsan.com.vn Tháng 6/2025
          </h2>
          <div className="text-gray-600 space-y-4">
            <p>
              Trong thời gian gần đây, nhu cầu{" "}
              {categoryType === "ban" ? "mua bán" : "cho thuê"} bất động sản tại
              Việt Nam đang tăng cao. Với những lợi thế về mặt địa lý, Việt Nam
              được nhiều người tìm tới để lựa chọn bất động sản, đáp ứng được
              những nhu cầu sinh hoạt của gia đình.
            </p>

            {/* Weekly Views Statistics Box */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Thống kê lượt xem tuần này
                  </p>
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">{weeklyViews}</span> người
                    đã xem các tin đăng trong tuần qua
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Những lưu ý khi {categoryType === "ban" ? "mua bán" : "cho thuê"}{" "}
              bất động sản
            </h3>

            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Xác định mục tiêu và nhu cầu sử dụng bất động sản</li>
              <li>Cân đối ngân sách phù hợp với khả năng tài chính</li>
              <li>Xem xét yếu tố vị trí và tiện ích xung quanh</li>
              <li>So sánh giá cả thị trường từ nhiều nguồn</li>
              <li>Kiểm tra pháp lý đầy đủ và hợp lệ</li>
              <li>Kiểm tra trực tiếp tình trạng bất động sản</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
