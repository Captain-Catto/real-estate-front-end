"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import DraggablePriceTable from "@/components/admin/DraggablePriceTable";
import { fetchWithAuth } from "@/services/authService";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";

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

function PricesManagementInternalContent() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(false);
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
      if (prices.length === 0) {
        setLoading(true);
      }
      const typeParam = filterType !== "all" ? `&type=${filterType}` : "";
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/prices?page=${currentPage}&limit=10${typeParam}`
      );

      if (!response) {
        throw new Error("No response received");
      }

      // Check response status first
      if (response.status === 401) {
        showErrorToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }

      // Only parse JSON if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setPrices(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        showErrorToast(
          data.message || "Có lỗi xảy ra khi lấy danh sách khoảng giá"
        );
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, prices.length]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleCreatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/admin/prices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showSuccessToast("Tạo khoảng giá thành công!");
        setShowForm(false);
        setFormData({
          name: "",
          slug: "",
          type: "ban",
          minValue: 0,
          maxValue: -1,
          order: 0,
        });
        fetchPrices();
      } else {
        showErrorToast("Lỗi: " + (data.message || "Có lỗi xảy ra"));
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi tạo khoảng giá");
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/prices/${editingPrice._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showSuccessToast("Cập nhật khoảng giá thành công!");
        setShowForm(false);
        setEditingPrice(null);
        setFormData({
          name: "",
          slug: "",
          type: "ban",
          minValue: 0,
          maxValue: -1,
          order: 0,
        });
        fetchPrices();
      } else {
        showErrorToast("Lỗi: " + (data.message || "Có lỗi xảy ra"));
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi cập nhật khoảng giá");
    }
  };

  const handleDeletePrice = async (price: Price) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khoảng giá này?")) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/prices/${price._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showSuccessToast("Xóa khoảng giá thành công!");
        fetchPrices();
      } else {
        showErrorToast("Lỗi: " + (data.message || "Có lỗi xảy ra"));
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi xóa khoảng giá");
    }
  };

  const handleToggleStatus = async (price: Price) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/prices/${price._id}/toggle-active`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !price.isActive }),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        showSuccessToast(
          `${
            !price.isActive ? "Kích hoạt" : "Vô hiệu hóa"
          } khoảng giá thành công!`
        );
        fetchPrices();
      } else {
        showErrorToast("Lỗi: " + (data.message || "Có lỗi xảy ra"));
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi thay đổi trạng thái khoảng giá");
    }
  };

  const handleEditPrice = (price: Price) => {
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

  const handleReorder = async (updatedPrices: Price[]) => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/admin/prices/reorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prices: updatedPrices }),
        }
      );

      if (!response) {
        throw new Error("No response received");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setPrices(updatedPrices);
      } else {
        showErrorToast(
          "Lỗi khi cập nhật thứ tự: " + (data.message || "Có lỗi xảy ra")
        );
        fetchPrices();
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi cập nhật thứ tự");
      fetchPrices();
    }
  };

  const formatPrice = (min?: number, max?: number) => {
    const formatValue = (value: number | undefined) => {
      if (value === undefined || value === null) return "Không giới hạn";
      if (value === -1) return "Không giới hạn";
      if (value >= 1000000000) return `${value / 1000000000} tỷ`;
      if (value >= 1000000) return `${value / 1000000} triệu`;
      if (value >= 1000) return `${value / 1000}k`;
      return value.toString();
    };

    if (min === undefined || min === null) return "Không giới hạn";
    if (max === -1) return `Từ ${formatValue(min)}`;
    if (min === 0 && max) return `Dưới ${formatValue(max)}`;
    if (min && max) return `${formatValue(min)} - ${formatValue(max)}`;
    return formatValue(min);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý khoảng giá
                </h1>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Thêm khoảng giá
                </button>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(
                        e.target.value as "all" | "ban" | "cho-thue" | "project"
                      );
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="ban">Bán</option>
                    <option value="cho-thue">Cho thuê</option>
                    <option value="project">Dự án</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <DraggablePriceTable
                    prices={prices}
                    onEdit={handleEditPrice}
                    onDelete={handleDeletePrice}
                    onToggleStatus={handleToggleStatus}
                    onReorder={handleReorder}
                    formatPrice={formatPrice}
                  />

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Trước
                      </button>
                      <span className="px-3 py-1">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingPrice ? "Sửa khoảng giá" : "Thêm khoảng giá mới"}
            </h2>
            <form
              onSubmit={editingPrice ? handleUpdatePrice : handleCreatePrice}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "ban" | "cho-thue" | "project",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ban">Bán</option>
                    <option value="cho-thue">Cho thuê</option>
                    <option value="project">Dự án</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị tối thiểu
                  </label>
                  <input
                    type="number"
                    value={formData.minValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minValue: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị tối đa (-1 = không giới hạn)
                  </label>
                  <input
                    type="number"
                    value={formData.maxValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxValue: parseInt(e.target.value) || -1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPrice ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap component with AdminGuard
export default function ProtectedPricesManagement() {
  return (
    <AdminGuard permissions={[PERMISSIONS.LOCATION.MANAGE_PRICES]}>
      <PricesManagementInternalContent />
    </AdminGuard>
  );
}
