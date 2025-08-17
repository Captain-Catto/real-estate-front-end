"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ProjectService } from "@/services/projectService";
import { ProjectListItem } from "@/types/project";
import { Pagination } from "@/components/common/Pagination";
import { useLocationNames } from "@/hooks/useLocationNames";
import Link from "next/link";
import { toast } from "sonner";

interface ProjectListProps {
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  pageSize?: number;
  location?: {
    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
  };
}

export function ProjectList({
  title = "Danh sách dự án",
  showSearch = true,
  showFilters = true,
  pageSize = 12,
  location,
}: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ProjectService.getProjects();

      let filteredProjects = response;

      // Apply search filter
      if (searchTerm) {
        filteredProjects = filteredProjects.filter(
          (project) =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.developer.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter) {
        filteredProjects = filteredProjects.filter(
          (project) => project.status === statusFilter
        );
      }

      // Apply sorting
      filteredProjects.sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "price-asc":
            return (a.priceRange || "").localeCompare(b.priceRange || "");
          case "price-desc":
            return (b.priceRange || "").localeCompare(a.priceRange || "");
          case "newest":
          default:
            return b.name.localeCompare(a.name); // Fallback to name sorting
        }
      });

      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

      setProjects(paginatedProjects);
      setTotalPages(Math.ceil(filteredProjects.length / pageSize));
    } catch {
      toast.error("Có lỗi xảy ra khi tải danh sách dự án");
      setError("Có lỗi xảy ra khi tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy, pageSize]);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchTerm, statusFilter, sortBy, location, fetchProjects]);

  // Component để render project card
  const ProjectCard = ({ project }: { project: ProjectListItem }) => {
    // Use location names hook to get readable location names if structured location is available
    const { locationNames, loading: locationLoading } = useLocationNames(
      project.locationObj?.provinceCode,
      project.locationObj?.wardCode
    );

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Đang cập nhật":
          return "bg-gray-100 text-gray-600";
        case "Sắp mở bán":
          return "bg-yellow-100 text-yellow-600";
        case "Đã bàn giao":
          return "bg-green-100 text-green-600";
        case "Đang bán":
          return "bg-blue-100 text-blue-600";
        default:
          return "bg-gray-100 text-gray-600";
      }
    };

    // Build location display string with fallback logic
    const getLocationDisplay = () => {
      if (locationLoading) {
        return (
          <span className="animate-pulse bg-gray-200 h-4 w-16 rounded inline-block"></span>
        );
      }

      const locationParts = [];

      // Thêm các cấp hành chính theo thứ tự ward -> district -> province (không có address trong ProjectListItem)
      if (locationNames.wardName) locationParts.push(locationNames.wardName);
      if (locationNames.districtName)
        locationParts.push(locationNames.districtName);
      if (locationNames.provinceName)
        locationParts.push(locationNames.provinceName);

      if (locationParts.length > 0) {
        return locationParts.join(", ");
      }

      // Fallback: sử dụng fullLocationName từ API nếu có
      if (locationNames.fullLocationName) {
        return locationNames.fullLocationName;
      }

      // Final fallback: use the original location string
      return project.location;
    };

    if (viewMode === "list") {
      return (
        <Link href={`/du-an/${project.id}`}>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
            <div className="flex gap-6">
              {/* Project Image Placeholder */}
              <div className="relative w-48 h-32 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                <i className="fas fa-building text-gray-400 text-2xl"></i>
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Project Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <div className="text-lg font-bold text-red-600">
                    {project.priceRange || "Liên hệ"}
                  </div>
                </div>

                <p className="text-gray-600 mb-3 flex items-center">
                  <i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>
                  {getLocationDisplay()}
                </p>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <i className="fas fa-building mr-2 text-gray-400"></i>
                    <span>
                      {project.totalUnits?.toLocaleString() || "N/A"} căn
                    </span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-expand-arrows-alt mr-2 text-gray-400"></i>
                    <span>{project.area || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-user-tie mr-2 text-gray-400"></i>
                    <span className="truncate">
                      {project.developer || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Grid variant (default)
    return (
      <Link href={`/du-an/${project.id}`} className="group block">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 border border-gray-200 overflow-hidden">
          {/* Project Image Placeholder */}
          <div className="relative h-48 bg-gray-200 flex items-center justify-center">
            <i className="fas fa-building text-gray-400 text-3xl"></i>
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
          </div>

          {/* Project Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {project.name}
            </h3>

            <p className="text-sm text-gray-600 mb-3 flex items-center">
              <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
              <span className="line-clamp-1">{getLocationDisplay()}</span>
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold text-red-600">
                {project.priceRange || "Liên hệ"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-3">
              <div className="flex items-center">
                <i className="fas fa-building mr-1 text-gray-400"></i>
                <span>{project.totalUnits?.toLocaleString() || "N/A"} căn</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-expand-arrows-alt mr-1 text-gray-400"></i>
                <span>{project.area || "N/A"}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-user-tie mr-2 text-gray-400"></i>
                <span className="font-medium text-blue-600 truncate">
                  {project.developer || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Có lỗi xảy ra
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchProjects}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">
            {loading ? "Đang tải..." : `${projects.length} dự án`}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <i className="fas fa-th-large"></i>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm dự án, địa điểm, chủ đầu tư..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>

            {/* Status Filter */}
            {showFilters && (
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Đang bán">Đang bán</option>
                  <option value="Sắp mở bán">Sắp mở bán</option>
                  <option value="Đã bàn giao">Đã bàn giao</option>
                  <option value="Đang cập nhật">Đang cập nhật</option>
                </select>
              </div>
            )}

            {/* Sort */}
            {showFilters && (
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter) && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Bộ lọc đang áp dụng:
              </span>
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tìm kiếm: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Trạng thái: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("")}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      )}

      {/* Projects Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <i className="fas fa-building"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy dự án nào
          </h3>
          <p className="text-gray-600 mb-4">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
          {(searchTerm || statusFilter) && (
            <button
              onClick={resetFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default ProjectList;
