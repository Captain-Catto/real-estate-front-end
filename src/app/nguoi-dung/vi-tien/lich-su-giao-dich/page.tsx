"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import { Pagination } from "@/components/common/Pagination";
import UserHeader from "@/components/user/UserHeader";

export default function LichSuGiaoDichPage() {
  // Mock user data
  const userData = {
    name: "Lê Quang Trí Đạt",
    avatar: "Đ",
    balance: "450.000 đ",
    greeting: "Chào buổi sáng 🌤",
  };

  // Transaction history state - Chỉ giữ những state cần thiết
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bỏ các state và ref không cần thiết:
  // - showNotificationPopup (đã có trong UserHeader)
  // - mobileNotificationRef (đã có trong UserHeader)
  // - notifications array (đã có trong UserHeader)

  // Extended transaction history mock data
  const allTransactions = [
    {
      id: "TXN001",
      postId: "POST123",
      type: "deposit",
      amount: 500000,
      status: "completed",
      date: "2024-06-11 14:30",
      method: "VNPay",
      description: "Nạp tiền vào ví",
    },
    {
      id: "TXN002",
      postId: "POST456",
      type: "payment",
      amount: -50000,
      status: "completed",
      date: "2024-06-10 09:15",
      method: "Ví tiền",
      description: "Thanh toán gói tin VIP - Căn hộ Vinhomes",
    },
    {
      id: "TXN003",
      postId: null,
      type: "deposit",
      amount: 1000000,
      status: "failed",
      date: "2024-06-09 16:45",
      method: "VNPay",
      description: "Nạp tiền vào ví (Thất bại)",
    },
    {
      id: "TXN004",
      postId: "POST789",
      type: "payment",
      amount: -30000,
      status: "pending",
      date: "2024-06-08 11:20",
      method: "Ví tiền",
      description: "Thanh toán gói tin thường - Nhà phố Q7",
    },
    {
      id: "TXN005",
      postId: null,
      type: "deposit",
      amount: 200000,
      status: "completed",
      date: "2024-06-07 08:30",
      method: "VNPay",
      description: "Nạp tiền vào ví",
    },
    {
      id: "TXN006",
      postId: "POST321",
      type: "payment",
      amount: -75000,
      status: "completed",
      date: "2024-06-06 13:45",
      method: "Ví tiền",
      description: "Thanh toán gói tin cao cấp - Biệt thự Thủ Đức",
    },
    {
      id: "TXN007",
      postId: null,
      type: "deposit",
      amount: 300000,
      status: "failed",
      date: "2024-06-05 19:15",
      method: "VNPay",
      description: "Nạp tiền vào ví (Lỗi thanh toán)",
    },
    {
      id: "TXN008",
      postId: "POST654",
      type: "payment",
      amount: -25000,
      status: "completed",
      date: "2024-05-20 10:30",
      method: "Ví tiền",
      description: "Thanh toán gói tin thường - Chung cư Landmark",
    },
    {
      id: "TXN009",
      postId: null,
      type: "deposit",
      amount: 800000,
      status: "completed",
      date: "2024-05-15 14:20",
      method: "VNPay",
      description: "Nạp tiền vào ví",
    },
    {
      id: "TXN010",
      postId: "POST987",
      type: "payment",
      amount: -60000,
      status: "failed",
      date: "2024-05-10 16:10",
      method: "Ví tiền",
      description: "Thanh toán gói tin VIP (Thất bại - Số dư không đủ)",
    },
    {
      id: "TXN011",
      postId: null,
      type: "deposit",
      amount: 2000000,
      status: "completed",
      date: "2024-05-05 11:30",
      method: "VNPay",
      description: "Nạp tiền vào ví",
    },
    {
      id: "TXN012",
      postId: "POST111",
      type: "payment",
      amount: -40000,
      status: "completed",
      date: "2024-05-03 15:20",
      method: "Ví tiền",
      description: "Thanh toán gói tin VIP - Shophouse Quận 1",
    },
    {
      id: "TXN013",
      postId: null,
      type: "deposit",
      amount: 150000,
      status: "failed",
      date: "2024-04-28 09:45",
      method: "VNPay",
      description: "Nạp tiền vào ví (Timeout)",
    },
    {
      id: "TXN014",
      postId: "POST222",
      type: "payment",
      amount: -35000,
      status: "completed",
      date: "2024-04-25 14:10",
      method: "Ví tiền",
      description: "Thanh toán gói tin cao cấp - Căn hộ Masteri",
    },
    {
      id: "TXN015",
      postId: null,
      type: "deposit",
      amount: 1500000,
      status: "completed",
      date: "2024-04-20 16:30",
      method: "VNPay",
      description: "Nạp tiền vào ví",
    },
  ];

  // Filter options
  const dateFilterOptions = [
    { value: "all", label: "Tất cả thời gian" },
    { value: "7days", label: "7 ngày qua" },
    { value: "30days", label: "30 ngày qua" },
    { value: "90days", label: "3 tháng qua" },
  ];

  const statusFilterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "completed", label: "Thành công" },
    { value: "pending", label: "Đang xử lý" },
    { value: "failed", label: "Thất bại" },
  ];

  const typeFilterOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "deposit", label: "Nạp tiền" },
    { value: "payment", label: "Thanh toán" },
  ];

  // Filter transactions based on search, date, status, and type
  const getFilteredTransactions = () => {
    let filtered = [...allTransactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (transaction.postId &&
            transaction.postId
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          transaction.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let days;
      switch (dateFilter) {
        case "7days":
          days = 7;
          break;
        case "30days":
          days = 30;
          break;
        case "90days":
          days = 90;
          break;
        default:
          days = 0;
      }

      if (days > 0) {
        const filterDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (transaction) => new Date(transaction.date) >= filterDate
        );
      }
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, statusFilter, typeFilter]);

  // Bỏ useEffect cho click outside - không cần thiết nữa
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (
  //       mobileNotificationRef.current &&
  //       !mobileNotificationRef.current.contains(event.target as Node)
  //     ) {
  //       setShowNotificationPopup(false);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Thành công";
      case "pending":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return "Không xác định";
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === "deposit" || amount > 0) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const getTypeIcon = (type: string) => {
    return type === "deposit" ? "📥" : "📤";
  };

  // Bỏ function getNotificationIcon - không cần thiết
  // const getNotificationIcon = (type: string) => {
  //   switch (type) {
  //     case "success":
  //       return "✅";
  //     case "error":
  //       return "❌";
  //     case "info":
  //       return "ℹ️";
  //     default:
  //       return "📢";
  //   }
  // };

  // Bỏ unreadCount - không cần thiết
  // const unreadCount = notifications.filter((n) => !n.read).length;

  // Calculate summary statistics
  const totalDeposit = filteredTransactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayment = Math.abs(
    filteredTransactions
      .filter((t) => t.type === "payment" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0)
  );

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
                            {filteredTransactions.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
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
                          onChange={(e) => setDateFilter(e.target.value)}
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

                    {/* Clear filters button */}
                    {(searchQuery ||
                      dateFilter !== "all" ||
                      statusFilter !== "all" ||
                      typeFilter !== "all") && (
                      <div>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setDateFilter("all");
                            setStatusFilter("all");
                            setTypeFilter("all");
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Transaction List */}
                  <div className="space-y-4">
                    {paginatedTransactions.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {paginatedTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl flex-shrink-0">
                                    {getTypeIcon(transaction.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="font-medium text-gray-900 line-clamp-2">
                                        {transaction.description}
                                      </div>
                                      <span
                                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(
                                          transaction.status
                                        )}`}
                                      >
                                        {getStatusText(transaction.status)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>
                                        {transaction.method} •{" "}
                                        {transaction.date}
                                      </div>
                                      <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                          Mã GD: {transaction.id}
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
                                    transaction.type,
                                    transaction.amount
                                  )} flex-shrink-0`}
                                >
                                  {transaction.amount > 0 ? "+" : ""}
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
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
                          Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
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
            href="/nguoi-dung/tong-quan"
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
            <span className="text-xs">Tổng quan</span>
          </Link>

          {/* Quản lý tin */}
          <Link
            href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue"
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
                fillRule="evenodd"
                d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Quản lý</span>
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
            className="flex flex-col items-center py-2 px-1 text-blue-600 bg-blue-50"
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
                d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
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
