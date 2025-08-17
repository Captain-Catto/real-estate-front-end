"use client";

import { useState, useEffect } from "react";
import PackageSelection from "../common/PackageSelection";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

interface Post {
  _id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  expiredAt?: string;
  packageId?: string;
  originalPackageDuration?: number;
}

function PostExpiryManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [extendingPost, setExtendingPost] = useState<Post | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");

  // Fetch user's posts
  const fetchMyPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/my?status=all`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setPosts(data.data.posts);
      }
    } catch {
      toast.error("Không thể tải danh sách tin đăng");
    } finally {
      setLoading(false);
    }
  };

  // Extend post expiry
  const extendPost = async (postId: string, packageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Gia hạn tin đăng thành công!");
        fetchMyPosts();
        setExtendingPost(null);
        setSelectedPackageId("");
      } else {
        alert(`❌ ${data.message || "Lỗi khi gia hạn tin đăng"}`);
      }
    } catch {
      toast.error("Lỗi kết nối server");
    }
  };

  const handleExtendPost = (post: Post) => {
    setExtendingPost(post);
    setSelectedPackageId("");
  };

  const confirmExtend = () => {
    if (!extendingPost || !selectedPackageId) {
      alert("Vui lòng chọn gói gia hạn");
      return;
    }

    extendPost(extendingPost._id, selectedPackageId);
  };

  const cancelExtend = () => {
    setExtendingPost(null);
    setSelectedPackageId("");
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getDaysUntilExpiry = (expiredAt: string) => {
    const now = new Date();
    const expiry = new Date(expiredAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (post: Post) => {
    if (!post.expiredAt)
      return {
        text: "Không giới hạn",
        color: "text-gray-500",
        bg: "bg-gray-100",
      };

    const daysLeft = getDaysUntilExpiry(post.expiredAt);

    if (daysLeft < 0) {
      return { text: "Đã hết hạn", color: "text-red-800", bg: "bg-red-100" };
    } else if (daysLeft <= 3) {
      return {
        text: `Còn ${daysLeft} ngày`,
        color: "text-yellow-800",
        bg: "bg-yellow-100",
      };
    } else if (daysLeft <= 7) {
      return {
        text: `Còn ${daysLeft} ngày`,
        color: "text-orange-800",
        bg: "bg-orange-100",
      };
    } else {
      return {
        text: `Còn ${daysLeft} ngày`,
        color: "text-green-800",
        bg: "bg-green-100",
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-800 bg-green-100";
      case "pending":
        return "text-yellow-800 bg-yellow-100";
      case "expired":
        return "text-red-800 bg-red-100";
      case "rejected":
        return "text-red-800 bg-red-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "pending":
        return "Chờ duyệt";
      case "expired":
        return "Hết hạn";
      case "rejected":
        return "Bị từ chối";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý Thời hạn Tin đăng
        </h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và gia hạn các tin đăng của bạn
        </p>
      </div>

      {/* Extend Form Modal */}
      {extendingPost && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gia hạn tin đăng: {extendingPost.title}
                </h2>
                <button
                  onClick={cancelExtend}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <PackageSelection
                  selectedPackageId={selectedPackageId}
                  onPackageSelect={setSelectedPackageId}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelExtend}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmExtend}
                  disabled={!selectedPackageId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Xác nhận Gia hạn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách Tin đăng ({posts.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => {
                const expiryStatus = getExpiryStatus(post);
                return (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.type === "sell" ? "Bán" : "Cho thuê"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {getStatusText(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.bg} ${expiryStatus.color}`}
                      >
                        {expiryStatus.text}
                      </span>
                      {post.expiredAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(post.expiredAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {post.status === "active" && (
                        <button
                          onClick={() => handleExtendPost(post)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Gia hạn
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {posts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Bạn chưa có tin đăng nào
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {posts.filter((p) => p.status === "active").length}
          </div>
          <div className="text-sm text-blue-700">Tin đang hoạt động</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {
              posts.filter(
                (p) =>
                  p.expiredAt &&
                  getDaysUntilExpiry(p.expiredAt) <= 7 &&
                  getDaysUntilExpiry(p.expiredAt) > 0
              ).length
            }
          </div>
          <div className="text-sm text-yellow-700">Sắp hết hạn (≤7 ngày)</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {
              posts.filter(
                (p) =>
                  p.status === "expired" ||
                  (p.expiredAt && getDaysUntilExpiry(p.expiredAt) < 0)
              ).length
            }
          </div>
          <div className="text-sm text-red-700">Đã hết hạn</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">
            {posts.filter((p) => p.status === "pending").length}
          </div>
          <div className="text-sm text-gray-700">Chờ duyệt</div>
        </div>
      </div>
    </div>
  );
}

export default PostExpiryManagement;
