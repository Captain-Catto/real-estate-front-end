"use client";
import React, { useState } from "react";
import { Menu, Transition } from "@headlessui/react";

const locationOptions = [
  { value: "CN", label: "Toàn quốc" },
  { value: "SG", label: "Hồ Chí Minh" },
  { value: "HN", label: "Hà Nội" },
  { value: "DDN", label: "Đà Nẵng" },
  { value: "BD", label: "Bình Dương" },
  { value: "DNA", label: "Đồng Nai" },
  { value: "KH", label: "Khánh Hòa" },
  { value: "HP", label: "Hải Phòng" },
];

const categoryOptions = [
  { value: "-1", label: "Tất cả loại hình", icon: "🏢" },
  { value: "155", label: "Căn hộ chung cư", icon: "🏢" },
  { value: "156", label: "Cao ốc văn phòng", icon: "🏢" },
  { value: "157", label: "Trung tâm thương mại", icon: "🏢" },
  { value: "150", label: "Khu đô thị mới", icon: "🏙️" },
  { value: "160", label: "Khu phức hợp", icon: "🏢" },
  { value: "148", label: "Nhà ở xã hội", icon: "🏠" },
  { value: "158", label: "Khu nghỉ dưỡng, Sinh thái", icon: "🌿" },
  { value: "159", label: "Khu công nghiệp", icon: "🏭" },
  { value: "421", label: "Biệt thự liền kề", icon: "🏘️" },
  { value: "600", label: "Shophouse", icon: "🏪" },
  { value: "601", label: "Nhà mặt phố", icon: "🏬" },
  { value: "161", label: "Dự án khác", icon: "🏗️" },
];

const priceOptions = [
  { value: "-1", label: "Tất cả mức giá" },
  { value: "1", label: "Dưới 5 triệu/m²", min: 0, max: 5 },
  { value: "2", label: "5 - 10 triệu/m²", min: 5, max: 10 },
  { value: "3", label: "10 - 20 triệu/m²", min: 10, max: 20 },
  { value: "4", label: "20 - 35 triệu/m²", min: 20, max: 35 },
  { value: "5", label: "35 - 50 triệu/m²", min: 35, max: 50 },
  { value: "6", label: "50 - 80 triệu/m²", min: 50, max: 80 },
  { value: "7", label: "Trên 80 triệu/m²", min: 80, max: 999 },
];

const statusOptions = [
  { value: "1", label: "Sắp mở bán" },
  { value: "2", label: "Đang mở bán" },
  { value: "3", label: "Đã bàn giao" },
];

