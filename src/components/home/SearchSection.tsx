"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tab } from "@headlessui/react";
import { locationService } from "@/services/locationService";
import { categoryService, Category } from "@/services/categoryService";
import { priceRangeService, PriceRange } from "@/services/priceService";
import { areaService, AreaRange } from "@/services/areaService";

interface SelectedDistrict {
  code: string;
  name: string;
  codename?: string;
}

interface SearchSectionProps {
  initialSearchType?: "buy" | "rent" | "project";
  initialCity?: any; // Thay đổi từ string sang object
  initialDistricts?: any[];
  initialCategory?: string;
  initialPrice?: string;
  initialArea?: string;
  provinces?: any[];
  cityDistricts?: any[];
}

export default function SearchSection({
  initialSearchType = "buy",
  initialCity = null,
  initialDistricts = [],
  initialCategory = "",
  initialPrice = "",
  initialArea = "",
  provinces = [],
  cityDistricts = [],
}: SearchSectionProps) {
  const router = useRouter();

  // Sử dụng ref để theo dõi việc khởi tạo
  const isInitialized = useRef(false);
  const fetchedCities = useRef<Set<string>>(new Set());
  const hasUpdatedFromProps = useRef(false);

  // States
  const [searchType, setSearchType] = useState<"buy" | "rent" | "project">(
    initialSearchType
  );

  // Sử dụng useState với callback để khởi tạo state chỉ một lần
  const [selectedCity, setSelectedCity] = useState<string | null>(() =>
    initialCity ? initialCity.code : null
  );

  const [selectedDistricts, setSelectedDistricts] = useState<
    SelectedDistrict[]
  >(() =>
    Array.isArray(initialDistricts) && initialDistricts.length > 0
      ? initialDistricts.map((district) => ({
          code: district.code || "",
          name: district.name || "",
          codename: district.codename || district.code || "",
        }))
      : []
  );

  const [selectedPropertyType, setSelectedPropertyType] = useState(
    () => initialCategory || ""
  );
  const [selectedPrice, setSelectedPrice] = useState(() => initialPrice || "");
  const [selectedArea, setSelectedArea] = useState(() => initialArea || "");

  // Locations data
  const [locationData, setLocationData] = useState<any[]>(
    () => provinces || []
  );
  const [selectedCityDistricts, setSelectedCityDistricts] = useState<any[]>(
    () => cityDistricts || []
  );

  // UI states
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [loadingSearchOptions, setLoadingSearchOptions] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [areaRanges, setAreaRanges] = useState<AreaRange[]>([]);

  // Refs for clickaway
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  // Load provinces nếu không được truyền vào - CHẠY MỘT LẦN
  useEffect(() => {
    const fetchProvinces = async () => {
      if (!provinces || provinces.length === 0) {
        try {
          const data = await locationService.getProvinces();
          setLocationData(data);
        } catch (error) {
          console.error("Failed to fetch provinces:", error);
        }
      }
    };

    fetchProvinces();
    // Không có dependencies để đảm bảo chỉ chạy một lần
  }, []);

  // SAFE: Cập nhật từ prop initialCity khi prop thay đổi
  useEffect(() => {
    if (initialCity?.code && selectedCity !== initialCity.code) {
      setSelectedCity(initialCity.code);
    } else if (!initialCity && selectedCity !== null) {
      setSelectedCity(null);
    }
  }, [initialCity]);

  // SAFE: Cập nhật từ prop initialDistricts khi prop thay đổi
  useEffect(() => {
    if (
      initialDistricts &&
      Array.isArray(initialDistricts) &&
      initialDistricts.length > 0
    ) {
      const newDistricts = initialDistricts.map((district) => ({
        code: district.code || district.codename || "",
        name: district.name || "",
        codename: district.codename || district.code || "",
      }));

      // Chỉ cập nhật khi thực sự khác nhau
      const currentCodes = selectedDistricts
        .map((d) => d.code)
        .sort()
        .join(",");
      const newCodes = newDistricts
        .map((d) => d.code)
        .sort()
        .join(",");

      if (currentCodes !== newCodes) {
        setSelectedDistricts(newDistricts);
      }
    } else if (
      initialDistricts &&
      initialDistricts.length === 0 &&
      selectedDistricts.length > 0
    ) {
      setSelectedDistricts([]);
    }
  }, [initialDistricts]);

  // SAFE: Fetch districts khi selectedCity thay đổi - KHÔNG CÓ VÒNG LẶP
  useEffect(() => {
    // Nếu không có selectedCity, không làm gì cả
    if (!selectedCity) {
      return;
    }

    const fetchDistricts = async () => {
      // Nếu đã fetch city này rồi, không fetch lại
      if (fetchedCities.current.has(selectedCity)) {
        return;
      }

      // Nếu đã có cityDistricts từ props
      if (
        cityDistricts &&
        cityDistricts.length > 0 &&
        initialCity?.code === selectedCity
      ) {
        setSelectedCityDistricts(cityDistricts);
        fetchedCities.current.add(selectedCity);
        return;
      }

      try {
        const cityData = locationData.find(
          (city) => city.code === selectedCity
        );
        if (cityData) {
          const districts = await locationService.getDistricts(
            cityData.codename
          );
          setSelectedCityDistricts(districts);
          fetchedCities.current.add(selectedCity);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      }
    };

    fetchDistricts();
  }, [selectedCity, locationData]);

  // SAFE: Fetch categories, price ranges, và areas - CHẠY KHI searchType THAY ĐỔI
  useEffect(() => {
    const fetchSearchOptions = async () => {
      setLoadingSearchOptions(true);
      try {
        // 1. Fetch categories
        const categoriesResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
          }/categories`
        );

        if (!categoriesResponse.ok) {
          throw new Error(
            `Error fetching categories: ${categoriesResponse.status}`
          );
        }

        const categoriesResult = await categoriesResponse.json();

        // Filter categories theo searchType
        let filteredCategories = [];
        if (searchType === "project") {
          filteredCategories =
            categoriesResult.data?.categories?.filter((cat) => cat.isProject) ||
            [];
        } else {
          filteredCategories =
            categoriesResult.data?.categories?.filter(
              (cat) => !cat.isProject
            ) || [];
        }

        setCategories(filteredCategories);

        // 2. Fetch price ranges
        const priceTypeParam =
          searchType === "buy"
            ? "ban"
            : searchType === "rent"
            ? "thue"
            : "project";

        const priceResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
          }/price-ranges?type=${priceTypeParam}`
        );

        if (!priceResponse.ok) {
          throw new Error(
            `Error fetching price ranges: ${priceResponse.status}`
          );
        }

        const priceResult = await priceResponse.json();
        const priceRanges = priceResult.data?.priceRanges || [];

        // Sort price ranges
        const sortedPriceRanges = [...priceRanges].sort((a, b) => {
          if (a.id === "all_rent") return -1;
          if (b.id === "all_rent") return 1;
          if (a.id === "0" || a.id === "r0") return -1;
          if (b.id === "0" || b.id === "r0") return 1;

          const getNumericId = (id: string): number => {
            if (typeof id !== "string") return parseInt(id);
            if (id.startsWith("r")) return parseInt(id.substring(1));
            return parseInt(id);
          };

          const numA = getNumericId(a.id);
          const numB = getNumericId(b.id);

          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.id.localeCompare(b.id);
        });

        setPriceRanges(sortedPriceRanges);

        // 3. Fetch area ranges (không cần cho projects)
        if (searchType !== "project") {
          const areaResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "http://localhost:8080/api"
            }/areas`
          );

          if (!areaResponse.ok) {
            throw new Error(
              `Error fetching area ranges: ${areaResponse.status}`
            );
          }

          const areaResult = await areaResponse.json();
          const areaRanges = areaResult.data?.areas || [];
          setAreaRanges(areaRanges);
        } else {
          setAreaRanges([]);
        }

        // Update selected values dựa trên initialValues nếu cần
        if (!hasUpdatedFromProps.current) {
          // Cập nhật category nếu có initialCategory và categories đã tải
          if (initialCategory && filteredCategories.length > 0) {
            const matchingCategory = filteredCategories.find(
              (cat) => cat.slug === initialCategory
            );
            if (matchingCategory) {
              setSelectedPropertyType(matchingCategory.slug);
            }
          }

          // Cập nhật price nếu có initialPrice và priceRanges đã tải
          if (initialPrice && sortedPriceRanges.length > 0) {
            const matchingPrice = sortedPriceRanges.find(
              (price) =>
                price.slug === initialPrice || price.id === initialPrice
            );
            if (matchingPrice) {
              setSelectedPrice(matchingPrice.slug || matchingPrice.id || "");
            }
          }

          // Cập nhật area nếu có initialArea và areaRanges đã tải
          if (
            initialArea &&
            searchType !== "project" &&
            areaRanges.length > 0
          ) {
            const matchingArea = areaRanges.find(
              (area) => area.slug === initialArea || area.id === initialArea
            );
            if (matchingArea) {
              setSelectedArea(matchingArea.slug || matchingArea.id || "");
            }
          }

          hasUpdatedFromProps.current = true;
        }
      } catch (error) {
        console.error("Failed to fetch search options:", error);
        setCategories([]);
        setPriceRanges([]);
        setAreaRanges([]);
      } finally {
        setLoadingSearchOptions(false);
      }
    };

    fetchSearchOptions();
  }, [searchType]);

  // SAFE: Theo dõi thay đổi category từ props
  useEffect(() => {
    if (initialCategory !== selectedPropertyType) {
      setSelectedPropertyType(initialCategory || "");
    }
  }, [initialCategory]);

  // SAFE: Theo dõi thay đổi price từ props
  useEffect(() => {
    if (initialPrice !== selectedPrice) {
      setSelectedPrice(initialPrice || "");
    }
  }, [initialPrice]);

  // SAFE: Theo dõi thay đổi area từ props
  useEffect(() => {
    if (initialArea !== selectedArea) {
      setSelectedArea(initialArea || "");
    }
  }, [initialArea]);

  // SAFE: Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // City dropdown
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }

      // Location suggestions
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }

      // Property type dropdown
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPropertyDropdown(false);
      }

      // Price dropdown
      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriceDropdown(false);
      }

      // Area dropdown
      if (
        areaDropdownRef.current &&
        !areaDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAreaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered districts based on search
  const filteredDistricts = useMemo(() => {
    // Nếu không có selectedCity, không hiển thị districts
    if (!selectedCity) {
      return [];
    }

    if (!locationSearch || locationSearch.trim() === "") {
      return selectedCityDistricts;
    }

    const searchLower = locationSearch.toLowerCase();
    return selectedCityDistricts.filter((district) =>
      district.name.toLowerCase().includes(searchLower)
    );
  }, [locationSearch, selectedCityDistricts, selectedCity]);

  // Handlers
  const handleCitySelect = (cityCode: string) => {
    if (cityCode !== selectedCity) {
      setSelectedDistricts([]);

      // Không reset selectedCityDistricts ngay lập tức để tránh nhấp nháy UI
      setSelectedCity(cityCode);
      setShowCityDropdown(false);
      setLocationSearch("");

      // Không cần gọi fetchDistricts ở đây, useEffect sẽ tự động xử lý
    } else {
      // Nếu click lại city đã chọn, chỉ đóng dropdown
      setShowCityDropdown(false);
    }
  };

  const handleDistrictSelect = (district: any) => {
    // Không cho phép chọn quá 3 quận/huyện
    if (selectedDistricts.length >= 3) {
      return;
    }

    // Kiểm tra đã chọn rồi chưa
    const alreadySelected = selectedDistricts.some(
      (d) => d.code === district.code || d.codename === district.codename
    );

    if (alreadySelected) {
      return;
    }

    setSelectedDistricts((prev) => [
      ...prev,
      {
        code: district.code,
        name: district.name,
        codename: district.codename || district.code,
      },
    ]);

    setLocationSearch("");
  };

  const handleDistrictRemove = (districtCode: string) => {
    setSelectedDistricts((prev) =>
      prev.filter((district) => district.code !== districtCode)
    );
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocationSearch(e.target.value);
  };

  const handleLocationInputFocus = () => {
    // Chỉ hiển thị suggestions nếu có thành phố được chọn
    if (selectedCity) {
      setShowLocationSuggestions(true);
    } else {
      // Nếu chưa chọn thành phố, hiển thị dropdown thành phố
      setShowCityDropdown(true);
    }
  };

  const handlePropertyTypeSelect = (propertyTypeSlug: string) => {
    setSelectedPropertyType(propertyTypeSlug);
    setShowPropertyDropdown(false);
  };

  // Helper functions for labels
  const getSelectedCityLabel = (): string => {
    if (selectedCity) {
      const city = locationData.find((c) => c.code === selectedCity);
      return city ? city.name : "Toàn quốc";
    }
    return locationData.length > 0 ? "Toàn quốc" : "Đang tải...";
  };

  const getSelectedPropertyLabel = (): string => {
    if (selectedPropertyType) {
      const category = categories.find((c) => c.slug === selectedPropertyType);
      return category ? category.name : "Tất cả loại hình";
    }
    return "Tất cả loại hình";
  };

  const getSelectedPriceLabel = (): string => {
    if (selectedPrice) {
      const price = priceRanges.find(
        (p) => p.slug === selectedPrice || p.id === selectedPrice
      );
      return price ? price.name || price.label || "" : "Tất cả mức giá";
    }
    return "Tất cả mức giá";
  };

  const getSelectedAreaLabel = (): string => {
    if (selectedArea) {
      const area = areaRanges.find(
        (a) => a.slug === selectedArea || a.id === selectedArea
      );
      return area ? area.name || area.label || "" : "Tất cả diện tích";
    }
    return "Tất cả diện tích";
  };

  // Search handler
  const handleSearch = () => {
    const baseUrl =
      searchType === "project"
        ? "/du-an"
        : searchType === "buy"
        ? "/mua-ban"
        : "/cho-thue";

    const queryParams = new URLSearchParams();

    if (selectedPropertyType) {
      queryParams.set("category", selectedPropertyType);
    }

    if (selectedCity) {
      const selectedCityData = locationData.find(
        (c) => c.code === selectedCity
      );
      if (selectedCityData) {
        queryParams.set("city", selectedCityData.codename);
      }
    }

    if (selectedDistricts.length > 0) {
      selectedDistricts.forEach((district) => {
        queryParams.append("districts", district.codename || district.code);
      });
    }

    if (selectedPrice) {
      queryParams.set("price", selectedPrice);
    }

    if (selectedArea && searchType !== "project") {
      queryParams.set("area", selectedArea);
    }

    const queryString = queryParams.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    router.push(finalUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-6xl mx-auto">
      {/* Search Tabs */}
      <div className="flex mb-4 border-b">
        <Tab.Group
          selectedIndex={["buy", "rent", "project"].indexOf(searchType)}
          onChange={(index) => {
            const newSearchType = ["buy", "rent", "project"][index] as
              | "buy"
              | "rent"
              | "project";
            setSearchType(newSearchType);
            // Reset category và price khi đổi tab
            setSelectedPropertyType("");
            setSelectedPrice("");
            if (newSearchType === "project") {
              setSelectedArea("");
            }
          }}
        >
          <Tab.List className="flex space-x-4">
            <Tab
              className={({ selected }) => `
              ${
                selected
                  ? "text-blue-600 font-medium border-b-2 border-blue-600"
                  : "text-gray-600"
              }
              px-4 py-2 focus:outline-none whitespace-nowrap
            `}
            >
              Mua bán
            </Tab>
            <Tab
              className={({ selected }) => `
              ${
                selected
                  ? "text-blue-600 font-medium border-b-2 border-blue-600"
                  : "text-gray-600"
              }
              px-4 py-2 focus:outline-none whitespace-nowrap
            `}
            >
              Cho thuê
            </Tab>
            <Tab
              className={({ selected }) => `
              ${
                selected
                  ? "text-blue-600 font-medium border-b-2 border-blue-600"
                  : "text-gray-600"
              }
              px-4 py-2 focus:outline-none whitespace-nowrap
            `}
            >
              Dự án
            </Tab>
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Search Form */}
      <div className="flex flex-col gap-4">
        {/* Location Section */}
        <div className="w-full relative">
          <div className="border border-gray-300 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center">
            {/* City Selector */}
            <div className="flex items-center p-3 border-b sm:border-b-0 sm:border-r border-gray-200">
              <div className="relative flex-shrink-0" ref={cityDropdownRef}>
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50"
                >
                  <i className="fas fa-map-marker-alt text-blue-600 text-xs"></i>
                  <span className="font-medium text-sm">
                    {getSelectedCityLabel()}
                  </span>
                  <i
                    className={`fas fa-chevron-${
                      showCityDropdown ? "up" : "down"
                    } text-xs`}
                  ></i>
                </button>

                {/* City Dropdown */}
                {showCityDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {/* Top Cities */}
                    <div className="p-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Tỉnh thành nổi bật
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {locationData.slice(0, 6).map((city) => (
                          <button
                            key={city.code}
                            onClick={() => handleCitySelect(city.code)}
                            className={`relative h-16 rounded-lg overflow-hidden text-white text-sm font-medium ${
                              selectedCity === city.code
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            style={{
                              background:
                                "linear-gradient(45deg, #3b82f6, #1d4ed8)",
                            }}
                          >
                            <span className="relative z-10">{city.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* All Cities */}
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-2 text-sm font-medium text-gray-700">
                        Tất cả tỉnh thành
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {locationData.map((city) => (
                          <button
                            key={city.code}
                            onClick={() => handleCitySelect(city.code)}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                              selectedCity === city.code
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                          >
                            {city.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Input và Search Button */}
            <div
              className="flex items-center flex-1 relative"
              ref={locationSuggestionsRef}
            >
              <div className="flex-1 flex flex-col p-3 gap-2">
                {/* Selected Districts Badges */}
                {searchType !== "project" && selectedDistricts.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedDistricts.map((district) => (
                      <span
                        key={district.code}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        <i className="fas fa-map-marker-alt text-xs"></i>
                        {district.name}
                        <button
                          onClick={() => handleDistrictRemove(district.code)}
                          className="ml-1 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                    {selectedDistricts.length >= 3 && (
                      <span className="text-xs text-gray-500 self-center">
                        (Tối đa 3 quận)
                      </span>
                    )}
                  </div>
                )}

                {/* Input */}
                <div className="flex items-center">
                  <i className="fas fa-search text-gray-400 mr-3 text-sm"></i>
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={handleLocationInputChange}
                    onFocus={handleLocationInputFocus}
                    onClick={handleLocationInputFocus} // Thêm onClick để hiển thị dropdown khi click
                    placeholder={
                      !selectedCity
                        ? "Chọn tỉnh/thành phố trước"
                        : searchType === "project"
                        ? `Nhập tên dự án trong ${getSelectedCityLabel()}...`
                        : selectedDistricts.length >= 3
                        ? "Đã chọn tối đa 3 quận"
                        : `Nhập quận/huyện trong ${getSelectedCityLabel()}...`
                    }
                    disabled={
                      !selectedCity ||
                      (searchType !== "project" &&
                        selectedDistricts.length >= 3)
                    }
                    className="flex-1 text-sm border-none outline-none bg-transparent disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && (
                <div className="absolute top-full left-0 right-12 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
                  {!selectedCity ? (
                    <div className="p-4 text-center">
                      <div className="text-gray-500 text-sm">
                        Vui lòng chọn tỉnh/thành phố trước
                      </div>
                    </div>
                  ) : filteredDistricts.length > 0 ? (
                    <>
                      <div className="p-2 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-700">
                          Quận/Huyện trong {getSelectedCityLabel()}
                          {selectedDistricts.length > 0 && (
                            <span className="text-blue-600 ml-1">
                              (Đã chọn: {selectedDistricts.length}/3)
                            </span>
                          )}
                        </div>
                      </div>
                      {filteredDistricts.map((district) => {
                        const isSelected = selectedDistricts.some(
                          (d) =>
                            d.code === district.code ||
                            d.codename === district.codename
                        );
                        const canSelect =
                          selectedDistricts.length < 3 && !isSelected;

                        return (
                          <button
                            key={district.code || district.codename}
                            onClick={() =>
                              canSelect && handleDistrictSelect(district)
                            }
                            disabled={!canSelect}
                            className={`w-full px-3 py-2 text-left text-sm border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                              isSelected
                                ? "bg-blue-50 text-blue-600 cursor-default"
                                : canSelect
                                ? "hover:bg-gray-50 cursor-pointer"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <span className="flex items-center">
                              <i
                                className={`fas fa-map-marker-alt mr-2 ${
                                  isSelected ? "text-blue-600" : "text-gray-400"
                                }`}
                              ></i>
                              {district.name}
                            </span>
                            {isSelected && (
                              <i className="fas fa-check text-blue-600 text-xs"></i>
                            )}
                            {!canSelect && !isSelected && (
                              <span className="text-xs text-gray-400">
                                (Tối đa 3)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </>
                  ) : selectedCityDistricts.length === 0 ? (
                    <div className="p-4 text-center">
                      <div className="text-gray-500 text-sm">
                        Đang tải danh sách quận/huyện...
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="text-gray-500 text-sm">
                        Không tìm thấy quận/huyện phù hợp
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-2">
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Property Type */}
          <div className="w-full sm:w-1/3 relative" ref={propertyDropdownRef}>
            <button
              onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center hover:border-blue-500"
            >
              <span className="text-sm truncate">
                {getSelectedPropertyLabel()}
              </span>
              <i
                className={`fas fa-chevron-${
                  showPropertyDropdown ? "up" : "down"
                } text-gray-400 text-xs ml-2`}
              ></i>
            </button>

            {showPropertyDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-3 border-b border-gray-200 flex-shrink-0">
                  <div className="text-sm font-medium text-gray-700">
                    {searchType === "project" ? "Loại dự án" : "Loại nhà đất"}
                  </div>
                </div>

                {/* Scrollable Content */}
                {loadingSearchOptions ? (
                  <div className="p-4 text-center">
                    <div className="animate-pulse text-gray-500">
                      Đang tải...
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    {categories.length === 0 && !loadingSearchOptions ? (
                      <div className="p-4 text-center text-gray-500">
                        Không có dữ liệu loại bất động sản
                      </div>
                    ) : (
                      categories.map((category) => {
                        const isSelected =
                          selectedPropertyType === category.slug;

                        return (
                          <button
                            key={category._id}
                            onClick={() =>
                              handlePropertyTypeSelect(category.slug)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 ${
                              isSelected ? "bg-blue-50" : ""
                            }`}
                          >
                            <span
                              className={`text-sm ${
                                isSelected ? "text-blue-600 font-medium" : ""
                              }`}
                            >
                              {category.name}
                            </span>
                            {isSelected && (
                              <i className="fas fa-check text-blue-600 text-xs"></i>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 flex justify-between items-center flex-shrink-0 bg-white">
                  <button
                    onClick={() => {
                      setSelectedPropertyType("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Đặt lại
                  </button>
                  <button
                    onClick={() => setShowPropertyDropdown(false)}
                    className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="w-full sm:w-1/3 relative" ref={priceDropdownRef}>
            <button
              onClick={() => setShowPriceDropdown(!showPriceDropdown)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center hover:border-blue-500"
            >
              <span className="text-sm truncate">
                {getSelectedPriceLabel()}
              </span>
              <i
                className={`fas fa-chevron-${
                  showPriceDropdown ? "up" : "down"
                } text-gray-400 text-xs`}
              ></i>
            </button>

            {showPriceDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-700">
                    Mức giá
                  </div>
                </div>

                {loadingSearchOptions ? (
                  <div className="p-4 text-center">
                    <div className="animate-pulse text-gray-500">
                      Đang tải...
                    </div>
                  </div>
                ) : (
                  priceRanges.map((price) => {
                    const isPriceSelected =
                      price.slug === selectedPrice ||
                      price.id === selectedPrice;

                    return (
                      <button
                        key={price._id}
                        onClick={() => {
                          setSelectedPrice(price.slug || price.id || "");
                          setShowPriceDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-50 flex items-center justify-between ${
                          isPriceSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <span
                          className={
                            isPriceSelected ? "text-blue-600 font-medium" : ""
                          }
                        >
                          {price.name || price.label}
                        </span>
                        {isPriceSelected && (
                          <i className="fas fa-check text-blue-600 text-xs"></i>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Area - Ẩn cho dự án */}
          {searchType !== "project" && (
            <div className="w-full sm:w-1/3 relative" ref={areaDropdownRef}>
              <button
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center hover:border-blue-500"
              >
                <span className="text-sm truncate">
                  {getSelectedAreaLabel()}
                </span>
                <i
                  className={`fas fa-chevron-${
                    showAreaDropdown ? "up" : "down"
                  } text-gray-400 text-xs`}
                ></i>
              </button>

              {showAreaDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-700">
                      Diện tích
                    </div>
                  </div>

                  {loadingSearchOptions ? (
                    <div className="p-4 text-center">
                      <div className="animate-pulse text-gray-500">
                        Đang tải...
                      </div>
                    </div>
                  ) : (
                    areaRanges.map((area) => {
                      const isAreaSelected =
                        area.slug === selectedArea || area.id === selectedArea;

                      return (
                        <button
                          key={area._id}
                          onClick={() => {
                            setSelectedArea(area.slug || area.id || "");
                            setShowAreaDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-50 flex items-center justify-between ${
                            isAreaSelected ? "bg-blue-50" : ""
                          }`}
                        >
                          <span
                            className={
                              isAreaSelected ? "text-blue-600 font-medium" : ""
                            }
                          >
                            {area.name || area.label}
                          </span>
                          {isAreaSelected && (
                            <i className="fas fa-check text-blue-600 text-xs"></i>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
