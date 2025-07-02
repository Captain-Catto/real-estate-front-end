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
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("");
  const [projectStatuses, setProjectStatuses] = useState([
    { id: "sap-mo-ban", name: "Sắp mở bán" },
    { id: "dang-mo-ban", name: "Đang mở bán" },
    { id: "da-ban-giao", name: "Đã bàn giao" },
  ]);
  const [showProjectStatusDropdown, setShowProjectStatusDropdown] =
    useState(false);
  const projectStatusDropdownRef = useRef<HTMLDivElement>(null);

  // Locations data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cityDistricts, setCityDistricts] = useState<any[]>([]);

  // UI states
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
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

      // Project Status dropdown - Đã được khai báo nhưng chưa được xử lý
      if (
        projectStatusDropdownRef.current &&
        !projectStatusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProjectStatusDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cập nhật phần CSS animation để dropdown mở mượt mà hơn
  useEffect(() => {
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

  // Handlers
  const handleTabChange = (index: number) => {
    const types: ["buy", "rent", "project"] = ["buy", "rent", "project"];
    const newType = types[index];

    // Reset các lựa chọn giá, loại BĐS, diện tích, trạng thái
    setSelectedPropertyType("");
    setSelectedPrice("");
    setSelectedArea("");
    setSelectedProjectStatus("");

    // Nếu chuyển sang tab dự án và đã chọn nhiều quận/huyện, giữ lại quận/huyện đầu tiên
    if (newType === "project" && selectedDistricts.length > 1) {
      setSelectedDistricts([selectedDistricts[0]]);
    }

    // Cập nhật loại tìm kiếm
    setSearchType(newType);
  };

  const handleCitySelect = (province: any) => {
    setSelectedCity(province.code);
    setSelectedDistricts([]);
    setShowCityDropdown(false);
    setCitySearch("");
    setDistrictSearch("");
  };

  const handleDistrictSelect = (district: any) => {
    if (searchType === "project") {
      // Đối với dự án: chỉ cho phép chọn một quận/huyện (ghi đè)
      setSelectedDistricts([
        {
          code: district.code,
          name: district.name,
          codename: district.codename,
        },
      ]);
    } else {
      // Đối với mua bán và cho thuê: cho phép chọn tối đa 3 quận/huyện
      // Kiểm tra giới hạn 3 quận/huyện
      if (
        selectedDistricts.length >= 3 &&
        !selectedDistricts.some((d) => d.code === district.code)
      ) {
        return;
      }

      // Toggle chọn/bỏ chọn quận/huyện
      const isSelected = selectedDistricts.some(
        (d) => d.code === district.code
      );

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
    }
  };

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

    // Thêm khoảng diện tích hoặc trạng thái dự án tùy thuộc vào searchType
    if (searchType === "project") {
      if (selectedProjectStatus) {
        queryParams.append("status", selectedProjectStatus);
      }
    } else {
      if (selectedArea) {
        queryParams.append("area", selectedArea);
      }
    }

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
  const filteredDistricts = districtSearch
    ? cityDistricts.filter((district) =>
        district.name.toLowerCase().includes(districtSearch.toLowerCase())
      )
    : cityDistricts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg">
      <div className="py-8">
        {/* Search Tabs */}
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

        {/* Search Form - Layout mới */}
        <div className="space-y-4">
          {/* Hàng 1: Vị trí (province và district) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* City selection - bên trái */}
            <div className="w-full col-span-1">
              <div className="relative" ref={cityDropdownRef}>
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                >
                  <i className="fas fa-map-marker-alt text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                  <span
                    className={`${
                      selectedCity
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
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
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
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
                              .includes(citySearch.toLowerCase())
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
              </div>
            </div>

            {/* Districts selection - bên phải */}
            <div className="w-full col-span-1 md:col-span-2">
              {selectedCity ? (
                <div className="relative" ref={locationSuggestionsRef}>
                  <button
                    onClick={() =>
                      setShowLocationSuggestions(!showLocationSuggestions)
                    }
                    className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200"
                  >
                    <i className="fas fa-map-marker-alt text-blue-500 mr-3 text-lg"></i>
                    <div className="flex flex-wrap gap-1.5 items-center flex-1 text-left">
                      {selectedDistricts.length > 0 ? (
                        selectedDistricts.map((district) => (
                          <span
                            key={district.code}
                            className="bg-blue-100 text-blue-800 text-sm px-2.5 py-1 rounded-full flex items-center"
                          >
                            {district.name}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDistricts(
                                  selectedDistricts.filter(
                                    (d) => d.code !== district.code
                                  )
                                );
                              }}
                              className="ml-1.5 hover:text-blue-700 cursor-pointer"
                            >
                              <i className="fas fa-times-circle"></i>
                            </span>
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
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">
                            {provinces.find((p) => p.code === selectedCity)
                              ?.name || "Quận/Huyện"}
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

                        <div className="relative mt-2">
                          <input
                            type="text"
                            placeholder="Tìm kiếm quận/huyện..."
                            value={districtSearch}
                            onChange={(e) => setDistrictSearch(e.target.value)}
                            className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <i className="fas fa-search absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto p-2">
                        {filteredDistricts.length > 0 ? (
                          <>
                            {/* Hiện thị thông tin số quận đã chọn */}
                            {/* Hiện thị thông tin số quận đã chọn */}
                            <div className="flex items-center justify-between mb-2 px-2">
                              <p className="text-xs text-gray-500">
                                {searchType === "project" ? (
                                  <span>Chọn một quận/huyện</span>
                                ) : (
                                  <>
                                    <span className="font-medium">
                                      {selectedDistricts.length}/3
                                    </span>{" "}
                                    quận đã chọn
                                  </>
                                )}
                              </p>
                            </div>
                            {filteredDistricts.map((district) => {
                              const isSelected = selectedDistricts.some(
                                (d) => d.code === district.code
                              );

                              // Nếu là dự án, chỉ cho phép chọn 1 quận/huyện
                              // Nếu đã có quận được chọn, chỉ cho phép bấm vào quận đó để bỏ chọn
                              const canSelect =
                                searchType === "project"
                                  ? selectedDistricts.length === 0 || isSelected
                                  : selectedDistricts.length < 3 || isSelected;

                              return (
                                <button
                                  key={district.code}
                                  onClick={() =>
                                    canSelect && handleDistrictSelect(district)
                                  }
                                  className={`w-full px-3 py-2.5 text-left flex items-center justify-between rounded-md
        ${isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}
        ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
                                  disabled={!canSelect}
                                >
                                  <span className="flex items-center gap-2">
                                    <i
                                      className={`fas fa-map-marker-alt ${
                                        isSelected
                                          ? "text-blue-500"
                                          : "text-gray-400"
                                      }`}
                                    ></i>
                                    {district.name}
                                  </span>
                                  {isSelected && (
                                    <i className="fas fa-check text-blue-500"></i>
                                  )}
                                  {!canSelect && !isSelected && (
                                    <span className="text-xs text-gray-400">
                                      {searchType === "project"
                                        ? "(Chỉ chọn 1)"
                                        : "(Tối đa 3)"}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                            {/* Danh sách quận huyện */}
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
                                    ${
                                      !canSelect
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  disabled={!canSelect}
                                >
                                  <span className="flex items-center gap-2">
                                    <i
                                      className={`fas fa-map-marker-alt ${
                                        isSelected
                                          ? "text-blue-500"
                                          : "text-gray-400"
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
                          </>
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
              ) : (
                <div className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-gray-50 text-gray-400">
                  <i className="fas fa-map-marker-alt text-gray-400 mr-3 text-lg"></i>
                  <span className="flex-1 text-left">
                    Chọn tỉnh/thành phố trước
                  </span>
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
              )}
            </div>
          </div>

          {/* Hàng 2: Các lọc khác và nút tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Property Type */}
            <div className="w-full">
              <div className="relative" ref={propertyDropdownRef}>
                <button
                  onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                  className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                >
                  <i className="fas fa-home text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                  <span
                    className={`${
                      selectedPropertyType
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    } flex-1 text-left`}
                  >
                    {selectedPropertyType
                      ? categories.find((c) => c.slug === selectedPropertyType)
                          ?.name
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
            </div>

            {/* Price Range */}
            <div className="w-full">
              <div className="relative" ref={priceDropdownRef}>
                <button
                  onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                  className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                >
                  <i className="fas fa-tag text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                  <span
                    className={`${
                      selectedPrice
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
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
                        {!selectedPrice && (
                          <i className="fas fa-check text-blue-500"></i>
                        )}
                      </button>

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
            </div>

            {/* Area hoặc Project Status tùy thuộc vào tab được chọn */}
            <div className="w-full">
              {searchType !== "project" ? (
                // Hiển thị dropdown Diện tích cho Mua bán và Cho thuê
                <div className="relative" ref={areaDropdownRef}>
                  <button
                    onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                  >
                    <i className="fas fa-ruler-combined text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                    <span
                      className={`${
                        selectedArea
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
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
                          {!selectedArea && (
                            <i className="fas fa-check text-blue-500"></i>
                          )}
                        </button>

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
              ) : (
                // Hiển thị dropdown Trạng thái dự án cho tab Dự án
                <div className="relative" ref={projectStatusDropdownRef}>
                  <button
                    onClick={() =>
                      setShowProjectStatusDropdown(!showProjectStatusDropdown)
                    }
                    className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                  >
                    <i className="fas fa-clock text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                    <span
                      className={`${
                        selectedProjectStatus
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      } flex-1 text-left`}
                    >
                      {selectedProjectStatus
                        ? projectStatuses.find(
                            (s) => s.id === selectedProjectStatus
                          )?.name
                        : "Trạng thái dự án"}
                    </span>
                    <i
                      className={`fas fa-chevron-${
                        showProjectStatusDropdown ? "up" : "down"
                      } text-gray-400 group-hover:text-blue-500`}
                    ></i>
                  </button>

                  {showProjectStatusDropdown && (
                    <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium">Trạng thái dự án</p>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        <button
                          className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
                ${
                  !selectedProjectStatus
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
                          onClick={() => {
                            setSelectedProjectStatus("");
                            setShowProjectStatusDropdown(false);
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <i className="fas fa-globe text-gray-400"></i>
                            Tất cả trạng thái
                          </span>
                          {!selectedProjectStatus && (
                            <i className="fas fa-check text-blue-500"></i>
                          )}
                        </button>

                        {projectStatuses.map((status) => (
                          <button
                            key={status.id}
                            className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between
                  ${
                    selectedProjectStatus === status.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                            onClick={() => {
                              setSelectedProjectStatus(status.id);
                              setShowProjectStatusDropdown(false);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              {status.id === "sap-mo-ban" && (
                                <i className="fas fa-hourglass-start text-yellow-500 mr-2"></i>
                              )}
                              {status.id === "dang-mo-ban" && (
                                <i className="fas fa-fire text-orange-500 mr-2"></i>
                              )}
                              {status.id === "da-ban-giao" && (
                                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                              )}
                              {status.name}
                            </span>
                            {selectedProjectStatus === status.id && (
                              <i className="fas fa-check text-blue-500"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="w-full">
              <button
                onClick={handleSearch}
                className="w-full h-full min-h-[56px] px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-lg group"
              >
                <i className="fas fa-search mr-2 group-hover:animate-pulse"></i>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
