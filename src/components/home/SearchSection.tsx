"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { locationService, Location } from "@/services/locationService";
import { categoryService, Category } from "@/services/categoryService";
import { priceRangeService, PriceRange } from "@/services/priceService";
import { areaService, AreaRange } from "@/services/areaService";
import { toast } from "sonner";

interface SearchSectionOptimizedProps {
  searchType?: "buy" | "rent" | "project";
  initialProvince?: string;
  initialWard?: string;
  initialCategory?: string;
  initialPrice?: string;
  initialArea?: string;
  initialStatus?: string;
  initialSearch?: string;
  initialSort?: string;
  showSearchTypeToggle?: boolean;
}

// Search type configuration
const SEARCH_TYPES = [
  { id: "buy", name: "Mua bán", baseUrl: "/mua-ban" },
  { id: "rent", name: "Cho thuê", baseUrl: "/cho-thue" },
  { id: "project", name: "Dự án", baseUrl: "/du-an" },
] as const;

// Status options for projects
const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Sắp mở bán", label: "Sắp mở bán" },
  { value: "Đang bán", label: "Đang mở bán" },
  { value: "Đã bàn giao", label: "Đã bàn giao" },
  { value: "Đang cập nhật", label: "Đang cập nhật" },
];

// Sort options for projects
const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "updated", label: "Mới cập nhật" },
  { value: "price-high", label: "Giá cao nhất" },
  { value: "price-low", label: "Giá thấp nhất" },
  { value: "area-large", label: "Diện tích lớn nhất" },
  { value: "area-small", label: "Diện tích nhỏ nhất" },
  { value: "name-asc", label: "Tên A-Z" },
  { value: "name-desc", label: "Tên Z-A" },
];

