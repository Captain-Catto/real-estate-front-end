"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tab } from "@headlessui/react";
import { locationService, Location } from "@/services/locationService";
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
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [cityDistricts, setCityDistricts] = useState<Location[]>([]);
  const [wardsList, setWardsList] = useState<Location[]>([]); // Thêm state cho phường/xã
  const [selectedWard, setSelectedWard] = useState<string | null>(null); // Thêm state cho phường/xã được chọn

  // UI states
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [loadingSearchOptions, setLoadingSearchOptions] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [areaRanges, setAreaRanges] = useState<AreaRange[]>([]);

  // Refs for clickaway
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);
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

  // Tải danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistricts.length === 0 || !selectedCity) {
        setWardsList([]);
        setSelectedWard(null);
        return;
      }

      try {
        // Lấy phường/xã của quận/huyện được chọn
        const districtCode = selectedDistricts[0].code;
        const data = await locationService.getWards(selectedCity, districtCode);
        setWardsList(data);
        setSelectedWard(null); // Reset selected ward when district changes
      } catch (error) {
        console.error("Error fetching wards:", error);
        setWardsList([]);
      }
    };

    fetchWards();
  }, [selectedDistricts, selectedCity]);

  // Tải các tùy chọn tìm kiếm dựa trên loại tìm kiếm
  useEffect(() => {
    const fetchSearchOptions = async () => {
      setLoadingSearchOptions(true);
      try {
        // 1. Tải danh mục sử dụng categoryService
        try {
          const isProject = searchType === "project";
          const filteredCategories = await categoryService.getByProjectType(
            isProject
          );
          setCategories(filteredCategories);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        }

        // 2. Tải khoảng giá sử dụng priceRangeService
        try {
          const priceTypeParam =
            searchType === "buy"
              ? "ban"
              : searchType === "rent"
              ? "cho-thue"
              : "project";

          const priceRanges = await priceRangeService.getByType(priceTypeParam);

          // Sắp xếp khoảng giá theo name hoặc id
          const sortedPriceRanges = [...priceRanges].sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setPriceRanges(sortedPriceRanges);
        } catch (error) {
          console.error("Error fetching price ranges:", error);
          // Fallback: sử dụng getAll nếu getByType thất bại
          try {
            const allPriceRanges = await priceRangeService.getAll();
            const filteredByType = allPriceRanges.filter((range) => {
              const searchTypeMapping = {
                buy: "ban",
                rent: "cho-thue",
                project: "project",
              };
              return range.type === searchTypeMapping[searchType];
            });
            const sortedPriceRanges = [...filteredByType].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
            setPriceRanges(sortedPriceRanges);
          } catch (fallbackError) {
            console.error("Error fetching all price ranges:", fallbackError);
            setPriceRanges([]);
          }
        }

        // 3. Tải khoảng diện tích sử dụng areaService
        try {
          const areaRanges = await areaService.getAll();

          // Sắp xếp khoảng diện tích theo name
          const sortedAreaRanges = [...areaRanges].sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          setAreaRanges(sortedAreaRanges);
        } catch (error) {
          console.error("Error fetching area ranges:", error);
          setAreaRanges([]);
        }
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

      // District dropdown
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDistrictDropdown(false);
      }

      // Ward dropdown
      if (
        wardDropdownRef.current &&
        !wardDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWardDropdown(false);
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

      // Project Status dropdown
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

  const handleCitySelect = (province: {
    code: string;
    name: string;
    codename: string;
  }) => {
    setSelectedCity(province.code);
    setSelectedDistricts([]);
    setSelectedWard(null);
    setShowCityDropdown(false);
    setCitySearch("");
    setDistrictSearch("");
    setWardSearch("");
  };

  const handleDistrictSelect = (district: {
    code: string;
    name: string;
    codename: string;
  }) => {
    setSelectedDistricts([
      {
        code: district.code,
        name: district.name,
        codename: district.codename,
      },
    ]);
    setSelectedWard(null);
    setShowDistrictDropdown(false);
    setDistrictSearch("");
  };

  const handleWardSelect = (ward: {
    code: string;
    name: string;
    codename: string;
  }) => {
    setSelectedWard(ward.code);
    setShowWardDropdown(false);
    setWardSearch("");
  };

  // Thêm state và hàm xử lý thông báo
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showTemporaryFeedback = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackMessage("");
    }, 3000);
  };

  // Sửa hàm handleCitySelect để bỏ setLocationSearch
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
      queryParams.append("districts", selectedDistricts[0].codename);
    }

    // Thêm phường/xã
    if (selectedWard) {
      const selectedWardObj = wardsList.find((w) => w.code === selectedWard);
      if (selectedWardObj) {
        queryParams.append("ward", selectedWardObj.codename);
      }
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

  // Lọc phường/xã dựa trên từ khóa tìm kiếm
  const filteredWards = wardSearch
    ? wardsList.filter((ward) =>
        ward.name.toLowerCase().includes(wardSearch.toLowerCase())
      )
    : wardsList;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg">
      {/* Feedback message */}
      {showFeedback && (
        <div className="fixed top-4 right-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg animate-fadeIn">
          <p>{feedbackMessage}</p>
        </div>
      )}

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
          {" "}
          {/* Hàng 1: Vị trí (province, district, and ward) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* City/Province selection */}
            <div className="w-full">
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
                      : "Tỉnh/Thành phố"}
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
                            setSelectedWard(null);
                            setShowCityDropdown(false);
                            setCitySearch("");
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

            {/* District selection */}
            <div className="w-full">
              <div className="relative" ref={districtDropdownRef}>
                <button
                  onClick={() => {
                    if (selectedCity) {
                      setShowDistrictDropdown(!showDistrictDropdown);
                    } else {
                      // Show feedback message if province is not selected
                      showTemporaryFeedback(
                        "Vui lòng chọn tỉnh/thành phố trước"
                      );
                    }
                  }}
                  className={`w-full p-3.5 border border-gray-300 rounded-xl flex items-center ${
                    selectedCity
                      ? "bg-white hover:border-blue-400"
                      : "bg-gray-50 cursor-not-allowed"
                  } transition-all duration-200 group`}
                >
                  <i
                    className={`fas fa-map-marker-alt ${
                      selectedCity ? "text-blue-500" : "text-gray-400"
                    } mr-3 text-lg`}
                  ></i>
                  <span
                    className={`${
                      selectedDistricts.length > 0
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    } flex-1 text-left`}
                  >
                    {selectedDistricts.length > 0
                      ? selectedDistricts[0].name
                      : "Quận/Huyện"}
                  </span>
                  <i
                    className={`fas fa-chevron-${
                      showDistrictDropdown ? "up" : "down"
                    } ${selectedCity ? "text-gray-400" : "text-gray-300"}`}
                  ></i>
                </button>

                {showDistrictDropdown && selectedCity && (
                  <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {provinces.find((p) => p.code === selectedCity)
                            ?.name || "Quận/Huyện"}
                        </p>
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
                      <button
                        className={`w-full px-4 py-2 text-left rounded-md hover:bg-blue-50 transition-colors
                          ${
                            selectedDistricts.length === 0
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700"
                          }`}
                        onClick={() => {
                          setSelectedDistricts([]);
                          setSelectedWard(null);
                          setShowDistrictDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-globe-asia text-gray-400"></i>
                          Tất cả quận/huyện
                        </div>
                      </button>

                      {filteredDistricts.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                          Không tìm thấy quận/huyện nào
                        </p>
                      ) : (
                        filteredDistricts.map((district) => (
                          <button
                            key={district.code}
                            onClick={() => handleDistrictSelect(district)}
                            className={`w-full px-4 py-2.5 text-left rounded-md hover:bg-blue-50 transition-colors flex items-center justify-between
                              ${
                                selectedDistricts.length > 0 &&
                                selectedDistricts[0].code === district.code
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-700"
                              }`}
                          >
                            <span>{district.name}</span>
                            {selectedDistricts.length > 0 &&
                              selectedDistricts[0].code === district.code && (
                                <i className="fas fa-check text-blue-500"></i>
                              )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ward selection */}
            <div className="w-full">
              <div className="relative" ref={wardDropdownRef}>
                <button
                  onClick={() => {
                    if (selectedDistricts.length > 0) {
                      setShowWardDropdown(!showWardDropdown);
                    } else {
                      // Show feedback message if district is not selected
                      showTemporaryFeedback("Vui lòng chọn quận/huyện trước");
                    }
                  }}
                  className={`w-full p-3.5 border border-gray-300 rounded-xl flex items-center ${
                    selectedDistricts.length > 0
                      ? "bg-white hover:border-blue-400"
                      : "bg-gray-50 cursor-not-allowed"
                  } transition-all duration-200 group`}
                >
                  <i
                    className={`fas fa-map-marker-alt ${
                      selectedDistricts.length > 0
                        ? "text-blue-500"
                        : "text-gray-400"
                    } mr-3 text-lg`}
                  ></i>
                  <span
                    className={`${
                      selectedWard
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    } flex-1 text-left`}
                  >
                    {selectedWard
                      ? wardsList.find((w) => w.code === selectedWard)?.name
                      : "Phường/Xã"}
                  </span>
                  <i
                    className={`fas fa-chevron-${
                      showWardDropdown ? "up" : "down"
                    } ${
                      selectedDistricts.length > 0
                        ? "text-gray-400"
                        : "text-gray-300"
                    }`}
                  ></i>
                </button>

                {showWardDropdown && selectedDistricts.length > 0 && (
                  <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-fadeIn">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {selectedDistricts[0].name || "Phường/Xã"}
                        </p>
                      </div>

                      <div className="relative mt-2">
                        <input
                          type="text"
                          placeholder="Tìm kiếm phường/xã..."
                          value={wardSearch}
                          onChange={(e) => setWardSearch(e.target.value)}
                          className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <i className="fas fa-search absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-2">
                      <button
                        className={`w-full px-4 py-2 text-left rounded-md hover:bg-blue-50 transition-colors
                          ${
                            !selectedWard
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700"
                          }`}
                        onClick={() => {
                          setSelectedWard(null);
                          setShowWardDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <i className="fas fa-globe-asia text-gray-400"></i>
                          Tất cả phường/xã
                        </div>
                      </button>

                      {filteredWards.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                          Không tìm thấy phường/xã nào
                        </p>
                      ) : (
                        filteredWards.map((ward) => (
                          <button
                            key={ward.code}
                            onClick={() => handleWardSelect(ward)}
                            className={`w-full px-4 py-2.5 text-left rounded-md hover:bg-blue-50 transition-colors flex items-center justify-between
                              ${
                                selectedWard === ward.code
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-700"
                              }`}
                          >
                            <span>{ward.name}</span>
                            {selectedWard === ward.code && (
                              <i className="fas fa-check text-blue-500"></i>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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
