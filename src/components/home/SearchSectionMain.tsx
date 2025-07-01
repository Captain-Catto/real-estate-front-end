"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tab } from "@headlessui/react";
import { locationService } from "@/services/locationService";
import { categoryService, Category } from "@/services/categoryService";
import { priceRangeService, PriceRange } from "@/services/priceService";
import { areaService, AreaRange } from "@/services/areaService";

interface SelectedDistrict {
  code: string;
  name: string;
  codename: string;
}

export default function SearchSectionMain() {
  const router = useRouter();

  // States
  const [searchType, setSearchType] = useState<"buy" | "rent" | "project">(
    "buy"
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<
    SelectedDistrict[]
  >([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Locations data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cityDistricts, setCityDistricts] = useState<any[]>([]);

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

  // Tải danh sách tỉnh/thành
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Tải danh sách quận/huyện khi chọn tỉnh/thành
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedCity) {
        setCityDistricts([]);
        return;
      }

      try {
        const data = await locationService.getDistricts(selectedCity);
        setCityDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setCityDistricts([]);
      }
    };

    fetchDistricts();
  }, [selectedCity]);

  // Tải các tùy chọn tìm kiếm dựa trên loại tìm kiếm
  useEffect(() => {
    const fetchSearchOptions = async () => {
      setLoadingSearchOptions(true);
      try {
        // 1. Tải danh mục
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

        // Lọc danh mục theo searchType
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

        // 2. Tải khoảng giá
        const priceTypeParam =
          searchType === "buy"
            ? "ban"
            : searchType === "rent"
            ? "thue"
            : "project";
        const priceResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
          }/price-ranges/type/${priceTypeParam}`
        );

        if (!priceResponse.ok) {
          throw new Error(
            `Error fetching price ranges: ${priceResponse.status}`
          );
        }

        const priceResult = await priceResponse.json();
        const priceRanges = priceResult.data?.priceRanges || [];

        // Sắp xếp khoảng giá theo thứ tự tăng dần
        const sortedPriceRanges = [...priceRanges].sort((a, b) => {
          // Xử lý trường hợp đặc biệt: < X VNĐ
          if (a.minValue === 0 && b.minValue !== 0) return -1;
          if (b.minValue === 0 && a.minValue !== 0) return 1;
          return a.minValue - b.minValue;
        });

        setPriceRanges(sortedPriceRanges);

        // 3. Tải khoảng diện tích
        const areaResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
          }/areas`
        );

        if (!areaResponse.ok) {
          throw new Error(`Error fetching area ranges: ${areaResponse.status}`);
        }

        const areaResult = await areaResponse.json();
        const areaRanges = areaResult.data?.areas || [];

        // Sắp xếp khoảng diện tích theo thứ tự tăng dần
        const sortedAreaRanges = [...areaRanges].sort((a, b) => {
          if (a.minValue === 0 && b.minValue !== 0) return -1;
          if (b.minValue === 0 && a.minValue !== 0) return 1;
          return a.minValue - b.minValue;
        });

        setAreaRanges(sortedAreaRanges);
      } catch (error) {
        console.error("Error fetching search options:", error);
      } finally {
        setLoadingSearchOptions(false);
      }
    };

    fetchSearchOptions();
  }, [searchType]);

  // Click-away handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
        !locationSuggestionsRef.current.contains(event.target as Node) &&
        !cityDropdownRef.current?.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }

      // Property dropdown
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
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý chọn tab tìm kiếm
  const handleTabChange = (index: number) => {
    const types: ["buy", "rent", "project"] = ["buy", "rent", "project"];
    setSearchType(types[index]);

    // Reset các lựa chọn
    setSelectedPropertyType("");
    setSelectedPrice("");
    setSelectedArea("");
  };

  // Xử lý chọn thành phố
  const handleCitySelect = (province: any) => {
    setSelectedCity(province.code);
    setSelectedDistricts([]);
    setShowCityDropdown(false);
    setLocationSearch("");
  };

  // Xử lý chọn quận/huyện
  const handleDistrictSelect = (district: any) => {
    // Tối đa 3 quận/huyện được chọn
    if (
      selectedDistricts.length >= 3 &&
      !selectedDistricts.some((d) => d.code === district.code)
    ) {
      return;
    }

    // Toggle chọn/bỏ chọn quận/huyện
    const isSelected = selectedDistricts.some((d) => d.code === district.code);

    if (isSelected) {
      setSelectedDistricts(
        selectedDistricts.filter((d) => d.code !== district.code)
      );
    } else {
      setSelectedDistricts([
        ...selectedDistricts,
        {
          code: district.code,
          name: district.name,
          codename: district.codename,
        },
      ]);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    // Xác định đường dẫn tìm kiếm dựa trên loại tìm kiếm
    let baseUrl;
    switch (searchType) {
      case "buy":
        baseUrl = "/mua-ban";
        break;
      case "rent":
        baseUrl = "/cho-thue";
        break;
      case "project":
        baseUrl = "/du-an";
        break;
      default:
        baseUrl = "/mua-ban";
    }

    // Tạo query params
    const queryParams = new URLSearchParams();

    // Thêm thành phố
    if (selectedCity) {
      const selectedProvince = provinces.find((p) => p.code === selectedCity);
      if (selectedProvince) {
        queryParams.append("city", selectedProvince.codename);
      }
    }

    // Thêm quận/huyện
    if (selectedDistricts.length > 0) {
      selectedDistricts.forEach((district) => {
        queryParams.append("districts", district.codename);
      });
    }

    // Thêm loại bất động sản
    if (selectedPropertyType) {
      queryParams.append("category", selectedPropertyType);
    }

    // Thêm khoảng giá
    if (selectedPrice) {
      queryParams.append("price", selectedPrice);
    }

    // Thêm khoảng diện tích
    if (selectedArea) {
      queryParams.append("area", selectedArea);
    }

    // Tạo URL đầy đủ
    const searchUrl = `${baseUrl}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    // Chuyển hướng đến trang kết quả tìm kiếm
    router.push(searchUrl);
  };

  // Lọc quận/huyện dựa trên từ khóa tìm kiếm
  const filteredDistricts = locationSearch
    ? cityDistricts.filter((district) =>
        district.name.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : cityDistricts;

  // Render các tab tìm kiếm
  // Cập nhật giao diện phần tabs tìm kiếm
  const renderTabs = () => (
    <div className="mb-6">
      <Tab.Group onChange={handleTabChange}>
        <Tab.List className="flex rounded-lg border-b border-gray-200 overflow-hidden">
          <Tab
            className={({ selected }) =>
              `flex-1 py-4 text-center font-medium text-lg transition-all duration-200 ease-in-out ${
                selected
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
              }`
            }
          >
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-home"></i>
              Mua bán
            </span>
          </Tab>
          <Tab
            className={({ selected }) =>
              `flex-1 py-4 text-center font-medium text-lg transition-all duration-200 ease-in-out ${
                selected
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
              }`
            }
          >
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-key"></i>
              Cho thuê
            </span>
          </Tab>
          <Tab
            className={({ selected }) =>
              `flex-1 py-4 text-center font-medium text-lg transition-all duration-200 ease-in-out ${
                selected
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
              }`
            }
          >
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-building"></i>
              Dự án
            </span>
          </Tab>
        </Tab.List>
      </Tab.Group>
    </div>
  );

  // Cập nhật giao diện phần dropdown chọn thành phố
  const renderCityDropdown = () => (
    <div className="relative" ref={cityDropdownRef}>
      <button
        onClick={() => setShowCityDropdown(!showCityDropdown)}
        className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
      >
        <i className="fas fa-map-marker-alt text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
        <span
          className={`${
            selectedCity ? "text-gray-900 font-medium" : "text-gray-500"
          } flex-1 text-left`}
        >
          {selectedCity
            ? provinces.find((p) => p.code === selectedCity)?.name
            : "Toàn quốc"}
        </span>
        <i
          className={`fas fa-chevron-${
            showCityDropdown ? "up" : "down"
          } text-gray-400 group-hover:text-blue-500`}
        ></i>
      </button>

      {showCityDropdown && (
        <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tỉnh/thành phố..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {/* Tỉnh thành phổ biến */}
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase mb-2 font-medium">
                Phổ biến
              </p>
              <div className="grid grid-cols-2 gap-2">
                {provinces.slice(0, 6).map((province) => (
                  <button
                    key={`popular-${province.code}`}
                    className={`p-2 text-left rounded-md hover:bg-blue-50 transition-colors
                    ${
                      selectedCity === province.code
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleCitySelect(province)}
                  >
                    {province.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tất cả tỉnh thành */}
            <div className="p-2">
              <p className="text-xs text-gray-500 uppercase mb-2 px-2 font-medium">
                Tất cả
              </p>
              <button
                className={`w-full px-4 py-2 text-left rounded-md hover:bg-blue-50 transition-colors
                ${
                  !selectedCity
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setSelectedCity(null);
                  setSelectedDistricts([]);
                  setShowCityDropdown(false);
                  setLocationSearch("");
                }}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-globe-asia text-gray-400"></i>
                  Toàn quốc
                </div>
              </button>

              {/* Provinces filtered by search */}
              {provinces
                .filter((province) =>
                  province.name
                    .toLowerCase()
                    .includes(locationSearch.toLowerCase())
                )
                .map((province) => (
                  <button
                    key={province.code}
                    className={`w-full px-4 py-2 text-left rounded-md hover:bg-blue-50 transition-colors
                    ${
                      selectedCity === province.code
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleCitySelect(province)}
                  >
                    {province.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Quận/huyện dropdown - Hiển thị khi đã chọn thành phố */}
      {selectedCity && (
        <div className="relative mt-3" ref={locationSuggestionsRef}>
          <button
            onClick={() => setShowLocationSuggestions(!showLocationSuggestions)}
            className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200"
          >
            <i className="fas fa-map text-blue-500 mr-3 text-lg"></i>
            <div className="flex flex-wrap gap-1.5 items-center flex-1 text-left">
              {selectedDistricts.length > 0 ? (
                selectedDistricts.map((district) => (
                  <span
                    key={district.code}
                    className="bg-blue-100 text-blue-800 text-sm px-2.5 py-1 rounded-full flex items-center"
                  >
                    {district.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDistricts(
                          selectedDistricts.filter(
                            (d) => d.code !== district.code
                          )
                        );
                      }}
                      className="ml-1.5 hover:text-blue-700"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Chọn quận/huyện</span>
              )}
            </div>
            <i
              className={`fas fa-chevron-${
                showLocationSuggestions ? "up" : "down"
              } text-gray-400`}
            ></i>
          </button>

          {showLocationSuggestions && (
            <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm quận/huyện..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredDistricts.length > 0 ? (
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        {provinces.find((p) => p.code === selectedCity)?.name ||
                          "Quận/Huyện"}
                      </p>
                      {selectedDistricts.length > 0 && (
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => setSelectedDistricts([])}
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>

                    {filteredDistricts.map((district) => {
                      const isSelected = selectedDistricts.some(
                        (d) => d.code === district.code
                      );
                      const canSelect =
                        selectedDistricts.length < 3 || isSelected;

                      return (
                        <button
                          key={district.code}
                          onClick={() =>
                            canSelect && handleDistrictSelect(district)
                          }
                          className={`w-full px-3 py-2.5 text-left flex items-center justify-between rounded-md
                          ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          }
                          ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={!canSelect}
                        >
                          <span className="flex items-center gap-2">
                            <i
                              className={`fas fa-map-marker-alt ${
                                isSelected ? "text-blue-500" : "text-gray-400"
                              }`}
                            ></i>
                            {district.name}
                          </span>
                          {isSelected && (
                            <i className="fas fa-check text-blue-500"></i>
                          )}
                          {!canSelect && !isSelected && (
                            <span className="text-xs text-gray-400">
                              (Tối đa 3)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : cityDistricts.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="animate-pulse">
                      <i className="fas fa-spinner fa-spin text-blue-500 text-xl mb-2"></i>
                      <p className="text-gray-500 text-sm">
                        Đang tải danh sách quận/huyện...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <i className="fas fa-search text-gray-300 text-2xl mb-2"></i>
                    <p className="text-gray-500 text-sm">
                      Không tìm thấy quận/huyện phù hợp
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Cập nhật giao diện phần dropdown chọn loại bất động sản
  const renderPropertyDropdown = () => (
    <div className="relative" ref={propertyDropdownRef}>
      <button
        onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
        className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
      >
        <i className="fas fa-home text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
        <span
          className={`${
            selectedPropertyType ? "text-gray-900 font-medium" : "text-gray-500"
          } flex-1 text-left`}
        >
          {selectedPropertyType
            ? categories.find((c) => c.slug === selectedPropertyType)?.name
            : "Loại bất động sản"}
        </span>
        <i
          className={`fas fa-chevron-${
            showPropertyDropdown ? "up" : "down"
          } text-gray-400 group-hover:text-blue-500`}
        ></i>
      </button>

      {showPropertyDropdown && (
        <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium">Loại bất động sản</p>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {/* All option */}
            <button
              className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
              ${
                !selectedPropertyType
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedPropertyType("");
                setShowPropertyDropdown(false);
              }}
            >
              <span className="flex items-center gap-2">
                <i className="fas fa-th-large text-gray-400"></i>
                Tất cả loại bất động sản
              </span>
              {!selectedPropertyType && (
                <i className="fas fa-check text-blue-500"></i>
              )}
            </button>

            {/* Categories */}
            {categories.map((category) => (
              <button
                key={category.slug}
                className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
                ${
                  selectedPropertyType === category.slug
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setSelectedPropertyType(category.slug);
                  setShowPropertyDropdown(false);
                }}
              >
                <span>{category.name}</span>
                {selectedPropertyType === category.slug && (
                  <i className="fas fa-check text-blue-500"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Cập nhật giao diện phần dropdown chọn khoảng giá
  const renderPriceDropdown = () => (
    <div className="relative" ref={priceDropdownRef}>
      <button
        onClick={() => setShowPriceDropdown(!showPriceDropdown)}
        className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
      >
        <i className="fas fa-tag text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
        <span
          className={`${
            selectedPrice ? "text-gray-900 font-medium" : "text-gray-500"
          } flex-1 text-left`}
        >
          {selectedPrice
            ? priceRanges.find((p) => p.slug === selectedPrice)?.name
            : "Khoảng giá"}
        </span>
        <i
          className={`fas fa-chevron-${
            showPriceDropdown ? "up" : "down"
          } text-gray-400 group-hover:text-blue-500`}
        ></i>
      </button>

      {showPriceDropdown && (
        <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium">Khoảng giá</p>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {/* All option */}
            <button
              className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
              ${
                !selectedPrice
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedPrice("");
                setShowPriceDropdown(false);
              }}
            >
              <span className="flex items-center gap-2">
                <i className="fas fa-money-bill-wave text-gray-400"></i>
                Tất cả khoảng giá
              </span>
              {!selectedPrice && <i className="fas fa-check text-blue-500"></i>}
            </button>

            {/* Price ranges */}
            {priceRanges.map((priceRange) => (
              <button
                key={priceRange.slug}
                className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
                ${
                  selectedPrice === priceRange.slug
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setSelectedPrice(priceRange.slug);
                  setShowPriceDropdown(false);
                }}
              >
                <span>{priceRange.name}</span>
                {selectedPrice === priceRange.slug && (
                  <i className="fas fa-check text-blue-500"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Cập nhật giao diện phần dropdown chọn diện tích
  const renderAreaDropdown = () => (
    <div className="relative" ref={areaDropdownRef}>
      <button
        onClick={() => setShowAreaDropdown(!showAreaDropdown)}
        className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
      >
        <i className="fas fa-ruler-combined text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
        <span
          className={`${
            selectedArea ? "text-gray-900 font-medium" : "text-gray-500"
          } flex-1 text-left`}
        >
          {selectedArea
            ? areaRanges.find((a) => a.slug === selectedArea)?.name
            : "Diện tích"}
        </span>
        <i
          className={`fas fa-chevron-${
            showAreaDropdown ? "up" : "down"
          } text-gray-400 group-hover:text-blue-500`}
        ></i>
      </button>

      {showAreaDropdown && (
        <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium">Diện tích</p>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {/* All option */}
            <button
              className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
              ${
                !selectedArea
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedArea("");
                setShowAreaDropdown(false);
              }}
            >
              <span className="flex items-center gap-2">
                <i className="fas fa-expand-arrows-alt text-gray-400"></i>
                Tất cả diện tích
              </span>
              {!selectedArea && <i className="fas fa-check text-blue-500"></i>}
            </button>

            {/* Area ranges */}
            {areaRanges.map((areaRange) => (
              <button
                key={areaRange.slug}
                className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
                ${
                  selectedArea === areaRange.slug
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setSelectedArea(areaRange.slug);
                  setShowAreaDropdown(false);
                }}
              >
                <span>{areaRange.name}</span>
                {selectedArea === areaRange.slug && (
                  <i className="fas fa-check text-blue-500"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Cập nhật giao diện nút tìm kiếm
  const renderSearchButton = () => (
    <button
      onClick={handleSearch}
      className="w-full h-full min-h-[56px] px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-lg group"
    >
      <i className="fas fa-search mr-2 group-hover:animate-pulse"></i>
      Tìm kiếm
    </button>
  );

  // Cập nhật phần CSS animation để dropdown mở mượt mà hơn
  useEffect(() => {
    // Thêm CSS animation cho các dropdown
    const styleElement = document.createElement("style");
    styleElement.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Cập nhật phần return với layout mới
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg">
      <div className="py-8">
        {/* Search Tabs */}
        {renderTabs()}

        {/* Search Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* City & District Selection */}
            <div className="md:col-span-1">{renderCityDropdown()}</div>

            {/* Property Type Selection */}
            <div className="md:col-span-1">{renderPropertyDropdown()}</div>

            {/* Price Range Selection */}
            <div className="md:col-span-1">{renderPriceDropdown()}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
            {/* Area Selection */}
            <div className="md:col-span-1">{renderAreaDropdown()}</div>

            {/* Search Button */}
            <div className="md:col-span-3">{renderSearchButton()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
