"use client";
import { useState, useEffect } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeHeader from "@/components/employee/EmployeeHeader";
// Import các component khác từ admin
import PostsStats from "@/components/admin/PostsStats";
import PostsFilters from "@/components/admin/PostsFilters";
import PostsList from "@/components/admin/PostsList";
import AdminPostDetail from "@/components/admin/AdminPostDetail";

// Sử dụng cùng PostsService từ admin
import { PostsService } from "@/app/admin/quan-ly-tin-dang/page";

export default function EmployeePostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  });
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await PostsService.getPosts(filters);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await PostsService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await PostsService.approvePost(postId);
      fetchPosts();
      fetchStats();
      alert("Đã duyệt tin đăng thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi duyệt tin đăng!");
    }
  };

  const handleRejectPost = async (postId: string, reason: string) => {
    try {
      await PostsService.rejectPost(postId, reason);
      fetchPosts();
      fetchStats();
      alert("Đã từ chối tin đăng!");
    } catch (error) {
      alert("Có lỗi xảy ra khi từ chối tin đăng!");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) {
      try {
        await PostsService.deletePost(postId);
        fetchPosts();
        fetchStats();
        alert("Đã xóa tin đăng thành công!");
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa tin đăng!");
      }
    }
  };

  const handleViewPost = (post: any) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeHeader />
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý tin đăng
            </h1>
            <p className="text-gray-600">
              Duyệt và quản lý tin đăng bất động sản
            </p>
          </div>

          {/* Stats */}
          <PostsStats stats={stats} onFilterChange={handleFilterChange} />

          {/* Filters */}
          <PostsFilters filters={filters} onFilterChange={handleFilterChange} />

          {/* Posts List */}
          <PostsList
            posts={posts}
            loading={loading}
            onView={handleViewPost}
            onApprove={handleApprovePost}
            onReject={handleRejectPost}
            onDelete={handleDeletePost}
          />

          {/* Modal */}
          {showModal && selectedPost && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <AdminPostDetail
                  post={selectedPost}
                  onApprove={handleApprovePost}
                  onReject={handleRejectPost}
                  onDelete={handleDeletePost}
                  onClose={() => setShowModal(false)}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
