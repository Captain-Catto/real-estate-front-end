"use client";
import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Pagination } from "@/components/common/Pagination";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  AdminTransactionService,
  AdminPayment,
  AdminPaymentStats,
  AdminPaymentFilters,
} from "@/services/adminTransactionService";
import { toast } from "sonner";

export default function AdminTransactionsPage() {
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
    fetchTransactions();
  }, [fetchTransactions]);

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

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("vi-VN", { hour12: false });

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Tổng giao dịch
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalTransactions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Tổng số tiền
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Nạp tiền
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalTopup)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Thanh toán tin
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalPostPayments)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mã giao dịch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mô tả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày tạo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((payment) => {
                      const transactionType = getTransactionType(payment);
                      return (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm text-gray-900">
                            {payment.orderId}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="font-medium">
                                  {payment.userId?.username || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.userId?.email || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-1 ${transactionType.color}`}
                            >
                              <CurrencyDollarIcon className="w-4 h-4" />
                              {transactionType.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="max-w-xs truncate">
                              {payment.description}
                            </div>
                            {payment.postId?.title && (
                              <div className="text-xs text-blue-600 truncate max-w-xs">
                                Tin: {payment.postId.title}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            <span className="text-green-700">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                                payment.status
                              )}`}
                            >
                              {payment.status === "completed" && (
                                <>
                                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                                  Hoàn thành
                                </>
                              )}
                              {payment.status === "pending" && (
                                <>
                                  <ClockIcon className="w-4 h-4 mr-1" />
                                  Đang xử lý
                                </>
                              )}
                              {payment.status === "failed" && (
                                <>
                                  <XCircleIcon className="w-4 h-4 mr-1" />
                                  Thất bại
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {formatDate(payment.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
