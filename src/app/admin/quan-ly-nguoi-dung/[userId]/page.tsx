"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  TrashIcon,
  HomeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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
  bio?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  identityCard?: string;
  bankAccount?: string;
  emergencyContact?: string;
}

interface Post {
  id: string;
  title: string;
  type: "sale" | "rent";
  category: string;
  location: string;
  price: string;
  area: string;
  status: "active" | "pending" | "rejected" | "expired" | "sold";
  priority: "vip" | "premium" | "normal";
  views: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
  description: string;
}

interface Transaction {
  id: string;
  type: "payment" | "refund" | "commission";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  postId?: string;
  postTitle?: string;
}

// Mock service
const UserDetailService = {
  getUserById: async (userId: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock user data
    const users: Record<string, User> = {
      "1": {
        id: "1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        phone: "0901234567",
        avatar: "/api/placeholder/150/150",
        role: "user",
        status: "active",
        isVerified: true,
        createdAt: "2024-01-15T08:30:00.000Z",
        lastLoginAt: "2024-06-15T14:20:00.000Z",
        totalPosts: 12,
        totalTransactions: 5,
        totalSpent: 2500000,
        location: "Hà Nội",
        bio: "Tôi là một người yêu thích bất động sản và đang tìm kiếm cơ hội đầu tư tốt tại Hà Nội.",
        dateOfBirth: "1990-05-15",
        gender: "male",
        address: "123 Đường ABC, Quận Ba Đình, Hà Nội",
        identityCard: "001234567890",
        bankAccount: "1234567890 - VCB",
        emergencyContact: "0987654321 (Nguyễn Thị B - Vợ)",
      },
      "2": {
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
        bio: "Môi giới bất động sản chuyên nghiệp với 5 năm kinh nghiệm tại TP.HCM.",
        dateOfBirth: "1985-08-20",
        gender: "female",
        address: "456 Đường XYZ, Quận 1, TP.HCM",
        identityCard: "002345678901",
        bankAccount: "2345678901 - BIDV",
        emergencyContact: "0976543210 (Trần Văn C - Anh trai)",
      },
    };

    const user = users[userId];
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const posts: Post[] = [
      {
        id: "BDS001",
        title: "Bán căn hộ 2PN Vinhomes Central Park Q.Bình Thạnh",
        type: "sale",
        category: "apartment",
        location: "Quận Bình Thạnh, TP.HCM",
        price: "3500000000",
        area: "75",
        status: "active",
        priority: "vip",
        views: 1245,
        createdAt: "2024-01-20T10:30:00Z",
        updatedAt: "2024-01-20T10:30:00Z",
        images: ["image1.jpg", "image2.jpg"],
        description: "Căn hộ cao cấp view sông, đầy đủ nội thất...",
      },
      {
        id: "BDS002",
        title: "Cho thuê nhà phố 3 tầng tại Quận 7",
        type: "rent",
        category: "house",
        location: "Quận 7, TP.HCM",
        price: "25000000",
        area: "120",
        status: "pending",
        priority: "premium",
        views: 567,
        createdAt: "2024-02-15T14:20:00Z",
        updatedAt: "2024-02-15T14:20:00Z",
        images: ["image3.jpg"],
        description: "Nhà phố mới xây, khu an ninh...",
      },
      {
        id: "BDS003",
        title: "Bán đất nền dự án Saigon Mystery Villas",
        type: "sale",
        category: "land",
        location: "Quận 2, TP.HCM",
        price: "5200000000",
        area: "100",
        status: "sold",
        priority: "normal",
        views: 892,
        createdAt: "2024-01-10T09:15:00Z",
        updatedAt: "2024-03-05T16:30:00Z",
        images: ["image4.jpg", "image5.jpg"],
        description: "Đất nền dự án hot, pháp lý rõ ràng...",
      },
    ];

    return posts.filter((post) => Math.random() > 0.3); // Random filter để simulate
  },

  getUserTransactions: async (userId: string): Promise<Transaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      {
        id: "TXN001",
        type: "payment",
        amount: 500000,
        description: "Thanh toán gói tin VIP - 30 ngày",
        status: "completed",
        createdAt: "2024-06-10T10:30:00Z",
        postId: "BDS001",
        postTitle: "Bán căn hộ 2PN Vinhomes Central Park",
      },
      {
        id: "TXN002",
        type: "payment",
        amount: 200000,
        description: "Thanh toán gói tin Premium - 15 ngày",
        status: "completed",
        createdAt: "2024-06-05T14:20:00Z",
        postId: "BDS002",
        postTitle: "Cho thuê nhà phố 3 tầng",
      },
      {
        id: "TXN003",
        type: "commission",
        amount: 1000000,
        description: "Hoa hồng từ giao dịch thành công",
        status: "pending",
        createdAt: "2024-06-01T09:15:00Z",
        postId: "BDS003",
        postTitle: "Bán đất nền dự án Saigon Mystery",
      },
    ];
  },

  updateUserStatus: async (userId: string, status: User["status"]) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },

  verifyUser: async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "posts" | "transactions">(
    "info"
  );
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [userData, postsData, transactionsData] = await Promise.all([
        UserDetailService.getUserById(userId),
        UserDetailService.getUserPosts(userId),
        UserDetailService.getUserTransactions(userId),
      ]);

      setUser(userData);
      setPosts(postsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Handle error - could redirect to 404 page
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: User["status"]) => {
    if (!user) return;

    try {
      await UserDetailService.updateUserStatus(userId, newStatus);
      setUser({ ...user, status: newStatus });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleVerifyUser = async () => {
    if (!user) return;

    try {
      await UserDetailService.verifyUser(userId);
      setUser({ ...user, isVerified: true });
    } catch (error) {
      console.error("Error verifying user:", error);
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

  const getPostStatusColor = (status: Post["status"]) => {
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

  const getPostStatusText = (status: Post["status"]) => {
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

  const getPriorityIcon = (priority: Post["priority"]) => {
    switch (priority) {
      case "vip":
        return <StarIcon className="w-4 h-4 text-purple-600" />;
      case "premium":
        return <ShieldCheckIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
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
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                        src={user.avatar}
                        alt={user.name}
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
                        {user.name}
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
                        {user.phone}
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
                    onClick={() => setShowEditModal(true)}
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
                    {formatCurrency(user.totalSpent)}
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
                  Tin đăng ({posts.length})
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "transactions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Giao dịch ({transactions.length})
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
                          {user.name}
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
                          {user.phone}
                        </p>
                      </div>
                      {user.dateOfBirth && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Ngày sinh
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(user.dateOfBirth).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      )}
                      {user.gender && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Giới tính
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.gender === "male"
                              ? "Nam"
                              : user.gender === "female"
                              ? "Nữ"
                              : "Khác"}
                          </p>
                        </div>
                      )}
                      {user.bio && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Giới thiệu
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact & Security */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Liên hệ & Bảo mật
                    </h3>
                    <div className="space-y-4">
                      {user.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Địa chỉ
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.address}
                          </p>
                        </div>
                      )}
                      {user.identityCard && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            CMND/CCCD
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.identityCard}
                          </p>
                        </div>
                      )}
                      {user.bankAccount && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Tài khoản ngân hàng
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.bankAccount}
                          </p>
                        </div>
                      )}
                      {user.emergencyContact && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Liên hệ khẩn cấp
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.emergencyContact}
                          </p>
                        </div>
                      )}
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
                      Tin đăng của {user.name}
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
                            <tr key={post.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-12 h-12">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <span className="text-gray-500 text-xs">
                                        IMG
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex items-center gap-2">
                                      {getPriorityIcon(post.priority)}
                                      <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                                        {post.title}
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      #{post.id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="font-medium">
                                    {formatPrice(post.price)}{" "}
                                    {post.type === "sale" ? "VNĐ" : "VNĐ/tháng"}
                                  </div>
                                  <div className="text-gray-500">
                                    {post.area}m² • {post.location}
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
                                      /* View post */
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Xem chi tiết"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      /* Edit post */
                                    }}
                                    className="text-yellow-600 hover:text-yellow-900"
                                    title="Chỉnh sửa"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      /* Delete post */
                                    }}
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
                              key={transaction.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{transaction.id}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {transaction.description}
                                </div>
                                {transaction.postTitle && (
                                  <div className="text-xs text-gray-500">
                                    Tin: {transaction.postTitle}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`text-sm font-medium ${
                                    transaction.type === "payment"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {transaction.type === "payment" ? "-" : "+"}
                                  {formatCurrency(transaction.amount)}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
