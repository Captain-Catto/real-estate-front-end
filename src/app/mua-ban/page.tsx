"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryPage } from "@/components/category/CategoryPage";
import { propertyTypeData } from "@/types/propertyTypeData";
import { locationService } from "@/services/locationService";
import { useRouter } from "next/navigation";
import { postService } from "@/services/postsService";
import SearchSection from "@/components/home/SearchSection";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { toast } from "sonner";

export default function MuaBanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [propertyResults, setPropertyResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [title, setTitle] = useState("");
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [initialProvinceObj, setInitialProvinceObj] = useState<any>(null);
  const [initialDistrictsObj, setInitialDistrictsObj] = useState<any[]>([]);

  // Giữ lại useEffect đầu tiên và loại bỏ cái thứ hai
  useEffect(() => {
    let isMounted = true;

    const fetchLocationData = async () => {
      setLoading(true);
      try {
        // Lấy provinces
        const provinceData = await locationService.getProvinces();
        if (!isMounted) return;
        setProvinces(provinceData);

        // Lấy districts nếu có city trong URL
        const cityCode = searchParams.get("city");
        if (cityCode) {
          const districtData = await locationService.getDistricts(cityCode);
          if (!isMounted) return;
          setDistricts(districtData);

          // QUAN TRỌNG: Lấy tất cả districts từ URL thay vì chỉ lấy một
          const urlParams = new URLSearchParams(window.location.search);
          const districtEntries = Array.from(urlParams.entries())
            .filter(([key]) => key === "districts")
            .map(([_, value]) => value);

          // Tìm province và districts objects để truyền vào SearchSection
          const selectedProvince = provinceData.find(
            (p) => p.codename === cityCode
          );

          const selectedDistricts = districtEntries
            .map((code) => {
              const district = districtData.find((d) => d.codename === code);
              if (district) return district;
              return null;
            })
            .filter(Boolean);

          // Sử dụng state để lưu trữ
          if (isMounted) {
            setInitialProvinceObj(selectedProvince);
            setInitialDistrictsObj(selectedDistricts);

            // THÊM MỚI: Sửa activeFilters để có districtNames đầy đủ
            const districtNames = selectedDistricts.map((d) => d.name);
            setActiveFilters((prev) => ({
              ...prev,
              districts: districtNames,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        if (isMounted) {
          // Luôn gọi searchProperties sau khi load xong location data
          await searchProperties();
          setLoading(false); // Đảm bảo setLoading(false) sau khi tất cả hoàn tất
        }
      }
    };

    fetchLocationData();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Trong useEffect xử lý searchParams
  useEffect(() => {
    // Khi có thay đổi searchParams, reset initialProvinceObj và initialDistrictsObj
    // nếu city đã bị xóa
    if (!searchParams.get("city")) {
      setInitialProvinceObj(null);
      setInitialDistrictsObj([]);
    }

    // Nếu city còn nhưng districts bị xóa thì cập nhật initialDistrictsObj
    if (searchParams.get("city")) {
      // Lấy danh sách districts từ URL
      const urlParams = new URLSearchParams(window.location.search);
      const districtEntries = Array.from(urlParams.entries())
        .filter(([key]) => key === "districts")
        .map(([_, value]) => value);

      // Nếu không còn districts nào trong URL thì reset
      if (districtEntries.length === 0) {
        setInitialDistrictsObj([]);
      }
    }
  }, [searchParams]);

  // Thêm timeout để tránh trạng thái loading vô hạn
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 8000); // 8 giây timeout

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const searchProperties = async () => {
    try {
      // Xử lý các tham số tìm kiếm
      const cityCode = searchParams.get("city");
      const category = searchParams.get("category");

      // Xử lý districts - sửa lại cách lấy districts từ URL
      let districtCodes: string[] = [];

      // Đơn giản hóa cách lấy districts từ URL
      const urlParams = new URLSearchParams(window.location.search);
      const districtEntries = Array.from(urlParams.entries())
        .filter(([key]) => key === "districts")
        .map(([_, value]) => value);

      if (districtEntries.length > 0) {
        districtCodes = districtEntries;
      }

      // API filters
      const apiFilters = {
        type: "ban",
        category: category || undefined,
        status: "active",
        city: cityCode || undefined,
        districts: districtCodes.length > 0 ? districtCodes : undefined,
        price: searchParams.get("price") || undefined,
        area: searchParams.get("area") || undefined,
      };

      // Khi không có tham số tìm kiếm, hiển thị tất cả hoặc trang mặc định
      if (
        !cityCode &&
        !category &&
        districtCodes.length === 0 &&
        !searchParams.get("price") &&
        !searchParams.get("area")
      ) {
        setTitle("Mua bán bất động sản");
        setActiveFilters({});

        // Lấy tất cả bất động sản
        const response = await postService.searchPosts({
          type: "ban",
          status: "active",
        });

        if (response.success) {
          setPropertyResults(response.data.posts || []);
          setTotalCount(response.data.pagination?.totalItems || 0);
        } else {
          setPropertyResults([]);
          setTotalCount(0);
        }

        return;
      }

      // Normal search with filters
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
      console.error("Error in searchProperties:", error);
      setPropertyResults([]);
      setTotalCount(0);
    }
  };

  // Hàm tạo tiêu đề và active filters dựa trên dữ liệu từ API
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

    // QUAN TRỌNG: Sử dụng initialDistrictsObj đã được xử lý trước đó
    // để có tên đầy đủ của tất cả quận/huyện
    const districtNames = initialDistrictsObj.map((district) => district.name);

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

    // Tạo object active filters với district data đầy đủ
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

  // (Tương tự cho cho-thue/page.tsx)

  const handleFilterRemove = (filterType: string, value?: string) => {
    if (filterType === "city") {
      // Reset city và districts
      setInitialProvinceObj(null);
      setInitialDistrictsObj([]);
    } else if (filterType === "district" && value) {
      // Chỉ xóa district cụ thể
      setInitialDistrictsObj((prev) =>
        prev.filter((district) => district.codename !== value)
      );
    } else if (filterType === "category") {
      // Reset category
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("category");
    } else if (filterType === "price") {
      // Reset price
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("price");
    } else if (filterType === "area") {
      // Reset area
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("area");
    }

    // Đảm bảo SearchSection được cập nhật
    const newSearchParams = new URLSearchParams(window.location.search);

    // Cập nhật state và props cho SearchSection
    if (!newSearchParams.get("city")) {
      setInitialProvinceObj(null);
      setInitialDistrictsObj([]);
    }
  };

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
      <Header />
      <SearchSection
        initialSearchType="buy"
        initialCity={initialProvinceObj} // Đã được xử lý đúng cách
        initialDistricts={initialDistrictsObj} // Đã được xử lý đúng cách
        initialCategory={searchParams.get("category") || ""}
        initialPrice={searchParams.get("price") || ""}
        initialArea={searchParams.get("area") || ""}
        provinces={provinces}
        cityDistricts={districts}
      />

      <CategoryPage
        title={title}
        totalCount={totalCount}
        categoryType="ban"
        activeFilters={activeFilters}
        searchParams={searchParamsObj}
        slug={searchParams.get("category") || ""}
        searchResults={propertyResults}
        loading={false}
        onFilterRemove={handleFilterRemove}
      />
      <Footer />
    </>
  );
}
