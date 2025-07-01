"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/common/PropertyCard";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { locationService } from "@/services/locationService";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface CategoryPageProps {
  title: string;
  totalCount: number;
  categoryType: "ban" | "thue";
  location?: string;
  activeFilters?: {
    propertyType?: string;
    city?: string;
    districts?: string[] | any[];
    price?: string;
    area?: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
  slug?: string;
  searchResults?: any[];
  loading?: boolean;
  onFilterRemove?: (filterType: string, value?: string) => void;
}

export function CategoryPage({
  title,
  totalCount,
  categoryType,
  location,
  activeFilters = {},
  searchParams = {},
  slug = "",
  searchResults = [],
  loading = false,
  onFilterRemove,
}: CategoryPageProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [formattedCount, setFormattedCount] = useState(totalCount.toString());
  const [weeklyViews, setWeeklyViews] = useState("0");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

 // Format price for display
const formatPriceDisplay = (priceSlug: string): string => {
  console.log("Formatting price slug:", priceSlug);

  // Map price slugs to readable text
  const priceDisplayMap: Record<string, string> = {
    // Mức giá bán
    "thoa-thuan-ban": "Thỏa thuận",
    "duoi-500-trieu": "Dưới 500 triệu",
    "500-800-trieu": "500 - 800 triệu",
    "800-trieu-1-ty": "800 triệu - 1 tỷ",
    "1-2-ty": "1 - 2 tỷ",
    "2-3-ty": "2 - 3 tỷ",
    "3-5-ty": "3 - 5 tỷ",
    "5-7-ty": "5 - 7 tỷ",
    "7-10-ty": "7 - 10 tỷ",
    "10-20-ty": "10 - 20 tỷ",
    "20-30-ty": "20 - 30 tỷ",
    "30-40-ty": "30 - 40 tỷ",
    "40-60-ty": "40 - 60 tỷ",
    "tren-60-ty": "Trên 60 tỷ",

    // Mức giá thuê - Slug
    "thoa-thuan": "Thỏa thuận",
    "thoa-thuan-thue": "Thỏa thuận",
    "duoi-1-trieu": "Dưới 1 triệu",
    "1-3-trieu": "1 - 3 triệu",
    "3-5-trieu": "3 - 5 triệu",
    "5-10-trieu": "5 - 10 triệu",
    "10-15-trieu": "10 - 15 triệu",
    "15-20-trieu": "15 - 20 triệu",
    "20-30-trieu": "20 - 30 triệu",
    "30-40-trieu": "30 - 40 triệu",
    "40-50-trieu": "40 - 50 triệu",
    "50-60-trieu": "50 - 60 triệu",
    "60-80-trieu": "60 - 80 triệu",
    "80-100-trieu": "80 - 100 triệu",
    "tren-100-trieu": "Trên 100 triệu",
    "tat-ca-thue": "Tất cả mức giá",

    // Mức giá thuê - ID
    "r0": "Thỏa thuận",
    "r1": "Dưới 1 triệu",
    "r2": "1 - 3 triệu",
    "r3": "3 - 5 triệu",
    "r4": "5 - 10 triệu",
    "r5": "10 - 15 triệu",
    "r6": "15 - 20 triệu",
    "r7": "20 - 30 triệu",
    "r8": "30 - 40 triệu",
    "r9": "40 - 50 triệu",
    "r10": "60 - 80 triệu",
    "r11": "80 - 100 triệu",
    "r12": "Trên 100 triệu",
    "all_rent": "Tất cả mức giá"
  };

  // Check if it's in the map first
  if (priceDisplayMap[priceSlug]) {
    return priceDisplayMap[priceSlug];
  }

  // If not in the map, try to parse patterns
  const patterns = {
    duoi: /^duoi-(\d+)-trieu$/,
    tu: /^tu-(\d+)-trieu$/,
    tren: /^tren-(\d+)-trieu$/,
    range: /^(\d+)-(\d+)-trieu$/,
    ty_duoi: /^duoi-(\d+)-ty$/,
    ty_tu: /^tu-(\d+)-ty$/,
    ty_tren: /^tren-(\d+)-ty$/,
    ty_range: /^(\d+)-(\d+)-ty$/,
    r_id: /^r(\d+)$/ // Special pattern for r0, r1, r2...
  };

  // Check each pattern
  for (const [type, pattern] of Object.entries(patterns)) {
    const match = priceSlug.match(pattern);
    if (match) {
      // Handle specific patterns
      if (type === "duoi") return `Dưới ${match[1]} triệu`;
      if (type === "tu") return `Từ ${match[1]} triệu`;
      if (type === "tren") return `Trên ${match[1]} triệu`;
      if (type === "range") return `${match[1]} - ${match[2]} triệu`;
      if (type === "ty_duoi") return `Dưới ${match[1]} tỷ`;
      if (type === "ty_tu") return `Từ ${match[1]} tỷ`;
      if (type === "ty_tren") return `Trên ${match[1]} tỷ`;
      if (type === "ty_range") return `${match[1]} - ${match[2]} tỷ`;
      
      // Special handling for r-IDs based on your API data
      if (type === "r_id") {
        const rId = parseInt(match[1], 10);
        switch (rId) {
          case 0: return "Thỏa thuận";
          case 1: return "Dưới 1 triệu";
          case 2: return "1 - 3 triệu";
          case 3: return "3 - 5 triệu";
          case 4: return "5 - 10 triệu";
          case 5: return "10 - 15 triệu";
          case 6: return "15 - 20 triệu";
          case 7: return "20 - 30 triệu";
          case 8: return "30 - 40 triệu";
          case 9: return "40 - 50 triệu";
          case 10: return "60 - 80 triệu";
          case 11: return "80 - 100 triệu";
          case 12: return "Trên 100 triệu";
          default: return `Giá mức ${rId}`;
        }
      }
    }
  }

  // Fallback to basic formatting if no patterns match
  return priceSlug
    .replace(/-/g, " ")
    .replace("trieu", "triệu")
    .replace("ty", "tỷ")
    .replace("thoa thuan", "Thỏa thuận");
};

  // Format area for display
  const formatAreaDisplay = (areaSlug: string): string => {
    const areaDisplayMap: Record<string, string> = {
      "duoi-30-m2": "Dưới 30 m²",
      "30-50-m2": "30 - 50 m²",
      "50-80-m2": "50 - 80 m²",
      "80-100-m2": "80 - 100 m²",
      "100-150-m2": "100 - 150 m²",
      "150-200-m2": "150 - 200 m²",
      "200-250-m2": "200 - 250 m²",
      "250-300-m2": "250 - 300 m²",
      "300-500-m2": "300 - 500 m²",
      "tren-500-m2": "Trên 500 m²",
      "duoi-20-m2": "Dưới 20 m²",
      "20-30-m2": "20 - 30 m²",
      "70-90-m2": "70 - 90 m²",
      "90-120-m2": "90 - 120 m²",
      "120-150-m2": "120 - 150 m²",
    };

    if (!areaDisplayMap[areaSlug]) {
      const pattern = /^([a-z]+)-([0-9]+)-([a-z0-9]+)(-m2)?$/;
      if (pattern.test(areaSlug)) {
        return areaSlug
          .replace(/-m2$/, " m²")
          .replace(/-/g, " ")
          .replace(/m2$/, "m²");
      }
      return areaSlug.replace(/-/g, " ").replace(/m2$/, "m²");
    }

    return areaDisplayMap[areaSlug];
  };

  // Get city name from codename
  const getCityNameFromCodename = (cityCodename: string): string => {
    if (!provinces || provinces.length === 0) return cityCodename;
    const province = provinces.find((p) => p.codename === cityCodename);
    return province ? province.name : cityCodename;
  };

  // Get property type name from slug
  const getPropertyTypeName = (slug: string): string => {
    const propertyTypeMap: Record<string, string> = {
      "nha-tro": "Nhà trọ, phòng trọ",
      "can-ho-chung-cu": "Căn hộ chung cư",
      "nha-rieng": "Nhà riêng",
      "biet-thu-lien-ke": "Nhà biệt thự, liền kề",
      "nha-mat-pho": "Nhà mặt phố",
      shophouse: "Shophouse, nhà phố thương mại",
      "dat-nen": "Đất nền",
      "chung-cu-mini": "Chung cư mini, căn hộ dịch vụ",
      "cua-hang": "Cửa hàng, ki ốt",
      "kho-nha-xuong": "Kho, nhà xưởng, đất",
      "bat-dong-san-khac": "Bất động sản khác",
    };

    return propertyTypeMap[slug] || "Bất động sản";
  };

  // Fetch provinces once on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when there's city in URL
  useEffect(() => {
    const fetchDistricts = async () => {
      if (searchParams.city && provinces.length > 0) {
        try {
          const cityCode =
            typeof searchParams.city === "string" ? searchParams.city : "";
          const cityData = provinces.find((p) => p.codename === cityCode);

          if (cityData) {
            setSelectedCity(cityData.code);
            const districtsData = await locationService.getDistricts(cityCode);
            setDistricts(districtsData);

            // Get selected districts from URL
            const urlParams = new URLSearchParams(window.location.search);
            const selectedDistrictCodes = Array.from(urlParams.entries())
              .filter(([key]) => key === "districts")
              .map(([_, value]) => value);

            if (districtsData?.length > 0 && selectedDistrictCodes.length > 0) {
              const selectedDistObjs = selectedDistrictCodes
                .map((code) => {
                  const district = districtsData.find(
                    (d) => d.codename === code
                  );
                  return district || null;
                })
                .filter(Boolean);

              setSelectedDistricts(selectedDistObjs);
            }
          }
        } catch (error) {
          console.error("Failed to fetch districts:", error);
        }
      }
    };

    fetchDistricts();
  }, [searchParams.city, provinces]);

  // Format numbers for display
  useEffect(() => {
    setFormattedCount(new Intl.NumberFormat("vi-VN").format(totalCount));
    const weeklyViewCount = Math.floor(totalCount * 0.15);
    setWeeklyViews(new Intl.NumberFormat("vi-VN").format(weeklyViewCount));
  }, [totalCount]);

  // Handle sort and page changes
  useEffect(() => {
    if (searchParams.sort) {
      setSortBy(searchParams.sort as string);
    }
    if (searchParams.page) {
      const pageNum = parseInt(searchParams.page as string, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [searchParams]);

  // Create breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    {
      label: categoryType === "ban" ? "Bán" : "Cho thuê",
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`,
    },
  ];

  if (activeFilters.city) {
    breadcrumbItems.push({
      label: activeFilters.city,
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}?city=${
        searchParams.city
      }`,
    });
  }

  if (activeFilters.propertyType) {
    breadcrumbItems.push({
      label: activeFilters.propertyType,
      href: "#",
      isActive: true,
    });
  } else {
    breadcrumbItems.push({
      label: "Tất cả BĐS",
      href: "#",
      isActive: true,
    });
  }

  // Sort options
  const sortOptions = [
    { value: "0", label: "Thông thường" },
    { value: "1", label: "Tin mới nhất" },
    { value: "2", label: "Giá thấp đến cao" },
    { value: "3", label: "Giá cao đến thấp" },
    { value: "4", label: "Diện tích bé đến lớn" },
    { value: "5", label: "Diện tích lớn đến bé" },
  ];

  // Handle sort change
  const handleSortChange = (newSortValue: string) => {
    setSortBy(newSortValue);
    const newSearchParams = { ...searchParams, sort: newSortValue };

    if (currentPage !== 1) {
      newSearchParams.page = "1";
      setCurrentPage(1);
    }

    const queryString = new URLSearchParams(
      newSearchParams as Record<string, string>
    ).toString();

    const path = `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`;
    router.push(queryString ? `${path}?${queryString}` : path);
  };

  // Handle removing filters
  const handleRemoveFilter = (filterType: string, value?: string) => {
    const urlParams = new URLSearchParams(window.location.search);

    switch (filterType) {
      case "city":
        urlParams.delete("city");
        urlParams.delete("districts");
        setSelectedCity(null);
        setSelectedDistricts([]);
        break;

      case "district":
        if (value) {
          const districtEntries = Array.from(urlParams.entries())
            .filter(([key]) => key === "districts")
            .map(([_, val]) => val);

          const remainingDistricts = districtEntries.filter(
            (code) => code !== value
          );

          if (districts && districts.length > 0) {
            const updatedSelectedDistricts = selectedDistricts.filter(
              (district) => district.codename !== value
            );
            setSelectedDistricts(updatedSelectedDistricts);
          }

          urlParams.delete("districts");
          remainingDistricts.forEach((district) => {
            urlParams.append("districts", district);
          });
        }
        break;

      case "category":
      case "price":
      case "area":
        urlParams.delete(filterType);
        break;

      default:
        if (filterType && typeof urlParams.get(filterType) !== "undefined") {
          urlParams.delete(filterType);
        }
        break;
    }

    if (onFilterRemove) {
      onFilterRemove(filterType, value);
    }

    if (currentPage !== 1) {
      urlParams.set("page", "1");
    }

    const path = `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`;
    router.push(
      urlParams.toString() ? `${path}?${urlParams.toString()}` : path
    );
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;

    setCurrentPage(page);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", page.toString());

    const path = `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`;
    router.push(`${path}?${urlParams.toString()}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(currentPage + 1, totalPages - 1);

      const pagesToShow = 3;
      if (end - start + 1 < pagesToShow) {
        if (start === 2) {
          end = Math.min(start + pagesToShow - 1, totalPages - 1);
        } else if (end === totalPages - 1) {
          start = Math.max(end - pagesToShow + 1, 2);
        }
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Render district filters
  const renderDistrictFilters = () => {
    if (selectedDistricts && selectedDistricts.length > 0) {
      return selectedDistricts.map((district, idx) => (
        <span
          key={`selected-${district.codename || idx}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
          <i className="fas fa-map-marker-alt text-xs mr-1"></i>
          {district.name}
          <button
            onClick={() => {
              handleRemoveFilter("district", district.codename);
            }}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </span>
      ));
    }

    return null;
  };

  return (
    <>
      <main className="bg-gray-100 min-h-screen pb-8">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-3">
          <nav className="flex text-xs text-gray-600 max-w-6xl mx-auto">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRightIcon className="h-3 w-3 mx-2 self-center text-gray-400" />
                )}
                {item.isActive ? (
                  <span className="text-gray-900 font-medium">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-blue-600">
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Title Section */}
        <div className="py-4 mb-4">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <div className="flex gap-1 text-sm text-gray-600 mt-1">
                <span>{formattedCount} bất động sản</span>
                <span className="mx-1">•</span>
                <span>{weeklyViews} lượt xem tuần qua</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(activeFilters.city ||
          (Array.isArray(activeFilters.districts) &&
            activeFilters.districts.length > 0) ||
          selectedDistricts.length > 0 ||
          searchParams.category ||
          searchParams.price ||
          searchParams.area) && (
          <div className="container mx-auto px-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-3 max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-700">Đang lọc theo:</span>

                {/* City Filter */}
                {searchParams.city && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <i className="fas fa-map-marker-alt text-xs mr-1"></i>
                    {getCityNameFromCodename(searchParams.city as string)}
                    <button
                      onClick={() => handleRemoveFilter("city")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {/* District Filters */}
                {renderDistrictFilters()}

                {/* Property Type Filter */}
                {searchParams.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    <i className="fas fa-home text-xs mr-1"></i>
                    {getPropertyTypeName(searchParams.category as string)}
                    <button
                      onClick={() => handleRemoveFilter("category")}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {/* Price Filter */}
                {searchParams.price && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <i className="fas fa-tag text-xs mr-1"></i>
                    {formatPriceDisplay(searchParams.price as string)}
                    <button
                      onClick={() => handleRemoveFilter("price")}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {/* Area Filter */}
                {searchParams.area && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <i className="fas fa-ruler-combined text-xs mr-1"></i>
                    {formatAreaDisplay(searchParams.area as string)}
                    <button
                      onClick={() => handleRemoveFilter("area")}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {/* Clear All Button */}
                <button
                  onClick={() => {
                    router.push(
                      `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`
                    );
                    if (onFilterRemove) {
                      onFilterRemove("all", undefined);
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Filter and Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : searchResults.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Không tìm thấy bất động sản phù hợp với các tiêu chí đã chọn.
                  Hãy thử điều chỉnh lại bộ lọc.
                </p>
                <button
                  onClick={() =>
                    router.push(
                      `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`
                    )
                  }
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                {/* Property Listings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                  {searchResults.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center my-6">
                    <nav className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                        disabled={currentPage === 1}
                        className={`px-2 py-2 rounded-md text-sm ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Trang trước</span>
                        &lsaquo;
                      </button>

                      {getPaginationItems().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === "..." ? (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() =>
                                typeof page === "number" &&
                                handlePageChange(page)
                              }
                              className={`px-3 py-2 rounded-md text-sm font-medium ${
                                currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}

                      <button
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                        disabled={currentPage === totalPages}
                        className={`px-2 py-2 rounded-md text-sm ${
                          currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Trang sau</span>
                        &rsaquo;
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
