"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import locationData from "../../../locationVN.json";

interface PropertyTypeChild {
  value: string;
  label: string;
  slug: string;
}

interface PropertyType {
  value: string;
  label: string;
  icon: string;
  slug: string;
  children?: PropertyTypeChild[];
}

// Cập nhật interface để có slug
interface PriceRange {
  value: string;
  label: string;
  slug?: string;
}

interface SelectedDistrict {
  code: number;
  name: string;
}

interface SelectedPropertyType {
  value: string;
  label: string;
  slug: string;
}

// Map từ JSON data - lấy 6 thành phố chính
const popularCities = [
  { code: 79, name: "Hồ Chí Minh" }, // TP.HCM
  { code: 1, name: "Hà Nội" },
  { code: 48, name: "Đà Nẵng" },
  { code: 74, name: "Bình Dương" },
  { code: 75, name: "Đồng Nai" },
  { code: 56, name: "Khánh Hòa" },
];

// Property types cho từng tab với slug
const sellPropertyTypes: PropertyType[] = [
  { value: "", label: "Tất cả nhà đất", icon: "🏠", slug: "tat-ca" },
  {
    value: "324",
    label: "Căn hộ chung cư",
    icon: "🏢",
    slug: "can-ho-chung-cu",
  },
  {
    value: "650",
    label: "Chung cư mini, căn hộ dịch vụ",
    icon: "🏨",
    slug: "chung-cu-mini",
  },
  {
    value: "362",
    label: "Các loại nhà bán",
    icon: "🏘️",
    slug: "nha-ban",
    children: [
      { value: "41", label: "Nhà riêng", slug: "nha-rieng" },
      {
        value: "325",
        label: "Nhà biệt thự, liền kề",
        slug: "biet-thu-lien-ke",
      },
      { value: "163", label: "Nhà mặt phố", slug: "nha-mat-pho" },
      {
        value: "575",
        label: "Shophouse, nhà phố thương mại",
        slug: "shophouse",
      },
    ],
  },
  {
    value: "361",
    label: "Các loại đất bán",
    icon: "🌿",
    slug: "dat-ban",
    children: [
      { value: "40", label: "Đất nền dự án", slug: "dat-nen-du-an" },
      { value: "283", label: "Bán đất", slug: "ban-dat" },
    ],
  },
  {
    value: "44",
    label: "Trang trại, khu nghỉ dưỡng",
    icon: "🏞️",
    slug: "trang-trai-khu-nghi-duong",
    children: [{ value: "562", label: "Condotel", slug: "condotel" }],
  },
  { value: "45", label: "Kho, nhà xưởng", icon: "🏭", slug: "kho-nha-xuong" },
  {
    value: "48",
    label: "Bất động sản khác",
    icon: "📍",
    slug: "bat-dong-san-khac",
  },
];

const rentPropertyTypes: PropertyType[] = [
  { value: "", label: "Tất cả nhà đất", icon: "🏠", slug: "tat-ca" },
  {
    value: "326",
    label: "Căn hộ chung cư",
    icon: "🏢",
    slug: "can-ho-chung-cu",
  },
  {
    value: "651",
    label: "Chung cư mini, căn hộ dịch vụ",
    icon: "🏨",
    slug: "chung-cu-mini",
  },
  { value: "52", label: "Nhà riêng", icon: "🏠", slug: "nha-rieng" },
  {
    value: "577",
    label: "Nhà biệt thự, liền kề",
    icon: "🏘️",
    slug: "biet-thu-lien-ke",
  },
  { value: "51", label: "Nhà mặt phố", icon: "🏪", slug: "nha-mat-pho" },
  { value: "57", label: "Nhà trọ, phòng trọ", icon: "🏨", slug: "nha-tro" },
  {
    value: "576",
    label: "Shophouse, nhà phố thương mại",
    icon: "🏬",
    slug: "shophouse",
  },
  { value: "50", label: "Văn phòng", icon: "🏢", slug: "van-phong" },
  { value: "55", label: "Cửa hàng, ki ốt", icon: "🏪", slug: "cua-hang" },
  {
    value: "53",
    label: "Kho, nhà xưởng, đất",
    icon: "🏭",
    slug: "kho-nha-xuong",
  },
  {
    value: "59",
    label: "Bất động sản khác",
    icon: "📍",
    slug: "bat-dong-san-khac",
  },
];

