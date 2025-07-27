"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Pagination } from "@/components/common/Pagination";
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  AdminTransactionService,
  AdminPayment,
  AdminPaymentStats,
  AdminPaymentFilters,
} from "@/services/adminTransactionService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AdminTransactionsPage() {
  const { hasRole, isAuthenticated, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [transactions, setTransactions] = useState<AdminPayment[]>([]);
  const [stats, setStats] = useState<AdminPaymentStats | null>(null);
  const [filters, setFilters] = useState<AdminPaymentFilters>({
    page: 1,
    limit: 20,
    search: "",
    status: "all",
    type: "all",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Authentication check
  useEffect(() => {
    if (user !== undefined) {
      setAccessChecked(true);
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AdminTransactionService.getAllPayments({
        ...filters,
        page: currentPage,
      });

      console.log("Fetched transactions:", response);

      if (response.success) {
        setTransactions(response.data.payments);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.totalPages);

        // Debug: Log sample descriptions to see what's in the data
        if (response.data.payments.length > 0) {
          console.log(
            "📝 Sample descriptions:",
            response.data.payments.slice(0, 5).map((p) => ({
              id: p._id,
              description: p.description,
              type: getTransactionType(p),
            }))
          );
        }
      } else {
        console.error("Failed to fetch transactions");
        toast.error("Không thể tải danh sách giao dịch");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Có lỗi xảy ra khi tải giao dịch");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    if (user && accessChecked && isAuthenticated && hasRole("admin")) {
      fetchTransactions();
    }
  }, [fetchTransactions, user, accessChecked, isAuthenticated, hasRole]);

  const handleSearch = (searchTerm: string) => {
    console.log("🔍 Search triggered with term:", searchTerm);
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const handleTypeFilter = (type: string) => {
    setFilters((prev) => ({ ...prev, type }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters((prev) => ({ ...prev, limit: newLimit }));
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Math.abs(amount));

  const getStatusBadge = (status: string) => {
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

  const getTransactionType = (payment: AdminPayment) => {
    const description = payment.description.toLowerCase();
    // Check for topup keywords (both with and without Vietnamese accents)
    if (
      description.includes("nạp") ||
      description.includes("nap") ||
      description.includes("topup") ||
      description.includes("nạp tiền") ||
      description.includes("nap tien")
    ) {
      return { type: "topup", label: "Nạp tiền", color: "text-green-700" };
    }
    if (payment.postId) {
      return {
        type: "post_payment",
        label: "Thanh toán tin",
        color: "text-red-700",
      };
    }
    return { type: "other", label: "Khác", color: "text-gray-700" };
  };

  if (!accessChecked) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa đăng nhập
              </h2>
              <p className="text-gray-600">
                Vui lòng đăng nhập để truy cập trang này.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hasRole("admin")) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Không có quyền truy cập
              </h2>
              <p className="text-gray-600">
                Bạn không có quyền truy cập vào trang này.
              </p>
            </div>
          </main>
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý giao dịch
            </h1>
            <p className="text-gray-600">
              Xem và tìm kiếm các giao dịch của người dùng
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Tổng giao dịch
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.totalTransactions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Tổng số tiền
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(stats.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Nạp tiền
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(stats.totalTopup)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      Thanh toán tin
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(stats.totalPostPayments)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mã giao dịch, tên, email..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Tất cả loại</option>
                <option value="topup">Nạp tiền</option>
                <option value="post_payment">Thanh toán tin</option>
              </select>

              <select
                value={filters.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value={5}>5 mục/trang</option>
                <option value={10}>10 mục/trang</option>
                <option value={20}>20 mục/trang</option>
                <option value={50}>50 mục/trang</option>
                <option value={100}>100 mục/trang</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="animate-fade-in">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Mã giao dịch
                        </th>
                        <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Người dùng
                        </th>
                        <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Loại
                        </th>
                        <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Mô tả
                        </th>
                        <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Số tiền
                        </th>
                        <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Trạng thái
                        </th>
                        <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ngày tạo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((payment) => {
                        const transactionType = getTransactionType(payment);
                        return (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td
                              className="px-3 py-3 font-mono text-xs text-gray-900 truncate"
                              title={payment.orderId}
                            >
                              {payment.orderId}
                            </td>
                            <td className="px-3 py-3">
                              {payment.userId ? (
                                <Link
                                  href={`/admin/quan-ly-nguoi-dung/${payment.userId._id}`}
                                  className="block hover:bg-blue-50 rounded p-1 -m-1 transition-colors"
                                >
                                  <div
                                    className="text-xs font-medium truncate text-blue-600 hover:text-blue-800"
                                    title={payment.userId.username || "N/A"}
                                  >
                                    {payment.userId.username || "N/A"}
                                  </div>
                                  <div
                                    className="text-xs text-gray-500 truncate"
                                    title={payment.userId.email || "N/A"}
                                  >
                                    {payment.userId.email || "N/A"}
                                  </div>
                                </Link>
                              ) : (
                                <div>
                                  <div className="text-xs font-medium truncate text-gray-400">
                                    N/A
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    N/A
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              <span
                                className={`${transactionType.color} font-medium`}
                              >
                                {transactionType.label}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div
                                className="truncate"
                                title={payment.description}
                              >
                                {payment.description}
                              </div>
                              {payment.postId?.title && (
                                <div
                                  className="text-xs text-blue-600 truncate"
                                  title={`Tin: ${payment.postId.title}`}
                                >
                                  Tin: {payment.postId.title}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 text-xs font-semibold">
                              <span className="text-green-700">
                                {formatCurrency(payment.amount)}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                                  payment.status
                                )}`}
                              >
                                {payment.status === "completed" && "Hoàn thành"}
                                {payment.status === "pending" && "Đang xử lý"}
                                {payment.status === "failed" && "Thất bại"}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500">
                              <div>
                                {new Date(payment.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                              <div>
                                {new Date(payment.createdAt).toLocaleTimeString(
                                  "vi-VN",
                                  {
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Không có giao dịch nào
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Không tìm thấy giao dịch phù hợp với bộ lọc.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
