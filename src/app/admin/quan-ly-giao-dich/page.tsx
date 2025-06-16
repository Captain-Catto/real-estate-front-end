"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

// Transaction type
interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "deposit" | "payment" | "commission";
  amount: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  description: string;
  postId?: string;
  postTitle?: string;
}

// Mock service
const TransactionService = {
  getAllTransactions: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock data
    return [
      {
        id: "TXN001",
        userId: "1",
        userName: "Nguyễn Văn A",
        userEmail: "nguyenvana@gmail.com",
        type: "deposit",
        amount: 500000,
        status: "completed",
        createdAt: "2024-06-11T14:30:00Z",
        description: "Nạp tiền vào ví",
      },
      {
        id: "TXN002",
        userId: "2",
        userName: "Trần Thị B",
        userEmail: "tranthib@gmail.com",
        type: "payment",
        amount: -50000,
        status: "completed",
        createdAt: "2024-06-10T09:15:00Z",
        description: "Thanh toán gói tin VIP - Căn hộ Vinhomes",
        postId: "POST456",
        postTitle: "Căn hộ Vinhomes",
      },
      {
        id: "TXN003",
        userId: "1",
        userName: "Nguyễn Văn A",
        userEmail: "nguyenvana@gmail.com",
        type: "commission",
        amount: 1000000,
        status: "pending",
        createdAt: "2024-06-09T10:00:00Z",
        description: "Hoa hồng giao dịch thành công",
        postId: "POST789",
        postTitle: "Nhà phố Q7",
      },
      // ... thêm mock data nếu cần
    ] as Transaction[];
  },
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const data = await TransactionService.getAllTransactions();
    setTransactions(data);
    setLoading(false);
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchSearch =
      txn.id.toLowerCase().includes(search.toLowerCase()) ||
      txn.userName.toLowerCase().includes(search.toLowerCase()) ||
      txn.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (txn.postTitle &&
        txn.postTitle.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = status === "all" || txn.status === status;
    return matchSearch && matchStatus;
  });

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

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã giao dịch, tên, email, tin đăng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="min-w-[180px]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
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
              ) : filteredTransactions.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mã GD
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
                        Ngày
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-gray-900">
                          #{txn.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-blue-500" />
                            <div>
                              <div className="font-medium">{txn.userName}</div>
                              <div className="text-xs text-gray-500">
                                {txn.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {txn.type === "deposit" && (
                            <span className="inline-flex items-center gap-1 text-green-700">
                              <CurrencyDollarIcon className="w-4 h-4" /> Nạp
                              tiền
                            </span>
                          )}
                          {txn.type === "payment" && (
                            <span className="inline-flex items-center gap-1 text-red-700">
                              <CurrencyDollarIcon className="w-4 h-4" /> Thanh
                              toán
                            </span>
                          )}
                          {txn.type === "commission" && (
                            <span className="inline-flex items-center gap-1 text-yellow-700">
                              <CurrencyDollarIcon className="w-4 h-4" /> Hoa
                              hồng
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>{txn.description}</div>
                          {txn.postTitle && (
                            <div className="text-xs text-blue-600">
                              Tin: {txn.postTitle}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          <span
                            className={
                              txn.amount > 0 ? "text-green-700" : "text-red-700"
                            }
                          >
                            {txn.amount > 0 ? "+" : "-"}
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                              txn.status
                            )}`}
                          >
                            {txn.status === "completed"
                              ? "Hoàn thành"
                              : txn.status === "pending"
                              ? "Đang xử lý"
                              : "Thất bại"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {formatDate(txn.createdAt)}
                        </td>
                      </tr>
                    ))}
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
          </div>
        </main>
      </div>
    </div>
  );
}
