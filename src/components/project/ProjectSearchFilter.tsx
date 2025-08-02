"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { locationService } from "@/services/locationService";
import { categoryService, Category } from "@/services/categoryService";
import { priceRangeService, PriceRange } from "@/services/priceService";
import { areaService, AreaRange } from "@/services/areaService";
import { Location } from "@/types/location";

interface ProjectSearchFilterProps {
  currentProvince?: string;
  currentWard?: string;
  currentCategory?: string;
  currentPrice?: string;
  currentArea?: string;
  currentStatus?: string;
  currentSort?: string;
  currentSearch?: string;
  onFilterChange?: (filters: ProjectFilters) => void;
}

interface ProjectFilters {
  search?: string;
  province?: string;
  ward?: string;
  category?: string;
  priceRange?: string;
  areaRange?: string;
  status?: string;
  sortBy?: string;
}

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Sắp mở bán", label: "Sắp mở bán" },
  { value: "Đang bán", label: "Đang mở bán" },
  { value: "Đã bàn giao", label: "Đã bàn giao" },
  { value: "Tạm ngưng", label: "Tạm ngưng" },
];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "updated", label: "Mới cập nhật" },
  { value: "price-high", label: "Giá cao nhất" },
  { value: "price-low", label: "Giá thấp nhất" },
  { value: "area-large", label: "Diện tích lớn nhất" },
  { value: "area-small", label: "Diện tích nhỏ nhất" },
  { value: "name-asc", label: "Tên A-Z" },
  { value: "name-desc", label: "Tên Z-A" },
];

