"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tab } from "@headlessui/react";
import { locationService } from "@/services/locationService";

interface Location {
  code: string;
  name: string;
  codename: string;
  division_type?: string;
  phone_code?: string;
  districts?: Location[];
  wards?: Location[];
}

interface SelectedDistrict {
  code: string;
  name: string;
  codename?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  isProject?: boolean;
}

interface PriceRange {
  id: string;
  name: string;
  slug?: string;
  minValue: number;
  maxValue: number;
}

interface AreaRange {
  id: string;
  name: string;
  slug?: string;
  minValue: number;
  maxValue: number;
}

export default function SearchSection() {
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
  const [projectStatuses] = useState([
    { id: "sap-mo-ban", name: "Sắp mở bán" },
    { id: "dang-mo-ban", name: "Đang mở bán" },
    { id: "da-ban-giao", name: "Đã bàn giao" },
  ]);

  // Locations data
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [cityDistricts, setCityDistricts] = useState<Location[]>([]);
  const [wardsList, setWardsList] = useState<Location[]>([]);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  // UI states
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [showProjectStatusDropdown, setShowProjectStatusDropdown] =
    useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [areaRanges, setAreaRanges] = useState<AreaRange[]>([]);
  const [loadingSearchOptions, setLoadingSearchOptions] = useState(false);

  // Refs for clickaway
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const projectStatusDropdownRef = useRef<HTMLDivElement>(null);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Show temporary feedback message
  const showTemporaryFeedback = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackMessage("");
    }, 3000);
  };

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

  // Component is now self-contained, no need for prop update effects

  // Fetch districts when city is selected
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
            categoriesResult.data?.categories?.filter(
              (cat: { isProject: boolean }) => cat.isProject
            ) || [];
        } else {
          filteredCategories =
            categoriesResult.data?.categories?.filter(
              (cat: { isProject: boolean }) => !cat.isProject
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

  // Component is now self-contained, no need for prop update effects

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
    };

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

  // Filtered data
  const filteredDistricts = districtSearch
    ? cityDistricts.filter((district) =>
        district.name.toLowerCase().includes(districtSearch.toLowerCase())
      )
    : cityDistricts;

  const filteredWards = wardSearch
    ? wardsList.filter((ward) =>
        ward.name.toLowerCase().includes(wardSearch.toLowerCase())
      )
    : wardsList;

  // Handlers
  const handleTabChange = (index: number) => {
    const types: ["buy", "rent", "project"] = ["buy", "rent", "project"];
    const newType = types[index];
    setSearchType(newType);

    // Reset các lựa chọn
    setSelectedPropertyType("");
    setSelectedPrice("");
    setSelectedArea("");
    setSelectedProjectStatus("");
  };

  const handleCitySelect = (province: Location) => {
    setSelectedCity(province.code);
    setSelectedDistricts([]);
    setSelectedWard(null);
    setShowCityDropdown(false);
    setCitySearch("");
  };

  const handleDistrictSelect = (district: Location) => {
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

  const handleWardSelect = (ward: Location) => {
    setSelectedWard(ward.code);
    setShowWardDropdown(false);
    setWardSearch("");
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

    // Thêm thành phố
    if (selectedCity) {
      const selectedProvince = provinces.find((p) => p.code === selectedCity);
      if (selectedProvince) {
        queryParams.append("city", selectedProvince.codename);
      }
    }

    // Thêm quận/huyện
    if (selectedDistricts.length > 0) {
      queryParams.append("districts", selectedDistricts[0].codename || "");
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

    // Thêm khoảng diện tích hoặc trạng thái dự án
    if (searchType === "project") {
      if (selectedProjectStatus) {
        queryParams.append("status", selectedProjectStatus);
      }
    } else {
      if (selectedArea) {
        queryParams.append("area", selectedArea);
      }
    }

    // Tạo URL đầy đủ
    const searchUrl = `${baseUrl}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    // Chuyển hướng đến trang kết quả tìm kiếm
    router.push(searchUrl);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg">
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
                  Dự án
                </span>
              </Tab>
            </Tab.List>
          </Tab.Group>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          {/* Row 1: Location filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* City selection */}
            <div className="w-full">
              <div className="relative" ref={cityDropdownRef}>
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                >
                  <span className="flex-1 text-left">
                    {selectedCity
                      ? provinces.find((p) => p.code === selectedCity)?.name
                      : "Toàn quốc"}
                  </span>
                </button>

                {showCityDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Tìm kiếm tỉnh thành..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {provinces
                        .filter((province) =>
                          province.name
                            .toLowerCase()
                            .includes(citySearch.toLowerCase())
                        )
                        .map((province) => (
                          <button
                            key={province.code}
                            onClick={() => handleCitySelect(province)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            {province.name}
                          </button>
                        ))}
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
                    }
                  }}
                  className={`w-full p-3.5 border border-gray-300 rounded-xl flex items-center ${
                    selectedCity
                      ? "bg-white hover:border-blue-400"
                      : "bg-gray-50 cursor-not-allowed"
                  } transition-all duration-200 group`}
                >
                  <span className="flex-1 text-left">
                    {selectedDistricts.length > 0
                      ? selectedDistricts[0].name
                      : "Quận/Huyện"}
                  </span>
                </button>

                {showDistrictDropdown && selectedCity && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Tìm kiếm quận huyện..."
                        value={districtSearch}
                        onChange={(e) => setDistrictSearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredDistricts.map((district) => (
                        <button
                          key={district.code}
                          onClick={() => handleDistrictSelect(district)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          {district.name}
                        </button>
                      ))}
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
                    }
                  }}
                  className={`w-full p-3.5 border border-gray-300 rounded-xl flex items-center ${
                    selectedDistricts.length > 0
                      ? "bg-white hover:border-blue-400"
                      : "bg-gray-50 cursor-not-allowed"
                  } transition-all duration-200 group`}
                >
                  <span className="flex-1 text-left">
                    {selectedWard
                      ? wardsList.find((w) => w.code === selectedWard)?.name
                      : "Phường/Xã"}
                  </span>
                </button>

                {showWardDropdown && selectedDistricts.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Tìm kiếm phường xã..."
                        value={wardSearch}
                        onChange={(e) => setWardSearch(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredWards.map((ward) => (
                        <button
                          key={ward.code}
                          onClick={() => handleWardSelect(ward)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          {ward.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Other filters and search button */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Property Type */}
            <div className="w-full">
              <div className="relative" ref={propertyDropdownRef}>
                <button
                  onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                  className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                >
                  <span className="flex-1 text-left">
                    {selectedPropertyType
                      ? categories.find((c) => c.slug === selectedPropertyType)
                          ?.name
                      : "Loại BĐS"}
                  </span>
                </button>

                {showPropertyDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category.slug}
                          onClick={() => setSelectedPropertyType(category.slug)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          {category.name}
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
                  <span className="flex-1 text-left">
                    {selectedPrice
                      ? priceRanges.find(
                          (p) =>
                            p.slug === selectedPrice || p.id === selectedPrice
                        )?.name
                      : "Mức giá"}
                  </span>
                </button>

                {showPriceDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="max-h-60 overflow-y-auto">
                      {priceRanges.map((price) => (
                        <button
                          key={price.slug || price.id}
                          onClick={() =>
                            setSelectedPrice(price.slug || price.id || "")
                          }
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          {price.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Area Range or Project Status */}
            <div className="w-full">
              {searchType !== "project" ? (
                <div className="relative" ref={areaDropdownRef}>
                  <button
                    onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                  >
                    <span className="flex-1 text-left">
                      {selectedArea
                        ? areaRanges.find(
                            (a) =>
                              a.slug === selectedArea || a.id === selectedArea
                          )?.name
                        : "Diện tích"}
                    </span>
                  </button>

                  {showAreaDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="max-h-60 overflow-y-auto">
                        {areaRanges.map((area) => (
                          <button
                            key={area.slug || area.id}
                            onClick={() =>
                              setSelectedArea(area.slug || area.id || "")
                            }
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            {area.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative" ref={projectStatusDropdownRef}>
                  <button
                    onClick={() =>
                      setShowProjectStatusDropdown(!showProjectStatusDropdown)
                    }
                    className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                  >
                    <span className="flex-1 text-left">
                      {selectedProjectStatus
                        ? projectStatuses.find(
                            (s) => s.id === selectedProjectStatus
                          )?.name
                        : "Trạng thái"}
                    </span>
                  </button>

                  {showProjectStatusDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="max-h-60 overflow-y-auto">
                        {projectStatuses.map((status) => (
                          <button
                            key={status.id}
                            onClick={() => setSelectedProjectStatus(status.id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            {status.name}
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
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
