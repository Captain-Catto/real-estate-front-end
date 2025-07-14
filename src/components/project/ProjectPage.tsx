"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/property-detail/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import { ProjectSearchBar } from "./ProjectSearchBar";
import { ProjectNews } from "./ProjectNews";
import { LocationNavigationBar } from "./LocationNavigationBar";
import { LocationSearch } from "./LocationSearch";
import { ProjectListCard } from "./ProjectListCard";
import { useProjects } from "@/hooks/useProjects";
import { useLocationNames } from "@/hooks/useLocationNames";
import { Menu, Transition } from "@headlessui/react";
import Header from "../header/Header";
import Footer from "../footer/Footer";

interface ProjectPageProps {
  title: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
}

const sortOptions = [
  { value: "1", label: "Mới nhất" },
  { value: "2", label: "Mới cập nhật" },
  { value: "3", label: "Giá cao nhất" },
  { value: "4", label: "Giá thấp nhất" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function ProjectPage({
  title,
  provinceCode,
  districtCode,
  wardCode,
}: ProjectPageProps) {
  const [sortBy, setSortBy] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Use hook to fetch projects based on location
  const {
    projects,
    loading,
    error,
    totalCount: actualTotalCount,
    totalPages: apiTotalPages,
  } = useProjects({
    provinceCode,
    districtCode,
    wardCode,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
  });

  // Get location names for breadcrumb
  const { locationNames } = useLocationNames(
    provinceCode,
    districtCode,
    wardCode
  );

  // Format numbers consistently
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Build dynamic breadcrumb based on location
  const buildBreadcrumb = () => {
    const items: Array<{ label: string; href: string; isActive?: boolean }> = [
      { label: "Trang chủ", href: "/" },
      { label: "Dự án", href: "/du-an" },
    ];

    // Add province level
    if (provinceCode && locationNames.provinceName) {
      items.push({
        label: locationNames.provinceName,
        href: `/du-an?provinceCode=${provinceCode}`,
      });

      // Add district level
      if (districtCode && locationNames.districtName) {
        items.push({
          label: locationNames.districtName,
          href: `/du-an?provinceCode=${provinceCode}&districtCode=${districtCode}`,
        });

        // Add ward level
        if (wardCode && locationNames.wardName) {
          items.push({
            label: locationNames.wardName,
            href: `/du-an?provinceCode=${provinceCode}&districtCode=${districtCode}&wardCode=${wardCode}`,
            isActive: true,
          });
        } else {
          // District is the most specific level
          items[items.length - 1].isActive = true;
        }
      } else {
        // Province is the most specific level
        items[items.length - 1].isActive = true;
      }
    } else {
      // Default - all projects
      items[items.length - 1].isActive = true;
    }

    return items;
  };

  // Build dynamic title based on location
  const getPageTitle = () => {
    if (wardCode && locationNames.wardName) {
      return `Dự án tại ${locationNames.wardName}, ${locationNames.districtName}, ${locationNames.provinceName}`;
    } else if (districtCode && locationNames.districtName) {
      return `Dự án tại ${locationNames.districtName}, ${locationNames.provinceName}`;
    } else if (provinceCode && locationNames.provinceName) {
      return `Dự án tại ${locationNames.provinceName}`;
    }
    return title;
  };

  // Get appropriate count text based on location level
  const getCountText = () => {
    const count = actualTotalCount; // Always use actual count from API
    if (wardCode && locationNames.wardName) {
      return `${formatNumber(count)} dự án tại ${locationNames.wardName}`;
    } else if (districtCode && locationNames.districtName) {
      return `${formatNumber(count)} dự án tại ${locationNames.districtName}`;
    } else if (provinceCode && locationNames.provinceName) {
      return `${formatNumber(count)} dự án tại ${locationNames.provinceName}`;
    }
    return `${formatNumber(count)} dự án toàn quốc`;
  };

  // Breadcrumb items
  const breadcrumbItems = buildBreadcrumb();
  const pageTitle = getPageTitle();
  const countText = getCountText();

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const getCurrentSortLabel = () => {
    return (
      sortOptions.find((option) => option.value === sortBy)?.label || "Mới nhất"
    );
  };

  // Pagination logic
  const totalPages =
    apiTotalPages || Math.ceil(actualTotalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Search Bar */}
          <ProjectSearchBar />

          {/* Location Search */}
          <LocationSearch
            currentProvinceCode={provinceCode}
            currentDistrictCode={districtCode}
            currentWardCode={wardCode}
          />

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Project Listings */}
            <div className="flex-1">
              {/* Breadcrumb */}
              <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} />
              </div>

              {/* Location Navigation Bar */}
              <LocationNavigationBar
                provinceCode={provinceCode}
                districtCode={districtCode}
                wardCode={wardCode}
                currentCount={actualTotalCount}
              />

              {/* Page Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {pageTitle}
              </h1>

              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {/* Project Count */}
                <div>
                  <span className="text-gray-700">
                    Hiện đang có{" "}
                    <span className="font-semibold text-gray-900">
                      {countText}
                    </span>
                  </span>
                </div>

                {/* Sort Dropdown */}
                <div className="w-full sm:w-auto">
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span>{getCurrentSortLabel()}</span>
                        <svg
                          className="w-4 h-4 ml-2 text-gray-500"
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
                      <Menu.Items className="absolute left-0 sm:right-0 z-50 mt-2 w-full sm:w-48 origin-top-left sm:origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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

              {/* Project List */}
              {loading ? (
                <div className="space-y-4 mb-8">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                    >
                      <div className="flex gap-6">
                        <div className="w-48 h-32 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                    <div>
                      <h3 className="text-red-800 font-medium">
                        Có lỗi xảy ra
                      </h3>
                      <p className="text-red-600 text-sm mt-1">
                        Không thể tải danh sách dự án. Vui lòng thử lại sau.
                      </p>
                    </div>
                  </div>
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {projects.map((project) => (
                    <ProjectListCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-search text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy dự án nào
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {wardCode && locationNames.wardName
                      ? `Hiện tại chưa có dự án nào tại ${locationNames.wardName}`
                      : districtCode && locationNames.districtName
                      ? `Hiện tại chưa có dự án nào tại ${locationNames.districtName}`
                      : provinceCode && locationNames.provinceName
                      ? `Hiện tại chưa có dự án nào tại ${locationNames.provinceName}`
                      : "Hiện tại chưa có dự án nào phù hợp với tiêu chí tìm kiếm"}
                  </p>
                  <div className="flex justify-center gap-4">
                    {(districtCode || wardCode) && (
                      <Link
                        href={`/du-an?provinceCode=${provinceCode}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <i className="fas fa-expand-alt mr-2"></i>
                        Xem tất cả tại {locationNames.provinceName}
                      </Link>
                    )}
                    <Link
                      href="/du-an"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <i className="fas fa-globe mr-2"></i>
                      Xem tất cả dự án
                    </Link>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mb-8"
              />
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <ProjectNews />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
