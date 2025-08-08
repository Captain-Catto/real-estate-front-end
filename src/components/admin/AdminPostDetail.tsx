// src/components/admin/AdminPostDetail.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  StarIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { locationService } from "@/services/locationService";
import { postService } from "@/services/postsService";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/auth/ProtectionGuard";
import { PERMISSIONS } from "@/constants/permissions";

interface AdminPostDetailProps {
  post: {
    id?: string;
    _id?: string;
    title: string;
    description: string;
    status:
      | "pending"
      | "active"
      | "rejected"
      | "expired"
      | "inactive"
      | "deleted";
    views: number;
    priority?: string;
    type: string;
    category: string;
    price: string | number;
    area: string | number;
    createdAt: string;
    updatedAt: string;
    author:
      | {
          _id?: string;
          username?: string;
          email?: string;
          avatar?: string;
          phoneNumber?: string;
        }
      | string;
    authorPhone?: string;
    authorEmail?: string;
    approvedAt?: string;
    approvedBy?:
      | {
          _id?: string;
          username?: string;
          email?: string;
          avatar?: string;
        }
      | string;
    rejectedAt?: string;
    rejectedBy?:
      | {
          _id?: string;
          username?: string;
          email?: string;
          avatar?: string;
        }
      | string;
    rejectedReason?: string;
    images?: string[];
    location:
      | {
          province: string;
          ward: string;
          street?: string;
        }
      | string;
  };
  onApprove: (postId: string) => void;
  onReject: (postId: string, reason: string) => void;
  onEdit?: () => void;
  onStatusChange?: (postId: string, newStatus: string) => void;
  onDelete?: (postId: string) => void;
  onBack: () => void;
}

