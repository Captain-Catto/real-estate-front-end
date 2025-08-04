"use client";

import React, { useState, useEffect } from "react";
import { PropertyCard } from "@/components/common/PropertyCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/project-detail/Breadcrumb";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

interface SearchResult {
  _id: string;
  title: string;
  type: "ban" | "cho-thue";
  price: number;
  area: number;
  location: {
    province: string;
    district: string;
    ward: string;
    street?: string;
  };
  images: string[];
  createdAt: string;
  // Add other properties as needed
}

interface SearchParams {
  sort?: string;
  page?: string;
  [key: string]: string | string[] | undefined;
}

interface CategoryPageProps {
  title: string;
  totalCount: number;
  categoryType: "ban" | "cho-thue";
  activeFilters?: {
    type?: "ban" | "cho-thue"; // Thêm type property
    propertyType?: string;
    city?: string;
    districts?: string[];
    ward?: string; // Thêm ward vào activeFilters interface
    price?: string;
    area?: string;
  };
  searchParams?: SearchParams;
  slug?: string;
  searchResults?: SearchResult[];
  loading?: boolean;
  onFilterRemove?: (filterType: string, value?: string) => void;
}

export function CategoryPage({
  title,
  totalCount,
  categoryType,
  searchParams = {},
  searchResults = [],
  loading = false,
}: CategoryPageProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [formattedCount, setFormattedCount] = useState(totalCount.toString());
  const [weeklyViews, setWeeklyViews] = useState("0");

  // Helper functions để format display names
  const formatLocationName = (codename: string): string => {
    const locationMap: Record<string, string> = {
      thanh_pho_ho_chi_minh: "Thành phố Hồ Chí Minh",
      thanh_pho_ha_noi: "Thành phố Hà Nội",
      thanh_pho_da_nang: "Thành phố Đà Nẵng",
      quan_1: "Quận 1",
      quan_2: "Quận 2",
      quan_3: "Quận 3",
      quan_7: "Quận 7", // Thêm mapping cho Quận 7
      quan_go_vap: "Quận Gò Vấp",
      phuong_da_kao: "Phường Đa Kao",
      phuong_16: "Phường 16",
      phuong_17: "Phường 17",
      phuong_tan_phong: "Phường Tân Phong", // Thêm mapping cho ward test
      phuong_tan_kieng: "Phường Tân Kiểng", // Thêm mapping cho ward từ URL test
      phuong_tan_thuan_tay: "Phường Tân Thuận Tây", // Thêm mapping cho ward khác
      // Thêm các mapping khác nếu cần
    };

    return (
      locationMap[codename] ||
      codename.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const formatCategoryName = (slug: string): string => {
    const categoryMap: Record<string, string> = {
      "can-ho-chung-cu": "Căn hộ chung cư",
      "nha-rieng": "Nhà riêng",
      "nha-mat-pho": "Nhà mặt phố",
      "biet-thu-lien-ke": "Biệt thự, liền kề",
      "dat-nen": "Đất nền",
      "nha-tro": "Nhà trọ, phòng trọ",
      shophouse: "Shophouse",
      "chung-cu-mini": "Chung cư mini",
      "cua-hang": "Cửa hàng",
      "kho-nha-xuong": "Kho, nhà xưởng",
      "bat-dong-san-khac": "BĐS khác",
      "bat-dong-san-thuong-mai": "Bất động sản thương mại",
      // Thêm các mapping khác nếu cần
    };

    return (
      categoryMap[slug] ||
      slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

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

  // Create breadcrumb items - đọc từ URL parameters thay vì activeFilters
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/", isActive: false },
    {
      label: categoryType === "ban" ? "Bán" : "Cho thuê",
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}`,
      isActive: false,
    },
  ];

  // Đọc city từ URL parameters thay vì activeFilters
  if (searchParams.city) {
    const cityDisplayName = formatLocationName(searchParams.city.toString());

    breadcrumbItems.push({
      label: cityDisplayName,
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}?city=${
        searchParams.city
      }`,
      isActive: false,
    });
  }

  // Thêm xử lý districts
  if (searchParams.districts) {
    const districtsDisplayName = formatLocationName(
      searchParams.districts.toString()
    );

    breadcrumbItems.push({
      label: districtsDisplayName,
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}?city=${
        searchParams.city
      }&districts=${searchParams.districts}`,
      isActive: false,
    });
  }

  // Thêm xử lý ward
  if (searchParams.ward) {
    const wardDisplayName = formatLocationName(searchParams.ward.toString());

    breadcrumbItems.push({
      label: wardDisplayName,
      href: `/${categoryType === "ban" ? "mua-ban" : "cho-thue"}?city=${
        searchParams.city
      }&districts=${searchParams.districts}&ward=${searchParams.ward}`,
      isActive: false,
    });
  }

  // Đọc category từ URL parameters
  if (searchParams.category) {
    const categoryDisplayName = formatCategoryName(
      searchParams.category.toString()
    );

    breadcrumbItems.push({
      label: categoryDisplayName,
      href: "#",
      isActive: true,
    });
  } else if (searchParams.city || searchParams.districts || searchParams.ward) {
    // Nếu có location parameters nhưng không có category, hiển thị "Tất cả BĐS"
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

  return (
    <>
      <main className="bg-gray-100 min-h-screen pb-8">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Title Section */}
        <div className="py-4 mb-4">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <div className="flex gap-1 text-sm text-gray-600 mt-1">
                <span>{formattedCount} bất động sản</span>
                <span className="mx-1">•</span>
                <span>{weeklyViews} lượt xem tuần qua</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
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
