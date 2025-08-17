"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  UserIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  HomeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  User,
  getUserById,
  updateUser,
  updateUserStatus,
  getUserPosts,
  getUserPayments,
  getUserLogs,
  UserPost,
  UserPayment,
  UserLog,
} from "@/services/userService";
import { locationService } from "@/services/locationService";
import AdminGuard from "@/components/auth/AdminGuard";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import UserContactTab from "@/components/admin/UserContactTab";

// Trang chi tiết người dùng với kiểm tra quyền truy cập
function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [transactions, setTransactions] = useState<UserPayment[]>([]);
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "posts" | "transactions" | "logs" | "contacts"
  >("posts");

  // Location names cache
  const [locationNames, setLocationNames] = useState<Map<string, string>>(
    new Map()
  );

  // Pagination states
  const [postsPage, setPostsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  // Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    role: "user" as User["role"],
    status: "active" as User["status"],
  });

  // Fetch user data
  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getUserById(userId);
      if (response.success && response.data) {
        setUser(response.data.user);
        setEditForm({
          username: response.data.user.username,
          email: response.data.user.email,
          phoneNumber: response.data.user.phoneNumber || "",
          role: response.data.user.role,
          status: response.data.user.status,
        });
      } else {
        toast.error("Không thể tải thông tin người dùng");
        router.push("/admin/quan-ly-nguoi-dung");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải thông tin người dùng");
      router.push("/admin/quan-ly-nguoi-dung");
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  // Fetch user posts
  const fetchPosts = useCallback(async () => {
    if (!userId) return;

    setPostsLoading(true);
    try {
      const response = await getUserPosts(userId, {
        page: postsPage,
        limit: 10,
      });
      if (response.success) {
        setPosts(response.data.posts);
        setPostsTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải bài viết");
    } finally {
      setPostsLoading(false);
    }
  }, [userId, postsPage]);

  // Fetch user transactions
  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    setTransactionsLoading(true);
    try {
      const response = await getUserPayments(userId, {
        page: transactionsPage,
        limit: 10,
      });
      if (response.success) {
        setTransactions(response.data.payments);
        setTransactionsTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải giao dịch");
    } finally {
      setTransactionsLoading(false);
    }
  }, [userId, transactionsPage]);

  // Fetch user logs
  const fetchLogs = useCallback(async () => {
    if (!userId) return;

    setLogsLoading(true);
    try {
      const response = await getUserLogs(userId, { page: logsPage, limit: 10 });
      if (response.success) {
        setLogs(response.data.logs);
        setLogsTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải nhật ký");
    } finally {
      setLogsLoading(false);
    }
  }, [userId, logsPage]);

  // Get location name from cache or fetch
  const getLocationName = useCallback(
    async (
      provinceCode?: string,
      districtCode?: string,
      wardCode?: string
    ): Promise<string> => {
      if (!provinceCode) return "Không xác định";

      const cacheKey = `${provinceCode}-${districtCode || ""}-${
        wardCode || ""
      }`;

      // Check cache first
      if (locationNames.has(cacheKey)) {
        return locationNames.get(cacheKey)!;
      }

      try {
        // Use locationService to get names
        const locationNamesData = await locationService.getLocationNames(
          provinceCode,
          wardCode
        );

        let fullAddress = "";
        if (locationNamesData.wardName && locationNamesData.provinceName) {
          fullAddress = `${locationNamesData.wardName}, ${locationNamesData.provinceName}`;
        } else if (locationNamesData.provinceName) {
          fullAddress = locationNamesData.provinceName;
        } else {
          fullAddress = provinceCode;
        }

        // Cache the result
        setLocationNames((prev) => new Map(prev.set(cacheKey, fullAddress)));
        return fullAddress;
      } catch {
        toast.error("Có lỗi xảy ra khi lấy tên địa điểm");
        const fallback = `${wardCode || districtCode || provinceCode}`;
        setLocationNames((prev) => new Map(prev.set(cacheKey, fallback)));
        return fallback;
      }
    },
    [locationNames, setLocationNames]
  );

  // Load initial data
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Load tab data when tab changes
  useEffect(() => {
    if (activeTab === "posts") {
      fetchPosts();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    } else if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, fetchPosts, fetchTransactions, fetchLogs]);

  // Handle user update
  const handleSaveUser = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const response = await updateUser(user._id, {
        username: editForm.username,
        phoneNumber: editForm.phoneNumber || undefined,
        role: editForm.role,
        status: editForm.status,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi cập nhật");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: User["status"]) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const response = await updateUserStatus(user._id, newStatus);
      if (response.success) {
        setUser({ ...user, status: newStatus });
        setEditForm({ ...editForm, status: newStatus });
        toast.success("Cập nhật trạng thái thành công");
      } else {
        toast.error(
          response.message || "Có lỗi xảy ra khi cập nhật trạng thái"
        );
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  const getRoleText = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "employee":
        return "Nhân viên";
      case "user":
        return "Người dùng";
      default:
        return role;
    }
  };

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "banned":
        return "Đã cấm";
      default:
        return status;
    }
  };

  const getPostStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Location Display Component
  const LocationDisplay = ({
    location,
    fallback = "Không xác định",
  }: {
    location?: {
      province?: string;
      district?: string;
      ward?: string;
      address?: string;
    };
    fallback?: string;
  }) => {
    const [displayName, setDisplayName] = useState<string>(fallback);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const fetchLocationName = async () => {
        if (!location?.province) {
          setDisplayName(fallback);
          return;
        }

        setIsLoading(true);
        try {
          const name = await getLocationName(
            location.province,
            location.district,
            location.ward
          );
          let fullAddress = name;

          // Thêm địa chỉ cụ thể nếu có
          if (location.address && location.address.trim()) {
            fullAddress = `${location.address}, ${name}`;
          }

          setDisplayName(fullAddress);
        } catch {
          toast.error("Có lỗi xảy ra khi lấy tên địa điểm");
          setDisplayName(fallback);
        } finally {
          setIsLoading(false);
        }
      };

      fetchLocationName();
    }, [location, fallback]);

    if (isLoading) {
      return <span className="text-gray-400">⏳</span>;
    }

    return (
      <span title={displayName} className="truncate max-w-xs inline-block">
        {displayName}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết người dùng">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="Không tìm thấy người dùng">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không tìm thấy người dùng
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Người dùng không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/quan-ly-nguoi-dung"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Chi tiết: ${user.username}`}>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/admin/quan-ly-nguoi-dung"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Quay lại danh sách người dùng
        </Link>
      </div>

      {/* User Overview Card */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user.avatar ? (
                <Image
                  className="h-16 w-16 rounded-full object-cover"
                  src={user.avatar}
                  alt={user.username}
                  width={64}
                  height={64}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {user.username}
                  {user.isVerified && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  )}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    {user.email}
                  </span>
                  {user.phoneNumber && (
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4" />
                      {user.phoneNumber}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">
                    {getRoleText(user.role)}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      user.status
                    )}`}
                  >
                    {getStatusText(user.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <PermissionGuard permission={PERMISSIONS.USER.EDIT}>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
                </button>
              </PermissionGuard>

              <PermissionGuard permission={PERMISSIONS.USER.CHANGE_STATUS}>
                <select
                  value={user.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as User["status"])
                  }
                  disabled={isProcessing}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="banned">Đã cấm</option>
                </select>
              </PermissionGuard>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <PermissionGuard permission={PERMISSIONS.USER.EDIT}>
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as User["role"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">Người dùng</option>
                    <option value="employee">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </PermissionGuard>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng tin đăng
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {user.totalPosts || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng giao dịch
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {user.totalTransactions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng chi tiêu
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(user.totalSpent || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ngày tham gia
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(user.createdAt)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { key: "posts", label: "Tin đăng", icon: HomeIcon },
              {
                key: "transactions",
                label: "Giao dịch",
                icon: CurrencyDollarIcon,
              },
              { key: "logs", label: "Lịch sử", icon: DocumentTextIcon },
              { key: "contacts", label: "Lịch sử liên hệ", icon: PhoneIcon },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div>
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <HomeIcon className="h-4 w-4 text-blue-500" />
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {post.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                post.type === "ban"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {post.type === "ban" ? "Bán" : "Cho thuê"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            📍{" "}
                            <LocationDisplay
                              location={post.location}
                              fallback="Không xác định địa chỉ"
                            />{" "}
                            • {post.category}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1 font-medium text-green-600">
                              💰 {formatCurrency(post.price)}
                            </span>
                            <span className="flex items-center gap-1">
                              📏 {post.area} m²
                            </span>
                            <span className="flex items-center gap-1">
                              👁️ {post.views || 0} lượt xem
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPostStatusColor(
                              post.status
                            )}`}
                          >
                            {post.status === "active"
                              ? "Hoạt động"
                              : post.status === "pending"
                              ? "Chờ duyệt"
                              : post.status === "rejected"
                              ? "Từ chối"
                              : post.status === "expired"
                              ? "Hết hạn"
                              : post.status === "deleted"
                              ? "Đã xóa"
                              : post.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/quan-ly-tin-dang/${post._id}`}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors group flex items-center gap-1"
                              title="Xem chi tiết tin đăng"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span className="text-xs">Chi tiết</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {postsTotalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        currentPage={postsPage}
                        totalPages={postsTotalPages}
                        onPageChange={setPostsPage}
                        showPages={5}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <HomeIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có tin đăng nào
                  </h3>
                  <p className="text-sm text-gray-500">
                    Người dùng này chưa đăng tin bất động sản nào.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CurrencyDollarIcon className="h-4 w-4 text-blue-500" />
                            <h3 className="text-sm font-medium text-gray-900">
                              Giao dịch #{transaction.orderId}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(transaction.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              💳 {transaction.paymentMethod || "N/A"}
                            </span>
                            {transaction.postId && (
                              <span className="flex items-center gap-1">
                                🏠 {transaction.postId.title}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {formatCurrency(transaction.amount)}
                          </div>
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getTransactionStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status === "completed"
                              ? "Thành công"
                              : transaction.status === "pending"
                              ? "Đang xử lý"
                              : transaction.status === "failed"
                              ? "Thất bại"
                              : transaction.status}
                          </span>
                          {transaction.completedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Hoàn thành: {formatDate(transaction.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {transactionsTotalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        currentPage={transactionsPage}
                        totalPages={transactionsTotalPages}
                        onPageChange={setTransactionsPage}
                        showPages={5}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có giao dịch nào
                  </h3>
                  <p className="text-sm text-gray-500">
                    Người dùng này chưa thực hiện giao dịch thanh toán nào.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div>
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log._id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <DocumentTextIcon className="h-4 w-4 text-purple-500" />
                            <h3 className="text-sm font-medium text-gray-900">
                              {log.action === "created"
                                ? "Tạo mới"
                                : log.action === "updated"
                                ? "Cập nhật"
                                : log.action === "statusChanged"
                                ? "Thay đổi trạng thái"
                                : log.action === "deleted"
                                ? "Xóa"
                                : log.action}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {log.details || "Không có chi tiết"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(log.createdAt)}
                            </span>
                            {log.changedBy && (
                              <span className="flex items-center gap-1">
                                👤 {log.changedBy.username} (
                                {log.changedBy.role})
                              </span>
                            )}
                          </div>
                          {log.changes &&
                            Object.keys(log.changes).length > 0 && (
                              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Thay đổi:
                                </p>
                                <div className="space-y-1">
                                  {Object.entries(log.changes).map(
                                    ([field, change]) => (
                                      <div
                                        key={field}
                                        className="text-xs text-gray-600"
                                      >
                                        <span className="font-medium">
                                          {field}:
                                        </span>{" "}
                                        <span className="text-red-600">
                                          &quot;{String(change.from)}&quot;
                                        </span>{" "}
                                        →{" "}
                                        <span className="text-green-600">
                                          &quot;{String(change.to)}&quot;
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                        <div className="ml-4">
                          <div
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              log.action === "created"
                                ? "bg-green-100 text-green-800"
                                : log.action === "updated"
                                ? "bg-blue-100 text-blue-800"
                                : log.action === "statusChanged"
                                ? "bg-yellow-100 text-yellow-800"
                                : log.action === "deleted"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.action === "created"
                              ? "Tạo mới"
                              : log.action === "updated"
                              ? "Cập nhật"
                              : log.action === "statusChanged"
                              ? "Thay đổi"
                              : log.action === "deleted"
                              ? "Xóa"
                              : log.action}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {logsTotalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        currentPage={logsPage}
                        totalPages={logsTotalPages}
                        onPageChange={setLogsPage}
                        showPages={5}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Chưa có lịch sử hoạt động
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Các thay đổi đối với tài khoản này sẽ được hiển thị ở đây.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <div>
              <UserContactTab userId={userId} username={user?.username} />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Wrap with PagePermissionGuard

// Wrap component with AdminGuard
export default function ProtectedUserDetailPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.USER.VIEW]}>
      <UserDetailPage />
    </AdminGuard>
  );
}
