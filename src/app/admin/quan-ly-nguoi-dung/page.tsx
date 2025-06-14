"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCard from "@/components/admin/StatsCard";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation"; // Sửa import này

// Types
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "user" | "admin" | "agent";
  status: "active" | "inactive" | "banned";
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalPosts: number;
  totalTransactions: number;
  totalSpent: number;
  location?: string;
}

// Mock data service
const UserService = {
  getUsers: async (filters: any = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUsers: User[] = [
      {
        id: "1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        phone: "0901234567",
        avatar: "/api/placeholder/40/40",
        role: "user",
        status: "active",
        isVerified: true,
        createdAt: "2024-01-15T08:30:00.000Z",
        lastLoginAt: "2024-06-15T14:20:00.000Z",
        totalPosts: 12,
        totalTransactions: 5,
        totalSpent: 2500000,
        location: "Hà Nội",
      },
      {
        id: "2",
        name: "Trần Thị B",
        email: "tranthib@gmail.com",
        phone: "0912345678",
        role: "agent",
        status: "active",
        isVerified: true,
        createdAt: "2024-02-10T10:15:00.000Z",
        lastLoginAt: "2024-06-14T16:45:00.000Z",
        totalPosts: 45,
        totalTransactions: 23,
        totalSpent: 8750000,
        location: "TP.HCM",
      },
      {
        id: "3",
        name: "Lê Văn C",
        email: "levanc@gmail.com",
        phone: "0923456789",
        role: "user",
        status: "inactive",
        isVerified: false,
        createdAt: "2024-03-05T14:22:00.000Z",
        totalPosts: 2,
        totalTransactions: 0,
        totalSpent: 0,
        location: "Đà Nẵng",
      },
      {
        id: "4",
        name: "Admin System",
        email: "admin@batdongsan.com",
        phone: "0934567890",
        role: "admin",
        status: "active",
        isVerified: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLoginAt: "2024-06-15T09:00:00.000Z",
        totalPosts: 0,
        totalTransactions: 0,
        totalSpent: 0,
        location: "Hà Nội",
      },
      {
        id: "5",
        name: "Phạm Thị D",
        email: "phamthid@gmail.com",
        phone: "0945678901",
        role: "user",
        status: "banned",
        isVerified: true,
        createdAt: "2024-04-20T11:30:00.000Z",
        lastLoginAt: "2024-06-10T13:15:00.000Z",
        totalPosts: 8,
        totalTransactions: 2,
        totalSpent: 1200000,
        location: "Cần Thơ",
      },
    ];

    // Apply filters
    let filteredUsers = mockUsers;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.phone.includes(searchTerm)
      );
    }

    if (filters.role && filters.role !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === filters.role
      );
    }

    if (filters.status && filters.status !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filters.status
      );
    }

    return filteredUsers;
  },

  getUserStats: async () => ({
    totalUsers: 1247,
    activeUsers: 1089,
    verifiedUsers: 956,
    newUsersThisMonth: 45,
  }),

  updateUserStatus: async (userId: string, status: User["status"]) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },

  deleteUser: async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },
};

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedRole, selectedStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        UserService.getUsers({
          search: searchTerm,
          role: selectedRole,
          status: selectedStatus,
        }),
        UserService.getUserStats(),
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: User["status"]
  ) => {
    try {
      await UserService.updateUserStatus(userId, newStatus);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await UserService.deleteUser(userToDelete);
      setUsers(users.filter((user) => user.id !== userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1">
        <AdminHeader />

        <main className="p-6">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý người dùng
            </h1>
            <p className="text-gray-600">
              Quản lý tất cả người dùng trên hệ thống
            </p>
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
                    <option value="agent">Môi giới</option>
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
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.avatar}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {user.name}
                                {user.isVerified && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {user.phone}
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
                            <div>{formatCurrency(user.totalSpent)}</div>
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
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/quan-ly-nguoi-dung/${user.id}`
                                )
                              }
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title="Xem chi tiết"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <select
                              value={user.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  user.id,
                                  e.target.value as User["status"]
                                )
                              }
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="active">Hoạt động</option>
                              <option value="inactive">Không hoạt động</option>
                              <option value="banned">Đã cấm</option>
                            </select>
                            {user.role !== "admin" && (
                              <button
                                onClick={() => {
                                  setUserToDelete(user.id);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 text-red-600 hover:text-red-900"
                                title="Xóa người dùng"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
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
          </div>
        </main>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chi tiết người dùng
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                  {selectedUser.avatar ? (
                    <img
                      className="h-20 w-20 rounded-full object-cover"
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon className="h-10 w-10 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      {selectedUser.name}
                      {selectedUser.isVerified && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <p className="text-gray-500">{selectedUser.phone}</p>
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
                        <span className="text-gray-500">Vai trò:</span>
                        <span className="ml-2 text-gray-900">
                          {getRoleText(selectedUser.role)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Trạng thái:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                            selectedUser.status
                          )}`}
                        >
                          {getStatusText(selectedUser.status)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Khu vực:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedUser.location || "Chưa cập nhật"}
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
                        <span className="text-gray-500">Tin đăng:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedUser.totalPosts}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Giao dịch:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedUser.totalTransactions}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tổng chi tiêu:</span>
                        <span className="ml-2 text-gray-900">
                          {formatCurrency(selectedUser.totalSpent)}
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
                      <span className="text-gray-500">Ngày tạo tài khoản:</span>
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
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận xóa người dùng
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa người dùng này? Hành động này không
                thể hoàn tác.
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
    </div>
  );
}
