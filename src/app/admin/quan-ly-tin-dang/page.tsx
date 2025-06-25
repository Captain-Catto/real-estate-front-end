"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import PostsTable from "@/components/admin/PostsTable";
import PostsFilter from "@/components/admin/PostsFilter";
import PostsStats from "@/components/admin/PostsStats";
import PostModal from "@/components/admin/PostsModal";
import { Pagination } from "@/components/common/Pagination";

// Mock service
const PostsService = {
  getPosts: async (filters: any, page: number = 1, limit: number = 10) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    const allPosts = [
      {
        id: "BDS001",
        title: "Bán căn hộ 2PN Vinhomes Central Park Q.Bình Thạnh",
        type: "ban",
        category: "apartment",
        location: "Quận Bình Thạnh, TP.HCM",
        price: "3500000000",
        area: "75",
        author: "Nguyễn Văn A",
        authorPhone: "0901234567",
        status: "active",
        priority: "vip",
        views: 1245,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        approvedAt: "2024-01-15T14:20:00Z",
        approvedBy: "Admin",
        images: ["image1.jpg", "image2.jpg"],
        description: "Căn hộ cao cấp view sông, đầy đủ nội thất...",
      },
      {
        id: "BDS002",
        title: "Cho thuê biệt thự đơn lập Phú Mỹ Hưng",
        type: "cho-thue",
        category: "villa",
        location: "Quận 7, TP.HCM",
        price: "50000000",
        area: "300",
        author: "Trần Thị B",
        authorPhone: "0912345678",
        status: "pending",
        priority: "normal",
        views: 987,
        createdAt: "2024-01-16T09:15:00Z",
        updatedAt: "2024-01-16T09:15:00Z",
        images: ["image3.jpg"],
        description: "Biệt thự sang trọng, khu an ninh 24/7...",
      },
      {
        id: "BDS003",
        title: "Bán nhà mặt tiền đường Nguyễn Văn Cừ",
        type: "ban",
        category: "house",
        location: "Quận 5, TP.HCM",
        price: "12000000000",
        area: "120",
        author: "Lê Văn C",
        authorPhone: "0923456789",
        status: "rejected",
        priority: "normal",
        views: 756,
        createdAt: "2024-01-14T16:45:00Z",
        updatedAt: "2024-01-17T11:30:00Z",
        rejectedAt: "2024-01-17T11:30:00Z",
        rejectedBy: "Admin",
        rejectedReason: "Thông tin không đầy đủ",
        images: ["image4.jpg", "image5.jpg"],
        description: "Nhà mặt tiền kinh doanh tốt...",
      },
      // ... thêm data khác
    ];

    // Apply filters (mock)
    let filteredPosts = allPosts;

    if (filters.status && filters.status !== "all") {
      filteredPosts = filteredPosts.filter(
        (post) => post.status === filters.status
      );
    }

    if (filters.type && filters.type !== "all") {
      filteredPosts = filteredPosts.filter(
        (post) => post.type === filters.type
      );
    }

    if (filters.category && filters.category !== "all") {
      filteredPosts = filteredPosts.filter(
        (post) => post.category === filters.category
      );
    }

    if (filters.search) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          post.id.toLowerCase().includes(filters.search.toLowerCase()) ||
          post.author.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Pagination
    const total = filteredPosts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const posts = filteredPosts.slice(startIndex, endIndex);

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: endIndex < total,
      hasPrev: startIndex > 0,
    };
  },

  getPostsStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      total: 156,
      active: 89,
      pending: 23,
      rejected: 15,
      expired: 29,
      vip: 34,
      premium: 22,
      normal: 100,
    };
  },

  approvePost: async (postId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Approved post: ${postId}`);
    return { success: true };
  },

  rejectPost: async (postId: string, reason: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Rejected post: ${postId}, reason: ${reason}`);
    return { success: true };
  },

  deletePost: async (postId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Deleted post: ${postId}`);
    return { success: true };
  },
};

export default function AdminPostsPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
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
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: searchParams?.get("status") || "all",
    type: "all",
    category: "all",
    priority: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [filters, currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await PostsService.getPosts(filters, currentPage, 10);
      setPosts(result.posts);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await PostsService.getPostsStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
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
            onView={handleViewPost}
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

          {/* Post Modal */}
          {showModal && selectedPost && (
            <PostModal
              post={selectedPost}
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onApprove={handleApprovePost}
              onReject={handleRejectPost}
            />
          )}
        </main>
      </div>
    </div>
  );
}
