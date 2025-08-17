"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import PostsTable from "@/components/admin/PostsTable";
import PostsFilter from "@/components/admin/PostsFilter";
import PostsStats from "@/components/admin/PostsStats";
import { Pagination } from "@/components/common/Pagination";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";
import {
  adminPostsService,
  Post,
  PostFilters,
  PostsStats as StatsType,
} from "@/services/postsService";
import { toast } from "sonner";

function AdminPostsPageInternal() {
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    expired: 0,
    deleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<PostFilters>({
    status: searchParams?.get("status") || "all",
    type: "all",
    category: "all",
    package: "all",
    search: "",
    project: "all",
    dateFrom: "",
    dateTo: "",
    searchMode: "property", // Add default search mode
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminPostsService.getPosts(filters, currentPage, 10);
      setPosts(result.posts);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Có lỗi xảy ra khi tải bài viết");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const fetchStats = async () => {
    try {
      const statsData = await adminPostsService.getPostsStats();
      setStats(statsData);
    } catch {
      toast.error("Có lỗi xảy ra khi tải thống kê bài viết");
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
      toast.success("Đã duyệt tin đăng thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi duyệt tin đăng!");
    }
  };

  const handleRejectPost = async (postId: string, reason: string) => {
    try {
      await adminPostsService.rejectPost(postId, reason);
      fetchPosts();
      fetchStats();
      toast.success("Đã từ chối tin đăng!");
    } catch {
      toast.error("Có lỗi xảy ra khi từ chối tin đăng!");
    }
  };

  const handleDeletePost = async (postId: string, currentStatus?: string) => {
    // Check if the post is already in deleted status
    const isDeleted = currentStatus === "deleted";

    if (isDeleted) {
      // Hard delete for posts already in trash
      if (
        confirm(
          "Bạn có chắc chắn muốn xóa vĩnh viễn tin đăng này? Hành động này không thể hoàn tác!"
        )
      ) {
        try {
          await adminPostsService.deletePost(postId);
          fetchPosts();
          fetchStats();
          toast.success("Đã xóa vĩnh viễn tin đăng!");
        } catch {
          toast.error("Có lỗi xảy ra khi xóa vĩnh viễn tin đăng!");
        }
      }
    } else {
      // Soft delete for normal posts
      if (confirm("Bạn có chắc chắn muốn chuyển tin đăng này vào thùng rác?")) {
        try {
          // Use updatePostStatus to change status to "deleted" instead of hard delete
          await adminPostsService.updatePostStatus(postId, "deleted");
          fetchPosts();
          fetchStats();
          toast.success("Đã chuyển tin đăng vào thùng rác!");
        } catch {
          toast.error("Có lỗi xảy ra khi chuyển tin đăng vào thùng rác!");
        }
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

// Wrap component with AdminGuard
export default function ProtectedAdminPosts() {
  return (
    <AdminGuard permissions={[PERMISSIONS.POST.VIEW]}>
      <Suspense fallback={<div>Đang tải...</div>}>
        <AdminPostsPageInternal />
      </Suspense>
    </AdminGuard>
  );
}
