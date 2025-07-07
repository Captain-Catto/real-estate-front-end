"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ArrowLeftIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [transactions, setTransactions] = useState<UserPayment[]>([]);
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  // const [postsLoading, setPostsLoading] = useState(false);
  // const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "info" | "posts" | "transactions" | "logs"
  >("info");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination states
  // const [postsPagination, setPostsPagination] = useState({
  //   currentPage: 1,
  //   totalPages: 1,
  //   totalItems: 0,
  //   itemsPerPage: 10,
  // });
  // const [paymentsPagination, setPaymentsPagination] = useState({
  //   currentPage: 1,
  //   totalPages: 1,
  //   totalItems: 0,
  //   itemsPerPage: 10,
  // });
  const [logsPagination, setLogsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filter states
  // const [postsFilters, setPostsFilters] = useState({
  //   status: "all",
  //   type: "all",
  // });
  // const [paymentsFilters, setPaymentsFilters] = useState({
  //   status: "all",
  // });

  // Form data for editing user
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    role: "user" as User["role"],
    status: "active" as User["status"],
  });

  console.log("User ID from params:", userId);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserById(userId);
      if (result.success && result.data) {
        setUser(result.data.user);
      } else {
        console.error("Error fetching user:", result.message);
        // Handle error - could redirect to 404 page
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Handle error - could redirect to 404 page
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  const fetchUserPosts = useCallback(
    async (page: number = 1) => {
      // setPostsLoading(true);
      try {
        const result = await getUserPosts(userId, {
          page,
          limit: 10,
          // status:
          //   postsFilters.status !== "all" ? postsFilters.status : undefined,
          // type: postsFilters.type !== "all" ? postsFilters.type : undefined,
        });

        if (result.success && result.data) {
          setPosts(result.data.posts);
          // setPostsPagination(result.data.pagination);
        } else {
          console.error("Error fetching user posts:", result.message);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
        setPosts([]);
      } finally {
        // setPostsLoading(false);
      }
    },
    [userId]
  );

  const fetchUserPayments = useCallback(
    async (page: number = 1) => {
      // setPaymentsLoading(true);
      try {
        const result = await getUserPayments(userId, {
          page,
          limit: 10,
          // status:
          //   paymentsFilters.status !== "all"
          //     ? paymentsFilters.status
          //     : undefined,
        });

        if (result.success && result.data) {
          setTransactions(result.data.payments);
          // setPaymentsPagination(result.data.pagination);
        } else {
          console.error("Error fetching user payments:", result.message);
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching user payments:", error);
        setTransactions([]);
      } finally {
        // setPaymentsLoading(false);
      }
    },
    [userId]
  );

  const fetchUserLogs = useCallback(
    async (page: number = 1) => {
      setLogsLoading(true);
      try {
        const result = await getUserLogs(userId, {
          page,
          limit: 10,
        });

        console.log("Fetching user logs:", result);

        if (result.success && result.data) {
          setLogs(result.data.logs);
          setLogsPagination(result.data.pagination);
        } else {
          console.error("Error fetching user logs:", result.message);
          setLogs([]);
        }
      } catch (error) {
        console.error("Error fetching user logs:", error);
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    },
    [userId]
  );

  // Load posts when activeTab changes to "posts" or filters change
  useEffect(() => {
    if (activeTab === "posts" && userId) {
      fetchUserPosts(1);
    }
  }, [activeTab, userId, fetchUserPosts]);

  // Load payments when activeTab changes to "transactions" or filters change
  useEffect(() => {
    if (activeTab === "transactions" && userId) {
      fetchUserPayments(1);
    }
  }, [activeTab, userId, fetchUserPayments]);

  // Load logs when activeTab changes to "logs"
  useEffect(() => {
    if (activeTab === "logs" && userId) {
      fetchUserLogs(1);
    }
  }, [activeTab, userId, fetchUserLogs]);

  console.log("User data:", user);

  const handleStatusChange = async (newStatus: User["status"]) => {
    if (!user) return;

    try {
      const result = await updateUserStatus(user._id, newStatus);
      if (result.success) {
        setUser({ ...user, status: newStatus });
      } else {
        console.error("Error updating user status:", result.message);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleVerifyUser = async () => {
    if (!user) return;

    try {
      // For now, we'll update the user locally
      // This should be replaced with a real API call when available
      setUser({ ...user, isVerified: true });
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  };

  // Handle edit user
  const handleEditUser = () => {
    if (!user) return;

    setEditForm({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const result = await updateUser(user._id, {
        username: editForm.username,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber || undefined,
        role: editForm.role,
        status: editForm.status,
      });

      if (result.success && result.data) {
        setUser(result.data.user);
        setShowEditModal(false);
        alert("Cập nhật thông tin người dùng thành công!");
      } else {
        alert(result.message || "Có lỗi xảy ra khi cập nhật thông tin");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        status: user.status,
      });
    }
    setShowEditModal(false);
  };

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

  const formatDetailedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Vừa xong";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days < 7) {
        return `${days} ngày trước`;
      } else {
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
  };

  const formatPrice = (price: string) => {
    const num = parseInt(price);
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)} tỷ`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} tr`;
    }
    return num.toLocaleString();
  };

  const getRoleText = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "agent":
        return "Môi giới";
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

  const getPostStatusColor = (status: UserPost["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPostStatusText = (status: UserPost["status"]) => {
    switch (status) {
      case "active":
        return "Đang hiển thị";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Bị từ chối";
      case "expired":
        return "Hết hạn";
      case "sold":
        return "Đã bán";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không tìm thấy người dùng
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Người dùng này không tồn tại hoặc đã bị xóa.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1">
        <AdminHeader />

        <main className="p-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Quay lại danh sách người dùng
            </button>
          </div>

          {/* User Header */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* User Info */}
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div>
                    {user.avatar ? (
                      <Image
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                        src={user.avatar}
                        alt={user.username}
                        width={96}
                        height={96}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                        <UserIcon className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.username}
                      </h1>
                      {user.isVerified && (
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="h-4 w-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <PhoneIcon className="h-4 w-4" />
                        {user.phoneNumber}
                      </div>
                      {user.location && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {user.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {getStatusText(user.status)}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getRoleText(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col lg:flex-row gap-3">
                  {!user.isVerified && (
                    <button
                      onClick={handleVerifyUser}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Xác thực
                    </button>
                  )}

                  <select
                    value={user.status}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as User["status"])
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="banned">Đã cấm</option>
                  </select>

                  <button
                    onClick={handleEditUser}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tin đăng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.totalPosts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Giao dịch</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.totalTransactions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <HomeIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng chi tiêu
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(user.totalSpent || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100">
                  <CalendarIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Thành viên từ
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "info"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Thông tin chi tiết
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "posts"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Tin đăng
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "transactions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Giao dịch
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "logs"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Lịch sử thay đổi
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* User Info Tab */}
              {activeTab === "info" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Thông tin cá nhân
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Họ và tên
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user.username}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Số điện thoại
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user.phoneNumber || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Security */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Thông tin hệ thống
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Ngày tạo tài khoản
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                      {user.lastLoginAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Đăng nhập lần cuối
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(user.lastLoginAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === "posts" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Tin đăng của {user.username}
                    </h3>
                  </div>

                  {posts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tin đăng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thông tin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {posts.map((post) => (
                            <tr key={post._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-12 h-12">
                                    {post.images && post.images.length > 0 ? (
                                      <Image
                                        src={post.images[0]}
                                        alt={post.title}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">
                                          IMG
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                                        {post.title}
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      #{post._id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="font-medium">
                                    {formatPrice(post.price.toString())}{" "}
                                    {post.type === "ban" ? "VNĐ" : "VNĐ/tháng"}
                                  </div>
                                  <div className="text-gray-500">
                                    {post.area}m² • {post.location.province},{" "}
                                    {post.location.district}
                                  </div>
                                  <div className="text-gray-500">
                                    {post.views.toLocaleString()} lượt xem
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPostStatusColor(
                                    post.status
                                  )}`}
                                >
                                  {getPostStatusText(post.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(post.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => {
                                      window.open(
                                        `/du-an/${post._id}`,
                                        "_blank"
                                      );
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Xem chi tiết"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Chưa có tin đăng nào
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Người dùng này chưa đăng tin nào.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === "transactions" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Lịch sử giao dịch
                    </h3>
                  </div>

                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mã giao dịch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mô tả
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày giao dịch
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr
                              key={transaction._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{transaction.orderId}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {transaction.description}
                                </div>
                                {transaction.postId && (
                                  <div className="text-xs text-gray-500">
                                    Tin: {transaction.postId.title}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency(transaction.amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {transaction.paymentMethod}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    transaction.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : transaction.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {transaction.status === "completed"
                                    ? "Hoàn thành"
                                    : transaction.status === "pending"
                                    ? "Đang xử lý"
                                    : "Thất bại"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Chưa có giao dịch nào
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Người dùng này chưa thực hiện giao dịch nào.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === "logs" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Lịch sử thay đổi
                    </h3>
                    <div className="text-sm text-gray-500">
                      Theo dõi tất cả thay đổi thông tin người dùng
                    </div>
                  </div>

                  {logsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : logs.length > 0 ? (
                    <div className="space-y-4">
                      {logs.map((log) => (
                        <div
                          key={log._id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Action Header */}
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  {log.action === "updated" && (
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <PencilIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                  )}
                                  {log.action === "statusChanged" && (
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                                    </div>
                                  )}
                                  {log.action === "created" && (
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <UserIcon className="w-4 h-4 text-green-600" />
                                    </div>
                                  )}
                                  {log.action === "deleted" && (
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                      <XCircleIcon className="w-4 h-4 text-red-600" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {log.action === "updated" && "Cập nhật thông tin"}
                                      {log.action === "statusChanged" && "Thay đổi trạng thái"}
                                      {log.action === "created" && "Tạo tài khoản"}
                                      {log.action === "deleted" && "Xóa tài khoản"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatDetailedDate(log.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Changed By Info */}
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">Thực hiện bởi:</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-600">
                                        {log.changedBy?.username?.charAt(0).toUpperCase() || "?"}
                                      </span>
                                    </div>
                                    <span className="font-medium text-gray-900">
                                      {log.changedBy?.username || "Hệ thống"}
                                    </span>
                                    <span className="text-gray-500">
                                      ({log.changedBy?.email})
                                    </span>
                                    <span
                                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                        log.changedBy?.role === "admin"
                                          ? "bg-red-100 text-red-800"
                                          : log.changedBy?.role === "employee"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {log.changedBy?.role === "admin" && "Quản trị viên"}
                                      {log.changedBy?.role === "employee" && "Nhân viên"}
                                      {log.changedBy?.role === "agent" && "Môi giới"}
                                      {log.changedBy?.role === "user" && "Người dùng"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Changes Detail */}
                              {log.changes && Object.keys(log.changes).length > 0 && (
                                <div className="bg-gray-50 rounded-md p-3">
                                  <div className="text-sm font-medium text-gray-700 mb-2">
                                    Chi tiết thay đổi:
                                  </div>
                                  <div className="space-y-2">
                                    {Object.entries(log.changes).map(([field, change]) => (
                                      <div key={field} className="text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-900 capitalize">
                                            {field === "username" && "Tên người dùng"}
                                            {field === "email" && "Email"}
                                            {field === "phoneNumber" && "Số điện thoại"}
                                            {field === "role" && "Vai trò"}
                                            {field === "status" && "Trạng thái"}
                                            {!["username", "email", "phoneNumber", "role", "status"].includes(field) && field}
                                          </span>
                                        </div>
                                        <div className="ml-4 flex items-center gap-2 text-sm">
                                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                            {String(change.from || "(trống)")}
                                          </span>
                                          <span className="text-gray-400">→</span>
                                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                            {String(change.to || "(trống)")}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Details */}
                              {/* {log.details && (
                                <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                  <span className="font-medium">Ghi chú:</span> {log.details}
                                </div>
                              )} */}

                              {/* Technical Info */}
                              {/* {(log.ipAddress || log.userAgent) && (
                                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded space-y-1">
                                  {log.ipAddress && (
                                    <div>
                                      <span className="font-medium">IP Address:</span> {log.ipAddress}
                                    </div>
                                  )}
                                  {log.userAgent && (
                                    <div>
                                      <span className="font-medium">Device:</span> {
                                        log.userAgent.includes('Mobile') ? '📱 Mobile' :
                                        log.userAgent.includes('Tablet') ? '📱 Tablet' :
                                        log.userAgent.includes('Windows') ? '💻 Windows' :
                                        log.userAgent.includes('Mac') ? '🖥️ Mac' :
                                        log.userAgent.includes('Android') ? '📱 Android' :
                                        log.userAgent.includes('iPhone') ? '📱 iPhone' :
                                        '💻 Desktop'
                                      }
                                    </div>
                                  )}
                                </div>
                              )} */}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Logs Pagination */}
                      {logsPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                          <div className="flex flex-1 justify-between sm:hidden">
                            <button
                              onClick={() => {
                                if (logsPagination.currentPage > 1) {
                                  fetchUserLogs(logsPagination.currentPage - 1);
                                }
                              }}
                              disabled={logsPagination.currentPage <= 1}
                              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Trước
                            </button>
                            <button
                              onClick={() => {
                                if (logsPagination.currentPage < logsPagination.totalPages) {
                                  fetchUserLogs(logsPagination.currentPage + 1);
                                }
                              }}
                              disabled={logsPagination.currentPage >= logsPagination.totalPages}
                              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Sau
                            </button>
                          </div>
                          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-gray-700">
                                Hiển thị{" "}
                                <span className="font-medium">
                                  {(logsPagination.currentPage - 1) * logsPagination.itemsPerPage + 1}
                                </span>{" "}
                                đến{" "}
                                <span className="font-medium">
                                  {Math.min(
                                    logsPagination.currentPage * logsPagination.itemsPerPage,
                                    logsPagination.totalItems
                                  )}
                                </span>{" "}
                                trong tổng số{" "}
                                <span className="font-medium">{logsPagination.totalItems}</span> bản ghi
                              </p>
                            </div>
                            <div>
                              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                <button
                                  onClick={() => {
                                    if (logsPagination.currentPage > 1) {
                                      fetchUserLogs(logsPagination.currentPage - 1);
                                    }
                                  }}
                                  disabled={logsPagination.currentPage <= 1}
                                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="sr-only">Trang trước</span>
                                  <ArrowLeftIcon className="h-5 w-5" />
                                </button>
                                {Array.from({ length: logsPagination.totalPages }, (_, i) => i + 1)
                                  .filter(
                                    (page) =>
                                      page === 1 ||
                                      page === logsPagination.totalPages ||
                                      Math.abs(page - logsPagination.currentPage) <= 1
                                  )
                                  .map((page, index, visiblePages) => {
                                    const showDots =
                                      index > 0 && visiblePages[index - 1] !== page - 1;
                                    return (
                                      <React.Fragment key={page}>
                                        {showDots && (
                                          <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                            ...
                                          </span>
                                        )}
                                        <button
                                          onClick={() => fetchUserLogs(page)}
                                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                            page === logsPagination.currentPage
                                              ? "bg-blue-600 text-white hover:bg-blue-500"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {page}
                                        </button>
                                      </React.Fragment>
                                    );
                                  })}
                                <button
                                  onClick={() => {
                                    if (logsPagination.currentPage < logsPagination.totalPages) {
                                      fetchUserLogs(logsPagination.currentPage + 1);
                                    }
                                  }}
                                  disabled={logsPagination.currentPage >= logsPagination.totalPages}
                                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="sr-only">Trang sau</span>
                                  <ArrowLeftIcon className="h-5 w-5 rotate-180" />
                                </button>
                              </nav>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Chưa có lịch sử thay đổi
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Chưa có bản ghi thay đổi nào cho người dùng này.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit User Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Chỉnh sửa thông tin người dùng
                    </h2>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-4 mb-6">
                      {user?.avatar ? (
                        <Image
                          className="h-20 w-20 rounded-full object-cover"
                          src={user.avatar}
                          alt={user.username}
                          width={80}
                          height={80}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-10 w-10 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Cập nhật thông tin của {user?.username}
                        </h3>
                        <p className="text-gray-500">
                          Chỉnh sửa thông tin cơ bản của người dùng
                        </p>
                      </div>
                    </div>

                    {/* Edit Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên người dùng
                        </label>
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              username: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập tên người dùng"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập email"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={editForm.phoneNumber}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      {/* Role */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="user">Người dùng</option>
                          <option value="agent">Môi giới</option>
                          <option value="employee">Nhân viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              status: e.target.value as User["status"],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Không hoạt động</option>
                          <option value="banned">Đã cấm</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSaveUser}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                      )}
                      {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      disabled={isProcessing}
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
