"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { fetchWithAuth } from "@/services/authService";
import { toast } from "sonner";

interface Area {
  _id: string;
  id: string;
  name: string;
  slug: string;
  type: "property" | "project";
  minValue: number;
  maxValue: number; // -1 means unlimited
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function AreasManagementPageInternal() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedType, setSelectedType] = useState<
    "all" | "property" | "project"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "property" as "property" | "project",
    minValue: 0,
    maxValue: -1,
    order: 0,
  });

  // Fetch areas from API
  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = selectedType === "all" ? "" : `&type=${selectedType}`;
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/areas?page=${currentPage}&limit=10${typeParam}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAreas(data.data);
          setPagination(data.pagination);
        } else {
          toast.error(data.message || "Lỗi khi tải danh sách khoảng diện tích");
        }
      } else {
        toast.error("Lỗi kết nối server");
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      toast.error("Lỗi khi tải danh sách khoảng diện tích");
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedType]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingArea
        ? `http://localhost:8080/api/admin/areas/${editingArea._id}`
        : "http://localhost:8080/api/admin/areas";

      const method = editingArea ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          setShowForm(false);
          setEditingArea(null);
          resetForm();
          fetchAreas();
        } else {
          toast.error(data.message || "Có lỗi xảy ra");
        }
      } else {
        toast.error("Lỗi kết nối server");
      }
    } catch (error) {
      console.error("Error saving area:", error);
      toast.error("Lỗi khi lưu khoảng diện tích");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      type: "property",
      minValue: 0,
      maxValue: -1,
      order: 0,
    });
  };

  // Handle edit
  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      slug: area.slug,
      type: area.type,
      minValue: area.minValue,
      maxValue: area.maxValue,
      order: area.order,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (area: Area) => {
    if (
      !confirm(`Bạn có chắc chắn muốn xóa khoảng diện tích "${area.name}"?`)
    ) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/areas/${area._id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          fetchAreas();
        } else {
          toast.error(data.message || "Lỗi khi xóa");
        }
      } else {
        toast.error("Lỗi kết nối server");
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      toast.error("Lỗi khi xóa khoảng diện tích");
    }
  };

  // Toggle status
  const handleToggleStatus = async (area: Area) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/areas/${area._id}/toggle-status`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          fetchAreas();
        } else {
          toast.error(data.message || "Lỗi khi thay đổi trạng thái");
        }
      } else {
        toast.error("Lỗi kết nối server");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Lỗi khi thay đổi trạng thái");
    }
  };

  // Format area range for display
  const formatAreaRange = (area: Area) => {
    if (area.maxValue === -1) {
      return area.minValue > 0 ? `Trên ${area.minValue} m²` : "Không giới hạn";
    }
    return area.minValue > 0
      ? `${area.minValue} - ${area.maxValue} m²`
      : `Dưới ${area.maxValue} m²`;
  };

  return (
    <AdminLayout
      title="Quản lý khoảng diện tích"
      description="Quản lý các khoảng diện tích cho bất động sản và dự án"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(
                  e.target.value as "all" | "property" | "project"
                );
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="property">Bất động sản</option>
              <option value="project">Dự án</option>
            </select>
          </div>

          <button
            onClick={() => {
              setEditingArea(null);
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm khoảng diện tích
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khoảng diện tích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thứ tự
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : areas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không có khoảng diện tích nào
                    </td>
                  </tr>
                ) : (
                  areas.map((area) => (
                    <tr key={area._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {area.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {area.slug}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAreaRange(area)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            area.type === "property"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {area.type === "property" ? "Bất động sản" : "Dự án"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {area.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(area)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            area.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } transition-colors`}
                        >
                          {area.isActive ? "Kích hoạt" : "Vô hiệu"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(area)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(area)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingArea ? "Sửa khoảng diện tích" : "Thêm khoảng diện tích"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingArea(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="VD: 30 - 50 m²"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="VD: 30-50-m2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "property" | "project",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="property">Bất động sản</option>
                  <option value="project">Dự án</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diện tích tối thiểu (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.minValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diện tích tối đa (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.maxValue === -1 ? "" : formData.maxValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxValue:
                          e.target.value === ""
                            ? -1
                            : parseFloat(e.target.value) || -1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    placeholder="Để trống = không giới hạn"
                  />
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingArea(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {editingArea ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Wrap component with AdminGuard
export default function ProtectedAreasManagementPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.LOCATION.MANAGE_AREAS]}>
      <AreasManagementPageInternal />
    </AdminGuard>
  );
}
