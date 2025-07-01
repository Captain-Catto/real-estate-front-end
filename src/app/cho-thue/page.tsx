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

export default function ChoThuePage() {
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
  const [initialProvinceObj, setInitialProvinceObj] = useState<any>(null);
  const [initialDistrictsObj, setInitialDistrictsObj] = useState<any[]>([]);

  // Fetch location data and search results
  useEffect(() => {
    let isMounted = true;

    const fetchLocationData = async () => {
      setLoading(true);
      try {
        // Fetch provinces
        const provinceData = await locationService.getProvinces();
        if (!isMounted) return;
        setProvinces(provinceData);

        // Fetch districts if city is in URL
        const cityCode = searchParams.get("city");
        if (cityCode) {
          const districtData = await locationService.getDistricts(cityCode);
          if (!isMounted) return;
          setDistricts(districtData);

          // Get all districts from URL
          const urlParams = new URLSearchParams(window.location.search);
          const districtEntries = Array.from(urlParams.entries())
            .filter(([key]) => key === "districts")
            .map(([_, value]) => value);

          console.log("District entries from URL:", districtEntries);

          // Find province and districts objects for SearchSection
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

          // Save to state
          if (isMounted) {
            setInitialProvinceObj(selectedProvince);
            setInitialDistrictsObj(selectedDistricts);

            // Update activeFilters with district names
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
          // Always call searchProperties after location data is loaded
          await searchProperties();
          setLoading(false);
        }
      }
    };

    fetchLocationData();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Thêm useEffect để theo dõi thay đổi searchParams cho city và districts
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

  // Timeout to prevent infinite loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log("Force ending loading state after timeout");
        setLoading(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const searchProperties = async () => {
    try {
      // Process search parameters
      const cityCode = searchParams.get("city");
      const category = searchParams.get("category");

      // Process districts from URL
      let districtCodes: string[] = [];
      const urlParams = new URLSearchParams(window.location.search);
      const districtEntries = Array.from(urlParams.entries())
        .filter(([key]) => key === "districts")
        .map(([_, value]) => value);

      if (districtEntries.length > 0) {
        districtCodes = districtEntries;
        console.log("District codes from URL params:", districtCodes);
      }

      // API filters
      const apiFilters = {
        type: "thue", // Change to "thue" for rent page
        category: category || undefined,
        status: "active",
        city: cityCode || undefined,
        districts: districtCodes.length > 0 ? districtCodes : undefined,
        price: searchParams.get("price") || undefined,
        area: searchParams.get("area") || undefined,
      };

      console.log("Searching with filters:", apiFilters);
      console.log("Searching with filters:", apiFilters);
      console.log("Price filter:", searchParams.get("price"));

      // When no search params, display default
      if (
        !cityCode &&
        !category &&
        districtCodes.length === 0 &&
        !searchParams.get("price") &&
        !searchParams.get("area")
      ) {
        console.log("No search parameters, showing default listings");
        setTitle("Cho thuê bất động sản");
        setActiveFilters({});

        // Get all rental properties
        const response = await postService.searchPosts({
          type: "thue",
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
      console.log("Search response:", response);

      if (response.success) {
        setPropertyResults(response.data.posts || []);
        setTotalCount(response.data.pagination?.totalItems || 0);
      } else {
        console.error("API error:", response);
        setPropertyResults([]);
        setTotalCount(0);
      }

      // Generate title and active filters
      generateTitleAndFilters();
    } catch (error) {
      console.error("Error in searchProperties:", error);
      setPropertyResults([]);
      setTotalCount(0);
    }
  };

  // Generate title and active filters based on API data
  const generateTitleAndFilters = () => {
    // Get property type name from category param
    const categorySlug = searchParams.get("category") || "tat-ca";
    const propertyType = getPropertyTypeFromSlug(categorySlug);

    // Get city name from API data
    let cityName = "";
    const city = searchParams.get("city");
    if (city) {
      const cityData = provinces.find((p) => p.codename === city);
      cityName = cityData?.name || "";
    }

    // Use initialDistrictsObj for district names
    const districtNames = initialDistrictsObj.map((district) => district.name);
    console.log("District names for display:", districtNames);

    // Create title
    let newTitle = `Cho thuê ${propertyType.toLowerCase()}`;
    if (cityName) {
      newTitle += ` tại ${cityName}`;
      if (districtNames.length > 0) {
        newTitle += ` (${districtNames.join(", ")})`;
      }
    } else {
      newTitle += ` trên toàn quốc`;
    }
    setTitle(newTitle);

    // Create active filters object
    setActiveFilters({
      propertyType,
      city: cityName,
      districts: districtNames,
      price: searchParams.get("price"),
      area: searchParams.get("area"),
    });
  };

  // Create searchParamsObj to pass to CategoryPage
  const searchParamsObj = Object.fromEntries(searchParams.entries());

  // Get property type name from slug
  function getPropertyTypeFromSlug(slug: string): string {
    const allPropertyTypes = [
      ...propertyTypeData.sell,
      ...propertyTypeData.rent,
      ...propertyTypeData.project,
    ];
    const propertyType = allPropertyTypes.find((p) => p.slug === slug);
    return propertyType?.name || "Bất động sản";
  }

  // Thêm hàm xử lý khi filter bị xóa từ CategoryPage
  const handleFilterRemove = (filterType: string, value?: string) => {
    console.log(`Filter removed: ${filterType}, value: ${value}`);

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
    } else if (filterType === "all") {
      // Reset tất cả filter
      setInitialProvinceObj(null);
      setInitialDistrictsObj([]);
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
        initialSearchType="rent"
        initialCity={initialProvinceObj}
        initialDistricts={initialDistrictsObj}
        initialCategory={searchParams.get("category") || ""}
        initialPrice={searchParams.get("price") || ""}
        initialArea={searchParams.get("area") || ""}
        provinces={provinces}
        cityDistricts={districts}
      />

      <CategoryPage
        title={title}
        totalCount={totalCount}
        categoryType="thue"
        activeFilters={activeFilters}
        searchParams={searchParamsObj}
        slug={searchParams.get("category") || ""}
        searchResults={propertyResults}
        loading={false}
        onFilterRemove={handleFilterRemove} // Thêm prop này
      />
      <Footer />
    </>
  );
}
