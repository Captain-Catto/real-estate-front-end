"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLocationNames } from "@/hooks/useLocationNames";
import { categoryService, Category } from "@/services/categoryService";
import { priceRangeService, PriceRange } from "@/services/priceService";
import { areaService, AreaRange } from "@/services/areaService";
import { locationService } from "@/services/locationService";
import { toast } from "sonner";

interface ActiveFiltersProps {
  province?: string;
  ward?: string;
  category?: string;
  price?: string;
  area?: string;
  status?: string;
  search?: string;
  sortBy?: string;
}

interface FilterItem {
  type: string;
  label: string;
  value: string;
  removeUrl: string;
}

export function ActiveFilters({
  province,
  ward,
  category,
  price,
  area,
  status,
  search,
  sortBy,
}: ActiveFiltersProps) {
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [areaRanges, setAreaRanges] = useState<AreaRange[]>([]);

  // Get location names from codes
  const [provinceCode, setProvinceCode] = useState<string>();
  const [wardCode, setWardCode] = useState<string>();

  const { locationNames } = useLocationNames(provinceCode, undefined, wardCode);

  // Load data for filter labels
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, priceData, areaData] = await Promise.all([
          categoryService.getCategories(),
          priceRangeService.getByType("project"),
          areaService.getByType("project"),
        ]);
        setCategories(categoriesData);
        setPriceRanges(priceData);
        setAreaRanges(areaData);
      } catch {
        toast.error("Không thể tải dữ liệu bộ lọc");
      }
    };
    loadData();
  }, []);

  // Convert province/ward slugs to codes for useLocationNames hook
  useEffect(() => {
    const convertSlugs = async () => {
      try {
        if (province) {
          const provinceData = await locationService.getProvinceWithSlug(
            province
          );
          if (provinceData) {
            setProvinceCode(provinceData.code);
          }
        }

        if (ward && province) {
          const locationData = await locationService.getLocationBySlug(
            province,
            ward
          );
          if (locationData) {
            setWardCode(locationData.wardCode);
          }
        }
      } catch {
        toast.error("Không thể chuyển đổi địa chỉ");
      }
    };

    if (province || ward) {
      convertSlugs();
    }
  }, [province, ward]);

  // Build filters list
  useEffect(() => {
    const activeFilters: FilterItem[] = [];

    // Current URL params
    const params = new URLSearchParams();
    if (province) params.set("province", province);
    if (ward) params.set("ward", ward);
    if (category) params.set("category", category);
    if (price) params.set("price", price);
    if (area) params.set("area", area);
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy);

    // Helper function to create remove URL
    const createRemoveUrl = (paramToRemove: string) => {
      const newParams = new URLSearchParams(params);
      newParams.delete(paramToRemove);
      return newParams.toString() ? `/du-an?${newParams.toString()}` : "/du-an";
    };

    // Search filter
    if (search) {
      activeFilters.push({
        type: "search",
        label: `Tìm kiếm: "${search}"`,
        value: search,
        removeUrl: createRemoveUrl("search"),
      });
    }

    // Province filter
    if (province && locationNames.provinceName) {
      activeFilters.push({
        type: "province",
        label: locationNames.provinceName,
        value: province,
        removeUrl: createRemoveUrl("province"),
      });
    }

    // Ward filter
    if (ward && locationNames.wardName) {
      activeFilters.push({
        type: "ward",
        label: locationNames.wardName,
        value: ward,
        removeUrl: createRemoveUrl("ward"),
      });
    }

    // Category filter
    if (category && categories.length > 0) {
      const categoryObj = categories.find((c) => c.slug === category);
      if (categoryObj) {
        activeFilters.push({
          type: "category",
          label: categoryObj.name,
          value: category,
          removeUrl: createRemoveUrl("category"),
        });
      }
    }

    // Price filter
    if (price && priceRanges.length > 0) {
      const priceObj = priceRanges.find(
        (p) => p.slug === price || p.id === price
      );
      if (priceObj) {
        activeFilters.push({
          type: "price",
          label: `Giá: ${priceObj.name}`,
          value: price,
          removeUrl: createRemoveUrl("price"),
        });
      }
    }

    // Area filter
    if (area && areaRanges.length > 0) {
      const areaObj = areaRanges.find((a) => a.slug === area || a.id === area);
      if (areaObj) {
        activeFilters.push({
          type: "area",
          label: `Diện tích: ${areaObj.name}`,
          value: area,
          removeUrl: createRemoveUrl("area"),
        });
      }
    }

    // Status filter
    if (status) {
      const statusLabels = {
        "Sắp mở bán": "Sắp mở bán",
        "Đang bán": "Đang mở bán",
        "Đã bàn giao": "Đã bàn giao",
        "Đang cập nhật": "Đang cập nhật",
      };
      activeFilters.push({
        type: "status",
        label: `Trạng thái: ${
          statusLabels[status as keyof typeof statusLabels] || status
        }`,
        value: status,
        removeUrl: createRemoveUrl("status"),
      });
    }

    // Sort filter (only show if not default)
    if (sortBy && sortBy !== "newest") {
      const sortLabels = {
        updated: "Mới cập nhật",
        "price-high": "Giá cao nhất",
        "price-low": "Giá thấp nhất",
        "area-large": "Diện tích lớn nhất",
        "area-small": "Diện tích nhỏ nhất",
        "name-asc": "Tên A-Z",
        "name-desc": "Tên Z-A",
      };
      activeFilters.push({
        type: "sort",
        label: `Sắp xếp: ${
          sortLabels[sortBy as keyof typeof sortLabels] || sortBy
        }`,
        value: sortBy,
        removeUrl: createRemoveUrl("sortBy"),
      });
    }

    setFilters(activeFilters);
  }, [
    province,
    ward,
    category,
    price,
    area,
    status,
    search,
    sortBy,
    locationNames,
    categories,
    priceRanges,
    areaRanges,
  ]);

  // Don't show if no active filters
  if (filters.length === 0) {
    return null;
  }

  // Clear all filters URL
  const clearAllUrl = "/du-an";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-filter mr-2 text-blue-500"></i>
            <span>Bộ lọc đang áp dụng ({filters.length}):</span>
          </div>
          <Link
            href={clearAllUrl}
            className="text-xs text-red-600 hover:text-red-700 hover:underline"
          >
            Xóa tất cả
          </Link>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <div
              key={`${filter.type}-${index}`}
              className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 text-sm"
            >
              <span className="text-blue-700 font-medium">{filter.label}</span>
              <Link
                href={filter.removeUrl}
                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                title={`Xóa bộ lọc: ${filter.label}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActiveFilters;