export function ProjectSearchBar() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("CN");
  const [selectedCategory, setSelectedCategory] = useState("-1");
  const [selectedPrice, setSelectedPrice] = useState("-1");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [customPriceLabel, setCustomPriceLabel] = useState("");

  const handleReset = () => {
    setSearchValue("");
    setSelectedLocation("CN");
    setSelectedCategory("-1");
    setSelectedPrice("-1");
    setSelectedStatus([]);
    setPriceMin("");
    setPriceMax("");
    setCustomPriceLabel("");
  };

  const handleStatusToggle = (statusValue: string) => {
    setSelectedStatus((prev) =>
      prev.includes(statusValue)
        ? prev.filter((s) => s !== statusValue)
        : [...prev, statusValue]
    );
  };

  const handlePriceApply = () => {
    const min = parseFloat(priceMin) || 0;
    const max = parseFloat(priceMax) || 999;

    // Check if the range matches any predefined option
    const matchingOption = priceOptions.find(
      (option) =>
        option.min !== undefined &&
        option.max !== undefined &&
        option.min === min &&
        option.max === max
    );

    if (matchingOption) {
      // Use predefined option
      setSelectedPrice(matchingOption.value);
      setCustomPriceLabel("");
    } else {
      // Create custom label
      let label = "";
      if (min > 0 && max < 999) {
        label = `${min} - ${max} triệu/m²`;
      } else if (min > 0) {
        label = `Trên ${min} triệu/m²`;
      } else if (max < 999) {
        label = `Dưới ${max} triệu/m²`;
      } else {
        label = "Tất cả mức giá";
      }

      setSelectedPrice("custom");
      setCustomPriceLabel(label);
    }

    console.log("Price range applied:", min, "-", max);
  };

  const handlePriceReset = () => {
    setPriceMin("");
    setPriceMax("");
    setSelectedPrice("-1");
    setCustomPriceLabel("");
  };

  const handlePredefinedPriceSelect = (option: any) => {
    setSelectedPrice(option.value);
    setCustomPriceLabel("");

    // Update input fields if it's a predefined range
    if (option.min !== undefined && option.max !== undefined) {
      setPriceMin(option.min.toString());
      setPriceMax(option.max < 999 ? option.max.toString() : "");
    } else {
      setPriceMin("");
      setPriceMax("");
    }
  };

  const getPriceDisplayText = () => {
    if (selectedPrice === "custom" && customPriceLabel) {
      return customPriceLabel;
    }

    const selectedOption = priceOptions.find(
      (opt) => opt.value === selectedPrice
    );
    return selectedOption?.label || "Tất cả mức giá";
  };

  const getStatusDisplayText = () => {
    if (selectedStatus.length === 0) return "Tất cả";
    if (selectedStatus.length === 1) {
      const status = statusOptions.find(
        (opt) => opt.value === selectedStatus[0]
      );
      return status?.label || "Tất cả";
    }
    return `${selectedStatus.length} trạng thái`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

        {/* Location Filter */}
        <div className="w-full sm:w-auto">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-between w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="text-left">
                <div className="text-xs text-gray-500">Khu vực</div>
                <div className="font-medium">
                  {
                    locationOptions.find(
                      (opt) => opt.value === selectedLocation
                    )?.label
                  }
                </div>
              </div>
              <svg
                className="w-4 h-4 ml-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-50 mt-2 w-64 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Tìm Tỉnh/ Thành phố"
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {locationOptions.map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          onClick={() => setSelectedLocation(option.value)}
                          className={`${active ? "bg-gray-100" : ""} ${
                            selectedLocation === option.value
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700"
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {option.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

        {/* Category Filter */}
        <div className="w-full sm:w-auto">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-between w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="text-left">
                <div className="text-xs text-gray-500">Loại hình</div>
                <div className="font-medium">
                  {
                    categoryOptions.find(
                      (opt) => opt.value === selectedCategory
                    )?.label
                  }
                </div>
              </div>
              <svg
                className="w-4 h-4 ml-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-50 mt-2 w-64 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
                <div className="py-1">
                  {categoryOptions.map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          onClick={() => setSelectedCategory(option.value)}
                          className={`${active ? "bg-gray-100" : ""} ${
                            selectedCategory === option.value
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700"
                          } flex items-center w-full text-left px-4 py-2 text-sm`}
                        >
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

        {/* Price Filter */}
        <div className="w-full sm:w-auto">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-between w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="text-left min-w-0 flex-1">
                <div className="text-xs text-gray-500">Mức giá</div>
                <div className="font-medium truncate">
                  {getPriceDisplayText()}
                </div>
              </div>
              <svg
                className="w-4 h-4 ml-2 text-gray-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-50 mt-2 w-screen max-w-sm sm:w-80 left-0 sm:left-auto right-0 sm:right-auto origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-4">
                  {/* Price Range Input */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-3">
                      Khoảng giá (triệu VNĐ/m²)
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Từ"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="0"
                          max="200"
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Đến"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="0"
                          max="200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Predefined Price Options */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Hoặc chọn mức giá có sẵn:
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {priceOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handlePredefinedPriceSelect(option)}
                          className={`${
                            selectedPrice === option.value
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "text-gray-700 hover:bg-gray-50 border-transparent"
                          } block w-full text-left px-3 py-2 text-sm rounded border transition-colors`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-3 border-t border-gray-200">
                    <button
                      onClick={handlePriceReset}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Đặt lại
                    </button>
                    <button
                      onClick={handlePriceApply}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-between w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="text-left">
                <div className="text-xs text-gray-500">Trạng thái</div>
                <div className="font-medium">{getStatusDisplayText()}</div>
              </div>
              <svg
                className="w-4 h-4 ml-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-50 mt-2 w-64 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-900 mb-3">
                    Chọn trạng thái
                  </div>

                  {/* Status Tags */}
                  <div className="space-y-2 mb-4">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusToggle(option.value)}
                        className={`${
                          selectedStatus.includes(option.value)
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        } block w-full text-left px-3 py-2 text-sm border rounded transition-colors`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedStatus([])}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Đặt lại
                    </button>
                    <button
                      onClick={() => {
                        /* Apply status filter */
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-300"></div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Xóa tiêu chí lọc"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
