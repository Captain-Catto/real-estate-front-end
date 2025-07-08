"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryPage } from "@/components/category/CategoryPage";
import { locationService } from "@/services/locationService";
import { postService } from "@/services/postsService";
import SearchSection from "@/components/home/SearchSection";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

// Type definitions
interface Location {
  _id: string;
  name: string;
  codename: string;
  division_type: string;
  code: string;
  phone_code: string;
}

interface PropertyResult {
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
}

interface ActiveFilters {
  propertyType?: string;
  city?: string;
  districts?: string[];
  price?: string;
  area?: string;
  type: "ban" | "cho-thue";
  [key: string]: string | string[] | undefined;
}

export default function ChoThuePage() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [propertyResults, setPropertyResults] = useState<PropertyResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [title, setTitle] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    type: "cho-thue",
  });
  const [initialCity, setInitialCity] = useState<Location | null>(null);
  const [initialDistricts, setInitialDistricts] = useState<Location[]>([]);

  // Function to get search params, handling nulls
  const getSearchParam = useCallback(
    (param: string): string | undefined => {
      const value = searchParams.get(param);
      return value ?? undefined;
    },
    [searchParams]
  );

  const searchProperties = useCallback(async () => {
    try {
      // Prepare search filters
      const filters: ActiveFilters = {
        type: "cho-thue",
        propertyType: getSearchParam("propertyType"),
        price: getSearchParam("price"),
        area: getSearchParam("area"),
        city: getSearchParam("city"),
        districts: Array.from(searchParams.entries())
          .filter(([key]) => key === "districts")
          .map(([, value]) => value),
      };

      // Update active filters
      setActiveFilters(filters);

      // Call search API
      const results = await postService.searchPosts(filters);
      console.log("Search results:", results);
      setPropertyResults(results.data.posts || []);
      setTotalCount(results.total || 0);
      setTitle(results.title || "Cho thuê bất động sản");
    } catch (error) {
      console.error("Error searching properties:", error);
      setPropertyResults([]);
      setTotalCount(0);
    }
  }, [getSearchParam, searchParams]);

  const fetchLocationData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch provinces
      const provinceData = await locationService.getProvinces();
      const cityCode = searchParams.get("city");

      if (cityCode) {
        const districtData = await locationService.getDistricts(cityCode);

        // Get all districts from URL
        const urlParams = new URLSearchParams(window.location.search);
        const districtCodes = Array.from(urlParams.entries())
          .filter(([key]) => key === "districts")
          .map(([, value]) => value);

        // Find province and districts objects
        const selectedProvince =
          provinceData.find((p) => p.codename === cityCode) || null;
        const selectedDistricts = districtCodes
          .map((code) => districtData.find((d) => d.codename === code))
          .filter((d): d is Location => d !== null);

        setInitialCity(selectedProvince);
        setInitialDistricts(selectedDistricts);
      }

      await searchProperties();
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, searchProperties]);

  // Fetch data when search params change
  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  return (
    <>
      <Header />
      <SearchSection
        initialSearchType="rent"
        initialCity={initialCity}
        initialDistricts={initialDistricts}
      />
      <CategoryPage
        title={title}
        totalCount={totalCount}
        categoryType="cho-thue"
        searchParams={Object.fromEntries(searchParams.entries())}
        activeFilters={activeFilters}
        searchResults={propertyResults}
        loading={loading}
      />
      <Footer />
    </>
  );
}