const projectPropertyTypes: PropertyType[] = [
  { value: "", label: "Tất cả dự án", icon: "🏗️", slug: "tat-ca-du-an" },
  {
    value: "324",
    label: "Căn hộ chung cư",
    icon: "🏢",
    slug: "can-ho-chung-cu",
  },
  {
    value: "325",
    label: "Cao ốc văn phòng",
    icon: "🏬",
    slug: "cao-oc-van-phong",
  },
  {
    value: "326",
    label: "Trung tâm thương mại",
    icon: "🛒",
    slug: "trung-tam-thuong-mai",
  },
  { value: "327", label: "Khu đô thị mới", icon: "🏙️", slug: "khu-do-thi-moi" },
  { value: "328", label: "Khu phức hợp", icon: "🏘️", slug: "khu-phuc-hop" },
  { value: "329", label: "Nhà ở xã hội", icon: "🏠", slug: "nha-o-xa-hoi" },
  { value: "330", label: "Khu nghỉ dưỡng", icon: "🏖️", slug: "khu-nghi-duong" },
  {
    value: "331",
    label: "Khu công nghiệp",
    icon: "🏭",
    slug: "khu-cong-nghiep",
  },
];

// Cập nhật price ranges để có slug
const sellPriceRanges: PriceRange[] = [
  { value: "", label: "Tất cả mức giá" },
  { value: "1", label: "Dưới 500 triệu", slug: "duoi-500-trieu" },
  { value: "2", label: "500 - 800 triệu", slug: "500-800-trieu" },
  { value: "3", label: "800 triệu - 1 tỷ", slug: "800-trieu-1-ty" },
  { value: "4", label: "1 - 2 tỷ", slug: "1-2-ty" },
  { value: "5", label: "2 - 3 tỷ", slug: "2-3-ty" },
  { value: "6", label: "3 - 5 tỷ", slug: "3-5-ty" },
  { value: "7", label: "5 - 7 tỷ", slug: "5-7-ty" },
  { value: "8", label: "7 - 10 tỷ", slug: "7-10-ty" },
  { value: "9", label: "10 - 20 tỷ", slug: "10-20-ty" },
  { value: "10", label: "20 - 30 tỷ", slug: "20-30-ty" },
  { value: "11", label: "30 - 40 tỷ", slug: "30-40-ty" },
  { value: "12", label: "40 - 60 tỷ", slug: "40-60-ty" },
  { value: "13", label: "Trên 60 tỷ", slug: "tren-60-ty" },
  { value: "0", label: "Thỏa thuận", slug: "thoa-thuan" },
];

const rentPriceRanges: PriceRange[] = [
  { value: "", label: "Tất cả mức giá" },
  { value: "1", label: "Dưới 1 triệu", slug: "duoi-1-trieu" },
  { value: "2", label: "1 - 3 triệu", slug: "1-3-trieu" },
  { value: "3", label: "3 - 5 triệu", slug: "3-5-trieu" },
  { value: "4", label: "5 - 10 triệu", slug: "5-10-trieu" },
  { value: "5", label: "10 - 40 triệu", slug: "10-40-trieu" },
  { value: "6", label: "40 - 70 triệu", slug: "40-70-trieu" },
  { value: "7", label: "70 - 100 triệu", slug: "70-100-trieu" },
  { value: "8", label: "Trên 100 triệu", slug: "tren-100-trieu" },
  { value: "0", label: "Thỏa thuận", slug: "thoa-thuan" },
];

const projectPriceRanges: PriceRange[] = [
  { value: "", label: "Tất cả mức giá" },
  { value: "1", label: "Dưới 1 tỷ", slug: "duoi-1-ty" },
  { value: "2", label: "1 - 2 tỷ", slug: "1-2-ty" },
  { value: "3", label: "2 - 3 tỷ", slug: "2-3-ty" },
  { value: "4", label: "3 - 5 tỷ", slug: "3-5-ty" },
  { value: "5", label: "5 - 7 tỷ", slug: "5-7-ty" },
  { value: "6", label: "7 - 10 tỷ", slug: "7-10-ty" },
  { value: "7", label: "10 - 20 tỷ", slug: "10-20-ty" },
  { value: "8", label: "20 - 30 tỷ", slug: "20-30-ty" },
  { value: "9", label: "30 - 50 tỷ", slug: "30-50-ty" },
  { value: "10", label: "Trên 50 tỷ", slug: "tren-50-ty" },
  { value: "0", label: "Thỏa thuận", slug: "thoa-thuan" },
];

