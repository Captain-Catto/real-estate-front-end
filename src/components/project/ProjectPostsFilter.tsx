"use client";
import React, { useState, useEffect } from "react";
import { categoryService, Category } from "@/services/categoryService";
import { ProjectPostFilters } from "@/hooks/useProjectPosts";
import { toast } from "sonner";

interface ProjectPostsFilterProps {
  currentFilters: ProjectPostFilters;
  onFilterChange: (filters: ProjectPostFilters) => void;
  totalCount?: number;
}

// Predefined options (we'll replace these with API calls later)
const priceOptions = [
  { value: "", label: "Tất cả mức giá" },
  { value: "under-1", label: "Dưới 1 tỷ" },
  { value: "1-2", label: "1 - 2 tỷ" },
  { value: "2-3", label: "2 - 3 tỷ" },
  { value: "3-5", label: "3 - 5 tỷ" },
  { value: "5-10", label: "5 - 10 tỷ" },
  { value: "over-10", label: "Trên 10 tỷ" },
];

const areaOptions = [
  { value: "", label: "Tất cả diện tích" },
  { value: "under-50", label: "Dưới 50m²" },
  { value: "50-100", label: "50 - 100m²" },
  { value: "100-150", label: "100 - 150m²" },
  { value: "150-200", label: "150 - 200m²" },
  { value: "over-200", label: "Trên 200m²" },
];

// Predefined options
const bedroomOptions = [
  { value: "", label: "Tất cả phòng ngủ" },
  { value: "1", label: "1 phòng ngủ" },
  { value: "2", label: "2 phòng ngủ" },
  { value: "3", label: "3 phòng ngủ" },
  { value: "4", label: "4 phòng ngủ" },
  { value: "5", label: "5+ phòng ngủ" },
];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-low", label: "Giá thấp nhất" },
  { value: "price-high", label: "Giá cao nhất" },
  { value: "area-small", label: "Diện tích nhỏ nhất" },
  { value: "area-large", label: "Diện tích lớn nhất" },
  { value: "most-viewed", label: "Xem nhiều nhất" },
];

export default function ProjectPostsFilter({
  currentFilters,
  onFilterChange,
  totalCount = 0,
}: ProjectPostsFilterProps) {
  // States for dynamic options
  const [categories, setCategories] = useState<Category[]>([]);

  // Local filter states
  const [localFilters, setLocalFilters] =
    useState<ProjectPostFilters>(currentFilters);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load categories (only for properties, not projects)
        const categoriesData = await categoryService.getCategories();
        const propertyCategories = categoriesData.filter(
          (cat: Category) => !cat.isProject
        );
        setCategories(propertyCategories);

        console.log("Loaded property categories:", propertyCategories.length);
      } catch {
        toast.error("Không thể tải danh sách loại bất động sản");
      }
    };

    loadInitialData();
  }, []);

  // Update local filters when currentFilters change
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // Handle filter change
  const handleFilterChange = (
    key: keyof ProjectPostFilters,
    value: string | number | undefined
  ) => {
    const updatedFilters = {
      ...localFilters,
      [key]: value === "" || value === undefined ? undefined : value,
    };

    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Handle reset
  const handleReset = () => {
    const resetFilters: ProjectPostFilters = {};
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      localFilters.type ||
      localFilters.category ||
      localFilters.priceRange ||
      localFilters.areaRange ||
      localFilters.bedrooms ||
      localFilters.bathrooms ||
      (localFilters.sortBy && localFilters.sortBy !== "newest")
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Lọc tin đăng ({totalCount} kết quả)
        </h3>
        {hasActiveFilters() && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Transaction Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Loại giao dịch
          </label>
          <select
            value={localFilters.type || ""}
            onChange={(e) =>
              handleFilterChange("type", e.target.value as "ban" | "cho-thue")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="">Tất cả</option>
            <option value="ban">Bán</option>
            <option value="cho-thue">Cho thuê</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Loại BDS
          </label>
          <select
            value={localFilters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="">Tất cả loại BDS</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Mức giá
          </label>
          <select
            value={localFilters.priceRange || ""}
            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            {priceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Area Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Diện tích
          </label>
          <select
            value={localFilters.areaRange || ""}
            onChange={(e) => handleFilterChange("areaRange", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            {areaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Phòng ngủ
          </label>
          <select
            value={localFilters.bedrooms?.toString() || ""}
            onChange={(e) =>
              handleFilterChange(
                "bedrooms",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            {bedroomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sắp xếp theo
          </label>
          <select
            value={localFilters.sortBy || "newest"}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium">Bộ lọc:</span>

            {localFilters.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {localFilters.type === "ban" ? "Bán" : "Cho thuê"}
              </span>
            )}

            {localFilters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {
                  categories.find((cat) => cat._id === localFilters.category)
                    ?.name
                }
              </span>
            )}

            {localFilters.priceRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {
                  priceOptions.find(
                    (opt) => opt.value === localFilters.priceRange
                  )?.label
                }
              </span>
            )}

            {localFilters.areaRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                {
                  areaOptions.find(
                    (opt) => opt.value === localFilters.areaRange
                  )?.label
                }
              </span>
            )}

            {localFilters.bedrooms && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                {localFilters.bedrooms} phòng ngủ
              </span>
            )}

            {localFilters.sortBy && localFilters.sortBy !== "newest" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                {
                  sortOptions.find((opt) => opt.value === localFilters.sortBy)
                    ?.label
                }
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
