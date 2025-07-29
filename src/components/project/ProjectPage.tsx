"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/property-detail/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import ProjectSearchFilter from "./ProjectSearchFilter";
import { ProjectNews } from "./ProjectNews";
import { LocationNavigationBar } from "./LocationNavigationBar";
import { ProjectListCard } from "./ProjectListCard";
import { DeveloperInfo } from "./DeveloperInfo";
import { useProjects } from "@/hooks/useProjects";
import { useLocationNames } from "@/hooks/useLocationNames";
import { DeveloperService } from "@/services/developerService";
import { Developer } from "@/types/developer";
import Header from "../header/Header";
import Footer from "../footer/Footer";

interface ProjectPageProps {
  title: string;
  search?: string;
  provinceCode?: string;
  wardCode?: string;
  categoryId?: string;
  priceRange?: string;
  areaRange?: string;
  status?: string;
  sortBy?: string;
  developerId?: string;
}

export function ProjectPage({
  title,
  search,
  provinceCode,
  wardCode,
  categoryId,
  priceRange,
  areaRange,
  status,
  sortBy: initialSortBy,
  developerId,
}: ProjectPageProps) {
  const [currentSortBy] = useState(initialSortBy || "newest");
  const [currentPage, setCurrentPage] = useState(1);

  // State for developer information
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loadingDeveloper, setLoadingDeveloper] = useState(false);
  const [developerError, setDeveloperError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Use hook to fetch projects based on all filters
  const {
    projects,
    loading,
    error,
    totalCount: actualTotalCount,
    totalPages: apiTotalPages,
  } = useProjects({
    search,
    provinceCode,
    wardCode,
    categoryId,
    priceRange,
    areaRange,
    status,
    page: currentPage,
    limit: itemsPerPage,
    sortBy: currentSortBy,
  });

  console.log("Projects fetched:", projects);

  // Fetch developer information when developerId is provided
  useEffect(() => {
    const fetchDeveloper = async () => {
      if (!developerId) {
        setDeveloper(null);
        return;
      }

      setLoadingDeveloper(true);
      setDeveloperError(null);

      try {
        const developerData = await DeveloperService.getDeveloperById(
          developerId
        );
        console.log("Fetched developer data:", developerData);
        setDeveloper(developerData);
      } catch (error) {
        console.error("Error fetching developer:", error);
        setDeveloperError("Không thể tải thông tin chủ đầu tư");
      } finally {
        setLoadingDeveloper(false);
      }
    };

    fetchDeveloper();
  }, [developerId]);

  // Get location names for breadcrumb
  const { locationNames } = useLocationNames(provinceCode, undefined, wardCode);

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

      // Add ward level
      if (wardCode && locationNames.wardName) {
        items.push({
          label: locationNames.wardName,
          href: `/du-an?provinceCode=${provinceCode}&wardCode=${wardCode}`,
          isActive: true,
        });
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
      return `Dự án tại ${locationNames.wardName}, ${locationNames.provinceName}`;
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
    } else if (provinceCode && locationNames.provinceName) {
      return `${formatNumber(count)} dự án tại ${locationNames.provinceName}`;
    }
    return `${formatNumber(count)} dự án toàn quốc`;
  };

  // Breadcrumb items
  const breadcrumbItems = buildBreadcrumb();
  const pageTitle = getPageTitle();
  const countText = getCountText();

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
          {/* Integrated Search Filter */}
          <ProjectSearchFilter
            currentProvinceCode={provinceCode}
            currentWardCode={wardCode}
            currentCategory={categoryId}
            currentPrice={priceRange}
            currentArea={areaRange}
            currentStatus={status}
            currentSort={currentSortBy}
            currentSearch={search}
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
                wardCode={wardCode}
                currentCount={actualTotalCount}
              />

              {/* Page Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {pageTitle}
              </h1>

              {/* Developer Information */}
              {developerId && developer && (
                <div className="mb-6">
                  <DeveloperInfo
                    developer={developer}
                    loading={loadingDeveloper}
                    error={developerError || undefined}
                  />
                </div>
              )}

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
                      : provinceCode && locationNames.provinceName
                      ? `Hiện tại chưa có dự án nào tại ${locationNames.provinceName}`
                      : "Hiện tại chưa có dự án nào phù hợp với tiêu chí tìm kiếm"}
                  </p>
                  <div className="flex justify-center gap-4">
                    {wardCode && (
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
