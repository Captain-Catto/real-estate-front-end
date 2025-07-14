"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Category,
  categoryService,
  CreateCategoryData,
  UpdateCategoryData,
} from "@/services/categoryService";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface CategoryFormData {
  name: string;
  slug: string;
  isProject: boolean;
  order: number;
  isActive: boolean;
  description: string;
}

type ModalType = "create" | "edit" | null;

export default function AdminCategoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "property" | "project"
  >("all");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    isProject: false,
    order: 0,
    isActive: true,
    description: "",
  });

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dang-nhap");
    }
  }, [user, authLoading, router]);

  // Fetch categories
  useEffect(() => {
    if (user?.role === "admin") {
      fetchCategories();
    }
  }, [user]);

  // Filter categories
  useEffect(() => {
    let filtered = categories;
    if (selectedFilter === "property") {
      filtered = categories.filter((cat) => !cat.isProject);
    } else if (selectedFilter === "project") {
      filtered = categories.filter((cat) => cat.isProject);
    }

    // Sort by order
    filtered = filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    setFilteredCategories(filtered);
  }, [categories, selectedFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryService.admin.getAll();
      if (result.data?.categories) {
        setCategories(result.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const openCreateModal = () => {
    setModalType("create");
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      isProject: false,
      order: categories.length,
      isActive: true,
      description: "",
    });
  };

  const openEditModal = (category: Category) => {
    setModalType("edit");
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      isProject: category.isProject,
      order: category.order || 0,
      isActive: category.isActive ?? true,
      description: category.description || "",
    });
  };

  const closeModal = () => {
    setModalType(null);
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      isProject: false,
      order: 0,
      isActive: true,
      description: "",
    });
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (modalType === "create") {
        const data: CreateCategoryData = {
          name: formData.name,
          slug: formData.slug,
          isProject: formData.isProject,
          order: formData.order,
          isActive: formData.isActive,
          description: formData.description,
        };
        await categoryService.admin.create(data);
      } else if (modalType === "edit" && editingCategory) {
        const data: UpdateCategoryData = {
          name: formData.name,
          slug: formData.slug,
          isProject: formData.isProject,
          order: formData.order,
          isActive: formData.isActive,
          description: formData.description,
        };
        await categoryService.admin.update(editingCategory._id, data);
      }

      await fetchCategories();
      closeModal();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Có lỗi xảy ra khi lưu danh mục");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      await categoryService.admin.delete(category._id);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Có lỗi xảy ra khi xóa danh mục");
    }
  };

  // Handle move up/down
  const handleMoveCategory = async (
    category: Category,
    direction: "up" | "down"
  ) => {
    const currentIndex = filteredCategories.findIndex(
      (cat) => cat._id === category._id
    );
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === filteredCategories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapCategory = filteredCategories[newIndex];

    try {
      const orders = [
        { id: category._id, order: swapCategory.order || newIndex },
        { id: swapCategory._id, order: category.order || currentIndex },
      ];

      await categoryService.admin.updateOrder(orders);
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category order:", error);
      alert("Có lỗi xảy ra khi thay đổi thứ tự");
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (category: Category) => {
    try {
      await categoryService.admin.update(category._id, {
        isActive: !category.isActive,
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling category status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý danh mục
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý danh mục cho bất động sản và dự án
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                {/* Filter buttons */}
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedFilter === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tất cả ({categories.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("property")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedFilter === "property"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Bất động sản (
                  {categories.filter((cat) => !cat.isProject).length})
                </button>
                <button
                  onClick={() => setSelectedFilter("project")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedFilter === "project"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Dự án ({categories.filter((cat) => cat.isProject).length})
                </button>
              </div>

              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Thêm danh mục</span>
              </button>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thứ tự
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
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
                {filteredCategories.map((category, index) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="w-8 text-center">
                          {category.order ?? index}
                        </span>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleMoveCategory(category, "up")}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveCategory(category, "down")}
                            disabled={index === filteredCategories.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-500">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.isProject
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {category.isProject ? "Dự án" : "Bất động sản"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                          category.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {category.isActive ? (
                          <>
                            <EyeIcon className="w-3 h-3" />
                            <span>Hiển thị</span>
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="w-3 h-3" />
                            <span>Ẩn</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCategories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không có danh mục nào
              </div>
            )}
          </div>

          {/* Modal */}
          {modalType && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {modalType === "create"
                      ? "Thêm danh mục mới"
                      : "Chỉnh sửa danh mục"}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên danh mục
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            name,
                            slug: generateSlug(name),
                          }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isProject}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isProject: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Danh mục dự án
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Hiển thị
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? "Đang lưu..." : "Lưu"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