export default function ProjectSearchFilter({
  currentProvince,
  currentWard,
  currentCategory,
  currentPrice,
  currentArea,
  currentStatus,
  currentSort,
  currentSearch,
  onFilterChange,
}: ProjectSearchFilterProps) {
  const router = useRouter();

  // Location states
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Dynamic options from API
  const [priceOptions, setPriceOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Tất cả mức giá" }]);
  const [areaOptions, setAreaOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Tất cả diện tích" }]);

  // Filter states - Convert slugs to codes for internal state
  const [searchValue, setSearchValue] = useState(currentSearch || "");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(currentPrice || "");
  const [selectedArea, setSelectedArea] = useState(currentArea || "");
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");
  const [selectedSort, setSelectedSort] = useState(currentSort || "newest");

  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load provinces
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);

        // Load project categories
        const categoriesData = await categoryService.getCategories();
        const projectCategories = categoriesData.filter(
          (cat: Category) => cat.isProject
        );
        setCategories(projectCategories);

        console.log("Loaded provinces:", provincesData.length);
        console.log("Loaded project categories:", projectCategories.length);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    loadInitialData();
  }, []);

  // Convert current slug props to codes when data is loaded
  useEffect(() => {
    if (provinces.length === 0 || categories.length === 0) return;

    // Convert province slug to code
    if (currentProvince) {
      const provinceObj = provinces.find(
        (p) =>
          p.slug === currentProvince ||
          p.slug === `tinh-${currentProvince}` ||
          p.slug === `thanh-pho-${currentProvince}`
      );
      if (provinceObj) {
        setSelectedProvince(provinceObj.code);
        console.log(
          `Province slug "${currentProvince}" -> code "${provinceObj.code}"`
        );
      }
    }

    // Convert category slug to ID
    if (currentCategory) {
      const categoryObj = categories.find((c) => c.slug === currentCategory);
      if (categoryObj) {
        setSelectedCategory(categoryObj._id);
        console.log(
          `Category slug "${currentCategory}" -> ID "${categoryObj._id}"`
        );
      }
    }
  }, [provinces, categories, currentProvince, currentCategory]);

  // Load wards and convert ward slug when province is selected
  useEffect(() => {
    if (selectedProvince) {
      const loadWards = async () => {
        try {
          // Use getWardsFromProvince to get all wards directly from province
          const wardsData = await locationService.getWardsFromProvince(
            selectedProvince
          );
          setWards(wardsData);
          console.log("Loaded wards for province:", wardsData.length);

          // Convert ward slug to code if provided
          if (currentWard) {
            const wardObj = wardsData.find(
              (w) =>
                w.slug === currentWard ||
                w.slug === currentWard.replace(/-/g, "_")
            );
            if (wardObj) {
              setSelectedWard(wardObj.code);
              console.log(
                `Ward slug "${currentWard}" -> code "${wardObj.code}"`
              );
            }
          }
        } catch (error) {
          console.error("Error loading wards:", error);
          setWards([]);
        }
      };
      loadWards();
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedProvince, currentWard]);

  // Load price and area options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load project price ranges
        const projectPriceRanges = await priceRangeService.getByType("project");
        const priceOptionsList = [
          { value: "", label: "Tất cả mức giá" },
          ...projectPriceRanges.map((range: PriceRange) => ({
            value: range.slug || range.id,
            label: range.name,
          })),
        ];
        setPriceOptions(priceOptionsList);
      } catch (error) {
        console.error("Error loading price ranges:", error);
        // Keep default price options if API fails
      }

      try {
        // Load project area ranges
        const projectAreaRanges = await areaService.getByType("project");
        const areaOptionsList = [
          { value: "", label: "Tất cả diện tích" },
          ...projectAreaRanges.map((range: AreaRange) => ({
            value: range.slug || range.id,
            label: range.name,
          })),
        ];
        setAreaOptions(areaOptionsList);
      } catch (error) {
        console.error("Error loading area ranges:", error);
        // Keep default area options if API fails
      }
    };

    loadOptions();
  }, []);

  // Handle search
  const handleSearch = () => {
    setLoading(true);

    // Build URL params - SỬ DỤNG SLUG THAY VÌ CODE/ID
    const params = new URLSearchParams();

    // Thêm search vào URL params
    if (searchValue && searchValue.trim()) {
      params.append("search", searchValue.trim());
    }

    // Sử dụng province slug thay vì provinceCode
    if (selectedProvince) {
      const provinceObj = provinces.find((p) => p.code === selectedProvince);
      if (provinceObj?.slug) {
        params.append("province", provinceObj.slug);
      }
    }

    // Sử dụng ward slug thay vì wardCode
    if (selectedWard) {
      const wardObj = wards.find((w) => w.code === selectedWard);
      if (wardObj?.slug) {
        params.append("ward", wardObj.slug);
      }
    }

    // Sử dụng category slug thay vì categoryId
    if (selectedCategory) {
      const categoryObj = categories.find((c) => c._id === selectedCategory);
      if (categoryObj?.slug) {
        params.append("category", categoryObj.slug);
      }
    }

    if (selectedPrice) params.append("priceRange", selectedPrice);
    if (selectedArea) params.append("areaRange", selectedArea);
    if (selectedStatus) params.append("status", selectedStatus);
    if (selectedSort && selectedSort !== "newest")
      params.append("sortBy", selectedSort);

    const queryString = params.toString();
    const url = queryString ? `/du-an?${queryString}` : "/du-an";

    console.log("Search params (using slugs):", {
      searchValue,
      provinceSlug: provinces.find((p) => p.code === selectedProvince)?.slug,
      wardSlug: wards.find((w) => w.code === selectedWard)?.slug,
      categorySlug: categories.find((c) => c._id === selectedCategory)?.slug,
      selectedPrice,
      selectedArea,
      selectedStatus,
      selectedSort,
      url,
    });

    // Prepare filters for callback with slugs
    const filters: ProjectFilters = {
      search: searchValue || undefined,
      province: provinces.find((p) => p.code === selectedProvince)?.slug,
      ward: wards.find((w) => w.code === selectedWard)?.slug,
      category: categories.find((c) => c._id === selectedCategory)?.slug,
      priceRange: selectedPrice || undefined,
      areaRange: selectedArea || undefined,
      status: selectedStatus || undefined,
      sortBy: selectedSort,
    };

    // Call onFilterChange if provided
    if (onFilterChange) {
      onFilterChange(filters);
    }

    router.push(url);
    setLoading(false);
  };

  // Handle reset
  const handleReset = () => {
    setSearchValue("");
    setSelectedProvince("");
    setSelectedWard("");
    setSelectedCategory("");
    setSelectedPrice("");
    setSelectedArea("");
    setSelectedStatus("");
    setSelectedSort("newest");
    setShowAdvancedFilters(false);

    router.push("/du-an");
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      searchValue ||
      selectedProvince ||
      selectedWard ||
      selectedCategory ||
      selectedPrice ||
      selectedArea ||
      selectedStatus ||
      (selectedSort && selectedSort !== "newest")
    );
  };

  // Get display texts
  const getSelectedProvinceText = () => {
    const province = provinces.find((p) => p.code === selectedProvince);
    return province?.name || "";
  };

  const getSelectedWardText = () => {
    const ward = wards.find((w) => w.code === selectedWard);
    return ward?.name || "";
  };

  const getCategoryDisplayText = () => {
    const selectedCat = categories.find((cat) => cat._id === selectedCategory);
    return selectedCat?.name || "Tất cả loại hình";
  };

  const getPriceDisplayText = () => {
    const selectedOption = priceOptions.find(
      (opt) => opt.value === selectedPrice
    );
    return selectedOption?.label || "Tất cả mức giá";
  };

  const getAreaDisplayText = () => {
    const selectedOption = areaOptions.find(
      (opt) => opt.value === selectedArea
    );
    return selectedOption?.label || "Tất cả diện tích";
  };

  const getStatusDisplayText = () => {
    const selectedOption = statusOptions.find(
      (opt) => opt.value === selectedStatus
    );
    return selectedOption?.label || "Tất cả trạng thái";
  };

  const getSortDisplayText = () => {
    const selectedOption = sortOptions.find(
      (opt) => opt.value === selectedSort
    );
    return selectedOption?.label || "Mới nhất";
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án theo tên, địa điểm..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Province Input */}
          <div className="w-full lg:w-60">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="">Tất cả tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ward Input */}
          <div className="w-full lg:w-60">
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedProvince}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedProvince ? "Tất cả phường/xã" : "Chọn tỉnh trước"}
              </option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
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
                    selectedProvince,
                    selectedWard,
                    selectedCategory,
                    selectedPrice,
                    selectedArea,
                    selectedStatus,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Loại hình dự án
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Tất cả loại hình</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mức giá
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                {priceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Area Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Diện tích
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                {areaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sắp xếp theo
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
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
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Bộ lọc đang áp dụng:
                  </span>

                  {searchValue && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Từ khóa: &ldquo;{searchValue}&rdquo;
                    </span>
                  )}

                  {selectedProvince && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {getSelectedProvinceText()}
                    </span>
                  )}

                  {selectedWard && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {getSelectedWardText()}
                    </span>
                  )}

                  {selectedCategory && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {getCategoryDisplayText()}
                    </span>
                  )}

                  {selectedPrice && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      {getPriceDisplayText()}
                    </span>
                  )}

                  {selectedArea && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {getAreaDisplayText()}
                    </span>
                  )}

                  {selectedStatus && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      {getStatusDisplayText()}
                    </span>
                  )}

                  {selectedSort && selectedSort !== "newest" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {getSortDisplayText()}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
