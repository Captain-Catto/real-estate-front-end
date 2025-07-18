"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import DraggablePriceTable from "@/components/admin/DraggablePriceTable";
import { fetchWithAuth } from "@/services/authService";

interface Price {
  _id: string;
  id: string;
  name: string;
  slug: string;
  type: "ban" | "cho-thue" | "project";
  minValue?: number;
  maxValue?: number;
  order: number;
  isActive: boolean;
}

export default function PricesManagement() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<
    "all" | "ban" | "cho-thue" | "project"
  >("all");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "ban" as "ban" | "cho-thue" | "project",
    minValue: 0,
    maxValue: -1,
    order: 0,
  });

  const fetchPrices = useCallback(async () => {
    try {
      // Chỉ set loading khi load lần đầu hoặc thay đổi filter/page
      if (prices.length === 0) {
        setLoading(true);
      }
      const typeParam = filterType !== "all" ? `&type=${filterType}` : "";
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/prices?page=${currentPage}&limit=10${typeParam}`
      );

      const data = await response.json();
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }
      if (data.success) {
        setPrices(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        alert(data.message || "Lỗi khi tải dữ liệu");
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, prices.length]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPrice
        ? `http://localhost:8080/api/admin/prices/${editingPrice._id}`
        : "http://localhost:8080/api/admin/prices";

      const method = editingPrice ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }
      if (data.success) {
        fetchPrices();
        resetForm();
        alert(editingPrice ? "Cập nhật thành công!" : "Tạo mới thành công!");
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving price:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleEdit = (price: Price) => {
    setEditingPrice(price);
    setFormData({
      name: price.name,
      slug: price.slug,
      type: price.type,
      minValue: price.minValue || 0,
      maxValue: price.maxValue || -1,
      order: price.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (price: Price) => {
    if (!confirm(`Bạn có chắc muốn xóa "${price.name}"?`)) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/prices/${price._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }
      if (data.success) {
        fetchPrices();
        alert("Xóa thành công!");
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting price:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const toggleStatus = async (price: Price) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/prices/${price._id}/toggle-status`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }
      if (data.success) {
        fetchPrices();
        alert(`${price.isActive ? "Đã ẩn" : "Đã kích hoạt"} khoảng giá`);
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleReorder = async (newOrder: Price[]) => {
    // Cập nhật UI ngay lập tức
    setPrices(newOrder);

    try {
      // Chuẩn bị data với order mới
      const orderData = newOrder.map((price, index) => ({
        id: price._id,
        order: index + 1,
      }));

      const response = await fetchWithAuth(
        "http://localhost:8080/api/admin/prices/order",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prices: orderData }),
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }
      if (data.success) {
        // Thành công - fetch lại để đảm bảo dữ liệu đúng
        fetchPrices();
      } else {
        // Nếu có lỗi, load lại data từ server
        fetchPrices();
        alert(data.message || "Có lỗi xảy ra khi cập nhật thứ tự");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      // Nếu có lỗi, load lại data từ server
      fetchPrices();
      alert("Có lỗi xảy ra khi cập nhật thứ tự");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      type: "ban",
      minValue: 0,
      maxValue: -1,
      order: 0,
    });
    setEditingPrice(null);
    setShowForm(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const formatPrice = (
    min?: number,
    max?: number,
    type?: "ban" | "cho-thue" | "project"
  ) => {
    if (!min && !max) return "Thỏa thuận";
    if (min === 0 && max === -1) return "Thỏa thuận";

    const formatNumber = (num: number) => {
      if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    const getUnit = (type?: string) => {
      switch (type) {
        case "ban":
          return "VNĐ";
        case "cho-thue":
          return "VNĐ/tháng";
        case "project":
          return "VNĐ/m²";
        default:
          return "VNĐ";
      }
    };

    const unit = getUnit(type);

    if (max === -1) return `Từ ${formatNumber(min || 0)} ${unit}`;
    return `${formatNumber(min || 0)} - ${formatNumber(max || 0)} ${unit}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with Stats */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Quản lý Khoảng giá
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Quản lý khoảng giá cho mua bán, cho thuê và dự án bất động
                    sản
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                  Thêm khoảng giá
                </button>
              </div>
            </div>

            {/* Type Tabs and Stats */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bộ lọc khoảng giá
                  </h2>
                </div>

                {/* Type Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterType === "all"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilterType("ban")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterType === "ban"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Mua bán
                  </button>
                  <button
                    onClick={() => setFilterType("cho-thue")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterType === "cho-thue"
                        ? "bg-orange-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cho thuê
                  </button>
                  <button
                    onClick={() => setFilterType("project")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterType === "project"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Dự án
                  </button>
                </div>
              </div>
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {editingPrice ? "Sửa khoảng giá" : "Thêm khoảng giá mới"}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      X
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên khoảng giá
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại giao dịch
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            type: e.target.value as
                              | "ban"
                              | "cho-thue"
                              | "project",
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ban">Mua bán</option>
                        <option value="cho-thue">Cho thuê</option>
                        <option value="project">Dự án</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.type === "ban" &&
                          "Khoảng giá cho việc mua bán bất động sản"}
                        {formData.type === "cho-thue" &&
                          "Khoảng giá cho việc cho thuê bất động sản"}
                        {formData.type === "project" &&
                          "Khoảng giá cho các dự án bất động sản"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá tối thiểu
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.minValue}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                minValue: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-2 text-sm text-gray-500">
                            {formData.type === "ban"
                              ? "VNĐ"
                              : formData.type === "cho-thue"
                              ? "VNĐ/tháng"
                              : "VNĐ/m²"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá tối đa
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.maxValue}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                maxValue: parseFloat(e.target.value) || -1,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="-1"
                            placeholder="-1 = không giới hạn"
                          />
                          <span className="absolute right-3 top-2 text-sm text-gray-500">
                            {formData.type === "ban"
                              ? "VNĐ"
                              : formData.type === "cho-thue"
                              ? "VNĐ/tháng"
                              : "VNĐ/m²"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Nhập -1 hoặc để trống nếu không giới hạn trên
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thứ tự hiển thị
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            order: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        {editingPrice ? "Cập nhật" : "Tạo mới"}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Prices Table */}
            <DraggablePriceTable
              prices={prices}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={toggleStatus}
              onReorder={handleReorder}
              formatPrice={formatPrice}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </nav>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
