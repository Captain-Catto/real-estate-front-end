"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/hooks";
import { postService } from "@/services/postsService";
import { Post as ServicePost } from "@/services/postsService";
import { useEditPostModal } from "@/hooks/useEditPostModal";
import EditPostModal from "@/components/modals/EditPostModal/EditPostModal";
import { formatPriceByType } from "@/utils/format";
import { createPostSlug } from "@/utils/postSlug";
import { getPackageBadge, shouldShowBadge } from "@/utils/packageBadgeUtils";
import Link from "next/link";
import Image from "next/image";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ExtendPostModal from "@/components/modals/ExtendPostModal/ExtendPostModal";
import { toast } from "sonner";

// Use Post interface from service
type Post = ServicePost & {
  category: string | { name: string; _id: string; slug: string };
  legalDocs?: string;
  furniture?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  houseDirection?: string;
  balconyDirection?: string;
  roadWidth?: string;
  frontWidth?: string;
  phone?: string;
  project?: string | { id: string; name: string };
};

export default function QuanLyTinDangPage() {
  const { loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "pending" | "expired" | "rejected" | "deleted"
  >("all");
  const [filterType, setFilterType] = useState<"all" | "ban" | "cho-thue">(
    "all"
  );
  const [currentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Extend post modal states
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedPostForExtend, setSelectedPostForExtend] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Add edit post modal hook
  const editPostModal = useEditPostModal();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: currentPage,
          limit: 10,
          status: filterStatus === "all" ? undefined : filterStatus,
          type: filterType === "all" ? undefined : filterType,
          search: searchTerm || undefined,
        };

        const response = await postService.getUserPosts(params);
        setPosts(response.data?.posts || []);
      } catch (error) {
        console.error("Error loading posts:", error);
        toast.error("Không thể tải danh sách tin đăng");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, filterStatus, filterType, searchTerm]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) return;

    try {
      // Delete the post
      await postService.deletePost(id);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      toast.success("Đã xóa tin đăng thành công");
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Không thể xóa tin đăng");
    }
  };

  const handleExtendPost = async (id: string) => {
    const post = posts.find((p) => p._id === id);
    if (post) {
      setSelectedPostForExtend({
        id: post._id,
        title: post.title,
      });
      setShowExtendModal(true);
    }
  };

  const handleExtendSuccess = () => {
    // Update the post status to pending (chờ duyệt) and reload data
    if (selectedPostForExtend) {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === selectedPostForExtend.id
            ? { ...post, status: "pending" as const }
            : post
        )
      );
    }
    // Optionally reload all data to get fresh stats
    window.location.reload();
  };

  const handleViewPost = (post: Post) => {
    if (post.status === "active") {
      // Nếu tin đã được duyệt, chuyển đến trang chi tiết với SEO-friendly URL
      const seoUrl = createPostSlug({
        _id: post._id,
        title: post.title,
        type: post.type,
        location: post.location,
      });
      window.open(seoUrl, "_blank");
    } else {
      // Nếu tin chưa duyệt, mở modal xem trước
      setPreviewPost(post);
      setShowPreviewModal(true);
    }
  };

  const handleEditPost = (post: Post) => {
    // Convert category to _id string for select compatibility
    let categoryId = "";
    if (
      typeof post.category === "object" &&
      post.category &&
      "_id" in post.category
    ) {
      categoryId = (post.category as { _id: string })._id;
    } else if (typeof post.category === "string") {
      // If it's already an ObjectId string, use it; otherwise leave empty
      categoryId = post.category.length === 24 ? post.category : "";
    }

    // Convert Post to EditPost format for modal
    const editPost = {
      _id: post._id,
      title: post.title,
      description: post.description,
      type: post.type,
      status: post.status,
      category: categoryId,
      location: post.location,
      area: post.area,
      price: post.price.toString(),
      currency: post.currency,
      legalDocs: post.legalDocs,
      furniture: post.furniture,
      bedrooms: post.bedrooms,
      bathrooms: post.bathrooms,
      floors: post.floors,
      houseDirection: post.houseDirection,
      balconyDirection: post.balconyDirection,
      roadWidth: post.roadWidth,
      frontWidth: post.frontWidth,
      contactName: post.author?.username,
      email: post.author?.email,
      phone: post.phone,
      images: post.images,
      project:
        typeof post.project === "string"
          ? post.project
          : post.project &&
            typeof post.project === "object" &&
            "id" in post.project
          ? (post.project as { id: string }).id
          : "",
    };

    editPostModal.open(editPost);
  };

  // Wrapper function to handle type conversion for modal
  const handleUpdateFormData = (
    field: string | number | symbol,
    value: string | number | undefined
  ) => {
    // Type assertion to bypass strict typing - the modal components know what they're doing
    editPostModal.updateFormData(field as never, value);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewPost(null);
  };

  // Helper function to format location
  const formatLocation = (location: Post["location"]) => {
    const parts = [location.street, location.ward, location.province].filter(
      Boolean
    );
    return parts.join(", ");
  };

  // Helper function to format category
  const formatCategory = (
    category: string | { name: string; _id: string; slug: string }
  ) => {
    if (typeof category === "string") {
      return category;
    }
    return category?.name || "Chưa xác định";
  };

  const filteredPosts = posts.filter((post) => {
    const locationString = formatLocation(post.location);
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locationString.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || post.status === filterStatus;
    const matchesType = filterType === "all" || post.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
      rejected: "bg-gray-100 text-gray-800",
      deleted: "bg-gray-400 text-white",
    };

    const labels = {
      active: "Đang hiển thị",
      pending: "Chờ duyệt",
      expired: "Hết hạn",
      rejected: "Bị từ chối",
      deleted: "Đã xóa",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatPrice = (price: number, type: string) => {
    return formatPriceByType(price, type);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const postStats = {
    total: posts.length,
    active: posts.filter((p) => p.status === "active").length,
    pending: posts.filter((p) => p.status === "pending").length,
    expired: posts.filter((p) => p.status === "expired").length,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Quản lý tin đăng
                </h1>
                <p className="mt-1 sm:mt-2 text-sm text-gray-600">
                  Quản lý và theo dõi các bài đăng bất động sản của bạn
                </p>
              </div>
              <Link
                href="/nguoi-dung/dang-tin"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Đăng tin mới
              </Link>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-md">
                    <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {postStats.total}
                    </div>
                    <div className="text-xs text-gray-500">Tổng tin đăng</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-md">
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <div className="text-base sm:text-lg font-bold text-green-600">
                      {postStats.active}
                    </div>
                    <div className="text-xs text-gray-500">Đang hiển thị</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-md">
                    <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <div className="text-base sm:text-lg font-bold text-yellow-600">
                      {postStats.pending}
                    </div>
                    <div className="text-xs text-gray-500">Chờ duyệt</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-red-100 rounded-md">
                    <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <div className="text-base sm:text-lg font-bold text-red-600">
                      {postStats.expired}
                    </div>
                    <div className="text-xs text-gray-500">Hết hạn</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Tìm kiếm theo tên hoặc địa điểm..."
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as
                        | "all"
                        | "active"
                        | "pending"
                        | "expired"
                        | "rejected"
                        | "deleted"
                    )
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hiển thị</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="expired">Hết hạn</option>
                  <option value="rejected">Bị từ chối</option>
                  <option value="deleted">Thùng rác</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "all" | "ban" | "cho-thue")
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="ban">Nhà đất bán</option>
                  <option value="cho-thue">Nhà đất cho thuê</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Đang tải danh sách tin đăng...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Không tìm thấy tin đăng"
                  : "Chưa có tin đăng nào"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                  : "Hãy tạo tin đăng đầu tiên của bạn"}
              </p>
              {!searchTerm &&
                filterStatus === "all" &&
                filterType === "all" && (
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Đăng tin mới
                    </button>
                  </div>
                )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPosts.map((post) => {
                const imageUrl =
                  post.images && post.images.length > 0
                    ? post.images[0]
                    : "/no-image.png";
                const isActive = post.status === "active";
                // Badge status style
                let statusLabel = "";
                let statusClass = "";
                switch (post.status) {
                  case "active":
                    statusLabel = "Đang hiển thị";
                    statusClass =
                      "bg-green-100 text-green-700 border-green-300";
                    break;
                  case "pending":
                    statusLabel = "Chờ duyệt";
                    statusClass =
                      "bg-yellow-100 text-yellow-700 border-yellow-300";
                    break;
                  case "expired":
                    statusLabel = "Hết hạn";
                    statusClass = "bg-gray-100 text-gray-600 border-gray-300";
                    break;
                  case "rejected":
                    statusLabel = "Bị từ chối";
                    statusClass = "bg-red-100 text-red-700 border-red-300";
                    break;
                  case "deleted":
                    statusLabel = "Thùng rác";
                    statusClass = "bg-gray-200 text-gray-500 border-gray-300";
                    break;
                  default:
                    statusLabel = post.status;
                    statusClass = "bg-gray-100 text-gray-600 border-gray-300";
                }
                // Badge loại tin
                const typeLabel = post.type === "ban" ? "Mua bán" : "Cho thuê";
                const typeClass =
                  post.type === "ban"
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300";
                // Badge dự án
                const isProject = !!post.project;
                return (
                  <div
                    key={post._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full"
                  >
                    {/* Image section */}
                    <div className="relative h-24 md:h-32 w-full">
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        priority={false}
                      />
                      {shouldShowBadge(post.package) && (
                        <div className="absolute top-2 left-2">
                          {(() => {
                            const badge = getPackageBadge(post.package);
                            return (
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs font-medium ${badge.className}`}
                              >
                                {badge.text}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    {/* Info section */}
                    <div className="p-2 md:p-3 flex-1 flex flex-col">
                      <h3 className="font-semibold text-xs md:text-sm mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                        {post.title}
                      </h3>
                      {/* Badge group: status, type, project */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeClass}`}
                        >
                          {typeLabel}
                        </span>
                        {isProject && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                            Dự án
                          </span>
                        )}
                      </div>
                      {/* Lý do bị từ chối */}
                      {post.status === "rejected" && post.rejectedReason && (
                        <div className="text-xs text-red-600 mb-1">
                          Lý do bị từ chối: {post.rejectedReason}
                        </div>
                      )}
                      <div className="text-base md:text-lg font-bold text-red-600 mb-1 md:mb-2">
                        {formatPrice(post.price, post.type)}
                      </div>
                      <div className="flex items-center text-gray-600 mb-1 md:mb-2">
                        <svg
                          className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                        </svg>
                        <span className="text-xs md:text-sm truncate">
                          {formatLocation(post.location)}
                        </span>
                      </div>
                      <div className="mb-1 md:mb-2">
                        <span className="text-xs md:text-sm text-gray-500">
                          Đăng {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs md:text-sm text-gray-500 border-t pt-2 md:pt-2 mt-auto">
                        {post.bedrooms !== undefined &&
                          post.bedrooms !== null && (
                            <span className="flex items-center gap-1">
                              <i className="fas fa-bed"></i>
                              {post.bedrooms} PN
                            </span>
                          )}
                        {post.bathrooms !== undefined &&
                          post.bathrooms !== null && (
                            <span className="flex items-center gap-1">
                              <i className="fas fa-bath"></i>
                              {post.bathrooms} WC
                            </span>
                          )}
                        {post.area && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-ruler-combined"></i>
                            {post.area}m²
                          </span>
                        )}
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleViewPost(post);
                          }}
                          className="flex-1 p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium text-xs md:text-sm"
                          title={isActive ? "Xem chi tiết" : "Xem trước"}
                        >
                          {isActive ? "Xem chi tiết" : "Xem trước"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditPost(post);
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        {post.status === "expired" && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleExtendPost(post._id);
                            }}
                            className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Gia hạn
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeletePost(post._id);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                Xem trước tin đăng
              </h2>
              <button
                onClick={closePreviewModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Post Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {previewPost.title}
                    </h1>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(previewPost.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          previewPost.type === "ban"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {previewPost.type === "ban" ? "Bán" : "Cho thuê"}
                      </span>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-red-600 mb-4">
                    {formatPrice(previewPost.price, previewPost.type)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {formatLocation(previewPost.location)}
                    </div>
                    <div className="flex items-center">
                      <FunnelIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {previewPost.area} m²
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {previewPost.views} lượt xem
                    </div>
                  </div>
                </div>

                {/* Post Images */}
                {previewPost.images && previewPost.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Hình ảnh
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {previewPost.images.slice(0, 6).map((image, index) => (
                        <div key={index} className="aspect-w-16 aspect-h-12">
                          <Image
                            src={image}
                            alt={`Hình ảnh ${index + 1}`}
                            width={400}
                            height={300}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                    {previewPost.images.length > 6 && (
                      <p className="text-sm text-gray-500 mt-2">
                        +{previewPost.images.length - 6} hình ảnh khác
                      </p>
                    )}
                  </div>
                )}

                {/* Post Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Mô tả
                  </h3>
                  <div className="prose max-w-none text-gray-700">
                    {previewPost.description ? (
                      <p className="whitespace-pre-wrap">
                        {previewPost.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">Chưa có mô tả</p>
                    )}
                  </div>
                </div>

                {/* Post Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">
                        Ngày đăng:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {formatDate(previewPost.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        Trạng thái:
                      </span>
                      <span className="ml-2">
                        {getStatusBadge(previewPost.status)}
                      </span>
                    </div>
                    {previewPost.category && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Danh mục:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {formatCategory(previewPost.category)}
                        </span>
                      </div>
                    )}
                    {previewPost.package && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Gói tin:
                        </span>
                        <span className="ml-2 text-gray-600 capitalize">
                          {previewPost.package}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {previewPost.status === "pending" &&
                      "Tin đăng đang chờ được duyệt"}
                    {previewPost.status === "rejected" &&
                      "Tin đăng đã bị từ chối"}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleEditPost(previewPost)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={closePreviewModal}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={editPostModal.isOpen}
        onClose={editPostModal.close}
        currentStep={editPostModal.currentStep}
        editingPost={editPostModal.editingPost}
        formData={editPostModal.formData}
        selectedImages={editPostModal.selectedImages}
        selectedPackage={editPostModal.selectedPackage}
        nextStep={editPostModal.nextStep}
        prevStep={editPostModal.prevStep}
        updateFormData={handleUpdateFormData}
        setSelectedImages={editPostModal.setSelectedImages}
        setSelectedPackage={editPostModal.setSelectedPackage}
        handleBasicSubmit={editPostModal.handleBasicSubmit}
        handleImageSubmit={editPostModal.handleImageSubmit}
        handlePackageSubmit={editPostModal.handlePackageSubmit}
        existingImages={editPostModal.existingImages}
        updateExistingImages={editPostModal.updateExistingImages}
        categories={editPostModal.categories}
        projects={editPostModal.projects}
        provinces={editPostModal.provinces}
        wards={editPostModal.wards}
        locationLoading={editPostModal.locationLoading}
      />

      {showExtendModal && selectedPostForExtend && (
        <ExtendPostModal
          isOpen={showExtendModal}
          postId={selectedPostForExtend.id}
          postTitle={selectedPostForExtend.title}
          onClose={() => {
            setShowExtendModal(false);
            setSelectedPostForExtend(null);
          }}
          onSuccess={handleExtendSuccess}
        />
      )}
    </>
  );
}
