import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Post } from "@/services/postsService";
import { locationService, LocationNames } from "@/services/locationService";
import { ProjectService } from "@/services/projectService";
import { categoryService } from "@/services/categoryService";
import { PermissionGuard } from "@/components/auth/ProtectionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { showErrorToast } from "@/utils/errorHandler";

interface PostsTableProps {
  posts: Post[];
  loading: boolean;
  onApprove: (postId: string) => void;
  onReject: (postId: string, reason: string) => void;
  onDelete: (postId: string, currentStatus?: string) => void;
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
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {}
  );
  const [categoryData, setCategoryData] = useState<
    Record<string, { name: string; type: string }>
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
            } catch {
              console.warn("Could not fetch location names for:", {
                province: post.location.province,
                ward: post.location.ward,
              });
              // Set fallback names
              locationMap[key] = {
                provinceName: post.location.province,
                wardName: post.location.ward,
              };
            }
          }
        }
      }

      setLocationNames(locationMap);
    };

    const fetchProjectNames = async () => {
      const projectMap: Record<string, string> = {};

      for (const post of posts) {
        // Check both post.project and post.location?.project
        const projectId = post.project || post.location?.project;

        if (projectId) {
          // Convert projectId to string if it's an object
          let projectIdString: string;

          if (typeof projectId === "string") {
            projectIdString = projectId;
          } else if (typeof projectId === "object" && projectId !== null) {
            // Handle case where projectId might be an object with _id property
            const projectObj = projectId as { _id?: string; id?: string };
            projectIdString =
              projectObj._id || projectObj.id || JSON.stringify(projectId);
          } else {
            projectIdString = String(projectId);
          }

          if (!projectMap[projectIdString]) {
            // Validate project ID format (MongoDB ObjectID should be 24 hex characters)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(projectIdString);

            if (!isValidObjectId) {
              projectMap[projectIdString] = "Dự án (ID không hợp lệ)";
              continue;
            }

            try {
              const project = await ProjectService.getProjectById(
                projectIdString
              );
              if (project) {
                projectMap[projectIdString] = project.name;
                console.log(
                  `Found project: ${projectIdString} -> ${project.name}`
                );
              } else {
                console.warn("Project not found:", projectIdString);
                projectMap[projectIdString] = "Dự án (không tìm thấy)";
              }
            } catch (error) {
              console.warn(
                "Could not fetch project name for:",
                projectIdString,
                error
              );
              // Set fallback name
              projectMap[projectIdString] = "Dự án (lỗi)";
            }
          }
        }
      }

      setProjectNames(projectMap);
    };

    const fetchCategoryNames = async () => {
      const categoryMap: Record<string, string> = {};
      const categoryDataMap: Record<string, { name: string; type: string }> =
        {};

      for (const post of posts) {
        // Debug: Check post.category structure
        console.log(`🧪 Post category debug:`, {
          postId: post._id,
          category: post.category,
          categoryType: typeof post.category,
          isString: typeof post.category === "string",
          isObject: typeof post.category === "object",
          categoryStringified: JSON.stringify(post.category),
        });

        // Extract category ID - handle both string and object cases
        let categoryId: string | null = null;
        if (typeof post.category === "string") {
          categoryId = post.category;
          console.log(`✅ Category is string: ${categoryId}`);
        } else if (
          post.category &&
          typeof post.category === "object" &&
          "_id" in post.category
        ) {
          categoryId = (post.category as { _id: string })._id;
          console.log(`✅ Category is object, extracted _id: ${categoryId}`);
        } else if (
          post.category &&
          typeof post.category === "object" &&
          "id" in post.category
        ) {
          categoryId = (post.category as { id: string }).id;
          console.log(`✅ Category is object, extracted id: ${categoryId}`);
        } else {
          console.warn(`❌ Unknown category format:`, post.category);
        }

        if (categoryId && !categoryMap[categoryId]) {
          try {
            console.log(`🔍 Fetching category for ObjectId: ${categoryId}`);

            // Check if categoryService has getCategoryById method
            console.log(
              `🔧 categoryService methods:`,
              Object.getOwnPropertyNames(Object.getPrototypeOf(categoryService))
            );

            const category = await categoryService.getCategoryById(categoryId);
            console.log(`📝 Category API response:`, category);

            if (category) {
              categoryMap[categoryId] = category.name;
              // Convert isProject boolean to type string
              const categoryType = category.isProject ? "project" : "property";
              categoryDataMap[categoryId] = {
                name: category.name,
                type: categoryType,
              };
              console.log(
                `✅ Found category: ${categoryId} -> ${category.name} (${categoryType})`
              );
            } else {
              showErrorToast("Danh mục không tìm thấy");
              categoryMap[categoryId] = "Danh mục (không tìm thấy)";
              categoryDataMap[categoryId] = {
                name: "Danh mục (không tìm thấy)",
                type: "property",
              };
            }
          } catch {
            showErrorToast("Lỗi không tải được danh mục");
            categoryMap[categoryId] = "Danh mục (lỗi)";
            categoryDataMap[categoryId] = {
              name: "Danh mục (lỗi)",
              type: "property",
            };
          }
        }
      }

      setCategoryNames(categoryMap);
      setCategoryData(categoryDataMap);
    };

    if (posts.length > 0) {
      fetchLocationNames();
      fetchProjectNames();
      fetchCategoryNames();
    }
  }, [posts]);

  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} tr`;
    }
    return price.toLocaleString();
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getStatusBadge = useCallback((status: string) => {
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
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "Đang hiển thị";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Bị từ chối";
      case "expired":
        return "Hết hạn";
      case "deleted":
        return "Đã xóa mềm";
      default:
        return "Không xác định";
    }
  }, []);

  const getPackageBadge = useCallback((packageType: string | undefined) => {
    switch (packageType) {
      case "vip":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 min-w-[60px] justify-center">
            VIP
          </span>
        );
      case "premium":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 min-w-[60px] justify-center">
            Premium
          </span>
        );
      case "basic":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 min-w-[60px] justify-center">
            Cơ bản
          </span>
        );
      case "free":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600 min-w-[60px] justify-center">
            Miễn phí
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 min-w-[60px] justify-center">
            Không xác định
          </span>
        );
    }
  }, []);

  const getTypeName = useCallback((type: string) => {
    return type === "ban" ? "Bán" : "Cho thuê";
  }, []);

  const getTypeBadge = useCallback((type: string) => {
    return type === "ban"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  }, []);

  const getProjectBadge = useCallback(
    (post: Post) => {
      // Check both post.project and post.location?.project
      const projectId = post.project || post.location?.project;

      if (!projectId) return null;

      // Ensure projectId is a string, not an object
      let projectIdString: string;

      if (typeof projectId === "string") {
        projectIdString = projectId;
      } else if (typeof projectId === "object" && projectId !== null) {
        // Handle case where projectId might be an object with _id property
        const projectObj = projectId as { _id?: string; id?: string };
        projectIdString =
          projectObj._id || projectObj.id || JSON.stringify(projectId);
      } else {
        projectIdString = String(projectId);
      }

      const projectName = projectNames[projectIdString] || "Dự án";

      return (
        <Link
          href={`/admin/quan-ly-du-an/${projectIdString}`}
          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer min-w-[60px] justify-center"
          title={`Dự án: ${projectName} - Click để xem chi tiết`}
        >
          <span className="truncate max-w-16">{projectName}</span>
        </Link>
      );
    },
    [projectNames]
  );

  const getCategoryBadge = useCallback(
    (category: string | { _id: string; name: string } | undefined) => {
      if (!category) return null;

      // Extract category ID and name
      let categoryId: string;
      let categoryName: string;

      if (typeof category === "string") {
        categoryId = category;
        categoryName = categoryNames[categoryId] || "Danh mục";
      } else {
        categoryId = category._id;
        categoryName = category.name || categoryNames[categoryId] || "Danh mục";
      }

      const categoryInfo = categoryData[categoryId];
      const categoryType = categoryInfo?.type || "property";

      // Different colors for different types
      const badgeStyle =
        categoryType === "project"
          ? "bg-purple-100 text-purple-800"
          : "bg-indigo-100 text-indigo-800";

      return (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full min-w-[60px] justify-center ${badgeStyle}`}
          title={`Danh mục: ${categoryName}`}
        >
          <span className="truncate max-w-16">{categoryName}</span>
        </span>
      );
    },
    [categoryNames, categoryData]
  );

  const getLocationDisplayName = useCallback(
    (post: Post) => {
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
    },
    [locationNames]
  );

  const handleReject = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setShowRejectModal(true);
  }, []);

  const confirmReject = useCallback(() => {
    if (rejectReason.trim()) {
      onReject(selectedPostId, rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedPostId("");
    } else {
      alert("Vui lòng nhập lý do từ chối!");
    }
  }, [rejectReason, selectedPostId, onReject]);

  const handleViewClick = useCallback((post: Post) => {
    // chuyển hướng đến trang chi tiết
    window.location.href = `/admin/quan-ly-tin-dang/${post._id}`;
  }, []);

  // Helper function to check if post was recently updated by user
  const isRecentlyUpdated = (post: Post) => {
    if (!post.updatedAt || !post.createdAt) return false;

    const created = new Date(post.createdAt);
    const updated = new Date(post.updatedAt);
    const timeDiff = updated.getTime() - created.getTime();

    // Consider as "updated" if updatedAt is more than 1 minute after createdAt
    // and status is pending (indicating user made changes)
    return timeDiff > 60000 && post.status === "pending";
  };

  // Helper function to format time difference
  const getTimeSinceUpdate = (post: Post) => {
    if (!post.updatedAt) return null;

    const now = new Date();
    const updated = new Date(post.updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Memoize table header to prevent unnecessary re-renders
  const tableHeader = useMemo(
    () => (
      <thead className="bg-gray-50">
        <tr>
          <th className="w-96 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
          <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Trạng thái
          </th>
          <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ngày tạo
          </th>
          <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Cập nhật
          </th>
          <th className="w-32 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Thao tác
          </th>
        </tr>
      </thead>
    ),
    []
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            {tableHeader}
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(10)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-3 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                          <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-28 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            {tableHeader}
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => {
                const isUpdated = isRecentlyUpdated(post);
                return (
                  <tr
                    key={post._id}
                    className={`hover:bg-gray-50 ${
                      isUpdated
                        ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                        : ""
                    }`}
                  >
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
                          <div className="flex items-center gap-1 flex-wrap mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full min-w-[60px] justify-center ${getTypeBadge(
                                post.type
                              )}`}
                              title={getTypeName(post.type)}
                            >
                              {getTypeName(post.type)}
                            </span>
                            {getCategoryBadge(post.category)}
                            {getPackageBadge(post.package)}
                            {getProjectBadge(post)}
                          </div>
                          <div className="mt-1">
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
                        <Link
                          href={`/admin/quan-ly-nguoi-dung/${post.author._id}`}
                          className="font-medium truncate text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                          title={post.author.username}
                        >
                          {post.author.username}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full min-w-[60px] justify-center ${getStatusBadge(
                          post.status
                        )}`}
                      >
                        {getStatusText(post.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      <div className="flex flex-col">
                        <span>{formatDate(post.updatedAt)}</span>
                        {isUpdated && (
                          <span className="text-xs text-yellow-600 font-medium">
                            User đã sửa
                          </span>
                        )}
                        {getTimeSinceUpdate(post) && (
                          <span className="text-xs text-gray-400">
                            {getTimeSinceUpdate(post)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleViewClick(post)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {/* Approve Button - only for pending posts */}
                        {post.status === "pending" && (
                          <PermissionGuard
                            permission={PERMISSIONS.POST.APPROVE}
                          >
                            <button
                              onClick={() => onApprove(post._id)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Duyệt tin"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          </PermissionGuard>
                        )}

                        {/* Reject Button - only for pending posts */}
                        {post.status === "pending" && (
                          <PermissionGuard permission={PERMISSIONS.POST.REJECT}>
                            <button
                              onClick={() => handleReject(post._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Từ chối"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </PermissionGuard>
                        )}

                        {/* Delete Button - Soft delete for non-deleted posts, hard delete for deleted posts */}
                        <PermissionGuard permission={PERMISSIONS.POST.DELETE}>
                          <button
                            onClick={() => onDelete(post._id, post.status)}
                            className={`transition-colors ${
                              post.status === "deleted"
                                ? "text-red-600 hover:text-red-900"
                                : "text-orange-600 hover:text-orange-900"
                            }`}
                            title={
                              post.status === "deleted"
                                ? "Xóa vĩnh viễn"
                                : "Chuyển vào thùng rác"
                            }
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
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
