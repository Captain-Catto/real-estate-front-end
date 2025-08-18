"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import { Pagination } from "@/components/common/Pagination";
import UserHeader from "@/components/user/UserHeader";
import { useAuth } from "@/store/hooks";
import { useSearchParams } from "next/navigation";
import { paymentService, PaymentFilterParams } from "@/services/paymentService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { showErrorToast } from "@/utils/errorHandler";

interface Transaction {
  _id: string;
  userId: string;
  postId?: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  description: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  type?: string;
  packageId?: string;
  packageName?: string;
}
import "react-datepicker/dist/react-datepicker.css";

function LichSuGiaoDichPageInternal() {
  const { user, isAuthenticated, loading } = useAuth();
  const searchParams = useSearchParams();

  // Read initial filter values from URL
  const initialSearchQuery = searchParams.get("search") || "";
  const initialDateFilter = searchParams.get("dateRange") || "all";
  const initialStatusFilter = searchParams.get("status") || "all";
  const initialTypeFilter = searchParams.get("type") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1");

  // Set up initial date range if specified in URL
  const initialFromDate = searchParams.get("fromDate");
  const initialToDate = searchParams.get("toDate");

  // User data from auth context
  const userData = {
    name: user?.username || "Người dùng",
    avatar: (user?.username?.[0] || "U").toUpperCase(),
    balance: "0₫",
    greeting: "Xin chào",
    verified: false,
  };

  // Transaction history state
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [dateFilter, setDateFilter] = useState(initialDateFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState({
    fromDate: initialFromDate ? new Date(initialFromDate) : null,
    toDate: initialToDate ? new Date(initialToDate) : null,
  });

  // API data state
  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filter options
  const dateFilterOptions = [
    { value: "all", label: "Tất cả thời gian" },
    { value: "7days", label: "7 ngày qua" },
    { value: "30days", label: "30 ngày qua" },
    { value: "90days", label: "3 tháng qua" },
    { value: "thisMonth", label: "Tháng này" },
    { value: "lastMonth", label: "Tháng trước" },
    { value: "custom", label: "Tùy chọn..." },
  ];

  const statusFilterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "completed", label: "Thành công" },
    { value: "pending", label: "Đang xử lý" },
    { value: "failed", label: "Thất bại" },
  ];

  const typeFilterOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "topup", label: "Nạp tiền" },
    { value: "payment", label: "Thanh toán" },
  ];

  // Function to update URL with current filters
  const updateUrlWithFilters = (filters: PaymentFilterParams) => {
    const params = new URLSearchParams();

    // Add all filters to URL params
    if (filters.search) params.set("search", filters.search);
    if (filters.dateRange && filters.dateRange !== "all")
      params.set("dateRange", filters.dateRange);
    if (filters.status && filters.status !== "all")
      params.set("status", filters.status);
    if (filters.type && filters.type !== "all")
      params.set("type", filters.type);
    if (filters.page && filters.page > 1)
      params.set("page", filters.page.toString());
    if (filters.fromDate) params.set("fromDate", filters.fromDate);
    if (filters.toDate) params.set("toDate", filters.toDate);

    // Update URL without triggering navigation
    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.replaceState({}, "", newUrl);
  };

  // Fetch transactions with filters
  const fetchTransactions = useCallback(
    async (filters: PaymentFilterParams) => {
      if (!isAuthenticated) return;

      setIsLoadingTransactions(true);
      setTransactionError(null);

      try {
        // Apply filters to API call
        const response = await paymentService.getPaymentHistory(filters);

        console.log("Fetched transactions:", response);

        if (response.success && response.data) {
          setApiTransactions(response.data.payments);
          setTotalItems(response.data.pagination.totalItems);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          setTransactionError("Không thể tải dữ liệu giao dịch");
        }
      } catch {
        showErrorToast("Lỗi khi tải dữ liệu giao dịch");
        setTransactionError("Lỗi khi tải dữ liệu giao dịch");
        setApiTransactions([]);
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [isAuthenticated]
  );

  // Build filter object from current filter state
  const buildFilters = useCallback((): PaymentFilterParams => {
    const filters: PaymentFilterParams = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (typeFilter !== "all") filters.type = typeFilter;

    // Handle date filtering
    if (dateFilter === "custom" && customDateRange.fromDate) {
      filters.fromDate = customDateRange.fromDate.toISOString();

      if (customDateRange.toDate) {
        filters.toDate = customDateRange.toDate.toISOString();
      }
    } else if (dateFilter !== "all") {
      filters.dateRange = dateFilter;
    }

    return filters;
  }, [
    currentPage,
    searchQuery,
    statusFilter,
    typeFilter,
    dateFilter,
    customDateRange,
  ]);

  // Apply filters and fetch data
  const applyFilters = () => {
    const filters = buildFilters();
    updateUrlWithFilters(filters);
    fetchTransactions(filters);
  };

  // Fetch transactions on initial load and when filters change
  useEffect(() => {
    const filters = buildFilters();
    fetchTransactions(filters);
    // Don't update URL here to avoid loops
  }, [isAuthenticated, currentPage, buildFilters, fetchTransactions]);

  // Handle manual filter application
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when applying new filters
    applyFilters();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
    setCustomDateRange({ fromDate: null, toDate: null });

    // Clear URL params and fetch data
    window.history.replaceState({}, "", window.location.pathname);
    fetchTransactions({ page: 1, limit: itemsPerPage });
  };

  // Format date from ISO string to readable date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "failure":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return "Thành công";
      case "pending":
        return "Đang xử lý";
      case "failed":
      case "failure":
        return "Thất bại";
      default:
        return "Không xác định";
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === "deposit" || type === "topup" || amount > 0) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const getTypeIcon = (type: string) => {
    return type === "deposit" || type === "topup" ? "📥" : "📤";
  };

  // Determine transaction type from description or amount
  const determineTransactionType = (transaction: Transaction) => {
    const desc = transaction.description.toLowerCase();
    if (desc.includes("nap") || desc.includes("nạp")) return "topup";
    if (
      desc.includes("thanh toan") ||
      desc.includes("thanh toán") ||
      transaction.amount < 0
    )
      return "payment";
    return "topup"; // Default to topup if can't determine
  };

  // Calculate summary statistics from API data
  const totalDeposit = apiTransactions
    .filter(
      (t) => determineTransactionType(t) === "topup" && t.status === "completed"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayment = apiTransactions
    .filter(
      (t) =>
        determineTransactionType(t) === "payment" && t.status === "completed"
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlWithFilters({ ...buildFilters(), page });
  };

  // Show loading if auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Bạn cần đăng nhập để xem lịch sử giao dịch
          </p>
          <Link
            href="/dang-nhap"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen w-full pb-20 lg:pb-0">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow">
              {/* Header Section */}
              <UserHeader
                userData={userData}
                showNotificationButton={true}
                showWalletButton={true}
              />

              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-6">
                  {/* Page Title */}
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                      Lịch sử giao dịch
                    </h1>
                    <p className="text-gray-600">
                      Xem chi tiết các giao dịch nạp tiền và thanh toán của bạn
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">📥</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">
                            Tổng nạp tiền
                          </p>
                          <p className="text-lg font-semibold text-green-800">
                            {formatCurrency(totalDeposit)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-lg">📤</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-700">
                            Tổng chi tiêu
                          </p>
                          <p className="text-lg font-semibold text-red-800">
                            {formatCurrency(totalPayment)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-lg">📊</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Tổng giao dịch
                          </p>
                          <p className="text-lg font-semibold text-blue-800">
                            {totalItems}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <form
                    onSubmit={handleFilterSubmit}
                    className="bg-gray-50 p-4 rounded-lg space-y-4"
                  >
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tìm kiếm
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm mã giao dịch, mã tin, nội dung..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Filter dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời gian
                        </label>
                        <select
                          value={dateFilter}
                          onChange={(e) => {
                            setDateFilter(e.target.value);
                            // Clear custom dates if not using custom
                            if (e.target.value !== "custom") {
                              setCustomDateRange({
                                fromDate: null,
                                toDate: null,
                              });
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {dateFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loại giao dịch
                        </label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {typeFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trạng thái
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Custom date range */}
                    {dateFilter === "custom" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Từ ngày
                          </label>
                          <DatePicker
                            selected={customDateRange.fromDate}
                            onChange={(date) =>
                              setCustomDateRange({
                                ...customDateRange,
                                fromDate: date,
                              })
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày bắt đầu"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đến ngày
                          </label>
                          <DatePicker
                            selected={customDateRange.toDate}
                            onChange={(date) =>
                              setCustomDateRange({
                                ...customDateRange,
                                toDate: date,
                              })
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày kết thúc"
                            minDate={customDateRange.fromDate || undefined}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Filter action buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Áp dụng bộ lọc
                      </button>

                      {/* Clear filters button */}
                      {(searchQuery ||
                        dateFilter !== "all" ||
                        statusFilter !== "all" ||
                        typeFilter !== "all") && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Transaction List */}
                  <div className="space-y-4">
                    {isLoadingTransactions ? (
                      <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-4 text-gray-600">
                          Đang tải dữ liệu giao dịch...
                        </p>
                      </div>
                    ) : transactionError ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-500">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              fill="currentColor"
                              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"
                            />
                          </svg>
                        </div>
                        <p className="text-red-600 mb-2">{transactionError}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Tải lại trang
                        </button>
                      </div>
                    ) : apiTransactions.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {apiTransactions.map((transaction) => {
                            const transactionType =
                              determineTransactionType(transaction);
                            return (
                              <div
                                key={transaction._id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div className="text-2xl flex-shrink-0">
                                      {getTypeIcon(transactionType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-start justify-between mb-2">
                                        <div className="font-medium text-gray-900 line-clamp-2 mr-2">
                                          {transaction.description}
                                        </div>
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(
                                            transaction.status
                                          )}`}
                                        >
                                          {getStatusText(transaction.status)}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600 space-y-1">
                                        <div>
                                          {transaction.paymentMethod?.toUpperCase() ||
                                            "VNPay"}{" "}
                                          • {formatDate(transaction.createdAt)}
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          <span className="bg-gray-100 px-2 py-1 rounded">
                                            Mã GD: {transaction.orderId}
                                          </span>
                                          {transaction.postId && (
                                            <span className="bg-blue-100 px-2 py-1 rounded">
                                              Mã tin: {transaction.postId}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={`font-semibold text-xl ${getTransactionColor(
                                      transactionType,
                                      transaction.amount
                                    )} flex-shrink-0`}
                                  >
                                    {transactionType === "topup" ? "+" : ""}
                                    {formatCurrency(transaction.amount)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            className="justify-center"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4 text-4xl">🔍</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Không tìm thấy giao dịch nào
                        </h3>
                        <p className="text-gray-600">
                          {searchQuery ||
                          dateFilter !== "all" ||
                          statusFilter !== "all" ||
                          typeFilter !== "all"
                            ? "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm"
                            : "Bạn chưa có giao dịch nào"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          {/* Tổng quan */}
          <Link
            href="/nguoi-dung/dashboard"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
              />
            </svg>
            <span className="text-xs">Trang chủ</span>
          </Link>

          {/* Yêu thích */}
          <Link
            href="/nguoi-dung/yeu-thich"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Yêu thích</span>
          </Link>

          {/* Đăng tin */}
          <Link
            href="/dang-tin"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-1"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.75 2C8.16421 2 8.5 2.33579 8.5 2.75V7H12.75C13.1642 7 13.5 7.33579 13.5 7.75C13.5 8.16421 13.1642 8.5 12.75 8.5H8.5V12.75C8.5 13.1642 8.16421 13.5 7.75 13.5C7.33579 13.5 7 13.1642 7 12.75V8.5H2.75C2.33579 8.5 2 8.16421 2 7.75C2 7.33579 2.33579 7 2.75 7H7V2.75C7 2.33579 7.33579 2 7.75 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs">Đăng tin</span>
          </Link>

          {/* Ví tiền - Active */}
          <Link
            href="/nguoi-dung/vi-tien"
            className="flex flex-col items-center py-2 px-1 text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">Ví tiền</span>
          </Link>

          {/* Tài khoản */}
          <Link
            href="/nguoi-dung/tai-khoan"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Tài khoản</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}

export default function LichSuGiaoDichPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LichSuGiaoDichPageInternal />
    </Suspense>
  );
}
