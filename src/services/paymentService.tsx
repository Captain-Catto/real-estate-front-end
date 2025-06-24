const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface CreateVNPayPaymentRequest {
  amount: number;
  orderInfo: string;
  postId?: string;
  returnUrl?: string;
}

export interface VNPayPaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentUrl: string;
    orderId: string;
    amount: number;
    description: string;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: Array<{
      _id: string;
      orderId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      status: string;
      description: string;
      createdAt: string;
      completedAt?: string;
      failedAt?: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Helper function để thêm token vào headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function để xử lý response
const handleResponse = async (response: Response) => {
  console.log("Response status:", response.status);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export const paymentService = {
  // Tạo URL thanh toán VNPay
  async createVNPayPayment(
    data: CreateVNPayPaymentRequest
  ): Promise<VNPayPaymentResponse> {
    const response = await fetch(
      `${API_BASE_URL}/payments/vnpay/create-payment-url`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    console.log("Creating VNPay payment URL:", data);

    return handleResponse(response);
  },

  // Lấy lịch sử thanh toán
  async getPaymentHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<PaymentHistoryResponse> {
    const response = await fetch(
      `${API_BASE_URL}/payments/history?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse(response);
  },

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(orderId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payments/status/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  // Lấy chi tiết thanh toán
  async getPaymentDetails(orderId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/payments/details/${orderId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse(response);
  },
};
