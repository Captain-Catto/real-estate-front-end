"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryPage } from "@/components/category/CategoryPage";
import { propertyTypeData } from "@/types/propertyTypeData";
import { locationService } from "@/services/locationService";
import { useRouter } from "next/navigation";
import { postService } from "@/services/postsService";

export default function MuaBanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  console.log("searchParams", searchParams);

  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [propertyResults, setPropertyResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [title, setTitle] = useState("");
  const [activeFilters, setActiveFilters] = useState<any>({});

  useEffect(() => {
    let isMounted = true;

    const fetchLocationData = async () => {
      setLoading(true);
      try {
        // Load provinces
        const provinceData = await locationService.getProvinces();
        if (!isMounted) return;
        setProvinces(provinceData);

        // If city code exists, load districts
        const cityCode = searchParams.get("city");
        if (cityCode) {
          const districtData = await locationService.getDistricts(cityCode);
          if (!isMounted) return;
          setDistricts(districtData);
        }

        // Now that we have location data, load properties
        if (isMounted) {
          searchProperties();
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLocationData();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // 1. Lấy danh sách tỉnh thành và quận huyện từ API
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Lấy danh sách tỉnh thành
        const provinceData = await locationService.getProvinces();
        setProvinces(provinceData);

        // Nếu có city code, lấy districts của city đó
        const cityCode = searchParams.get("city");
        if (cityCode) {
          const districtData = await locationService.getDistricts(cityCode);
          setDistricts(districtData);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchLocationData();
  }, [searchParams]);

  const searchProperties = async () => {
    if (provinces.length === 0) return; // Don't proceed if provinces aren't loaded

    try {
      // Xử lý các tham số tìm kiếm
      const cityCode = searchParams.get("city");
      const category = searchParams.get("category");
      const districtCodesStr = searchParams.get("districts");
      const districtCodes = districtCodesStr ? districtCodesStr.split(",") : [];
      const propertyIdsStr = searchParams.get("propertyId");
      const propertyIds = propertyIdsStr ? propertyIdsStr.split(",") : [];

      // Gọi API tìm kiếm với các params đã xử lý
      const apiFilters = {
        type: "ban", // Vì đây là trang mua-ban
        category: category || undefined,
        status: "active", // Chỉ lấy tin đang hiển thị
        city: cityCode || undefined,
        districts: districtCodes.length > 0 ? districtCodes : undefined,
        price: searchParams.get("price") || undefined,
        area: searchParams.get("area") || undefined,
        propertyId: propertyIds.length > 0 ? propertyIds : undefined,
      };

      const response = await postService.searchPosts(apiFilters);

      if (response.success) {
        setPropertyResults(response.data.posts || []);
        setTotalCount(response.data.pagination?.totalItems || 0);
      } else {
        console.error("API error:", response);
        setPropertyResults([]);
        setTotalCount(0);
      }

      // Tạo tiêu đề và active filters
      generateTitleAndFilters();
    } catch (error) {
      console.error("Error searching properties:", error);
      setPropertyResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm tạo tiêu đề và active filters dựa trên dữ liệu từ API
  const generateTitleAndFilters = () => {
    // Lấy tên loại BĐS từ category param
    const categorySlug = searchParams.get("category") || "tat-ca";
    const propertyType = getPropertyTypeFromSlug(categorySlug);

    // Lấy tên thành phố từ API data
    let cityName = "";
    const city = searchParams.get("city");
    if (city) {
      const cityData = provinces.find((p) => p.codename === city);
      cityName = cityData?.name || "";
    }

    // Lấy tên quận/huyện từ API data
    const districtNames: string[] = [];
    if (districts.length > 0) {
      // Xử lý đúng cách với districts là array hoặc string
      const districtParam = searchParams.get("districts");
      let districtCodes: string[] = [];

      if (districtParam) {
        if (districtParam.includes(",")) {
          districtCodes = districtParam.split(",");
        } else {
          districtCodes = [districtParam];
        }

        // Thêm log để xem districts được xử lý
        console.log("District codes to process:", districtCodes);

        districtCodes.forEach((code) => {
          const districtData = districts.find((d) => d.codename === code);
          if (districtData) {
            districtNames.push(districtData.name);
          }
        });
      }
    }

    // Tạo tiêu đề
    let newTitle = `Mua bán ${propertyType.toLowerCase()}`;
    if (cityName) {
      newTitle += ` tại ${cityName}`;
      if (districtNames.length > 0) {
        newTitle += ` (${districtNames.join(", ")})`;
      }
    } else {
      newTitle += ` trên toàn quốc`;
    }
    setTitle(newTitle);

    // Tạo object active filters
    setActiveFilters({
      propertyType,
      city: cityName,
      districts: districtNames,
      price: searchParams.get("price"),
      area: searchParams.get("area"),
    });
  };

  // Tạo object searchParamsObj để truyền vào CategoryPage
  const searchParamsObj = Object.fromEntries(searchParams.entries());

  // Hàm lấy tên loại BĐS từ slug
  function getPropertyTypeFromSlug(slug: string): string {
    const allPropertyTypes = [
      ...propertyTypeData.sell,
      ...propertyTypeData.rent,
      ...propertyTypeData.project,
    ];
    const propertyType = allPropertyTypes.find((p) => p.slug === slug);
    return propertyType?.name || "Bất động sản";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <CategoryPage
        title={title}
        totalCount={totalCount}
        categoryType="ban"
        activeFilters={activeFilters}
        searchParams={searchParamsObj}
        slug={searchParams.get("category") || ""}
        searchResults={propertyResults}
        loading={loading}
      />
    </>
  );
}
