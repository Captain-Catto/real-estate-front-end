"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { NewsArticleDetail } from "@/components/news/NewsArticleDetail";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Mock service
const NewsService = {
  getNewsById: async (id: string) => {
    // Replace with real API
    await new Promise((r) => setTimeout(r, 300));
    if (id === "NEWS001")
      return {
        id: "NEWS001",
        title: "Thị trường bất động sản 2024: Xu hướng mới",
        content: "<p>Nội dung chi tiết bài viết...</p>",
        excerpt: "Xu hướng mới của thị trường bất động sản năm 2024...",
        author: { name: "Nguyễn Văn A", slug: "nguyenvana", avatar: "" },
        publishedAt: "2024-06-10T09:15:00Z",
        updatedAt: "2024-06-10T09:15:00Z",
        readTime: 4,
        featuredImage: "",
        tags: ["BĐS", "Xu hướng"],
        category: "thi-truong",
        relatedArticles: [],
        status: "pending",
      };
    return null;
  },
  approveNews: async (id: string) => {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },
  rejectNews: async (id: string) => {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },
  deleteNews: async (id: string) => {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  },
};

export default function AdminNewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    NewsService.getNewsById(id).then((data) => {
      setNews(data);
      setLoading(false);
    });
  }, [id]);

  const handleApprove = async () => {
    await NewsService.approveNews(id);
    alert("Đã duyệt bài viết!");
    router.refresh();
  };

  const handleReject = async () => {
    await NewsService.rejectNews(id);
    alert("Đã từ chối bài viết!");
    router.refresh();
  };

  const handleDelete = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa bài này?")) {
      await NewsService.deleteNews(id);
      alert("Đã xóa bài viết!");
      router.push("/admin/quan-ly-tin-tuc");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );

  if (!news)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h2>
            <button
              onClick={() => router.push("/admin/quan-ly-tin-tuc")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại danh sách
            </button>
          </main>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6 max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 text-blue-600 hover:underline"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Quay lại
          </button>
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                news.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : news.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {news.status === "approved"
                ? "Đã duyệt"
                : news.status === "pending"
                ? "Chờ duyệt"
                : "Đã từ chối"}
            </span>
            {news.status === "pending" && (
              <>
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Duyệt tin
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Từ chối tin
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-red-100"
            >
              <TrashIcon className="w-4 h-4" />
              Xóa
            </button>
          </div>
          <NewsArticleDetail article={news} popularArticles={[]} />
        </main>
      </div>
    </div>
  );
}
