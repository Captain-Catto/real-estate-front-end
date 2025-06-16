"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Mock data service
const NewsService = {
  getNewsList: async (filters = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      {
        id: "NEWS001",
        title: "Thị trường bất động sản 2024: Xu hướng mới",
        author: "Nguyễn Văn A",
        authorEmail: "nguyenvana@gmail.com",
        status: "pending",
        createdAt: "2024-06-10T09:15:00Z",
      },
      {
        id: "NEWS002",
        title: "Chính sách vay mua nhà mới nhất",
        author: "Trần Thị B",
        authorEmail: "tranthib@gmail.com",
        status: "approved",
        createdAt: "2024-06-09T14:20:00Z",
      },
      {
        id: "NEWS003",
        title: "Cảnh báo lừa đảo khi mua đất nền",
        author: "Lê Văn C",
        authorEmail: "levanc@gmail.com",
        status: "rejected",
        createdAt: "2024-06-08T11:00:00Z",
      },
    ];
  },
  approveNews: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },
  rejectNews: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },
  deleteNews: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },
};

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetchNews();
  }, [search, status]);

  const fetchNews = async () => {
    setLoading(true);
    const data = await NewsService.getNewsList();
    let filtered = data;
    if (search) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.author.toLowerCase().includes(search.toLowerCase()) ||
          n.authorEmail.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status !== "all") {
      filtered = filtered.filter((n) => n.status === status);
    }
    setNewsList(filtered);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await NewsService.approveNews(id);
    fetchNews();
  };

  const handleReject = async (id: string) => {
    await NewsService.rejectNews(id);
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài này?")) {
      await NewsService.deleteNews(id);
      fetchNews();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("vi-VN", { hour12: false });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý tin tức
            </h1>
            <p className="text-gray-600">
              Kiểm tra, duyệt và quản lý các bài đăng tin tức của người dùng
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, tác giả, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="min-w-[180px]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : newsList.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tiêu đề
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tác giả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newsList.map((news) => (
                      <tr key={news.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{news.title}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{news.author}</div>
                          <div className="text-xs text-gray-500">
                            {news.authorEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                              news.status
                            )}`}
                          >
                            {getStatusText(news.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(news.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title="Xem chi tiết"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {news.status === "pending" && (
                              <>
                                <button
                                  className="p-1 text-green-600 hover:text-green-900"
                                  title="Duyệt bài"
                                  onClick={() => handleApprove(news.id)}
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 text-red-600 hover:text-red-900"
                                  title="Từ chối"
                                  onClick={() => handleReject(news.id)}
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              className="p-1 text-gray-500 hover:text-red-700"
                              title="Xóa"
                              onClick={() => handleDelete(news.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Không có bài tin tức nào
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Không tìm thấy bài phù hợp với bộ lọc.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
