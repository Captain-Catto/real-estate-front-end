"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import DraggableAreaTable from "@/components/admin/DraggableAreaTable";
import { fetchWithAuth } from "@/services/authService";

interface Area {
  _id: string;
  id: string;
  name: string;
  slug: string;
  type: "property" | "project";
  minValue: number;
  maxValue: number;
  order: number;
  isActive: boolean;
}

export default function AreasManagement() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "property" | "project">(
    "all"
  );

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "property" as "property" | "project",
    minValue: 0,
    maxValue: -1,
    order: 0,
  });

  const fetchAreas = useCallback(async () => {
    try {
      // Chỉ set loading khi load lần đầu hoặc thay đổi filter/page
      if (areas.length === 0) {
        setLoading(true);
      }
      const typeParam = filterType !== "all" ? `&type=${filterType}` : "";
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/areas?page=${currentPage}&limit=10${typeParam}`
      );

      const data = await response.json();
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }
      if (data.success) {
        setAreas(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        alert(data.message || "Lỗi khi tải dữ liệu");
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, areas.length]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingArea
        ? `http://localhost:8080/api/admin/areas/${editingArea._id}`
        : "http://localhost:8080/api/admin/areas";

      const method = editingArea ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/dang-nhap";
        return;
      }
      if (data.success) {
        fetchAreas();
        resetForm();
        alert(editingArea ? "Cập nhật thành công!" : "Tạo mới thành công!");
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving area:", error);
      alert("Có lỗi xảy ra");
    }
  };

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

  const handleDelete = async (area: Area) => {
    if (!confirm(`Bạn có chắc muốn xóa "${area.name}"?`)) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/areas/${area._id}`,
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
        fetchAreas();
        alert("Xóa thành công!");
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const toggleStatus = async (area: Area) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/areas/${area._id}/toggle-status`,
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
        fetchAreas();
        alert(`${area.isActive ? "Đã ẩn" : "Đã kích hoạt"} diện tích`);
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleReorder = async (newOrder: Area[]) => {
    // Cập nhật UI ngay lập tức
    setAreas(newOrder);

    try {
      // Chuẩn bị data với order mới
      const orderData = newOrder.map((area, index) => ({
        id: area._id,
        order: index + 1,
      }));

      const response = await fetchWithAuth(
        "http://localhost:8080/api/admin/areas/order",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ areas: orderData }),
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
        fetchAreas();
      } else {
        // Nếu có lỗi, load lại data từ server
        fetchAreas();
        alert(data.message || "Có lỗi xảy ra khi cập nhật thứ tự");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      // Nếu có lỗi, load lại data từ server
      fetchAreas();
      alert("Có lỗi xảy ra khi cập nhật thứ tự");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      type: "property",
      minValue: 0,
      maxValue: -1,
      order: 0,
    });
    setEditingArea(null);
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

  const formatArea = (min: number, max: number) => {
    const minText = `${min}m²`;
    if (max === -1) {
      return `${minText} - ∞`;
    }
    return `${minText} - ${max}m²`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Diện tích
              </h1>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                ➕ Thêm diện tích
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as "all" | "property" | "project"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="property">Bất động sản</option>
                  <option value="project">Dự án</option>
                </select>
              </div>
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {editingArea ? "Sửa diện tích" : "Thêm diện tích mới"}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên diện tích
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
                        Loại
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            type: e.target.value as "property" | "project",
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            setFormData((prev) => ({
                              ...prev,
                              minValue: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Diện tích tối đa (m²)
                        </label>
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
                        💾 {editingArea ? "Cập nhật" : "Tạo mới"}
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

            {/* Areas Table */}
            <DraggableAreaTable
              areas={areas}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={toggleStatus}
              onReorder={handleReorder}
              formatArea={formatArea}
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
