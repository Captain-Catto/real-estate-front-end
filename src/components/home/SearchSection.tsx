"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { locationService } from "@/services/locationService";

interface Location {
  code: string;
  name: string;
  codename?: string;
  division_type?: string;
  phone_code?: string;
  districts?: Location[];
  wards?: Location[];
  slug?: string;
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

interface SearchSectionProps {
  initialSearchType?: "buy" | "rent" | "project";
  initialCity?: Location | null;
  initialDistricts?: Location[];
  initialWard?: Location | null;
  initialCategory?: string;
  initialPrice?: string;
  initialArea?: string;
  initialStatus?: string;
}

export default function SearchSection({
  initialCity = null,
  initialWard = null,
  initialCategory = "",
  initialPrice = "",
  initialArea = "",
  initialStatus = "",
}: SearchSectionProps) {
  const router = useRouter();

  // States
  const [searchType, setSearchType] = useState<"buy" | "rent" | "project">("buy");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("");

  // Data states
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [wardsList, setWardsList] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [areaRanges, setAreaRanges] = useState<AreaRange[]>([]);

  // UI states
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showProjectStatusDropdown, setShowProjectStatusDropdown] = useState(false);
  
  const [citySearch, setCitySearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");

  // Refs for clickaway
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const wardDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const projectStatusDropdownRef = useRef<HTMLDivElement>(null);

  // Project statuses (static data)
  const [projectStatuses] = useState([
    { id: "sap-mo-ban", name: "Sắp mở bán" },
    { id: "dang-mo-ban", name: "Đang mở bán" },
    { id: "da-ban-giao", name: "Đã bàn giao" },
  ]);

  // Helper function to get search type from URL
  const getSearchTypeFromPath = (): "buy" | "rent" | "project" => {
    const path = window.location.pathname;
    if (path.includes("cho-thue")) return "rent";
    if (path.includes("du-an")) return "project";
    return "buy"; // default to buy
  };

  // Helper function to get URL params
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      province: searchParams.get("province"),
      ward: searchParams.get("ward"),
      category: searchParams.get("category"),
      price: searchParams.get("price"),
      area: searchParams.get("area"),
      status: searchParams.get("status"),
    };
  };

  // Step 1: Initialize search type from URL
  useEffect(() => {
    const urlSearchType = getSearchTypeFromPath();
    console.log("Setting search type from URL:", urlSearchType);
    setSearchType(urlSearchType);
  }, []);

  // Step 2: Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        console.log("Fetched provinces:", data.length);
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Step 3: Check URL for province and set it if found
  useEffect(() => {
    if (provinces.length === 0) return;

    const urlParams = getUrlParams();
    
    if (urlParams.province) {
      const matchingProvince = provinces.find(p => p.slug === urlParams.province);
      if (matchingProvince) {
        console.log("Found province from URL:", matchingProvince.name);
        setSelectedCity(matchingProvince.code);
      } else {
        console.log("Province slug not found:", urlParams.province);
      }
    } else if (initialCity) {
      console.log("Using initial city from props");
      setSelectedCity(initialCity.code);
    }
  }, [provinces, initialCity]);

  // Step 4: Fetch wards when province is selected
  useEffect(() => {
    if (!selectedCity) {
      setWardsList([]);
      setSelectedWard(null);
      return;
    }

    const fetchWards = async () => {
      try {
        const data = await locationService.getDistricts(selectedCity);
        console.log("Fetched wards for province:", data.length);
        setWardsList(data as unknown as Location[]);
      } catch (error) {
        console.error("Error fetching wards:", error);
        setWardsList([]);
      }
    };

    fetchWards();
  }, [selectedCity]);

  // Step 5: Check URL for ward and set it if found
  useEffect(() => {
    if (wardsList.length === 0) return;

    const urlParams = getUrlParams();
    
    if (urlParams.ward) {
      const matchingWard = wardsList.find(w => w.slug === urlParams.ward);
      if (matchingWard) {
        console.log("Found ward from URL:", matchingWard.name);
        setSelectedWard(matchingWard.code);
      } else {
        console.log("Ward slug not found:", urlParams.ward);
      }
    } else if (initialWard) {
      console.log("Using initial ward from props");
      setSelectedWard(initialWard.code);
    }
  }, [wardsList, initialWard]);

  // Step 6: Fetch categories and prices based on search type
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data for search type:", searchType);

      // Fetch categories
      try {
        const categoriesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}/categories`
        );
        
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json();
          let filteredCategories = [];
          
          if (searchType === "project") {
            filteredCategories = categoriesResult.data?.categories?.filter(
              (cat: { isProject: boolean }) => cat.isProject
            ) || [];
          } else {
            filteredCategories = categoriesResult.data?.categories?.filter(
              (cat: { isProject: boolean }) => !cat.isProject
            ) || [];
          }
          
          console.log("Loaded categories:", filteredCategories.length);
          setCategories(filteredCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }

      // Fetch price ranges
      try {
        const priceTypeParam = 
          searchType === "buy" ? "ban" : 
          searchType === "rent" ? "cho-thue" : 
          "project";

        const priceResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}/price-ranges/type/${priceTypeParam}`
        );

        if (priceResponse.ok) {
          const priceResult = await priceResponse.json();
          const priceRanges = priceResult.data?.priceRanges || [];
          
          // Sort by minValue
          const sortedPriceRanges = [...priceRanges].sort((a, b) => {
            if (a.minValue === 0 && b.minValue !== 0) return -1;
            if (b.minValue === 0 && a.minValue !== 0) return 1;
            return a.minValue - b.minValue;
          });

          console.log("Loaded price ranges:", sortedPriceRanges.length);
          setPriceRanges(sortedPriceRanges);
        }
      } catch (error) {
        console.error("Error fetching price ranges:", error);
        setPriceRanges([]);
      }

      // Fetch area ranges (only for non-project types)
      if (searchType !== "project") {
        try {
          const areaResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}/areas`
          );

          if (areaResponse.ok) {
            const areaResult = await areaResponse.json();
            const areaRanges = areaResult.data?.areas || [];
            
            // Sort by minValue
            const sortedAreaRanges = [...areaRanges].sort((a, b) => {
              if (a.minValue === 0 && b.minValue !== 0) return -1;
              if (b.minValue === 0 && a.minValue !== 0) return 1;
              return a.minValue - b.minValue;
            });

            console.log("Loaded area ranges:", sortedAreaRanges.length);
            setAreaRanges(sortedAreaRanges);
          }
        } catch (error) {
          console.error("Error fetching area ranges:", error);
          setAreaRanges([]);
        }
      }
    };

    fetchData();
  }, [searchType]);

  // Step 7: Set selections from URL after data is loaded
  useEffect(() => {
    if (categories.length === 0) return;

    const urlParams = getUrlParams();
    
    if (urlParams.category) {
      const matchingCategory = categories.find(c => c.slug === urlParams.category);
      if (matchingCategory) {
        console.log("Found category from URL:", matchingCategory.name);
        setSelectedPropertyType(urlParams.category);
      } else {
        console.log("Category slug not found:", urlParams.category);
      }
    } else if (initialCategory) {
      console.log("Using initial category from props");
      setSelectedPropertyType(initialCategory);
    }
  }, [categories, initialCategory]);

  useEffect(() => {
    if (priceRanges.length === 0) return;

    const urlParams = getUrlParams();
    
    if (urlParams.price) {
      const matchingPrice = priceRanges.find(p => 
        p.slug === urlParams.price || p.id === urlParams.price
      );
      if (matchingPrice) {
        console.log("Found price from URL:", matchingPrice.name);
        setSelectedPrice(urlParams.price);
      } else {
        console.log("Price slug not found:", urlParams.price);
      }
    } else if (initialPrice) {
      console.log("Using initial price from props");
      setSelectedPrice(initialPrice);
    }
  }, [priceRanges, initialPrice]);

  useEffect(() => {
    if (searchType === "project") return;
    if (areaRanges.length === 0) return;

    const urlParams = getUrlParams();
    
    if (urlParams.area) {
      const matchingArea = areaRanges.find(a => 
        a.slug === urlParams.area || a.id === urlParams.area
      );
      if (matchingArea) {
        console.log("Found area from URL:", matchingArea.name);
        setSelectedArea(urlParams.area);
      } else {
        console.log("Area slug not found:", urlParams.area);
      }
    } else if (initialArea) {
      console.log("Using initial area from props");
      setSelectedArea(initialArea);
    }
  }, [areaRanges, initialArea, searchType]);

  useEffect(() => {
    if (searchType !== "project") return;

    const urlParams = getUrlParams();
    
    if (urlParams.status) {
      const matchingStatus = projectStatuses.find(s => s.id === urlParams.status);
      if (matchingStatus) {
        console.log("Found status from URL:", matchingStatus.name);
        setSelectedProjectStatus(urlParams.status);
      } else {
        console.log("Status slug not found:", urlParams.status);
      }
    } else if (initialStatus) {
      console.log("Using initial status from props");
      setSelectedProjectStatus(initialStatus);
    }
  }, [projectStatuses, initialStatus, searchType]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target as Node)) {
        setShowWardDropdown(false);
      }
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) {
        setShowPropertyDropdown(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node)) {
        setShowPriceDropdown(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setShowAreaDropdown(false);
      }
      if (projectStatusDropdownRef.current && !projectStatusDropdownRef.current.contains(event.target as Node)) {
        setShowProjectStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleTabChange = (newType: "buy" | "rent" | "project") => {
    console.log("Tab changed to:", newType);
    setSearchType(newType);
    
    // Reset selections when changing tabs
    setSelectedPropertyType("");
    setSelectedPrice("");
    setSelectedArea("");
    setSelectedProjectStatus("");
    
    // Close all dropdowns
    setShowPropertyDropdown(false);
    setShowPriceDropdown(false);
    setShowAreaDropdown(false);
    setShowProjectStatusDropdown(false);
  };

  const handleCitySelect = (province: Location) => {
    console.log("Selected city:", province.name);
    setSelectedCity(province.code);
    setSelectedWard(null); // Reset ward when city changes
    setShowCityDropdown(false);
    setCitySearch("");
    setWardSearch("");
  };

  const handleWardSelect = (ward: Location) => {
    console.log("Selected ward:", ward.name);
    setSelectedWard(ward.code);
    setShowWardDropdown(false);
    setWardSearch("");
  };

  const handleSearch = () => {
    // Build URL based on search type
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

    // Build query params
    const queryParams = new URLSearchParams();

    // Add province
    if (selectedCity) {
      const selectedProvince = provinces.find(p => p.code === selectedCity);
      if (selectedProvince?.slug) {
        queryParams.append("province", selectedProvince.slug);
      }
    }

    // Add ward
    if (selectedWard) {
      const selectedWardObj = wardsList.find(w => w.code === selectedWard);
      if (selectedWardObj?.slug) {
        queryParams.append("ward", selectedWardObj.slug);
      }
    }

    // Add category
    if (selectedPropertyType) {
      queryParams.append("category", selectedPropertyType);
    }

    // Add price
    if (selectedPrice) {
      queryParams.append("price", selectedPrice);
    }

    // Add area or status
    if (searchType === "project") {
      if (selectedProjectStatus) {
        queryParams.append("status", selectedProjectStatus);
      }
    } else {
      if (selectedArea) {
        queryParams.append("area", selectedArea);
      }
    }

    // Navigate to search results
    const searchUrl = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    console.log("Navigating to:", searchUrl);
    router.push(searchUrl);
  };

  // Filtered data for search
  const filteredProvinces = citySearch
    ? provinces.filter(province =>
        province.name.toLowerCase().includes(citySearch.toLowerCase())
      )
    : provinces;

  const filteredWards = wardSearch
    ? wardsList.filter(ward =>
        ward.name.toLowerCase().includes(wardSearch.toLowerCase())
      )
    : wardsList;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg">
      <div className="py-8">
        {/* Search Tabs */}
        <div className="mb-6">
          <div className="flex rounded-lg border-b border-gray-200 overflow-hidden">
            <button
              onClick={() => handleTabChange("buy")}
              className={`flex-1 py-4 text-center font-medium text-lg transition-all duration-200 ${
                searchType === "buy"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
              }`}
            >
              Mua bán
            </button>
            <button
              onClick={() => handleTabChange("rent")}
              className={`flex-1 py-4 text-center font-medium text-lg transition-all duration-200 ${
                searchType === "rent"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
              }`}
            >
              Cho thuê
            </button>
            <button
              onClick={() => handleTabChange("project")}
              className={`flex-1 py-4 text-center font-medium text-lg transition-all duration-200 ${
                searchType === "project"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
              }`}
            >
              Dự án
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          {/* Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* City Dropdown */}
            <div className="relative" ref={cityDropdownRef}>
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
              >
                <i className="fas fa-map-marker-alt text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                <span className={`${selectedCity ? "text-gray-900 font-medium" : "text-gray-500"} flex-1 text-left`}>
                  {selectedCity
                    ? provinces.find(p => p.code === selectedCity)?.name
                    : "Toàn quốc"
                  }
                </span>
                <i className={`fas fa-chevron-${showCityDropdown ? "up" : "down"} text-gray-400 group-hover:text-blue-500`}></i>
              </button>

              {showCityDropdown && (
                <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
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
                    {filteredProvinces.map((province) => (
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

            {/* Ward Dropdown */}
            <div className="relative" ref={wardDropdownRef}>
              <button
                onClick={() => {
                  if (selectedCity) {
                    setShowWardDropdown(!showWardDropdown);
                  }
                }}
                className={`w-full p-3.5 border border-gray-300 rounded-xl flex items-center ${
                  selectedCity ? "bg-white hover:border-blue-400" : "bg-gray-50 cursor-not-allowed"
                } transition-all duration-200 group`}
              >
                <i className={`fas fa-map-marker-alt ${selectedCity ? "text-blue-500" : "text-gray-400"} mr-3 text-lg`}></i>
                <span className={`${selectedWard ? "text-gray-900 font-medium" : "text-gray-500"} flex-1 text-left`}>
                  {selectedWard
                    ? wardsList.find(w => w.code === selectedWard)?.name
                    : "Phường/Xã"
                  }
                </span>
                <i className={`fas fa-chevron-${showWardDropdown ? "up" : "down"} ${selectedCity ? "text-gray-400" : "text-gray-300"}`}></i>
              </button>

              {showWardDropdown && selectedCity && (
                <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
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

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Property Type */}
            <div className="relative" ref={propertyDropdownRef}>
              <button
                onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
              >
                <i className="fas fa-home text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                <span className={`${selectedPropertyType ? "text-gray-900 font-medium" : "text-gray-500"} flex-1 text-left`}>
                  {selectedPropertyType
                    ? categories.find(c => c.slug === selectedPropertyType)?.name || "Loại BĐS"
                    : "Loại BĐS"
                  }
                </span>
                <i className={`fas fa-chevron-${showPropertyDropdown ? "up" : "down"} text-gray-400 group-hover:text-blue-500`}></i>
              </button>

              {showPropertyDropdown && (
                <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                  <div className="max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => {
                          setSelectedPropertyType(category.slug);
                          setShowPropertyDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="relative" ref={priceDropdownRef}>
              <button
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
              >
                <i className="fas fa-tag text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                <span className={`${selectedPrice ? "text-gray-900 font-medium" : "text-gray-500"} flex-1 text-left`}>
                  {selectedPrice
                    ? priceRanges.find(p => p.slug === selectedPrice || p.id === selectedPrice)?.name || "Mức giá"
                    : "Mức giá"
                  }
                </span>
                <i className={`fas fa-chevron-${showPriceDropdown ? "up" : "down"} text-gray-400 group-hover:text-blue-500`}></i>
              </button>

              {showPriceDropdown && (
                <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                  <div className="max-h-60 overflow-y-auto">
                    {priceRanges.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-center">Đang tải...</div>
                    ) : (
                      priceRanges.map((price) => (
                        <button
                          key={price.slug || price.id}
                          onClick={() => {
                            setSelectedPrice(price.slug || price.id || "");
                            setShowPriceDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          {price.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Area or Project Status */}
            <div className="relative" ref={searchType === "project" ? projectStatusDropdownRef : areaDropdownRef}>
              {searchType === "project" ? (
                // Project Status
                <>
                  <button
                    onClick={() => setShowProjectStatusDropdown(!showProjectStatusDropdown)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                  >
                    <i className="fas fa-calendar-alt text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                    <span className={`${selectedProjectStatus ? "text-gray-900 font-medium" : "text-gray-500"} flex-1 text-left`}>
                      {selectedProjectStatus
                        ? projectStatuses.find(s => s.id === selectedProjectStatus)?.name || "Trạng thái"
                        : "Trạng thái"
                      }
                    </span>
                    <i className={`fas fa-chevron-${showProjectStatusDropdown ? "up" : "down"} text-gray-400 group-hover:text-blue-500`}></i>
                  </button>

                  {showProjectStatusDropdown && (
                    <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                      <div className="max-h-60 overflow-y-auto">
                        {projectStatuses.map((status) => (
                          <button
                            key={status.id}
                            onClick={() => {
                              setSelectedProjectStatus(status.id);
                              setShowProjectStatusDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            {status.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Area Range
                <>
                  <button
                    onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl flex items-center bg-white hover:border-blue-400 transition-all duration-200 group"
                  >
                    <i className="fas fa-vector-square text-blue-500 mr-3 text-lg group-hover:text-blue-600"></i>
                    <span className={`${selectedArea ? "text-gray-900 font-medium" : "text-gray-500"} flex-1 text-left`}>
                      {selectedArea
                        ? areaRanges.find(a => a.slug === selectedArea || a.id === selectedArea)?.name || "Diện tích"
                        : "Diện tích"
                      }
                    </span>
                    <i className={`fas fa-chevron-${showAreaDropdown ? "up" : "down"} text-gray-400 group-hover:text-blue-500`}></i>
                  </button>

                  {showAreaDropdown && (
                    <div className="absolute z-30 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                      <div className="max-h-60 overflow-y-auto">
                        {areaRanges.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500 text-center">Đang tải...</div>
                        ) : (
                          areaRanges.map((area) => (
                            <button
                              key={area.slug || area.id}
                              onClick={() => {
                                setSelectedArea(area.slug || area.id || "");
                                setShowAreaDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            >
                              {area.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Search Button */}
            <div>
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