export default function SearchSection({
  searchType = "buy",
  initialProvince = "",
  initialWard = "",
  initialCategory = "",
  initialPrice = "",
  initialArea = "",
  initialStatus = "",
  initialSearch = "",
  initialSort = "newest",
  showSearchTypeToggle = true,
}: SearchSectionOptimizedProps) {
  const router = useRouter();

  // States
  const [currentSearchType, setCurrentSearchType] = useState<
    "buy" | "rent" | "project"
  >(searchType);

  // Search state
  const [searchValue, setSearchValue] = useState(initialSearch);

  // Location states - convert slugs to codes for internal state
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Filter states - use slugs directly
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // UI states
  const [loading, setLoading] = useState(false);

  // Data states
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Dynamic options from API
  const [priceOptions, setPriceOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Tất cả mức giá" }]);
  const [areaOptions, setAreaOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load provinces
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);

        // If initial province is provided, convert slug to code
        if (initialProvince) {
          const provinceObj = provincesData.find(
            (p) => p.slug === initialProvince
          );
          if (provinceObj) {
            setSelectedProvince(provinceObj.code);
          }
        }

        console.log("Loaded provinces:", provincesData.length);
      } catch {
        toast.error("Không thể tải dữ liệu ban đầu");
      }
    };
    loadInitialData();
  }, [initialProvince]);

  // Load data when search type changes
  useEffect(() => {
    const loadSearchTypeData = async () => {
      try {
        // Load categories based on search type
        const isProject = currentSearchType === "project";
        const categoriesData = await categoryService.getByProjectType(
          isProject
        );
        setCategories(categoriesData);

        // Load price ranges
        const priceType =
          currentSearchType === "buy"
            ? "ban"
            : currentSearchType === "rent"
            ? "cho-thue"
            : "project";
        const priceRanges = await priceRangeService.getByType(priceType);
        const priceOptionsList = [
          { value: "", label: "Tất cả mức giá" },
          ...priceRanges.map((range: PriceRange) => ({
            value: range.slug || range.id,
            label: range.name,
          })),
        ];
        setPriceOptions(priceOptionsList);

        // Load area ranges
        const areaType =
          currentSearchType === "project" ? "project" : "property";
        const areaRanges = await areaService.getByType(areaType);
        const areaOptionsList = [
          ...areaRanges.map((range: AreaRange) => ({
            value: range.slug || range.id,
            label: range.name,
          })),
        ];
        setAreaOptions(areaOptionsList);

        console.log(`Loaded data for ${currentSearchType}:`, {
          categories: categoriesData.length,
          priceRanges: priceRanges.length,
          areaRanges: areaRanges.length,
        });
      } catch {
        toast.error("Không thể tải dữ liệu loại tìm kiếm");
      }
    };

    loadSearchTypeData();
  }, [currentSearchType]);

  // Load wards when province is selected
  useEffect(() => {
    if (selectedProvince) {
      const loadWards = async () => {
        try {
          const wardsData = await locationService.getWardsFromProvince(
            selectedProvince
          );
          setWards(wardsData);

          // If initial ward is provided, convert slug to code
          if (initialWard && !selectedWard) {
            console.log("Looking for ward with slug:", initialWard);
            console.log(
              "Available wards:",
              wardsData.map((w) => ({
                name: w.name,
                code: w.code,
                slug: w.slug,
              }))
            );

            const wardObj = wardsData.find((w) => w.slug === initialWard);
            if (wardObj) {
              console.log("Found ward:", wardObj);
              setSelectedWard(wardObj.code);
            } else {
              console.log("Ward not found with slug:", initialWard);
            }
          }

          console.log("Loaded wards for province:", wardsData.length);
        } catch {
          // Silent error for wards loading
          setWards([]);
        }
      };
      loadWards();
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedProvince, initialWard, selectedWard]);

  // Handle tab switching - just change UI, don't navigate
  const handleTabSwitch = useCallback(
    (newSearchType: "buy" | "rent" | "project") => {
      setCurrentSearchType(newSearchType);
      // Don't navigate here, only change the UI state
    },
    []
  );

  // Handle search with slug-based URL building
  const handleSearch = useCallback(() => {
    setLoading(true);

    // Build URL params using SLUGS instead of codes/IDs
    const params = new URLSearchParams();

    // Add search term if provided (normalized for diacritic-insensitive search)
    if (searchValue && searchValue.trim()) {
      params.append("search", searchValue.trim());
    }

    // Convert province code to slug (only if province is selected)
    if (selectedProvince) {
      const provinceObj = provinces.find((p) => p.code === selectedProvince);
      if (provinceObj?.slug) {
        params.append("province", provinceObj.slug);
      }
    }

    // Convert ward code to slug (only if ward is selected)
    if (selectedWard) {
      const wardObj = wards.find((w) => w.code === selectedWard);
      if (wardObj?.slug) {
        params.append("ward", wardObj.slug);
      }
    }

    // Category is already slug-based
    if (selectedCategory) {
      params.append("category", selectedCategory);
    }

    // Price and area are already slug-based
    if (selectedPrice) params.append("price", selectedPrice);
    if (selectedArea) params.append("area", selectedArea);

    // Status for projects
    if (currentSearchType === "project" && selectedStatus) {
      params.append("status", selectedStatus);
    }

    // Sort for projects (only if not default)
    if (
      currentSearchType === "project" &&
      selectedSort &&
      selectedSort !== "newest"
    ) {
      params.append("sortBy", selectedSort);
    }

    // Build final URL
    const currentTab = SEARCH_TYPES.find((tab) => tab.id === currentSearchType);
    const baseUrl = currentTab?.baseUrl || "/mua-ban";
    const queryString = params.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    console.log("Search params (using slugs):", {
      currentSearchType,
      selectedProvince: selectedProvince || "all",
      selectedWard: selectedWard || "all",
      selectedCategory: selectedCategory || "all",
      finalUrl,
    });

    router.push(finalUrl);
    setLoading(false);
  }, [
    currentSearchType,
    searchValue,
    selectedProvince,
    selectedWard,
    selectedCategory,
    selectedPrice,
    selectedArea,
    selectedStatus,
    selectedSort,
    provinces,
    wards,
    router,
  ]);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg w-full">
      <div className="py-8">
        {/* Search Type Toggle */}
        {showSearchTypeToggle && (
          <div className="flex mb-6">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 w-full">
              {SEARCH_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() =>
                    handleTabSwitch(type.id as "buy" | "rent" | "project")
                  }
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentSearchType === type.id
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Search Bar - With search input */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="w-full flex-1">
              <input
                type="text"
                placeholder={
                  currentSearchType === "project"
                    ? "Tìm kiếm dự án theo tên, địa điểm..."
                    : "Tìm kiếm bất động sản theo tên, địa điểm..."
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
              />
            </div>

            {/* Province Input */}
            <div className="w-full flex-1">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
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
            <div className="w-full flex-1">
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                disabled={!selectedProvince}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
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

        {/* Filters - Always visible */}
        <div className="px-4 pb-4 border-t border-gray-200">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${
              currentSearchType === "project" ? "4" : "3"
            } gap-4 mt-4`}
          >
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {currentSearchType === "project"
                  ? "Loại hình dự án"
                  : "Loại bất động sản"}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
              >
                <option value="">Tất cả loại hình</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Mức giá
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Diện tích
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
              >
                {areaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter - Only for projects */}
            {currentSearchType === "project" && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Trạng thái
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sort Row - Only for projects */}
          {currentSearchType === "project" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
