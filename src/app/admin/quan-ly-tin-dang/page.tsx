"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole, isAuthenticated, loading: authLoading, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);

  // Debug: Log user info
  console.log("Admin page - Auth state:", {
    isAuthenticated,
    authLoading,
    user: user,
    userRole: user?.role,
    hasAdminRole: hasRole(["admin", "employee"]),
    accessChecked,
  });

  // Kiểm tra quyền truy cập - chỉ admin và employee mới được vào
  useEffect(() => {
    if (!accessChecked && user) {
      setAccessChecked(true);

      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push("/dang-nhap");
        return;
      }

      const hasAccess = hasRole(["admin", "employee"]);
      console.log("Has access:", hasAccess, "User role:", user?.role);
      if (!hasAccess) {
        // Nếu không có quyền, chuyển hướng về trang chủ
        console.log("No access, redirecting to home");
        router.push("/");
        return;
      }
    }
  }, [hasRole, isAuthenticated, router, user, accessChecked]);

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
          alert("Đã xóa vĩnh viễn tin đăng!");
        } catch (err) {
          console.error("Error permanently deleting post:", err);
          alert("Có lỗi xảy ra khi xóa vĩnh viễn tin đăng!");
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
          alert("Đã chuyển tin đăng vào thùng rác!");
        } catch (err) {
          console.error("Error soft deleting post:", err);
          alert("Có lỗi xảy ra khi chuyển tin đăng vào thùng rác!");
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Show loading while checking authentication and permissions */}
      {(!user || !accessChecked) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">
              Đang kiểm tra quyền truy cập...
            </span>
          </div>
        </div>
      )}

      {/* Only render admin interface if user has proper permissions */}
      {user &&
        accessChecked &&
        isAuthenticated &&
        hasRole(["admin", "employee"]) && (
          <>
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
                <PostsFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />

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
          </>
        )}

      {/* Show access denied message */}
      {user &&
        accessChecked &&
        isAuthenticated &&
        !hasRole(["admin", "employee"]) && (
          <div className="flex items-center justify-center min-h-screen w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Không có quyền truy cập
              </h1>
              <p className="text-gray-600 mb-4">
                Bạn không có quyền truy cập vào trang này.
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