export default function AdminPostDetail({
  post,
  onApprove,
  onReject,
  onEdit,
  onStatusChange,
  onDelete,
  onBack,
}: AdminPostDetailProps) {
  const { hasRole } = useAuth();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [approvedByName, setApprovedByName] = useState("");
  const [rejectedByName, setRejectedByName] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const fetchLocationName = async () => {
      console.log("🔍 Post location data:", post.location);
      console.log("🔍 Post location type:", typeof post.location);

      if (typeof post.location === "object" && post.location.province) {
        try {
          const name = await locationService.getLocationName(
            post.location.province,
            post.location.ward
          );

          setLocationName(name);
        } catch (error) {
          console.error("Error fetching location name:", error);
          // Fallback
          setLocationName(
            post.location.ward
              ? `${post.location.ward}, ${post.location.province}`
              : post.location.province
          );
        }
      } else if (typeof post.location === "string") {
        setLocationName(post.location);
      } else {
        // Xử lý trường hợp location có cấu trúc khác
        console.warn("Unknown location format:", post.location);
        setLocationName("Vị trí không xác định");
      }
    };

    fetchLocationName();
  }, [post.location]);

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (post.category) {
        console.log("🔍 Fetching category name for:", post.category);
        try {
          const name = await postService.getCategoryName(post.category);
          setCategoryName(name);
        } catch (error) {
          console.error("Error fetching category name:", error);
          setCategoryName("Không xác định");
        }
      }
    };

    fetchCategoryName();
  }, [post.category]);

  useEffect(() => {
    const fetchUserNames = async () => {
      const userIds = [];

      // Check if author is a string (user ID)
      if (typeof post.author === "string" && post.author) {
        userIds.push(post.author);
      }

      // Check if approvedBy is a string (user ID)
      if (typeof post.approvedBy === "string" && post.approvedBy) {
        userIds.push(post.approvedBy);
      }

      // Check if rejectedBy is a string (user ID)
      if (typeof post.rejectedBy === "string" && post.rejectedBy) {
        userIds.push(post.rejectedBy);
      }

      if (userIds.length > 0) {
        try {
          console.log("🔍 Fetching user names for:", userIds);
          const userNames = await postService.getUserNames(userIds);

          if (typeof post.author === "string" && post.author) {
            setAuthorName(userNames[post.author] || "Không xác định");
          }

          if (typeof post.approvedBy === "string" && post.approvedBy) {
            setApprovedByName(userNames[post.approvedBy] || "Không xác định");
          }

          if (typeof post.rejectedBy === "string" && post.rejectedBy) {
            setRejectedByName(userNames[post.rejectedBy] || "Không xác định");
          }
        } catch (error) {
          console.error("Error fetching user names:", error);
          setAuthorName("Không xác định");
          setApprovedByName("Không xác định");
          setRejectedByName("Không xác định");
        }
      }
    };

    fetchUserNames();
  }, [post.author, post.approvedBy, post.rejectedBy]);

  const rejectReasons = [
    "Hình ảnh không phù hợp hoặc chất lượng kém",
    "Thông tin không chính xác hoặc thiếu chi tiết",
    "Giá không hợp lý so với thị trường",
    "Mô tả có nội dung không phù hợp",
    "Tin đăng trùng lặp",
    "Thông tin liên hệ không chính xác",
    "Vi phạm quy định đăng tin",
    "Khác",
  ];

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseInt(price) : price;
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)} tỷ`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)} triệu`;
    }
    return num.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-800 bg-green-100 border-green-200";
      case "pending":
        return "text-yellow-800 bg-yellow-100 border-yellow-200";
      case "rejected":
        return "text-red-800 bg-red-100 border-red-200";
      case "expired":
        return "text-gray-800 bg-gray-100 border-gray-200";
      case "inactive":
        return "text-orange-800 bg-orange-100 border-orange-200";
      case "deleted":
        return "text-red-900 bg-red-50 border-red-300";
      default:
        return "text-gray-800 bg-gray-100 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string | undefined) => {
    switch (priority) {
      case "vip":
        return <TrophyIcon className="w-4 h-4 text-yellow-500" />;
      case "premium":
        return <StarIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityLabel = (priority: string | undefined) => {
    switch (priority) {
      case "vip":
        return "VIP";
      case "premium":
        return "Premium";
      case "basic":
        return "Cơ bản";
      case "free":
        return "Miễn phí";
      default:
        return priority || "Không xác định";
    }
  };

  const getTypeName = (type: string) => {
    return type === "ban" ? "Bán" : "Cho thuê";
  };

  const getCategoryName = () => {
    return categoryName || "Đang tải...";
  };

  const handleReject = () => {
    let finalReason = selectedReason;

    if (selectedReason === "Khác") {
      if (!customReason.trim()) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
      }
      finalReason = customReason.trim();
    } else if (!selectedReason) {
      alert("Vui lòng chọn lý do từ chối!");
      return;
    }

    // Make sure we have a valid ID before rejecting
    const postId = post._id || post.id;
    if (!postId) {
      alert("ID bài viết không hợp lệ!");
      return;
    }

    onReject(postId, finalReason);
    setShowRejectModal(false);
    setSelectedReason("");
    setCustomReason("");
  };

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
    if (reason !== "Khác") {
      setCustomReason("");
    }
  };

  const handleStatusChange = () => {
    if (!selectedStatus) {
      alert("Vui lòng chọn trạng thái!");
      return;
    }

    const postId = post._id || post.id;
    if (!postId) {
      alert("ID bài viết không hợp lệ!");
      return;
    }

    if (onStatusChange) {
      onStatusChange(postId, selectedStatus);
    }
    setShowStatusModal(false);
    setSelectedStatus("");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Quay lại danh sách</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chi tiết tin đăng
              </h1>
              <p className="text-gray-600">
                Mã tin: {post._id || post.id || "N/A"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Special buttons for deleted posts */}
            {post.status === "deleted" && onStatusChange && (
              <>
                <PermissionGuard permission={PERMISSIONS.POST.EDIT}>
                  <button
                    onClick={() => {
                      const postId = post._id || post.id;
                      if (!postId) {
                        alert("ID bài viết không hợp lệ!");
                        return;
                      }
                      if (
                        confirm(
                          "Bạn có chắc muốn khôi phục tin đăng này? Tin đăng sẽ chuyển về trạng thái chờ duyệt."
                        )
                      ) {
                        onStatusChange(postId, "pending");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Khôi phục tin
                  </button>
                </PermissionGuard>
                <PermissionGuard permission={PERMISSIONS.POST.EDIT}>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Đổi trạng thái
                  </button>
                </PermissionGuard>
                {/* Permanent delete button for deleted posts */}
                <PermissionGuard permission={PERMISSIONS.POST.DELETE}>
                  {onDelete && (
                    <button
                      onClick={() => {
                        const postId = post._id || post.id;
                        if (!postId) {
                          alert("ID bài viết không hợp lệ!");
                          return;
                        }
                        onDelete(postId);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Xóa vĩnh viễn
                    </button>
                  )}
                </PermissionGuard>
              </>
            )}

            {/* Normal buttons for non-deleted posts */}
            {post.status !== "deleted" && (
              <>
                {/* Edit button - For users with edit permission */}
                <PermissionGuard permission={PERMISSIONS.POST.EDIT}>
                  {onEdit && (
                    <button
                      onClick={() => {
                        const postId = post._id || post.id;
                        if (!postId) {
                          alert("ID bài viết không hợp lệ!");
                          return;
                        }
                        onEdit();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  )}
                </PermissionGuard>

                {/* Status change button - For users with permissions */}
                <PermissionGuard permission={PERMISSIONS.POST.EDIT}>
                  {onStatusChange && (
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                      Đổi trạng thái
                    </button>
                  )}
                </PermissionGuard>

                {/* Delete button - For users with delete permission */}
                <PermissionGuard permission={PERMISSIONS.POST.DELETE}>
                  {onStatusChange && (
                    <button
                      onClick={() => {
                        const postId = post._id || post.id;
                        if (!postId) {
                          alert("ID bài viết không hợp lệ!");
                          return;
                        }
                        if (
                          confirm(
                            "Bạn có chắc muốn chuyển tin đăng này vào thùng rác?"
                          )
                        ) {
                          onStatusChange(postId, "deleted");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Xóa tin
                    </button>
                  )}
                </PermissionGuard>

                {/* Status change buttons - For both admin and employee, only show for pending posts */}
                {post.status === "pending" && (
                  <>
                    <PermissionGuard permission={PERMISSIONS.POST.APPROVE}>
                      <button
                        onClick={() => {
                          const postId = post._id || post.id;
                          if (!postId) {
                            alert("ID bài viết không hợp lệ!");
                            return;
                          }
                          onApprove(postId);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Duyệt tin
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.POST.REJECT}>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Từ chối
                      </button>
                    </PermissionGuard>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Notice - Show for rejected posts */}
      {post.status === "rejected" && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Tin đăng đã bị từ chối
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-medium">Người từ chối:</span>
                    <span>
                      {typeof post.rejectedBy === "object" ? (
                        (post.rejectedBy as { username?: string }).username ||
                        "Admin"
                      ) : typeof post.rejectedBy === "string" &&
                        rejectedByName ? (
                        <Link
                          href={`/admin/quan-ly-nguoi-dung/${post.rejectedBy}`}
                          className="text-red-700 hover:text-red-900 underline cursor-pointer"
                        >
                          {rejectedByName}
                        </Link>
                      ) : (
                        post.rejectedBy || "Admin"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-medium">Thời gian:</span>
                    <span>
                      {post.rejectedAt ? formatDate(post.rejectedAt) : ""}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-red-800">
                      Lý do từ chối:
                    </span>
                    <div className="mt-1 p-3 bg-red-100 rounded-lg border border-red-200">
                      <p className="text-red-800">{post.rejectedReason}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deleted Notice - Show for deleted posts */}
      {post.status === "deleted" && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrashIcon className="w-6 h-6 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Tin đăng đã được chuyển vào thùng rác
                </h3>
                <p className="text-red-700 text-sm">
                  Tin đăng này đã bị xóa mềm và hiện đang trong thùng rác. Admin
                  có thể khôi phục tin đăng bằng cách thay đổi trạng thái.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{locationName || "Vị trí không xác định"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{post.views.toLocaleString()} lượt xem</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    post.status
                  )}`}
                >
                  {post.status === "active" && "Đang hiển thị"}
                  {post.status === "pending" && "Chờ duyệt"}
                  {post.status === "rejected" && "Đã từ chối"}
                  {post.status === "expired" && "Hết hạn"}
                  {post.status === "inactive" && "Không hoạt động"}
                  {post.status === "deleted" && "Đã xóa (Thùng rác)"}
                </span>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {getPriorityIcon(post.priority)}
                  <span>{getPriorityLabel(post.priority)}</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-600 mb-1">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Loại hình</span>
                </div>
                <div className="font-bold text-blue-800">
                  {getTypeName(post.type)} {getCategoryName()}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center text-green-600 mb-1">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Giá</span>
                </div>
                <div className="font-bold text-green-800">
                  {formatPrice(post.price)}{" "}
                  {post.type === "ban" ? "VNĐ" : "VNĐ/tháng"}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center text-orange-600 mb-1">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Diện tích</span>
                </div>
                <div className="font-bold text-orange-800">{post.area} m²</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center text-purple-600 mb-1">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Ngày đăng</span>
                </div>
                <div className="font-bold text-purple-800 text-sm">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Mô tả chi tiết
              </h3>
              <div className="prose max-w-none text-gray-700">
                {post.description
                  .split("\n")
                  .map((paragraph: string, index: number) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hình ảnh ({post.images?.length || 0})
            </h3>

            {post.images && post.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative h-80 rounded-lg overflow-hidden">
                  <Image
                    src={
                      post.images[selectedImageIndex] ||
                      "/placeholder-property.jpg"
                    }
                    alt={`${post.title} - Ảnh ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thumbnail Grid */}
                {post.images.length > 1 && (
                  <div className="grid grid-cols-6 gap-2">
                    {post.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className={`relative h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          index === selectedImageIndex
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Image
                          src={image || "/placeholder-property.jpg"}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có hình ảnh
              </div>
            )}
          </div>

          {/* Approval History */}
          {(post.approvedAt || post.rejectedAt) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch sử duyệt tin
              </h3>

              <div className="space-y-3">
                {post.approvedAt && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">
                        Đã duyệt bởi{" "}
                        {typeof post.approvedBy === "object" ? (
                          (post.approvedBy as { username?: string }).username ||
                          "Admin"
                        ) : typeof post.approvedBy === "string" &&
                          approvedByName ? (
                          <Link
                            href={`/admin/quan-ly-nguoi-dung/${post.approvedBy}`}
                            className="text-green-700 hover:text-green-900 underline cursor-pointer"
                          >
                            {approvedByName}
                          </Link>
                        ) : (
                          post.approvedBy || "Admin"
                        )}
                      </div>
                      <div className="text-sm text-green-600">
                        {post.approvedAt ? formatDate(post.approvedAt) : ""}
                      </div>
                    </div>
                  </div>
                )}

                {post.rejectedAt && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <XMarkIcon className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800">
                        Đã từ chối bởi{" "}
                        {typeof post.rejectedBy === "object" ? (
                          (post.rejectedBy as { username?: string }).username ||
                          "Admin"
                        ) : typeof post.rejectedBy === "string" &&
                          rejectedByName ? (
                          <Link
                            href={`/admin/quan-ly-nguoi-dung/${post.rejectedBy}`}
                            className="text-red-700 hover:text-red-900 underline cursor-pointer"
                          >
                            {rejectedByName}
                          </Link>
                        ) : (
                          post.rejectedBy || "Admin"
                        )}
                      </div>
                      <div className="text-sm text-red-600">
                        {post.rejectedAt ? formatDate(post.rejectedAt) : ""}
                      </div>
                      {post.rejectedReason && (
                        <div className="text-sm text-red-700 mt-1">
                          <strong>Lý do:</strong> {post.rejectedReason}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Rest of the code remains the same */}
        <div className="lg:col-span-1 space-y-6">
          {/* Author Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin người đăng
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {typeof post.author === "object" ? (
                      post.author._id ? (
                        <Link
                          href={`/admin/quan-ly-nguoi-dung/${post.author._id}`}
                          className="text-blue-700 hover:text-blue-900 underline cursor-pointer"
                        >
                          {post.author.username || "Người dùng"}
                        </Link>
                      ) : (
                        post.author.username || "Người dùng"
                      )
                    ) : typeof post.author === "string" && authorName ? (
                      <Link
                        href={`/admin/quan-ly-nguoi-dung/${post.author}`}
                        className="text-blue-700 hover:text-blue-900 underline cursor-pointer"
                      >
                        {authorName}
                      </Link>
                    ) : (
                      post.author || "Người dùng"
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Người đăng tin</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <PhoneIcon className="w-4 h-4" />
                <span>
                  {typeof post.author === "object" && post.author.phoneNumber
                    ? post.author.phoneNumber
                    : post.authorPhone || "Không có số điện thoại"}
                </span>
              </div>

              {post.authorEmail && (
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="w-4 h-4 text-center">@</span>
                  <span>{post.authorEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Post Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thống kê tin đăng
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lượt xem:</span>
                <span className="font-medium">
                  {post.views.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="font-medium text-sm">
                  {formatDate(post.createdAt)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cập nhật:</span>
                <span className="font-medium text-sm">
                  {formatDate(post.updatedAt)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    post.status
                  )}`}
                >
                  {post.status === "active" && "Đang hiển thị"}
                  {post.status === "pending" && "Chờ duyệt"}
                  {post.status === "rejected" && "Đã từ chối"}
                  {post.status === "expired" && "Hết hạn"}
                  {post.status === "inactive" && "Không hoạt động"}
                  {post.status === "deleted" && "Đã xóa (Thùng rác)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal - Same as before */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Từ chối tin đăng
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lý do từ chối *
                </label>
                <div className="space-y-2">
                  {rejectReasons.map((reason, index) => (
                    <div key={index} className="flex items-start">
                      <input
                        type="radio"
                        id={`reason-${index}`}
                        name="rejectReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        className="mt-1 w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                      />
                      <label
                        htmlFor={`reason-${index}`}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {reason}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom reason input */}
              {selectedReason === "Khác" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập lý do cụ thể *
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Nhập lý do từ chối cụ thể..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Từ chối tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Thay đổi trạng thái tin đăng
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Trạng thái mới *
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "active",
                      label: "Đang hiển thị",
                      color: "text-green-600",
                    },
                    {
                      value: "pending",
                      label: "Chờ duyệt",
                      color: "text-yellow-600",
                    },
                    {
                      value: "inactive",
                      label: "Không hoạt động",
                      color: "text-orange-600",
                    },
                    {
                      value: "expired",
                      label: "Hết hạn",
                      color: "text-red-600",
                    },
                    {
                      value: "rejected",
                      label: "Đã từ chối",
                      color: "text-red-500",
                    },
                    {
                      value: "deleted",
                      label: "Chuyển vào thùng rác",
                      color: "text-red-800",
                    },
                  ].map((status) => (
                    <div key={status.value} className="flex items-center">
                      <input
                        type="radio"
                        id={`status-${status.value}`}
                        name="postStatus"
                        value={status.value}
                        checked={selectedStatus === status.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`status-${status.value}`}
                        className={`ml-2 text-sm cursor-pointer ${status.color}`}
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={!selectedStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thay đổi trạng thái
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