const areaRanges: PriceRange[] = [
  { value: "", label: "Tất cả diện tích" },
  { value: "1", label: "Dưới 30 m²", slug: "duoi-30-m2" },
  { value: "2", label: "30 - 50 m²", slug: "30-50-m2" },
  { value: "3", label: "50 - 80 m²", slug: "50-80-m2" },
  { value: "4", label: "80 - 100 m²", slug: "80-100-m2" },
  { value: "5", label: "100 - 150 m²", slug: "100-150-m2" },
  { value: "6", label: "150 - 200 m²", slug: "150-200-m2" },
  { value: "7", label: "200 - 250 m²", slug: "200-250-m2" },
  { value: "8", label: "250 - 300 m²", slug: "250-300-m2" },
  { value: "9", label: "300 - 500 m²", slug: "300-500-m2" },
  { value: "10", label: "Trên 500 m²", slug: "tren-500-m2" },
];

export function SearchSection() {
  const router = useRouter();

  // States
  const [searchType, setSearchType] = useState<"buy" | "rent" | "project">(
    "buy"
  );
  const [selectedCity, setSelectedCity] = useState<number>(79); // TP.HCM default
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<
    SelectedPropertyType[]
  >([]);
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [selectedDistricts, setSelectedDistricts] = useState<
    SelectedDistrict[]
  >([]);

  // Dropdown states
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const [showPropertyDropdown, setShowPropertyDropdown] =
    useState<boolean>(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState<boolean>(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState<boolean>(false);
  const [showLocationSuggestions, setShowLocationSuggestions] =
    useState<boolean>(false);

  // Refs for dropdowns
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);

  // Click outside handler
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

  // Lấy danh sách quận/huyện của thành phố được chọn
  const selectedCityDistricts = useMemo(() => {
    const city = locationData.find((c) => c.code === selectedCity);
    return city?.districts || [];
  }, [selectedCity]);

  // Filter districts based on search input
  const filteredDistricts = useMemo(() => {
    if (!locationSearch.trim()) return selectedCityDistricts;
    return selectedCityDistricts.filter((district) =>
      district.name.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [selectedCityDistricts, locationSearch]);

  // Mock projects data for search suggestions
  const mockProjects = useMemo(
    () => [
      {
        id: 1,
        name: "Vinhomes Central Park",
        developer: "Vingroup",
        cityCode: 79,
      },
      {
        id: 2,
        name: "Masteri An Phú",
        developer: "Thảo Điền Investment",
        cityCode: 79,
      },
      { id: 3, name: "The Sun Avenue", developer: "Novaland", cityCode: 79 },
      { id: 4, name: "Saigon Pearl", developer: "Saigon Pearl", cityCode: 79 },
      { id: 5, name: "Landmark 81", developer: "Vinhomes", cityCode: 79 },
      {
        id: 6,
        name: "Vinhomes Smart City",
        developer: "Vingroup",
        cityCode: 1,
      },
      { id: 7, name: "Sun Grand City", developer: "Sun Group", cityCode: 1 },
      {
        id: 8,
        name: "The Manor Central Park",
        developer: "Bitexco",
        cityCode: 1,
      },
      {
        id: 9,
        name: "Muong Thanh Grand Da Nang",
        developer: "Muong Thanh",
        cityCode: 48,
      },
      {
        id: 10,
        name: "FLC Sea Tower Quy Nhon",
        developer: "FLC Group",
        cityCode: 56,
      },
    ],
    []
  );

  // Filter projects for search suggestions
  const filteredProjects = useMemo(() => {
    if (searchType !== "project") return [];

    // Nếu không có input, hiển thị một số dự án mẫu của city đó
    if (!locationSearch.trim()) {
      return mockProjects
        .filter((project) => project.cityCode === selectedCity)
        .slice(0, 5); // Hiển thị 5 dự án đầu tiên
    }

    // Filter by selected city first
    const projectsInCity = mockProjects.filter(
      (project) => project.cityCode === selectedCity
    );

    // Then filter by search query
    return projectsInCity.filter(
      (project) =>
        project.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
        project.developer.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [locationSearch, searchType, mockProjects, selectedCity]);

  const getCurrentPropertyTypes = (): PropertyType[] => {
    switch (searchType) {
      case "buy":
        return sellPropertyTypes;
      case "rent":
        return rentPropertyTypes;
      case "project":
        return projectPropertyTypes;
      default:
        return sellPropertyTypes;
    }
  };

  const getCurrentPriceRanges = (): PriceRange[] => {
    switch (searchType) {
      case "buy":
        return sellPriceRanges;
      case "rent":
        return rentPriceRanges;
      case "project":
        return projectPriceRanges;
      default:
        return sellPriceRanges;
    }
  };

  const getSelectedCityLabel = (): string => {
    const city = locationData.find((c) => c.code === selectedCity);
    return city ? city.name : "Hồ Chí Minh";
  };

  const getSelectedPropertyLabel = (): string => {
    if (selectedPropertyTypes.length === 0) {
      switch (searchType) {
        case "project":
          return "Loại dự án";
        default:
          return "Loại nhà đất";
      }
    }

    if (selectedPropertyTypes.length === 1) {
      return selectedPropertyTypes[0].label;
    }

    return `${selectedPropertyTypes.length} loại đã chọn`;
  };

  const getSelectedPriceLabel = (): string => {
    if (!selectedPrice) return "Mức giá";
    const priceRanges = getCurrentPriceRanges();
    const price = priceRanges.find((p) => p.value === selectedPrice);
    return price ? price.label : "Mức giá";
  };

  const getSelectedAreaLabel = (): string => {
    if (!selectedArea) return "Diện tích";
    const area = areaRanges.find((a) => a.value === selectedArea);
    return area ? area.label : "Diện tích";
  };

  // Handler functions
  const handleCitySelect = (cityCode: number) => {
    setSelectedCity(cityCode);
    setLocationSearch("");
    setSelectedDistricts([]);
    setShowCityDropdown(false);
  };

  const handlePropertyTypeSelect = (
    propertyType: PropertyType | PropertyTypeChild,
    isChild = false
  ) => {
    const newPropertyType: SelectedPropertyType = {
      value: propertyType.value,
      label: propertyType.label,
      slug: propertyType.slug,
    };

    // Check if already selected
    const isSelected = selectedPropertyTypes.some(
      (p) => p.value === propertyType.value
    );

    if (isSelected) {
      // Remove if already selected
      setSelectedPropertyTypes((prev) =>
        prev.filter((p) => p.value !== propertyType.value)
      );

      // If it's a parent type with children, also remove all children
      if (!isChild && "children" in propertyType && propertyType.children) {
        setSelectedPropertyTypes((prev) =>
          prev.filter(
            (p) =>
              !propertyType.children!.some((child) => child.value === p.value)
          )
        );
      }

      // If it's "Tất cả nhà đất" (value === ""), remove all
      if (propertyType.value === "") {
        setSelectedPropertyTypes([]);
      }
    } else {
      // Special case: "Tất cả nhà đất" (value === "")
      if (propertyType.value === "") {
        // Select all property types
        const allTypes: SelectedPropertyType[] = [];

        getCurrentPropertyTypes().forEach((type) => {
          if (type.value !== "") {
            // Skip "Tất cả nhà đất" itself
            allTypes.push({
              value: type.value,
              label: type.label,
              slug: type.slug,
            });

            // Add children if exists
            if (type.children) {
              type.children.forEach((child) => {
                allTypes.push({
                  value: child.value,
                  label: child.label,
                  slug: child.slug,
                });
              });
            }
          }
        });

        setSelectedPropertyTypes(allTypes);
      } else {
        // Normal case: Add if not selected (no limit)
        const typesToAdd = [newPropertyType];

        // If it's a parent type with children, also select all children
        if (!isChild && "children" in propertyType && propertyType.children) {
          const childrenToAdd = propertyType.children
            .filter(
              (child) =>
                // Only add children that aren't already selected
                !selectedPropertyTypes.some((p) => p.value === child.value)
            )
            .map((child) => ({
              value: child.value,
              label: child.label,
              slug: child.slug,
            }));

          typesToAdd.push(...childrenToAdd);
        }

        setSelectedPropertyTypes((prev) => [...prev, ...typesToAdd]);
      }
    }
  };

  // const handlePropertyTypeRemove = (value: string) => {
  //   setSelectedPropertyTypes((prev) => prev.filter((p) => p.value !== value));
  // };

  const handleDistrictSelect = (district: { code: number; name: string }) => {
    if (selectedDistricts.length >= 3) return;

    const alreadySelected = selectedDistricts.some(
      (d) => d.code === district.code
    );
    if (alreadySelected) return;

    setSelectedDistricts((prev) => [...prev, district]);
    setLocationSearch("");
    setShowLocationSuggestions(false);
  };

  const handleDistrictRemove = (districtCode: number) => {
    setSelectedDistricts((prev) => prev.filter((d) => d.code !== districtCode));
  };

  const handleProjectSelect = (projectName: string) => {
    setLocationSearch(projectName);
    setShowLocationSuggestions(false);
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocationSearch(e.target.value);
    setShowLocationSuggestions(e.target.value.length > 0);
  };

  const handleLocationInputFocus = () => {
    // Luôn hiển thị suggestions cho tất cả search types
    setShowLocationSuggestions(true);
  };

  // Search handler
  const handleSearch = () => {
    let url = "";
    const params = new URLSearchParams();

    // Determine base URL based on search type and selected property types
    if (searchType === "project") {
      url = "/du-an";
    } else {
      const baseUrl = searchType === "buy" ? "/mua-ban" : "/cho-thue";

      if (selectedPropertyTypes.length > 0) {
        // Use slug of first selected property type
        url = `${baseUrl}/${selectedPropertyTypes[0].slug}`;
      } else {
        url = baseUrl;
      }
    }

    // Add other parameters in order: city -> districts -> price -> area -> query -> propertyId

    // City - Always send city information using codename
    const selectedCityData = locationData.find((c) => c.code === selectedCity);
    if (selectedCityData) {
      // Sử dụng codename thay vì code
      params.append("city", selectedCityData.codename);
    }

    // Districts - Sử dụng codename thay vì code
    if (selectedDistricts.length > 0) {
      selectedDistricts.forEach((district) => {
        // Tìm district trong data để lấy codename
        const districtData = selectedCityDistricts.find(
          (d) => d.code === district.code
        );
        if (districtData && districtData.codename) {
          params.append("districts", districtData.codename);
        } else {
          // Fallback to code nếu không có codename
          params.append("districts", district.code.toString());
        }
      });
    }

    // Price - Send slug instead of value
    if (selectedPrice) {
      const priceRanges = getCurrentPriceRanges();
      const selectedPriceRange = priceRanges.find(
        (p) => p.value === selectedPrice
      );

      if (selectedPriceRange && selectedPriceRange.slug) {
        params.append("price", selectedPriceRange.slug);
      } else {
        // Fallback to value if no slug
        params.append("price", selectedPrice);
      }
    }

    // Area - Send slug instead of value
    if (selectedArea && searchType !== "project") {
      const selectedAreaRange = areaRanges.find(
        (a) => a.value === selectedArea
      );

      if (selectedAreaRange && selectedAreaRange.slug) {
        params.append("area", selectedAreaRange.slug);
      } else {
        // Fallback to value if no slug
        params.append("area", selectedArea);
      }
    }

    // Query for projects
    if (locationSearch && searchType === "project") {
      params.append("q", locationSearch);
    }

    // Property IDs - Only when multiple property types selected or no primary type in URL
    if (selectedPropertyTypes.length > 1) {
      // Multiple property types - include all except the first one (already in URL path)
      const additionalPropertyIds = selectedPropertyTypes
        .slice(1) // Skip first property type (already in URL path)
        .map((p) => p.value)
        .filter((v) => v !== "");

      additionalPropertyIds.forEach((id) => {
        params.append("propertyId", id);
      });
    }

    // Build final URL
    const queryString = params.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;

    console.log("Navigating to:", finalUrl); // Debug log
    console.log(
      "Selected city:",
      selectedCity,
      "City name:",
      selectedCityData?.name,
      "City codename:",
      selectedCityData?.codename
    ); // Debug city
    console.log(
      "Selected districts:",
      selectedDistricts.map((d) => {
        const districtData = selectedCityDistricts.find(
          (district) => district.code === d.code
        );
        return {
          name: d.name,
          code: d.code,
          codename: districtData?.codename || "not-found",
        };
      })
    ); // Debug districts
    router.push(finalUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 max-w-6xl mx-auto">
      {/* Search Tabs */}
      <div className="flex mb-4 sm:mb-6 border-b">
        <button
          onClick={() => {
            setSearchType("buy");
            setSelectedPropertyTypes([]);
            setSelectedPrice("");
            setSelectedDistricts([]);
            setLocationSearch("");
          }}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base ${
            searchType === "buy"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Mua
        </button>
        <button
          onClick={() => {
            setSearchType("rent");
            setSelectedPropertyTypes([]);
            setSelectedPrice("");
            setSelectedDistricts([]);
            setLocationSearch("");
          }}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base ${
            searchType === "rent"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Thuê
        </button>
        <button
          onClick={() => {
            setSearchType("project");
            setSelectedPropertyTypes([]);
            setSelectedPrice("");
            setSelectedDistricts([]);
            setLocationSearch("");
          }}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base ${
            searchType === "project"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Dự án
        </button>
      </div>

      {/* Search Form */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Location Section */}
        <div className="w-full relative">
          <div className="border border-gray-300 rounded-lg bg-white flex flex-col sm:flex-row sm:items-center">
            {/* City Selector - Hiển thị cho tất cả tabs */}
            <div className="flex items-center p-3 border-b sm:border-b-0 sm:border-r border-gray-200">
              <div className="relative flex-shrink-0" ref={cityDropdownRef}>
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1 border border-gray-200 rounded text-xs sm:text-sm hover:bg-gray-50"
                >
                  <i className="fas fa-map-marker-alt text-blue-600 text-xs"></i>
                  <span className="font-medium text-xs text-black sm:text-sm">
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
                  <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-80 sm:max-h-96 overflow-y-auto">
                    {/* Popular Cities */}
                    <div className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        Top tỉnh thành nổi bật
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        {popularCities.map((city) => (
                          <button
                            key={city.code}
                            onClick={() => handleCitySelect(city.code)}
                            className={`relative h-12 sm:h-16 rounded-lg overflow-hidden text-white text-xs sm:text-sm font-medium ${
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
                      <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700">
                        Tất cả tỉnh thành
                      </div>
                      <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                        {locationData.map((city) => (
                          <button
                            key={city.code}
                            onClick={() => handleCitySelect(city.code)}
                            className={`w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 ${
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
                {/* Selected Districts Badges - Only for buy/rent */}
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
                  <i className="fas fa-search text-gray-400 mr-2 sm:mr-3 text-xs sm:text-sm"></i>
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
                    className="flex-1 text-xs text-black sm:text-sm border-none outline-none bg-transparent disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && (
                <div className="absolute top-full left-0 right-12 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
                  {searchType === "project" ? (
                    // Project tab - hiển thị cả projects và districts
                    <>
                      {/* Project suggestions */}
                      {filteredProjects.length > 0 && (
                        <>
                          <div className="p-2 border-b border-gray-200">
                            <div className="text-xs sm:text-sm font-medium text-gray-700">
                              {locationSearch.trim()
                                ? `Dự án tìm kiếm trong ${getSelectedCityLabel()} (${
                                    filteredProjects.length
                                  } kết quả)`
                                : `Dự án nổi bật trong ${getSelectedCityLabel()}`}
                            </div>
                          </div>
                          {filteredProjects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectSelect(project.name)}
                              className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 text-black border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                <i className="fas fa-building text-blue-500"></i>
                                <div>
                                  <div className="font-medium">
                                    {project.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {project.developer} •{" "}
                                    {getSelectedCityLabel()}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* District suggestions for projects - if no project matches or empty search */}
                      {filteredDistricts.length > 0 && (
                        <>
                          {/* Separator nếu có projects ở trên */}
                          {filteredProjects.length > 0 && (
                            <div className="border-t border-gray-300 mt-1"></div>
                          )}

                          <div className="p-2 border-b border-gray-200">
                            <div className="text-xs sm:text-sm font-medium text-gray-700">
                              Khu vực trong {getSelectedCityLabel()}
                              {locationSearch.trim() && (
                                <span className="text-gray-500 ml-1">
                                  (có thể chọn để lọc dự án theo khu vực)
                                </span>
                              )}
                            </div>
                          </div>
                          {filteredDistricts.slice(0, 5).map((district) => (
                            <button
                              key={district.code}
                              onClick={() => {
                                // For projects, we can add district to search or filter
                                setLocationSearch((prev) =>
                                  prev.trim()
                                    ? `${prev.trim()}, ${district.name}`
                                    : district.name
                                );
                                setShowLocationSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 text-black border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                <i className="fas fa-map-marker-alt text-gray-400"></i>
                                <div>
                                  <div className="font-medium">
                                    {district.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Khu vực • {getSelectedCityLabel()}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                          {filteredDistricts.length > 5 && (
                            <div className="p-2 text-center">
                              <span className="text-xs text-gray-500">
                                Và {filteredDistricts.length - 5} khu vực
                                khác...
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Empty state */}
                      {filteredProjects.length === 0 &&
                        filteredDistricts.length === 0 &&
                        locationSearch.trim() && (
                          <div className="p-4 text-center">
                            <div className="text-gray-500 text-sm">
                              <i className="fas fa-search text-gray-400 mb-2 text-lg block"></i>
                              Không tìm thấy dự án hoặc khu vực nào phù hợp
                            </div>
                            <button
                              onClick={() => setLocationSearch("")}
                              className="text-blue-600 hover:text-blue-800 text-xs mt-2"
                            >
                              Xóa bộ lọc tìm kiếm
                            </button>
                          </div>
                        )}

                      {/* Footer suggestion */}
                      {(filteredProjects.length > 0 ||
                        filteredDistricts.length > 0) && (
                        <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                          <div className="text-xs text-gray-500">
                            Không tìm thấy dự án phù hợp?
                            <button
                              onClick={() => router.push("/du-an")}
                              className="text-blue-600 hover:text-blue-800 ml-1"
                            >
                              Xem tất cả dự án
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // District suggestions for buy/rent tabs (existing logic)
                    filteredDistricts.length > 0 && (
                      <>
                        <div className="p-2 border-b border-gray-200">
                          <div className="text-xs sm:text-sm font-medium text-gray-700">
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
                              className={`w-full px-3 py-2 text-left text-xs sm:text-sm border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                                isSelected
                                  ? "bg-blue-50 text-blue-600 cursor-default"
                                  : canSelect
                                  ? "hover:bg-gray-50 text-black cursor-pointer"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <span className="flex items-center">
                                <i
                                  className={`fas fa-map-marker-alt mr-2 ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-400"
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

                        {/* Thống kê */}
                        <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-200">
                          Hiển thị {filteredDistricts.length} quận/huyện
                          {selectedDistricts.length > 0 && (
                            <span className="text-blue-600 ml-1">
                              • Đã chọn: {selectedDistricts.length}/3
                            </span>
                          )}
                        </div>
                      </>
                    )
                  )}
                </div>
              )}

              <div className="p-2">
                <button
                  onClick={handleSearch}
                  className="px-3 sm:px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Tìm kiếm</span>
                  <i className="fas fa-search sm:hidden"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Property Type - Updated for multi-select without badges */}
          <div className="w-full sm:w-1/3 relative" ref={propertyDropdownRef}>
            <button
              onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <span className="text-xs text-black sm:text-sm truncate">
                {getSelectedPropertyLabel()}
              </span>
              <i
                className={`fas fa-chevron-${
                  showPropertyDropdown ? "up" : "down"
                } text-gray-400 text-xs ml-2`}
              ></i>
            </button>

            {showPropertyDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 sm:max-h-80 overflow-hidden flex flex-col">
                {/* Header - Fixed */}
                <div className="p-2 sm:p-3 border-b border-gray-200 flex-shrink-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-700">
                    {searchType === "project" ? "Loại dự án" : "Loại nhà đất"}
                    {selectedPropertyTypes.length > 0 && (
                      <span className="text-blue-600 ml-1">
                        ({selectedPropertyTypes.length} đã chọn)
                      </span>
                    )}
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  {getCurrentPropertyTypes().map((type) => {
                    const isSelected = selectedPropertyTypes.some(
                      (p) => p.value === type.value
                    );

                    // Check if all children are selected (for parent types)
                    const allChildrenSelected = type.children
                      ? type.children.every((child) =>
                          selectedPropertyTypes.some(
                            (p) => p.value === child.value
                          )
                        )
                      : false;

                    // Special case for "Tất cả nhà đất" - show as selected if all other types are selected
                    let shouldShowAsSelected =
                      isSelected || allChildrenSelected;

                    if (type.value === "") {
                      // Check if all other property types are selected
                      const allOtherTypes = getCurrentPropertyTypes().filter(
                        (t) => t.value !== ""
                      );
                      const allOtherTypesSelected = allOtherTypes.every(
                        (otherType) => {
                          // Check if this type is selected
                          const typeSelected = selectedPropertyTypes.some(
                            (p) => p.value === otherType.value
                          );

                          // If it has children, check if all children are selected
                          if (otherType.children) {
                            const allChildrenSelected =
                              otherType.children.every((child) =>
                                selectedPropertyTypes.some(
                                  (p) => p.value === child.value
                                )
                              );
                            return typeSelected || allChildrenSelected;
                          }

                          return typeSelected;
                        }
                      );

                      shouldShowAsSelected = allOtherTypesSelected;
                    }

                    return (
                      <div key={type.value}>
                        <button
                          onClick={() => handlePropertyTypeSelect(type)}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 ${
                            shouldShowAsSelected ? "bg-blue-50" : ""
                          }`}
                        >
                          <span className="text-sm sm:text-lg">
                            {type.icon}
                          </span>
                          <span
                            className={`text-xs sm:text-sm flex-1 ${
                              shouldShowAsSelected
                                ? "text-blue-600 font-medium"
                                : "text-black"
                            }`}
                          >
                            {type.label}
                          </span>
                          {shouldShowAsSelected && (
                            <i className="fas fa-check text-red-500 text-xs"></i>
                          )}
                        </button>

                        {type.children &&
                          type.children.map((child) => {
                            const isChildSelected = selectedPropertyTypes.some(
                              (p) => p.value === child.value
                            );

                            return (
                              <button
                                key={child.value}
                                onClick={() =>
                                  handlePropertyTypeSelect(child, true)
                                }
                                className={`w-full px-8 sm:px-12 py-1 sm:py-2 text-left hover:bg-gray-50 text-xs sm:text-sm border-b border-gray-50 flex items-center justify-between ${
                                  isChildSelected ? "bg-blue-50" : ""
                                }`}
                              >
                                <span
                                  className={`${
                                    isChildSelected
                                      ? "text-blue-600 font-medium"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {child.label}
                                </span>
                                {isChildSelected && (
                                  <i className="fas fa-check text-red-500 text-xs"></i>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>

                {/* Footer với nút Áp dụng - Fixed */}
                <div className="p-3 border-t border-gray-200 flex justify-between items-center flex-shrink-0 bg-white">
                  <button
                    onClick={() => {
                      setSelectedPropertyTypes([]);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Đặt lại
                  </button>
                  <button
                    onClick={() => setShowPropertyDropdown(false)}
                    className="px-4 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
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
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <span className="text-xs text-black sm:text-sm truncate">
                {getSelectedPriceLabel()}
              </span>
              <i
                className={`fas fa-chevron-${
                  showPriceDropdown ? "up" : "down"
                } text-gray-400 text-xs`}
              ></i>
            </button>

            {showPriceDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 sm:max-h-80 overflow-y-auto">
                <div className="p-2 sm:p-3 border-b border-gray-200">
                  <div className="text-xs sm:text-sm font-medium text-gray-700">
                    Mức giá
                  </div>
                </div>
                {getCurrentPriceRanges().map((price) => (
                  <button
                    key={price.value}
                    onClick={() => {
                      setSelectedPrice(price.value);
                      setShowPriceDropdown(false);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-50 text-xs sm:text-sm text-black border-b border-gray-50"
                  >
                    {price.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Area - Ẩn cho dự án */}
          {searchType !== "project" && (
            <div className="w-full sm:w-1/3 relative" ref={areaDropdownRef}>
              <button
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <span className="text-xs text-black sm:text-sm truncate">
                  {getSelectedAreaLabel()}
                </span>
                <i
                  className={`fas fa-chevron-${
                    showAreaDropdown ? "up" : "down"
                  } text-gray-400 text-xs`}
                ></i>
              </button>

              {showAreaDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 sm:max-h-80 overflow-y-auto">
                  <div className="p-2 sm:p-3 border-b border-gray-200">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">
                      Diện tích
                    </div>
                  </div>
                  {areaRanges.map((area) => (
                    <button
                      key={area.value}
                      onClick={() => {
                        setSelectedArea(area.value);
                        setShowAreaDropdown(false);
                      }}
                      className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-50 text-xs text-black sm:text-sm border-b border-gray-50"
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
