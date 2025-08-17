"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  newsCategoryService,
  NewsCategory,
} from "@/services/newsCategoryService";
import { toast } from "sonner";

export default function NewsSectionOptimized() {
  const router = useRouter();

  // States
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("newest");

  // UI states
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Data states
  const [categories, setCategories] = useState<NewsCategory[]>([]);

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "most-viewed", label: "Xem nhiều" },
    { value: "featured", label: "Nổi bật" },
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load news categories
        const response = await newsCategoryService.getPublicNewsCategories();
        setCategories(response.data);

        console.log("Loaded news categories:", response.data.length);
      } catch {
        toast.error("Không thể tải danh mục tin tức");
      }
    };
    loadInitialData();
  }, []);

  // Handle search with slug-based URL building
  const handleSearch = useCallback(() => {
    setLoading(true);

    // Build URL params using SLUGS
    const params = new URLSearchParams();

    // Add search term
    if (searchValue && searchValue.trim()) {
      params.append("search", searchValue.trim());
    }

    // Category is already slug-based
    if (selectedCategory) {
      params.append("category", selectedCategory);
    }

    // Sort by
    if (selectedSortBy && selectedSortBy !== "newest") {
      params.append("sort", selectedSortBy);
    }

    // Build final URL
    const baseUrl = "/tin-tuc";
    const queryString = params.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    console.log("News search params (using slugs):", {
      searchValue,
      selectedCategory,
      selectedSortBy,
      finalUrl,
    });

    router.push(finalUrl);
    setLoading(false);
  }, [searchValue, selectedCategory, selectedSortBy, router]);

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      searchValue ||
      selectedCategory ||
      (selectedSortBy && selectedSortBy !== "newest")
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg">
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tin tức bất động sản
          </h2>
          <p className="text-gray-600">
            Cập nhật tin tức mới nhất về thị trường bất động sản
          </p>
        </div>

        {/* Main Search Bar */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức theo tiêu đề, nội dung..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="w-full lg:w-60">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center px-4 py-3 border rounded-lg text-sm font-medium ${
                hasActiveFilters() || showAdvancedFilters
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Bộ lọc
              {hasActiveFilters() && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {
                    [
                      searchValue,
                      selectedCategory,
                      selectedSortBy !== "newest" ? selectedSortBy : null,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="px-4 pb-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Sort By Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sắp xếp theo
                </label>
                <select
                  value={selectedSortBy}
                  onChange={(e) => setSelectedSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional filters can be added here */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setSearchValue("");
                    setSelectedCategory("");
                    setSelectedSortBy("newest");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => {
              setSelectedCategory("");
              handleSearch();
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          {categories.slice(0, 6).map((category) => (
            <button
              key={category._id}
              onClick={() => {
                setSelectedCategory(category.slug);
                handleSearch();
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.slug
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
