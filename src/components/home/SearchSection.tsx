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
  initialCity?: string | null;
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

  // States
  const [searchType, setSearchType] = useState<"buy" | "rent" | "project">(
    initialSearchType
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedCityDistricts, setSelectedCityDistricts] =
    useState<any[]>(cityDistricts);
  const [selectedDistricts, setSelectedDistricts] =
    useState<SelectedDistrict[]>(initialDistricts);
  const [selectedPropertyType, setSelectedPropertyType] =
    useState<string>(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState<string>(initialPrice);
  const [selectedArea, setSelectedArea] = useState<string>(initialArea);
  const [locationSearch, setLocationSearch] = useState<string>("");

  // Dropdown states
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const [showPropertyDropdown, setShowPropertyDropdown] =
    useState<boolean>(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState<boolean>(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState<boolean>(false);
  const [showLocationSuggestions, setShowLocationSuggestions] =
    useState<boolean>(false);

  // Lưu trữ toàn bộ tỉnh thành
  const [locationData, setLocationData] = useState<any[]>(provinces);

  // Dynamic data from services
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [areaRanges, setAreaRanges] = useState<AreaRange[]>([]);
  const [loadingSearchOptions, setLoadingSearchOptions] = useState(true);

  // Refs for dropdowns
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);

  // Thêm fetch và thiết lập cho categories, priceRanges và areaRanges khi component mount
  useEffect(() => {
    const fetchSearchOptions = async () => {
      setLoadingSearchOptions(true);
      try {
        // Get the appropriate listing type
        let listingType: "ban" | "cho-thue" | "project" = "ban";
        if (searchType === "rent") listingType = "cho-thue";
        if (searchType === "project") listingType = "project";

        // Fetch data in parallel
        const [categoriesData, priceRangesData, areaRangesData] =
          await Promise.all([
            categoryService.getByProjectType(searchType === "project"),
            priceRangeService.getByType(listingType),
            areaService.getAll(),
          ]);

        setCategories(categoriesData);
        setPriceRanges(priceRangesData);
        setAreaRanges(areaRangesData);

        // Set initial values from URL params
        if (initialCategory && categoriesData.length > 0) {
          const foundCategory = categoriesData.find(
            (cat) => cat.slug === initialCategory
          );
          if (foundCategory) {
            setSelectedPropertyType(foundCategory.slug);
          }
        }

        if (initialPrice && priceRangesData.length > 0) {
          setSelectedPrice(initialPrice);
        }

        if (initialArea && areaRangesData.length > 0) {
          setSelectedArea(initialArea);
        }
      } catch (error) {
        console.error("Error fetching search options:", error);
      } finally {
        setLoadingSearchOptions(false);
      }
    };

    fetchSearchOptions();
  }, [searchType, initialCategory, initialPrice, initialArea]);

  // Tải dữ liệu tỉnh thành nếu chưa được truyền vào
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        if (provinces.length === 0) {
          const data = await locationService.getProvinces();
          setLocationData(data);
        } else {
          setLocationData(provinces);
        }
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };

    fetchProvinces();
  }, [provinces]);

  // Tải quận/huyện khi có selectedCity mà chưa có cityDistricts
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedCity && cityDistricts.length === 0) {
        try {
          // Tìm city theo code
          const selectedCityData = locationData.find(
            (city) => city.code === selectedCity
          );
          if (selectedCityData) {
            const districts = await locationService.getDistricts(
              selectedCityData.codename
            );
            setSelectedCityDistricts(districts);
          }
        } catch (error) {
          console.error("Failed to fetch districts:", error);
        }
      } else if (cityDistricts.length > 0) {
        setSelectedCityDistricts(cityDistricts);
      }
    };

    if (locationData.length > 0) {
      fetchDistricts();
    }
  }, [selectedCity, cityDistricts, locationData]);

  // Xử lý click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(target)
      ) {
        setShowCityDropdown(false);
      }
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(target)
      ) {
        setShowPropertyDropdown(false);
      }
      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(target)
      ) {
        setShowPriceDropdown(false);
      }
      if (
        areaDropdownRef.current &&
        !areaDropdownRef.current.contains(target)
      ) {
        setShowAreaDropdown(false);
      }
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(target)
      ) {
        setShowLocationSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Đồng bộ initialDistricts với selectedDistricts state
    if (initialDistricts && initialDistricts.length > 0) {
      setSelectedDistricts(initialDistricts);
    }
  }, [initialDistricts]);

  // Cập nhật selectedCityDistricts khi cityDistricts thay đổi
  useEffect(() => {
    if (cityDistricts && cityDistricts.length > 0) {
      setSelectedCityDistricts(cityDistricts);
    }
  }, [cityDistricts]);

  // Lấy danh sách quận/huyện đã được chọn
  const filteredDistricts = useMemo(() => {
    if (!locationSearch.trim()) return selectedCityDistricts;

    return selectedCityDistricts.filter((district) =>
      district.name.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [selectedCityDistricts, locationSearch]);

  // Lấy tên thành phố đã chọn
  const getSelectedCityLabel = (): string => {
    if (selectedCity) {
      const city = locationData.find((c) => c.code === selectedCity);
      return city ? city.name : "Toàn quốc";
    }
    return locationData.length > 0 ? "Toàn quốc" : "Đang tải...";
  };

  // Lấy tên loại bất động sản đã chọn
  const getSelectedPropertyLabel = (): string => {
    if (!selectedPropertyType || loadingSearchOptions) {
      return searchType === "project" ? "Loại dự án" : "Loại nhà đất";
    }

    const category = categories.find((c) => c.slug === selectedPropertyType);
    return category ? category.name : "Loại nhà đất";
  };

  // Lấy tên mức giá đã chọn
  const getSelectedPriceLabel = (): string => {
    if (!selectedPrice || loadingSearchOptions) return "Mức giá";

    const priceRange = priceRanges.find(
      (p) => p.slug === selectedPrice || p.value === selectedPrice
    );
    return priceRange ? priceRange.name || priceRange.label : "Mức giá";
  };

  // Lấy tên diện tích đã chọn
  const getSelectedAreaLabel = (): string => {
    if (!selectedArea || loadingSearchOptions) return "Diện tích";

    const areaRange = areaRanges.find(
      (a) => a.slug === selectedArea || a.value === selectedArea
    );
    return areaRange ? areaRange.name || areaRange.label : "Diện tích";
  };

  // Xử lý khi chọn thành phố
  const handleCitySelect = (cityCode: string) => {
    setSelectedCity(cityCode);
    setLocationSearch("");
    setSelectedDistricts([]);
    setShowCityDropdown(false);

    // Tải lại quận/huyện khi đổi thành phố
    const fetchDistrictsForCity = async () => {
      try {
        const cityData = locationData.find((city) => city.code === cityCode);
        if (cityData) {
          const districts = await locationService.getDistricts(
            cityData.codename
          );
          setSelectedCityDistricts(districts);
        }
      } catch (error) {
        console.error("Failed to fetch districts for new city:", error);
      }
    };

    fetchDistrictsForCity();
  };

  // Xử lý khi chọn loại bất động sản
  const handlePropertyTypeSelect = (categorySlug: string) => {
    setSelectedPropertyType(categorySlug);
    setShowPropertyDropdown(false);
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictSelect = (district: any) => {
    if (selectedDistricts.length >= 3) return;

    const alreadySelected = selectedDistricts.some(
      (d) => d.code === district.code
    );
    if (alreadySelected) return;

    setSelectedDistricts((prev) => [...prev, district]);
    setLocationSearch("");
    setShowLocationSuggestions(false);
  };

  // Xử lý khi xóa quận/huyện
  const handleDistrictRemove = (districtCode: string) => {
    setSelectedDistricts((prev) => prev.filter((d) => d.code !== districtCode));
  };

  // Xử lý khi nhập vào ô tìm kiếm địa điểm
  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocationSearch(e.target.value);
    setShowLocationSuggestions(e.target.value.length > 0);
  };

  // Xử lý khi focus vào ô tìm kiếm địa điểm
  const handleLocationInputFocus = () => {
    setShowLocationSuggestions(true);
  };

  // Xử lý khi bấm nút tìm kiếm
  const handleSearch = () => {
    // Xác định base URL dựa trên loại tìm kiếm
    const baseUrl =
      searchType === "project"
        ? "/du-an"
        : searchType === "buy"
        ? "/mua-ban"
        : "/cho-thue";

    // Tạo query params
    const queryParams = new URLSearchParams();

    // Thêm loại bất động sản (category)
    if (selectedPropertyType) {
      queryParams.set("category", selectedPropertyType);
    }

    // Thêm thành phố (city)
    if (selectedCity) {
      const selectedCityData = locationData.find(
        (c) => c.code === selectedCity
      );
      if (selectedCityData) {
        queryParams.set("city", selectedCityData.codename);
      }
    }

    // Thêm quận/huyện (districts)
    if (selectedDistricts.length > 0) {
      selectedDistricts.forEach((district) => {
        queryParams.append("districts", district.codename || district.code);
      });
    }

    // Thêm giá (price)
    if (selectedPrice) {
      queryParams.set("price", selectedPrice);
    }

    // Thêm diện tích (area)
    if (selectedArea && searchType !== "project") {
      queryParams.set("area", selectedArea);
    }

    // Tạo URL cuối cùng và chuyển hướng
    const queryString = queryParams.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    console.log("Navigating to URL:", finalUrl);
    router.push(finalUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-6xl mx-auto">
      {/* Search Tabs */}
      <div className="flex mb-4 border-b">
        <Tab.Group
          selectedIndex={["buy", "rent", "project"].indexOf(searchType)}
          onChange={(index) => {
            setSearchType(["buy", "rent", "project"][index] as any);
            setSelectedPropertyType("");
            setSelectedPrice("");
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
                    placeholder={
                      searchType === "project"
                        ? `Nhập tên dự án trong ${getSelectedCityLabel()}...`
                        : selectedDistricts.length >= 3
                        ? "Đã chọn tối đa 3 quận"
                        : `Nhập quận/huyện trong ${getSelectedCityLabel()}...`
                    }
                    disabled={
                      searchType !== "project" && selectedDistricts.length >= 3
                    }
                    className="flex-1 text-sm border-none outline-none bg-transparent disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && (
                <div className="absolute top-full left-0 right-12 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
                  {filteredDistricts.length > 0 ? (
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
                          (d) => d.code === district.code
                        );
                        const canSelect =
                          selectedDistricts.length < 3 && !isSelected;

                        return (
                          <button
                            key={district.code}
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
                    {categories.map((category) => {
                      const isSelected = selectedPropertyType === category.slug;

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
                    })}
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
                      price.value === selectedPrice;

                    return (
                      <button
                        key={price._id}
                        onClick={() => {
                          setSelectedPrice(price.slug || price.value || "");
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
                        area.slug === selectedArea ||
                        area.value === selectedArea;

                      return (
                        <button
                          key={area._id}
                          onClick={() => {
                            setSelectedArea(area.slug || area.value || "");
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
