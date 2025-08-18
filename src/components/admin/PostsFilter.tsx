import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { categoryService, Category } from "@/services/categoryService";
import { packageService } from "@/services/packageService";
import SearchableProjectSelect from "./SearchableProjectSelect";
import { showErrorToast } from "@/utils/errorHandler";

interface PostsFilterProps {
  filters: {
    status: string;
    type: string;
    category: string;
    package: string;
    search: string;
    project: string;
    dateFrom: string;
    dateTo: string;
    searchMode?: string; // Add search mode filter
  };
  onFilterChange: (filters: Record<string, string>) => void;
}

export default function PostsFilter({
  filters,
  onFilterChange,
}: PostsFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [packages, setPackages] = useState<string[]>([
    "vip",
    "premium",
    "normal",
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchMode, setSearchMode] = useState<"property" | "project">(
    "property"
  );
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Fetch packages when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packageList = await packageService.getPriorityTypes();
        if (packageList && packageList.length > 0) {
          setPackages(packageList);
        }
      } catch {
        showErrorToast("Lỗi không tải được gói bài viết");
      }
    };

    fetchPackages();
  }, []);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔄 Fetching categories for admin filter...");
        const categoryList = await categoryService.getCategories();
        console.log("📋 Fetched categories:", categoryList);
        if (categoryList && categoryList.length > 0) {
          setCategories(categoryList);
          setFilteredCategories(categoryList);
          console.log(`✅ Set ${categoryList.length} categories in filter`);
        }
      } catch {
        showErrorToast("Lỗi không tải được danh mục");
      }
    };

    fetchCategories();
  }, []);

  // Initialize search mode from filters
  useEffect(() => {
    setSearchMode(filters.searchMode === "project" ? "project" : "property");
  }, [filters.searchMode]);

  // Filter categories based on search mode
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (searchMode === "project") {
        // When in project mode, fetch only project categories (isProject: true)
        const projectCategories = await categoryService.getByProjectType(true);
        setFilteredCategories(projectCategories);
      } else {
        // When in property mode, fetch only non-project categories (isProject: false)
        const propertyCategories = await categoryService.getByProjectType(
          false
        );
        setFilteredCategories(propertyCategories);
      }
    };

    fetchFilteredData();
  }, [searchMode]);

  const handleFilterChange = (key: string, value: string) => {
    console.log(`🔄 Admin filter change: ${key} = ${value}`);

    if (key === "searchMode") {
      setSearchMode(value as "property" | "project");
      // Reset category and project when changing search mode
      onFilterChange({
        [key]: value,
        category: "all",
        project: "all",
      });
      return;
    }

    if (key === "category") {
      const selectedCategory = categories.find((cat) => cat._id === value);
      console.log(`📋 Selected category:`, selectedCategory);
      onFilterChange({ [key]: value });
      return;
    }

    if (key === "project") {
      onFilterChange({ [key]: value });
      return;
    }

    onFilterChange({ [key]: value });
  };

  const handleSearch = (value: string) => {
    onFilterChange({ search: value });
  };

  const clearFilters = () => {
    setSearchMode("property");
    onFilterChange({
      status: "all",
      type: "all",
      category: "all",
      package: "all",
      search: "",
      project: "all",
      dateFrom: "",
      dateTo: "",
      searchMode: "property",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, mã tin, tác giả..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="pending">Chờ duyệt</option>
            <option value="rejected">Bị từ chối</option>
            <option value="expired">Hết hạn</option>
            <option value="deleted">Đã xóa mềm</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="ban">Bán</option>
            <option value="cho-thue">Cho thuê</option>
          </select>
        </div>

        {/* Advanced Filter Toggle */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Search Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại tìm kiếm
            </label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchMode"
                  value="property"
                  checked={searchMode === "property"}
                  onChange={(e) =>
                    handleFilterChange("searchMode", e.target.value)
                  }
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Tìm theo loại bất động sản
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchMode"
                  value="project"
                  checked={searchMode === "project"}
                  onChange={(e) =>
                    handleFilterChange("searchMode", e.target.value)
                  }
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Tìm theo dự án</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchMode === "project" ? "Loại dự án" : "Loại BĐS"}
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                {filteredCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter - Only show in project mode */}
            {searchMode === "project" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dự án
                </label>
                <div className="relative">
                  <SearchableProjectSelect
                    value={filters.project}
                    onChange={(value) => handleFilterChange("project", value)}
                    categoryId={
                      filters.category !== "all" ? filters.category : undefined
                    }
                  />
                </div>
              </div>
            )}

            {/* Package Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gói tin
              </label>
              <select
                value={filters.package}
                onChange={(e) => handleFilterChange("package", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                {packages.map((packageType) => (
                  <option key={packageType} value={packageType}>
                    {packageType === "vip"
                      ? "VIP"
                      : packageType === "premium"
                      ? "Premium"
                      : packageType === "basic"
                      ? "Cơ bản"
                      : packageType === "free"
                      ? "Miễn phí"
                      : packageType}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {(filters.status !== "all" ||
        filters.type !== "all" ||
        filters.category !== "all" ||
        filters.package !== "all" ||
        filters.project !== "all" ||
        filters.search ||
        filters.dateFrom ||
        filters.dateTo) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
