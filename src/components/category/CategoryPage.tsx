"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/common/PropertyCard";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import SearchSection from "@/components/home/SearchSection";
import { locationService } from "@/services/locationService";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { setLoading } from "@/store/slices/favoritesSlices";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface CategoryPageProps {
  title: string;
  totalCount: number;
  categoryType: "ban" | "cho-thue";
  location?: string;
  activeFilters?: {
    propertyType?: string;
    city?: string;
    districts?: string[];
    price?: string;
    area?: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
  slug?: string;
  searchResults?: any[];
  loading?: boolean;
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
}: CategoryPageProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [formattedCount, setFormattedCount] = useState(totalCount.toString());
  const [weeklyViews, setWeeklyViews] = useState("0");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<any[]>([]);
  const [cityDistricts, setCityDistricts] = useState<any[]>([]);
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Đánh dấu component đã load xong sau khi fetch xong provinces và districts
  useEffect(() => {
    console.log("Checking if component should be loaded");
    console.log("provinces.length:", provinces.length);
    console.log("searchParams.city:", searchParams.city);
    console.log("cityDistricts:", cityDistricts);
    console.log("selectedDistricts:", selectedDistricts);

    if (
      provinces.length > 0 &&
      (!searchParams.city || cityDistricts.length > 0)
    ) {
      console.log("Setting isComponentLoaded to true");

      setIsComponentLoaded(true);
    }
  }, [provinces, cityDistricts, searchParams.city, selectedDistricts]);

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

  // Tải dữ liệu quận/huyện khi có city trong URL
  useEffect(() => {
    const fetchDistricts = async () => {
      if (searchParams.city && provinces.length > 0) {
        try {
          const cityCode =
            typeof searchParams.city === "string" ? searchParams.city : "";

          // Find city in provinces
          const cityData = provinces.find((p) => p.codename === cityCode);
          if (cityData) {
            setSelectedCity(cityData.code);

            // Fetch districts for selected city
            const districtsData = await locationService.getDistricts(cityCode);
            setCityDistricts(districtsData);

            // Handle district selection
            if (searchParams.districts) {
              const selectedDistrictCodes = Array.isArray(
                searchParams.districts
              )
                ? searchParams.districts
                : searchParams.districts.split(",");

              // Map district codes to objects
              if (districtsData?.length > 0) {
                const selectedDistObjs = districtsData.filter((d) =>
                  selectedDistrictCodes.includes(d.codename)
                );

                setSelectedDistricts(selectedDistObjs);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch districts:", error);
        }
      }
    };

    fetchDistricts();
  }, [searchParams.city, searchParams.districts, provinces]);

  // Format numbers consistently on client side to avoid hydration mismatch
  useEffect(() => {
    setFormattedCount(new Intl.NumberFormat("vi-VN").format(totalCount));
    // Mock weekly views calculation
    const weeklyViewCount = Math.floor(totalCount * 0.15);
    setWeeklyViews(new Intl.NumberFormat("vi-VN").format(weeklyViewCount));
  }, [totalCount]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    {
      label: categoryType === "ban" ? "Bán" : "Cho thuê",
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`,
    },
  ];

  // Add city to breadcrumb if available
  if (activeFilters.city) {
    breadcrumbItems.push({
      label: activeFilters.city,
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}?city=${
        searchParams.city
      }`,
    });
  }

  // Add property type to breadcrumb
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

  // Handle removing a filter
  const handleRemoveFilter = (filterType: string, value?: string) => {
    const newSearchParams = { ...searchParams };

    switch (filterType) {
      case "city":
        delete newSearchParams.city;
        delete newSearchParams.districts;
        break;

      case "district":
        if (value && newSearchParams.districts) {
          if (typeof newSearchParams.districts === "string") {
            // Nếu chỉ có 1 quận được chọn
            if (newSearchParams.districts === value) {
              delete newSearchParams.districts;
            }
          } else {
            // Nếu có nhiều quận được chọn (mảng)
            const updatedDistricts = (
              newSearchParams.districts as string[]
            ).filter((d) => d !== value);

            if (updatedDistricts.length === 0) {
              delete newSearchParams.districts;
            } else if (updatedDistricts.length === 1) {
              // Nếu chỉ còn lại 1 quận
              newSearchParams.districts = updatedDistricts[0];
            } else {
              newSearchParams.districts = updatedDistricts;
            }
          }
        }
        break;

      case "category":
        delete newSearchParams.category;
        break;

      case "price":
        delete newSearchParams.price;
        break;

      case "area":
        delete newSearchParams.area;
        break;
    }

    // Convert to query string and navigate
    const queryString = new URLSearchParams(
      newSearchParams as Record<string, string>
    ).toString();

    // Luôn chuyển đến URL gốc với query params
    const path = `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`;
    router.push(queryString ? `${path}?${queryString}` : path);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Update URL with page parameter
    const newSearchParams = { ...searchParams, page: page.toString() };
    const queryString = new URLSearchParams(
      newSearchParams as Record<string, string>
    ).toString();
    const path = `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`;
    router.push(`${path}?${queryString}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate pagination array
  const getPaginationItems = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if we have 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include the first page
      pages.push(1);

      // Calculate start and end based on current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(currentPage + 1, totalPages - 1);

      // Adjust to show 3 pages in the middle
      const pagesToShow = 3;
      if (end - start + 1 < pagesToShow) {
        if (start === 2) {
          end = Math.min(start + pagesToShow - 1, totalPages - 1);
        } else if (end === totalPages - 1) {
          start = Math.max(end - pagesToShow + 1, 2);
        }
      }

      // Add ellipsis if needed before middle pages
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed after middle pages
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always include the last page
      pages.push(totalPages);
    }

    return pages;
  };

  const formatPriceDisplay = (priceSlug: string): string => {
    // Map price slugs to readable text
    const priceDisplayMap: Record<string, string> = {
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
    };
    return priceDisplayMap[priceSlug] || priceSlug;
  };

  const formatAreaDisplay = (areaSlug: string): string => {
    // Map area slugs to readable text
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
    };
    return areaDisplayMap[areaSlug] || areaSlug;
  };

  return (
    <>
      <Header />
      <main className="bg-gray-100 min-h-screen pb-8">
        {/* Breadcrumb - Giữ nguyên chiều rộng container */}
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

        {/* Title Section - Đồng bộ chiều rộng với max-w-6xl */}
        <div className=" py-4 mb-4 ">
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

        {/* Search Section - Đã có max-w-6xl */}
        <div className="container mx-auto px-4 mb-5">
          <SearchSection
            initialSearchType={categoryType === "ban" ? "buy" : "rent"}
            initialCity={selectedCity}
            initialDistricts={selectedDistricts}
            initialCategory={slug || ""}
            initialPrice={(searchParams.price as string) || ""}
            initialArea={(searchParams.area as string) || ""}
            provinces={provinces}
            cityDistricts={cityDistricts}
          />
        </div>

        {/* Active Filters - Thêm max-w-6xl */}
        {(activeFilters.city ||
          selectedDistricts.length > 0 ||
          activeFilters.propertyType ||
          searchParams.price ||
          searchParams.area) && (
          <div className="container mx-auto px-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-3 max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-700">Đang lọc theo:</span>

                {/* City Filter */}
                {activeFilters.city && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <i className="fas fa-map-marker-alt text-xs mr-1"></i>
                    {activeFilters.city}
                    <button
                      onClick={() => handleRemoveFilter("city")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {/* District Filters - Sử dụng cả activeFilters.districts và selectedDistricts */}
                {/* Hiển thị từ selectedDistricts (state) */}
                {selectedDistricts.map((district, idx) => (
                  <span
                    key={`selected-${district.code || idx}`}
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
                ))}

                {/* Hiển thị từ activeFilters.districts (props) khi chưa có selectedDistricts */}
                {selectedDistricts.length === 0 &&
                  activeFilters.districts &&
                  activeFilters.districts.map(
                    (districtName: string, idx: number) => (
                      <span
                        key={`active-${idx}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <i className="fas fa-map-marker-alt text-xs mr-1"></i>
                        {districtName}
                        <button
                          onClick={() => {
                            // Tìm district code từ tên district
                            const district = districts.find(
                              (d) => d.name === districtName
                            );
                            if (district) {
                              handleRemoveFilter("district", district.codename);
                            }
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    )
                  )}

                {/* Property Type Filter */}
                {activeFilters.propertyType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    <i className="fas fa-home text-xs mr-1"></i>
                    {activeFilters.propertyType}
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
                    {activeFilters.price ||
                      formatPriceDisplay(searchParams.price as string)}
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
                    {activeFilters.area ||
                      formatAreaDisplay(searchParams.area as string)}
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
                  onClick={() =>
                    router.push(
                      `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`
                    )
                  }
                  className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Thêm max-w-6xl */}
        <div className="container mx-auto px-4">
          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {/* Filter and Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
      <Footer />
    </>
  );
}
