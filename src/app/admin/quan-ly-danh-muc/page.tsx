"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminGuard from "@/components/auth/AdminGuard";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import {
  Category,
  categoryService,
  CreateCategoryData,
  UpdateCategoryData,
} from "@/services/categoryService";
import {
  NewsCategory,
  newsCategoryService,
} from "@/services/newsCategoryService";
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

interface NewsCategoryFormData {
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}

type ModalType = "create" | "edit" | "create-news" | "edit-news" | null;
type CategoryTab = "property" | "news";

function AdminCategoryPageInternal() {
  // Tab state
  const [activeTab, setActiveTab] = useState<CategoryTab>("property");

  // State management for property categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"property" | "project">(
    "property"
  );

  // State management for news categories
  const [newsCategories, setNewsCategories] = useState<NewsCategory[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingNewsCategory, setEditingNewsCategory] =
    useState<NewsCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    isProject: false,
    order: 0,
    isActive: true,
    description: "",
  });
  const [newsCategoryFormData, setNewsCategoryFormData] =
    useState<NewsCategoryFormData>({
      name: "",
      slug: "",
      description: "",
      order: 0,
      isActive: true,
    });

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "property") {
      fetchCategories();
    } else if (activeTab === "news") {
      fetchNewsCategories();
    }
  }, [activeTab]);

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

  const fetchNewsCategories = async () => {
    try {
      setLoading(true);
      const result = await newsCategoryService.getAdminNewsCategories();
      if (result.success && result.data) {
        // Sort by order
        const sortedCategories = result.data.sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setNewsCategories(sortedCategories);
      } else {
        console.error("Failed to fetch news categories:", result.message);
        setNewsCategories([]);
      }
    } catch (error) {
      console.error("Error fetching news categories:", error);
      setNewsCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  useEffect(() => {
    if (activeTab === "property") {
      let filtered = categories;
      if (selectedFilter === "property") {
        filtered = categories.filter((cat) => !cat.isProject);
      } else if (selectedFilter === "project") {
        filtered = categories.filter((cat) => cat.isProject);
      }

      // Sort by order
      filtered = filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
      setFilteredCategories(filtered);
    }
  }, [categories, selectedFilter, activeTab]);

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
    setEditingNewsCategory(null);
    setFormData({
      name: "",
      slug: "",
      isProject: false,
      order: 0,
      isActive: true,
      description: "",
    });
    setNewsCategoryFormData({
      name: "",
      slug: "",
      description: "",
      order: 0,
      isActive: true,
    });
  };

  // News Category Modal functions
  const openCreateNewsModal = () => {
    setModalType("create-news");
    setEditingNewsCategory(null);
    setNewsCategoryFormData({
      name: "",
      slug: "",
      description: "",
      order: newsCategories.length,
      isActive: true,
    });
  };

  const openEditNewsModal = (category: NewsCategory) => {
    setModalType("edit-news");
    setEditingNewsCategory(category);
    setNewsCategoryFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      order: category.order || 0,
      isActive: category.isActive ?? true,
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
        await fetchCategories();
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
        await fetchCategories();
      } else if (modalType === "create-news") {
        await newsCategoryService.createNewsCategory(newsCategoryFormData);
        await fetchNewsCategories();
      } else if (modalType === "edit-news" && editingNewsCategory) {
        await newsCategoryService.updateNewsCategory(
          editingNewsCategory._id || editingNewsCategory.id,
          newsCategoryFormData
        );
        await fetchNewsCategories();
      }

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

  // Handle delete news category
  const handleDeleteNewsCategory = async (category: NewsCategory) => {
    if (
      !confirm(`Bạn có chắc chắn muốn xóa danh mục tin tức "${category.name}"?`)
    ) {
      return;
    }

    try {
      const categoryId = category._id || category.id;
      await newsCategoryService.deleteNewsCategory(categoryId);
      await fetchNewsCategories();
    } catch (error) {
      console.error("Error deleting news category:", error);
      alert("Có lỗi xảy ra khi xóa danh mục tin tức");
    }
  };

  // Handle move up/down for news categories
  const handleMoveNewsCategory = async (
    category: NewsCategory,
    direction: "up" | "down"
  ) => {
    const currentIndex = newsCategories.findIndex(
      (cat) => (cat._id || cat.id) === (category._id || category.id)
    );
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === newsCategories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapCategory = newsCategories[newIndex];

    try {
      const orders = [
        {
          id: category._id || category.id,
          order: swapCategory.order || newIndex,
        },
        {
          id: swapCategory._id || swapCategory.id,
          order: category.order || currentIndex,
        },
      ];

      await newsCategoryService.updateNewsCategoriesOrder(orders);
      await fetchNewsCategories();
    } catch (error) {
      console.error("Error updating news category order:", error);
      alert("Có lỗi xảy ra khi thay đổi thứ tự danh mục tin tức");
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

  // Handle toggle active status for news categories
  const handleToggleNewsActive = async (category: NewsCategory) => {
    const categoryId = category._id || category.id;
    const newActiveStatus = !category.isActive;

    // Optimistic update - cập nhật UI ngay lập tức
    setNewsCategories((prevCategories) =>
      prevCategories.map((cat) =>
        (cat._id || cat.id) === categoryId
          ? { ...cat, isActive: newActiveStatus }
          : cat
      )
    );

    try {
      const result = await newsCategoryService.toggleNewsActive(
        categoryId,
        newActiveStatus
      );

      if (!result.success) {
        // Nếu thất bại, revert lại trạng thái cũ
        setNewsCategories((prevCategories) =>
          prevCategories.map((cat) =>
            (cat._id || cat.id) === categoryId
              ? { ...cat, isActive: category.isActive }
              : cat
          )
        );
        console.error("Failed to toggle news category status:", result.message);
        alert("Có lỗi xảy ra khi thay đổi trạng thái danh mục tin tức");
      }
    } catch (error) {
      // Nếu có lỗi, revert lại trạng thái cũ
      setNewsCategories((prevCategories) =>
        prevCategories.map((cat) =>
          (cat._id || cat.id) === categoryId
            ? { ...cat, isActive: category.isActive }
            : cat
        )
      );
      console.error("Error toggling news category status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái danh mục tin tức");
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (category: Category) => {
    const newActiveStatus = !category.isActive;

    // Optimistic update - cập nhật UI ngay lập tức
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat._id === category._id ? { ...cat, isActive: newActiveStatus } : cat
      )
    );

    try {
      await categoryService.admin.update(category._id, {
        isActive: newActiveStatus,
      });
    } catch (error) {
      // Nếu có lỗi, revert lại trạng thái cũ
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === category._id
            ? { ...cat, isActive: category.isActive }
            : cat
        )
      );
      console.error("Error toggling category status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái");
    }
  };

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
              Quản lý danh mục cho bất động sản, dự án và tin tức
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("property")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === "property"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Danh mục BĐS
                </button>
                <button
                  onClick={() => setActiveTab("news")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === "news"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Danh mục tin tức
                </button>
              </nav>
            </div>
          </div>

          {/* Property Categories Tab */}
          {activeTab === "property" && (
            <div className="animate-fade-in">
              {/* Controls */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    {/* Filter buttons */}
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

                  <PermissionGuard
                    permission={PERMISSIONS.SETTINGS.MANAGE_CATEGORIES}
                  >
                    <button
                      onClick={openCreateModal}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Thêm danh mục</span>
                    </button>
                  </PermissionGuard>
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
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-500">
                              Đang tải danh mục...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category, index) => (
                        <tr key={category._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="w-8 text-center">
                                {category.order ?? index}
                              </span>
                              <div className="flex flex-col space-y-1">
                                <PermissionGuard
                                  permission={
                                    PERMISSIONS.SETTINGS.MANAGE_CATEGORIES
                                  }
                                >
                                  <button
                                    onClick={() =>
                                      handleMoveCategory(category, "up")
                                    }
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  >
                                    <ChevronUpIcon className="w-4 h-4" />
                                  </button>
                                </PermissionGuard>
                                <PermissionGuard
                                  permission={
                                    PERMISSIONS.SETTINGS.MANAGE_CATEGORIES
                                  }
                                >
                                  <button
                                    onClick={() =>
                                      handleMoveCategory(category, "down")
                                    }
                                    disabled={
                                      index === filteredCategories.length - 1
                                    }
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  >
                                    <ChevronDownIcon className="w-4 h-4" />
                                  </button>
                                </PermissionGuard>
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
                            <PermissionGuard
                              permission={
                                PERMISSIONS.SETTINGS.MANAGE_CATEGORIES
                              }
                            >
                              <button
                                onClick={() => handleToggleActive(category)}
                                className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
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
                            </PermissionGuard>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <PermissionGuard
                                permission={
                                  PERMISSIONS.SETTINGS.MANAGE_CATEGORIES
                                }
                              >
                                <button
                                  onClick={() => openEditModal(category)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              </PermissionGuard>
                              <PermissionGuard
                                permission={
                                  PERMISSIONS.SETTINGS.MANAGE_CATEGORIES
                                }
                              >
                                <button
                                  onClick={() => handleDelete(category)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {!loading && filteredCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không có danh mục nào
                  </div>
                )}
              </div>
            </div>
          )}

          {/* News Categories Tab */}
          {activeTab === "news" && (
            <div className="animate-fade-in">
              {/* Controls */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Danh mục tin tức
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Quản lý danh mục cho các bài viết tin tức
                    </p>
                  </div>

                  <PermissionGuard
                    permission={PERMISSIONS.NEWS.MANAGE_CATEGORIES}
                  >
                    <button
                      onClick={openCreateNewsModal}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Thêm danh mục tin tức</span>
                    </button>
                  </PermissionGuard>
                </div>
              </div>

              {/* News Categories Table */}
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
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-500">
                              Đang tải danh mục tin tức...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      newsCategories.map((category, index) => (
                        <tr
                          key={category._id || category.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="w-8 text-center">
                                {category.order || 0}
                              </span>
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() =>
                                    handleMoveNewsCategory(category, "up")
                                  }
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                  <ChevronUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleMoveNewsCategory(category, "down")
                                  }
                                  disabled={index === newsCategories.length - 1}
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
                            <PermissionGuard
                              permission={PERMISSIONS.NEWS.MANAGE_CATEGORIES}
                            >
                              <button
                                onClick={() => handleToggleNewsActive(category)}
                                className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
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
                            </PermissionGuard>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <PermissionGuard
                                permission={PERMISSIONS.NEWS.MANAGE_CATEGORIES}
                              >
                                <button
                                  onClick={() => openEditNewsModal(category)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Chỉnh sửa"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              </PermissionGuard>
                              <PermissionGuard
                                permission={PERMISSIONS.NEWS.MANAGE_CATEGORIES}
                              >
                                <button
                                  onClick={() =>
                                    handleDeleteNewsCategory(category)
                                  }
                                  className="text-red-600 hover:text-red-900"
                                  title="Xóa"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {!loading && newsCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không có danh mục tin tức nào
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal */}
          {modalType && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {modalType === "create" && "Thêm danh mục mới"}
                    {modalType === "edit" && "Chỉnh sửa danh mục"}
                    {modalType === "create-news" && "Thêm danh mục tin tức mới"}
                    {modalType === "edit-news" && "Chỉnh sửa danh mục tin tức"}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {(modalType === "create" || modalType === "edit") && (
                      <>
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
                      </>
                    )}

                    {(modalType === "create-news" ||
                      modalType === "edit-news") && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên danh mục tin tức
                          </label>
                          <input
                            type="text"
                            value={newsCategoryFormData.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              setNewsCategoryFormData((prev) => ({
                                ...prev,
                                name,
                                slug: newsCategoryService.generateSlug(name),
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
                            value={newsCategoryFormData.slug}
                            onChange={(e) =>
                              setNewsCategoryFormData((prev) => ({
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
                            value={newsCategoryFormData.description}
                            onChange={(e) =>
                              setNewsCategoryFormData((prev) => ({
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
                            value={newsCategoryFormData.order}
                            onChange={(e) =>
                              setNewsCategoryFormData((prev) => ({
                                ...prev,
                                order: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newsCategoryFormData.isActive}
                              onChange={(e) =>
                                setNewsCategoryFormData((prev) => ({
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
                      </>
                    )}

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

// Wrap component with AdminGuard
export default function ProtectedAdminCategoryPage() {
  return (
    <AdminGuard
      permissions={[
        PERMISSIONS.SETTINGS.MANAGE_CATEGORIES,
        PERMISSIONS.NEWS.MANAGE_CATEGORIES,
      ]}
    >
      <AdminCategoryPageInternal />
    </AdminGuard>
  );
}
