"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tab } from "@headlessui/react";
import { locationService, Location } from "@/services/locationService";
import { categoryService, Category } from "@/services/categoryService";
import { priceRangeService, PriceRange } from "@/services/priceService";
import { areaService, AreaRange } from "@/services/areaService";
import { toast } from "sonner";

// Search tabs configuration
const SEARCH_TABS = [
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

export default function SearchSectionMain() {
  const router = useRouter();

  // States
  const [searchType, setSearchType] = useState<"buy" | "rent" | "project">(
    "buy"
  );

  // Search state
  const [searchValue, setSearchValue] = useState("");

  // Location states - convert slugs to codes for internal state
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Filter states - use slugs directly
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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

        console.log("Loaded provinces:", provincesData.length);
      } catch {
        toast.error("Không thể tải dữ liệu ban đầu");
      }
    };
    loadInitialData();
  }, []);

  // Load data when search type changes
  useEffect(() => {
    const loadSearchTypeData = async () => {
      try {
        // Load categories based on search type
        const isProject = searchType === "project";
        const categoriesData = await categoryService.getByProjectType(
          isProject
        );
        setCategories(categoriesData);

        // Load price ranges
        const priceType =
          searchType === "buy"
            ? "ban"
            : searchType === "rent"
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
        const areaType = searchType === "project" ? "project" : "property";
        const areaRanges = await areaService.getByType(areaType);
        const areaOptionsList = [
          ...areaRanges.map((range: AreaRange) => ({
            value: range.slug || range.id,
            label: range.name,
          })),
        ];
        setAreaOptions(areaOptionsList);

        console.log(`Loaded data for ${searchType}:`, {
          categories: categoriesData.length,
          priceRanges: priceRanges.length,
          areaRanges: areaRanges.length,
        });
      } catch {
        toast.error("Không thể tải dữ liệu loại tìm kiếm");
      }
    };

    loadSearchTypeData();
  }, [searchType]);

  // Load wards when province is selected
  useEffect(() => {
    if (selectedProvince) {
      const loadWards = async () => {
        try {
          const wardsData = await locationService.getWardsFromProvince(
            selectedProvince
          );
          setWards(wardsData);
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
  }, [selectedProvince]);

  // Handle search with slug-based URL building
  const handleSearch = useCallback(() => {
    setLoading(true);

    // Build URL params using SLUGS instead of codes/IDs
    const params = new URLSearchParams();

    // Add search term if provided (normalized for diacritic-insensitive search)
    if (searchValue && searchValue.trim()) {
      params.append("search", searchValue.trim());
    }

    // Convert province code to slug
    if (selectedProvince) {
      const provinceObj = provinces.find((p) => p.code === selectedProvince);
      if (provinceObj?.slug) {
        params.append("province", provinceObj.slug);
      }
    }

    // Convert ward code to slug
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
    if (searchType === "project" && selectedStatus) {
      params.append("status", selectedStatus);
    }

    // Build final URL
    const currentTab = SEARCH_TABS.find((tab) => tab.id === searchType);
    const baseUrl = currentTab?.baseUrl || "/mua-ban";
    const queryString = params.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    console.log("Search params (using slugs):", {
      searchType,
      provinceSlug: provinces.find((p) => p.code === selectedProvince)?.slug,
      wardSlug: wards.find((w) => w.code === selectedWard)?.slug,
      selectedCategory,
      selectedPrice,
      selectedArea,
      selectedStatus,
      finalUrl,
    });

    router.push(finalUrl);
    setLoading(false);
  }, [
    searchType,
    searchValue,
    selectedProvince,
    selectedWard,
    selectedCategory,
    selectedPrice,
    selectedArea,
    selectedStatus,
    provinces,
    wards,
    router,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg">
      <div className="py-8">
        {/* Search Tabs */}
        <div className="mb-6">
          <Tab.Group
            selectedIndex={SEARCH_TABS.findIndex(
              (tab) => tab.id === searchType
            )}
          >
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {SEARCH_TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  onClick={() =>
                    setSearchType(tab.id as "buy" | "rent" | "project")
                  }
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                      selected
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                    }`
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
        </div>

        {/* Main Search Bar - With search input */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="w-full flex-1">
              <input
                type="text"
                placeholder={
                  searchType === "project"
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
              searchType === "project" ? "4" : "3"
            } gap-4 mt-4`}
          >
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {searchType === "project"
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
                <option value="">Chọn diện tích</option>
                {areaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter - Only for projects */}
            {searchType === "project" && (
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
        </div>
      </div>
    </div>
  );
}
