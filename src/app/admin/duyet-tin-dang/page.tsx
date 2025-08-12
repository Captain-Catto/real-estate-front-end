"use client";
import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import PostsTable from "@/components/admin/PostsTable";
import { Pagination } from "@/components/common/Pagination";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";
import {
  adminPostsService,
  Post,
  PostFilters,
  PostsStats as StatsType,
} from "@/services/postsService";

function PostApprovalPageInternal() {
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

  // Filter only pending posts for approval
  const filters: PostFilters = {
    status: "pending",
    type: "all",
    category: "all",
    package: "all",
    search: "",
    project: "all",
    dateFrom: "",
    dateTo: "",
    searchMode: "property",
  };

  const fetchPendingPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminPostsService.getPosts(filters, currentPage, 10);
      // Sort by updatedAt desc to show recently updated posts first
      const sortedPosts = result.posts.sort((a: Post, b: Post) => {
        const aUpdated = new Date(a.updatedAt || a.createdAt);
        const bUpdated = new Date(b.updatedAt || b.createdAt);
        return bUpdated.getTime() - aUpdated.getTime();
      });
      setPosts(sortedPosts);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Error fetching pending posts:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchStats = async () => {
    try {
      const statsData = await adminPostsService.getPostsStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
    fetchStats();
  }, [fetchPendingPosts]);

  const handleApprovePost = async (postId: string) => {
    try {
      await adminPostsService.approvePost(postId);
      fetchPendingPosts();
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
      fetchPendingPosts();
      fetchStats();
      alert("Đã từ chối tin đăng!");
    } catch (err) {
      console.error("Error rejecting post:", err);
      alert("Có lỗi xảy ra khi từ chối tin đăng!");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Bạn có chắc chắn muốn chuyển tin đăng này vào thùng rác?")) {
      try {
        await adminPostsService.updatePostStatus(postId, "deleted");
        fetchPendingPosts();
        fetchStats();
        alert("Đã chuyển tin đăng vào thùng rác!");
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Có lỗi xảy ra khi chuyển tin đăng vào thùng rác!");
      }
    }
  };

  // Quick approve all visible posts
  const handleBulkApprove = async () => {
    if (posts.length === 0) return;

    const confirmMessage = `Bạn có chắc chắn muốn duyệt tất cả ${posts.length} tin đăng hiện tại?`;
    if (!confirm(confirmMessage)) return;

    try {
      for (const post of posts) {
        await adminPostsService.approvePost(post._id);
      }
      fetchPendingPosts();
      fetchStats();
      alert(`Đã duyệt thành công ${posts.length} tin đăng!`);
    } catch (err) {
      console.error("Error bulk approving posts:", err);
      alert("Có lỗi xảy ra khi duyệt hàng loạt!");
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Duyệt tin đăng
                </h1>
                <p className="text-gray-600">
                  Duyệt tin đăng chờ phê duyệt ({stats.pending} tin)
                </p>
              </div>

              {/* Bulk Actions */}
              {posts.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkApprove}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Duyệt tất cả ({posts.length})
                  </button>
                  <button
                    onClick={fetchPendingPosts}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Làm mới
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600">Chờ duyệt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-600">Đang hiển thị</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
                <div className="text-sm text-gray-600">Bị từ chối</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Tổng tin đăng</div>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-500 text-lg">
                🎉 Không có tin đăng nào cần duyệt!
              </div>
              <p className="text-gray-400 mt-2">
                Tất cả tin đăng đã được xử lý.
              </p>
            </div>
          ) : (
            <PostsTable
              posts={posts}
              loading={loading}
              onApprove={handleApprovePost}
              onReject={handleRejectPost}
              onDelete={handleDeletePost}
            />
          )}

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
export default function ProtectedPostApproval() {
  return (
    <AdminGuard permissions={[PERMISSIONS.POST.APPROVE]}>
      <PostApprovalPageInternal />
    </AdminGuard>
  );
}
