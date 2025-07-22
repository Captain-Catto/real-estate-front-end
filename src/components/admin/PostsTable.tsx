import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  TrophyIcon,
  StarIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { Post } from "@/services/postsService";
import { locationService, LocationNames } from "@/services/locationService";

interface PostsTableProps {
  posts: Post[];
  loading: boolean;
  onApprove: (postId: string) => void;
  onReject: (postId: string, reason: string) => void;
  onDelete: (postId: string) => void;
}

export default function PostsTable({
  posts,
  loading,
  onApprove,
  onReject,
  onDelete,
}: PostsTableProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [locationNames, setLocationNames] = useState<
    Record<string, LocationNames>
  >({});

  // Fetch location names for all posts
  useEffect(() => {
    const fetchLocationNames = async () => {
      const locationMap: Record<string, LocationNames> = {};

      for (const post of posts) {
        if (post.location?.province && post.location?.ward) {
          const key = `${post.location.province}-${post.location.ward}`;
          if (!locationMap[key]) {
            try {
              const names = await locationService.getLocationNames(
                post.location.province,
                post.location.ward
              );
              locationMap[key] = names;
            } catch (error) {
              console.error("Error fetching location names:", error);
              locationMap[key] = {};
            }
          }
        }
      }

      setLocationNames(locationMap);
    };

    if (posts.length > 0) {
      fetchLocationNames();
    }
  }, [posts]);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} tr`;
    }
    return price.toLocaleString();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hiển thị";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Bị từ chối";
      case "expired":
        return "Hết hạn";
      default:
        return "Không xác định";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "vip":
        return <TrophyIcon className="w-4 h-4 text-purple-600" />;
      case "premium":
        return <StarIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    return type === "ban" ? "Bán" : "Cho thuê";
  };

  const getTypeBadge = (type: string) => {
    return type === "ban"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  const getLocationDisplayName = (post: Post) => {
    if (!post.location?.province || !post.location?.ward) {
      return {
        street: post.location?.street || "",
        ward: post.location?.ward || "N/A",
        province: post.location?.province || "N/A",
      };
    }

    const key = `${post.location.province}-${post.location.ward}`;
    const names = locationNames[key];

    return {
      street: post.location?.street || "",
      ward: names?.wardName || post.location.ward,
      province: names?.provinceName || post.location.province,
    };
  };

  const handleReject = (postId: string) => {
    setSelectedPostId(postId);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (rejectReason.trim()) {
      onReject(selectedPostId, rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedPostId("");
    } else {
      alert("Vui lòng nhập lý do từ chối!");
    }
  };

  const handleViewClick = (post: Post) => {
    // chuyển hướng đến trang chi tiết
    window.location.href = `/admin/quan-ly-tin-dang/${post._id}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-80 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tin đăng
                </th>
                <th className="w-64 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin
                </th>
                <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="w-32 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12">
                        {post.images && post.images.length > 0 ? (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                            <Image
                              src={post.images[0]}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-xs">IMG</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(post.priority || "normal")}
                          <Link
                            href={`/admin/quan-ly-tin-dang/${post._id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate max-w-xs cursor-pointer transition-colors"
                            title={post.title}
                          >
                            {post.title}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium truncate">
                          {formatPrice(post.price)}{" "}
                          {post.type === "ban" ? "VNĐ" : "VNĐ/tháng"}
                        </div>
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(
                            post.type
                          )}`}
                        >
                          {getTypeName(post.type)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {post.area}m²
                      </div>
                      <div className="text-xs text-gray-500">
                        {post.views.toLocaleString()} lượt xem
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        const locationDisplay = getLocationDisplayName(post);
                        const fullAddress = [
                          locationDisplay.street,
                          locationDisplay.ward,
                          locationDisplay.province,
                        ]
                          .filter(Boolean)
                          .join(", ");

                        return (
                          <>
                            {locationDisplay.street && (
                              <div
                                className="text-sm truncate"
                                title={locationDisplay.street}
                              >
                                {locationDisplay.street}
                              </div>
                            )}
                            <div
                              className={`${
                                locationDisplay.street ? "text-xs" : "text-sm"
                              } truncate`}
                              title={locationDisplay.ward}
                            >
                              {locationDisplay.ward}
                            </div>
                            <div
                              className="text-xs text-gray-500 truncate"
                              title={fullAddress}
                            >
                              {locationDisplay.province}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      <div
                        className="font-medium truncate"
                        title={post.author.username}
                      >
                        {post.author.username}
                      </div>
                      <div
                        className="text-xs text-gray-500 truncate"
                        title={post.author.email}
                      >
                        {post.author.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        post.status
                      )}`}
                    >
                      {getStatusText(post.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* View Button */}
                      <button
                        onClick={() => handleViewClick(post)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      {/* Approve Button - only for pending posts */}
                      {post.status === "pending" && (
                        <button
                          onClick={() => onApprove(post._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Duyệt tin"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Reject Button - only for pending posts */}
                      {post.status === "pending" && (
                        <button
                          onClick={() => handleReject(post._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Từ chối"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(post._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4 text-4xl">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có tin đăng nào
            </h3>
            <p className="text-gray-600">
              Không tìm thấy tin đăng phù hợp với bộ lọc hiện tại
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Từ chối tin đăng
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
