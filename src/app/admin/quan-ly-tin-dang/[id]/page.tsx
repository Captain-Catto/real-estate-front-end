// src/app/admin/quan-ly-tin-dang/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminPostDetail from "@/components/admin/AdminPostDetail";
import { adminPostsService, Post } from "@/services/postsService";

export default function AdminPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("AdminPostDetailPage params:", params);
  console.log("AdminPostDetailPage post:", post);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (postId: string) => {
    setLoading(true);
    try {
      const postData = await adminPostsService.getPostById(postId);
      if (postData) {
        setPost(postData);
      } else {
        setError("Không tìm thấy bài viết");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await adminPostsService.approvePost(postId);
      await fetchPost(postId);
      alert("Đã duyệt tin đăng thành công!");
    } catch (err) {
      console.error("Error approving post:", err);
      alert("Có lỗi xảy ra khi duyệt tin đăng!");
    }
  };

  const handleRejectPost = async (postId: string, reason: string) => {
    try {
      if (!postId || postId.trim() === "") {
        throw new Error("ID tin đăng không hợp lệ");
      }

      await adminPostsService.rejectPost(postId, reason);
      await fetchPost(postId);
      alert("Đã từ chối tin đăng!");
    } catch (err) {
      console.error("Error rejecting post:", err);
      alert(
        "Có lỗi xảy ra khi từ chối tin đăng: " +
          (err instanceof Error ? err.message : "Lỗi không xác định")
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || "Không tìm thấy bài viết"}
              </h2>
              <button
                onClick={() => router.push("/admin/quan-ly-tin-dang")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <AdminPostDetail
            post={post}
            onApprove={handleApprovePost}
            onReject={handleRejectPost}
            onBack={() => router.push("/admin/quan-ly-tin-dang")}
          />
        </main>
      </div>
    </div>
  );
}
