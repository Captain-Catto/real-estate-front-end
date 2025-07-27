"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { newsService, NewsCategory } from "@/services/newsService";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Pagination } from "@/components/common/Pagination";

interface NewsItem {
  _id: string;
  title: string;
  category: "mua-ban" | "cho-thue" | "tai-chinh" | "phong-thuy" | "tong-hop";
  status: "draft" | "pending" | "published" | "rejected";
  author: { _id: string; username: string; email: string };
  views: number;
  isHot: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
const statusLabels = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  published: "Đã xuất bản",
  rejected: "Bị từ chối",
};
const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
export default function NewsManagementPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setAccessChecked(true);
    }
  }, [isAuthenticated]);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await newsService.getNewsCategories();
      console.log("Fetched categories:", response);
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Create category labels object from API data
  const categoryLabels = categories.reduce((acc, category) => {
    acc[category.slug] = category.name;
    return acc;
  }, {} as Record<string, string>);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const params: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        status?: string;
      } = { page: currentPage, limit: itemsPerPage };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      const response = await newsService.getAllNews(params);
      console.log("Fetched news:", response);
      if (response.success) {
        setNews(response.data.news);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, itemsPerPage]);

  useEffect(() => {
    if (isAuthenticated && accessChecked) {
      fetchNews();
      fetchCategories();
    }
  }, [isAuthenticated, accessChecked, fetchNews, fetchCategories]);
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin tức "${title}"?`)) return;
    try {
      const response = await newsService.deleteNews(id);
      if (response.success) {
        alert("Đã xóa tin tức thành công!");
        fetchNews();
      } else {
        alert(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Có lỗi xảy ra khi xóa tin tức");
    }
  };
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!["pending", "published", "rejected"].includes(newStatus)) return;

    try {
      const response = await newsService.updateNews(id, {
        status: newStatus as "pending" | "published" | "rejected",
      });
      if (response.success) {
        alert("Đã cập nhật trạng thái thành công!");
        fetchNews();
      } else {
        alert(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  if (!accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa đăng nhập
          </h2>
          <p className="text-gray-600 mb-4">
            Vui lòng đăng nhập để truy cập trang quản lý tin tức.
          </p>
          <button
            onClick={() => router.push("/dang-nhap")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 animate-fade-in">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý tin tức
                </h1>
                <button
                  onClick={() => router.push("/admin/quan-ly-tin-tuc/tao-moi")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" /> Tạo tin tức mới
                </button>
              </div>
            </div>
            {/* Filters */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tin tức..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={categoriesLoading}
                >
                  <option value="">Tất cả danh mục</option>
                  {categoriesLoading ? (
                    <option disabled>Đang tải...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {/* Page Info & Items Per Page */}
                <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700">
                  <div className="w-full flex items-center gap-2">
                    <span>Hiển thị</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <span>tin / trang</span>
                  </div>
                </div>
              </div>
            </div>
            {/* News Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải tin tức...</p>
                </div>
              ) : news.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">Không có tin tức nào</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Bắt đầu bằng cách tạo tin tức mới
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiêu đề
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Danh mục
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tác giả
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lượt xem
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {news.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.isHot && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      Tin nóng
                                    </span>
                                  )}
                                  {item.isFeatured && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      Nổi bật
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {categoryLabels[item.category] || item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusColors[item.status]
                              }`}
                            >
                              {statusLabels[item.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.author?.username ? (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/quan-ly-nguoi-dung/${item.author._id}`
                                  )
                                }
                                className="text-blue-600 hover:text-blue-900 hover:underline"
                                title="Xem chi tiết tác giả"
                              >
                                {item.author.username}
                              </button>
                            ) : (
                              "Không có tác giả"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.views.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  window.open(`/tin-tuc/${item._id}`, "_blank")
                                }
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Xem tin tức"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/quan-ly-tin-tuc/${item._id}`
                                  )
                                }
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              {user?.role === "admin" && (
                                <button
                                  onClick={() =>
                                    handleDelete(item._id, item.title)
                                  }
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Xóa"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              )}
                              {user?.role === "admin" &&
                                item.status === "pending" && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          item._id,
                                          "published"
                                        )
                                      }
                                      className="text-green-600 hover:text-green-800 transition-colors"
                                      title="Duyệt"
                                    >
                                      <CheckIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(item._id, "rejected")
                                      }
                                      className="text-red-600 hover:text-red-800 transition-colors"
                                      title="Từ chối"
                                    >
                                      <XMarkIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    showPages={7}
                    className="justify-center"
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
