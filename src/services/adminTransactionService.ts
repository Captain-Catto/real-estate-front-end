const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface AdminPayment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  postId?: {
    _id: string;
    title: string;
    type: string;
  };
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
  description: string;
  metadata?: {
    isTopup?: boolean;
    isWalletPayment?: boolean;
    walletTransactionType?: string;
    packageId?: string;
    packageName?: string;
    packageDuration?: number;
    [key: string]: string | number | boolean | undefined;
  };
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
}

export interface AdminPaymentStats {
  totalAmount: number;
  totalTopup: number;
  totalPostPayments: number;
  totalTransactions: number;
}

export interface AdminPaymentResponse {
  success: boolean;
  data: {
    payments: AdminPayment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    stats: AdminPaymentStats;
  };
  message?: string;
}

export interface AdminPaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const AdminTransactionService = {
  // Get all payments with filters and pagination
  getAllPayments: async (
    filters: AdminPaymentFilters = {}
  ): Promise<AdminPaymentResponse> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const queryParams = new URLSearchParams();

      // Add pagination
      queryParams.append("page", String(filters.page || 1));
      queryParams.append("limit", String(filters.limit || 20));

      // Add filters
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) queryParams.append("dateTo", filters.dateTo);

      const response = await fetch(
        `${API_BASE_URL}/admin/payments?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch payments");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching admin payments:", error);
      throw error;
    }
  },

  // Get payment by orderId
  getPaymentByOrderId: async (
    orderId: string
  ): Promise<AdminPayment | null> => {
    try {
      const response = await AdminTransactionService.getAllPayments({
        search: orderId,
        limit: 1,
      });

      if (response.success && response.data.payments.length > 0) {
        const payment = response.data.payments.find(
          (p) => p.orderId === orderId
        );
        return payment || null;
      }

      return null;
    } catch (error) {
      console.error("Error fetching payment by orderId:", error);
      throw error;
    }
  },

  // Export payments to CSV
  exportPayments: async (filters: AdminPaymentFilters = {}): Promise<Blob> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const queryParams = new URLSearchParams();

      // Add filters for export (no pagination limit)
      queryParams.append("limit", "10000"); // Large limit for export
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) queryParams.append("dateTo", filters.dateTo);

      const response = await fetch(
        `${API_BASE_URL}/admin/payments?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export payments");
      }

      const data = await response.json();

      // Convert to CSV
      const csvContent = AdminTransactionService.convertToCSV(
        data.data.payments
      );
      return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    } catch (error) {
      console.error("Error exporting payments:", error);
      throw error;
    }
  },

  // Helper function to convert payments to CSV
  convertToCSV: (payments: AdminPayment[]): string => {
    const headers = [
      "Mã giao dịch",
      "Người dùng",
      "Email",
      "Tin đăng",
      "Số tiền",
      "Trạng thái",
      "Phương thức",
      "Mô tả",
      "Ngày tạo",
      "Ngày hoàn thành",
    ];

    const csvRows = [
      headers.join(","),
      ...payments.map((payment) =>
        [
          payment.orderId,
          payment.userId?.username || "",
          payment.userId?.email || "",
          payment.postId?.title || "",
          payment.amount,
          payment.status,
          payment.paymentMethod,
          `"${payment.description.replace(/"/g, '""')}"`, // Escape quotes
          new Date(payment.createdAt).toLocaleString("vi-VN"),
          payment.completedAt
            ? new Date(payment.completedAt).toLocaleString("vi-VN")
            : "",
        ].join(",")
      ),
    ];

    return csvRows.join("\n");
  },
};
