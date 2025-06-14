import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface PostsFilterProps {
  filters: {
    status: string;
    type: string;
    category: string;
    priority: string;
    search: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function PostsFilter({
  filters,
  onFilterChange,
}: PostsFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ [key]: value });
  };

  const handleSearch = (value: string) => {
    onFilterChange({ search: value });
  };

  const clearFilters = () => {
    onFilterChange({
      status: "all",
      type: "all",
      category: "all",
      priority: "all",
      search: "",
      dateFrom: "",
      dateTo: "",
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
            <option value="sale">Bán</option>
            <option value="rent">Cho thuê</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại BĐS
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="apartment">Căn hộ</option>
              <option value="house">Nhà phố</option>
              <option value="villa">Biệt thự</option>
              <option value="land">Đất nền</option>
              <option value="office">Văn phòng</option>
              <option value="commercial">Thương mại</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gói tin
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="vip">VIP</option>
              <option value="premium">Premium</option>
              <option value="normal">Thường</option>
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
      )}

      {/* Clear Filters */}
      {(filters.status !== "all" ||
        filters.type !== "all" ||
        filters.category !== "all" ||
        filters.priority !== "all" ||
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
