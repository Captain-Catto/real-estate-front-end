"use client";
import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCard from "@/components/admin/StatsCard";
import { Pagination } from "@/components/common/Pagination";
import { useAuth } from "@/hooks/useAuth";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  UserStats,
  getUsers,
  getUserStats,
  updateUserStatus,
  deleteUser,
  updateUser,
} from "@/services/userService";
import Link from "next/link";

export default function UserManagementPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);

  // Kiểm tra quyền truy cập - chỉ admin và employee mới được vào
  useEffect(() => {
    if (!accessChecked && user) {
      setAccessChecked(true);

      if (!isAuthenticated) {
        router.push("/dang-nhap");
        return;
      }

      const hasAccess = hasRole(["admin", "employee"]);
      if (!hasAccess) {
        // Nếu không có quyền, chuyển hướng về trang chủ
        router.push("/");
        return;
      }
    }
  }, [hasRole, isAuthenticated, router, user, accessChecked]);

  // Kiểm tra quyền: admin có thể làm tất cả, employee chỉ xem
  const canEdit = user && accessChecked && hasRole("admin");
  const canDelete = user && accessChecked && hasRole("admin");
  const canViewDetails =
    user && accessChecked && hasRole(["admin", "employee"]);

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form data for editing user
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    role: "user" as User["role"],
    status: "active" as User["status"],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        getUsers({
          search: searchTerm || undefined,
          role: selectedRole !== "all" ? selectedRole : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          page: currentPage,
          limit: itemsPerPage,
        }),
        getUserStats(),
      ]);
      console.log("Users Response:", usersResponse);

      if (usersResponse.success) {
        setUsers(usersResponse.data.users);
        if (usersResponse.data.pagination) {
          setTotalPages(usersResponse.data.pagination.totalPages);
        }
      } else {
        console.error("Error fetching users:", usersResponse.message);
        setUsers([]);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        console.error("Error fetching stats:", statsResponse.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole, selectedStatus, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleStatusChange = async (
    userId: string,
    newStatus: User["status"]
  ) => {
    if (!canEdit) return;

    setIsProcessing(true);
    try {
      const result = await updateUserStatus(userId, newStatus);
      console.log("Update User Status Result:", result);
      if (result.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
      } else {
        alert(result.message || "Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !canDelete) return;

    setIsProcessing(true);
    try {
      const result = await deleteUser(userToDelete);
      if (result.success) {
        setUsers(users.filter((user) => user._id !== userToDelete));
        setShowDeleteModal(false);
        setUserToDelete(null);
      } else {
        alert(result.message || "Có lỗi xảy ra khi xóa người dùng");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Có lỗi xảy ra khi xóa người dùng");
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      status: user.status,
    });
    setIsEditMode(true);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !canEdit) return;

    setIsProcessing(true);
    try {
      const result = await updateUser(selectedUser._id, {
        username: editForm.username,
        // email is not included as it should not be modified
        phoneNumber: editForm.phoneNumber || undefined,
        role: editForm.role,
        status: editForm.status,
      });

      if (result.success && result.data && result.data.user) {
        // Update the user in the list
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? result.data!.user! : user
          )
        );
        // Update selected user
        setSelectedUser(result.data.user);
        setIsEditMode(false);
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
    if (selectedUser) {
      setEditForm({
        username: selectedUser.username,
        email: selectedUser.email,
        phoneNumber: selectedUser.phoneNumber || "",
        role: selectedUser.role,
        status: selectedUser.status,
      });
    }
    setIsEditMode(false);
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
                {/* Page Title */}
                <div className="mb-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý người dùng
                      </h1>
                      <p className="text-gray-600">
                        Quản lý tất cả người dùng trên hệ thống
                      </p>
                    </div>
                    {/* Role indicator */}
                    <div className="text-sm text-gray-500">
                      Quyền của bạn:{" "}
                      {hasRole("admin")
                        ? "Quản trị viên (Toàn quyền)"
                        : "Nhân viên (Chỉ xem)"}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatsCard
                    title="Tổng người dùng"
                    value={stats.totalUsers}
                    icon={<UserGroupIcon className="w-6 h-6" />}
                    change="+12%"
                    changeType="increase"
                    color="blue"
                  />
                  <StatsCard
                    title="Đang hoạt động"
                    value={stats.activeUsers}
                    icon={<CheckCircleIcon className="w-6 h-6" />}
                    change="+8%"
                    changeType="increase"
                    color="green"
                  />
                  <StatsCard
                    title="Đã xác thực"
                    value={stats.verifiedUsers}
                    icon={<UserIcon className="w-6 h-6" />}
                    change="+15%"
                    changeType="increase"
                    color="yellow"
                  />
                  <StatsCard
                    title="Mới tháng này"
                    value={stats.newUsersThisMonth}
                    icon={<ClockIcon className="w-6 h-6" />}
                    change="+23%"
                    changeType="increase"
                    color="purple"
                  />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Role Filter */}
                      <div className="min-w-[150px]">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="all">Tất cả vai trò</option>
                          <option value="user">Người dùng</option>
                          <option value="employee">Nhân viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="min-w-[150px]">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="all">Tất cả trạng thái</option>
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Không hoạt động</option>
                          <option value="banned">Đã cấm</option>
                        </select>
                      </div>

                      {/* Items per page */}
                      <div className="min-w-[120px]">
                        <select
                          value={itemsPerPage}
                          onChange={(e) =>
                            setItemsPerPage(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value={5}>5 / trang</option>
                          <option value={10}>10 / trang</option>
                          <option value={20}>20 / trang</option>
                          <option value={50}>50 / trang</option>
                          <option value={100}>100 / trang</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow">
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Người dùng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vai trò
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hoạt động
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
                          {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {user.avatar ? (
                                    <Image
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={user.avatar}
                                      alt={user.username || "User Avatar"}
                                      width={40}
                                      height={40}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <UserIcon className="h-6 w-6 text-gray-600" />
                                    </div>
                                  )}
                                  <div className="ml-4">
                                    <Link
                                      href={`/admin/quan-ly-nguoi-dung/${user._id}`}
                                      className="text-sm font-medium text-gray-900 flex items-center gap-2 hover:text-blue-600"
                                    >
                                      {user.username}
                                      {user.isVerified && (
                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                      )}
                                    </Link>
                                    <div className="text-sm text-gray-500">
                                      {user.email}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {user.phoneNumber}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">
                                  {getRoleText(user.role)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                    user.status
                                  )}`}
                                >
                                  {getStatusText(user.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>
                                  <div>{user.totalPosts} tin đăng</div>
                                  <div>{user.totalTransactions} giao dịch</div>
                                  <div>
                                    {formatCurrency(user.totalSpent || 0)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>
                                  <div>{formatDate(user.createdAt)}</div>
                                  {user.lastLoginAt && (
                                    <div className="text-xs text-gray-400">
                                      Đăng nhập: {formatDate(user.lastLoginAt)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  {/* View button - accessible to both admin and employee */}
                                  {canViewDetails && (
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/admin/quan-ly-nguoi-dung/${user._id}`
                                        )
                                      }
                                      className="p-1 text-blue-600 hover:text-blue-900"
                                      title="Xem chi tiết"
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                  )}

                                  {/* Edit button - only for admin */}
                                  {canEdit && (
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className="p-1 text-green-600 hover:text-green-900"
                                      title="Chỉnh sửa"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                  )}

                                  {/* Status change - only for admin */}
                                  {canEdit && (
                                    <select
                                      value={user.status}
                                      onChange={(e) =>
                                        handleStatusChange(
                                          user._id,
                                          e.target.value as User["status"]
                                        )
                                      }
                                      className="text-xs px-2 py-1 border border-gray-300 rounded"
                                      title="Thay đổi trạng thái"
                                    >
                                      <option value="active">Hoạt động</option>
                                      <option value="inactive">
                                        Không hoạt động
                                      </option>
                                      <option value="banned">Đã cấm</option>
                                    </select>
                                  )}

                                  {/* Delete button - only for admin and not for admin users */}
                                  {canDelete && user.role !== "admin" && (
                                    <button
                                      onClick={() => {
                                        setUserToDelete(user._id);
                                        setShowDeleteModal(true);
                                      }}
                                      className="p-1 text-red-600 hover:text-red-900"
                                      title="Xóa người dùng"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  )}

                                  {/* Show read-only status for employee */}
                                  {!canEdit && (
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                        user.status
                                      )}`}
                                      title="Trạng thái (chỉ xem)"
                                    >
                                      {getStatusText(user.status)}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {!loading && users.length === 0 && (
                    <div className="text-center py-12">
                      <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Không tìm thấy người dùng
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Thử thay đổi bộ lọc để xem kết quả khác.
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {!loading && users.length > 0 && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex justify-center">
                        {/* Pagination Component */}
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          showPages={5}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </main>
            </div>

            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Chi tiết người dùng
                      </h2>
                      <div className="flex items-center gap-2">
                        {/* Edit button for admin only */}
                        {canEdit && selectedUser.role !== "admin" && (
                          <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            {isEditMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowUserModal(false);
                            setIsEditMode(false);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {isEditMode ? (
                        // Edit Form
                        <div className="space-y-4">
                          {/* Avatar and Basic Info */}
                          <div className="flex items-center gap-4 mb-6">
                            {selectedUser.avatar ? (
                              <Image
                                className="h-20 w-20 rounded-full object-cover"
                                src={selectedUser.avatar}
                                alt={selectedUser.username}
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
                                Chỉnh sửa thông tin người dùng
                              </h3>
                              <p className="text-gray-500">
                                Cập nhật thông tin cơ bản của người dùng
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
                                  setEditForm({
                                    ...editForm,
                                    email: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                placeholder="Email không thể thay đổi"
                                disabled
                                readOnly
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
                                <option value="employee">Nhân viên</option>
                                <option value="admin">Quản trị viên</option>
                              </select>
                            </div>

                            {/* Status */}
                            <div>
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
                                <option value="inactive">
                                  Không hoạt động
                                </option>
                                <option value="banned">Đã cấm</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          {/* Avatar and Basic Info */}
                          <div className="flex items-center gap-4">
                            {selectedUser.avatar ? (
                              <Image
                                className="h-20 w-20 rounded-full object-cover"
                                src={selectedUser.avatar}
                                alt={selectedUser.username}
                                width={80}
                                height={80}
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-10 w-10 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                {selectedUser.username}
                                {selectedUser.isVerified && (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                )}
                              </h3>
                              <p className="text-gray-500">
                                {selectedUser.email}
                              </p>
                              <p className="text-gray-500">
                                {selectedUser.phoneNumber}
                              </p>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Thông tin cơ bản
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Vai trò:
                                  </span>
                                  <span className="ml-2 text-gray-900">
                                    {getRoleText(selectedUser.role)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Trạng thái:
                                  </span>
                                  <span
                                    className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                                      selectedUser.status
                                    )}`}
                                  >
                                    {getStatusText(selectedUser.status)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Hoạt động
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Tin đăng:
                                  </span>
                                  <span className="ml-2 text-gray-900">
                                    {selectedUser.totalPosts}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Giao dịch:
                                  </span>
                                  <span className="ml-2 text-gray-900">
                                    {selectedUser.totalTransactions}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Tổng chi tiêu:
                                  </span>
                                  <span className="ml-2 text-gray-900">
                                    {formatCurrency(
                                      selectedUser.totalSpent || 0
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dates */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                              Thời gian
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-500">
                                  Ngày tạo tài khoản:
                                </span>
                                <span className="ml-2 text-gray-900">
                                  {formatDate(selectedUser.createdAt)}
                                </span>
                              </div>
                              {selectedUser.lastLoginAt && (
                                <div>
                                  <span className="text-gray-500">
                                    Đăng nhập lần cuối:
                                  </span>
                                  <span className="ml-2 text-gray-900">
                                    {formatDate(selectedUser.lastLoginAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                      {isEditMode && canEdit ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={isProcessing}
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleSaveUser}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserModal(false);
                            setIsEditMode(false);
                          }}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Đóng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Xác nhận xóa người dùng
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Bạn có chắc chắn muốn xóa người dùng này? Hành động này
                      không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleDeleteUser}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
