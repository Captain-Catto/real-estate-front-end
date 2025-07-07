"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import PostsTable from "@/components/admin/PostsTable";
import PostsFilter from "@/components/admin/PostsFilter";
import PostsStats from "@/components/admin/PostsStats";
import { Pagination } from "@/components/common/Pagination";
import {
  adminPostsService,
  Post,
  PostFilters,
  PostsStats as StatsType,
} from "@/services/postsService";

export default function AdminPostsPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    expired: 0,
    vip: 0,
    premium: 0,
    normal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<PostFilters>({
    status: searchParams?.get("status") || "all",
    type: "all",
    category: "all",
    priority: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminPostsService.getPosts(filters, currentPage, 10);
      setPosts(result.posts);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const fetchStats = async () => {
    try {
      const statsData = await adminPostsService.getPostsStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [fetchPosts]);

  const handleFilterChange = (newFilters: Partial<PostFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await adminPostsService.approvePost(postId);
      fetchPosts();
      fetchStats();
      alert("Đã duyệt tin đăng thành công!");
    } catch (err) {
      console.error("Error approving post:", err);
      alert("Có lỗi xảy ra khi duyệt tin đăng!");
    }
  };

  const handleRejectPost = async (postId: string, reason: string) => {
    try {
      await adminPostsService.rejectPost(postId, reason);
      fetchPosts();
      fetchStats();
      alert("Đã từ chối tin đăng!");
    } catch (err) {
      console.error("Error rejecting post:", err);
      alert("Có lỗi xảy ra khi từ chối tin đăng!");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) {
      try {
        await adminPostsService.deletePost(postId);
        fetchPosts();
        fetchStats();
        alert("Đã xóa tin đăng thành công!");
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Có lỗi xảy ra khi xóa tin đăng!");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1">
        <AdminHeader />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý tin đăng
            </h1>
            <p className="text-gray-600">
              Quản lý tất cả tin đăng bất động sản
            </p>
          </div>

          {/* Stats */}
          <PostsStats stats={stats} onFilterChange={handleFilterChange} />

          {/* Filters */}
          <PostsFilter filters={filters} onFilterChange={handleFilterChange} />

          {/* Posts Table */}
          <PostsTable
            posts={posts}
            loading={loading}
            onApprove={handleApprovePost}
            onReject={handleRejectPost}
            onDelete={handleDeletePost}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
