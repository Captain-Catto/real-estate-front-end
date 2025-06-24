"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
    amount?: number;
    bonus?: number;
    totalAmount?: number;
  } | null>(null);

  useEffect(() => {
    // Lấy thông tin từ localStorage (nếu có)
    const pending = localStorage.getItem("pendingPayment");
    let paymentInfo: any = null;
    if (pending) {
      paymentInfo = JSON.parse(pending);
      localStorage.removeItem("pendingPayment");
    }

    // Lấy mã phản hồi từ VNPay
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");

    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      setResult({
        success: true,
        message: "Nạp tiền thành công!",
        orderId: paymentInfo?.orderId || vnp_TxnRef,
        amount: paymentInfo?.amount,
        bonus: paymentInfo?.bonus,
        totalAmount: paymentInfo?.totalAmount,
      });
    } else {
      setResult({
        success: false,
        message: "Thanh toán thất bại hoặc bị hủy.",
        orderId: paymentInfo?.orderId || vnp_TxnRef,
      });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {result?.success ? (
          <>
            <div className="mb-4 text-green-600 text-3xl">✔️</div>
            <h2 className="text-xl font-bold mb-2">Nạp tiền thành công!</h2>
            <div className="mb-2">
              <div>
                Mã giao dịch: <b>{result.orderId}</b>
              </div>
              <div>
                Số tiền:{" "}
                <b>
                  {result.amount?.toLocaleString("vi-VN")}đ
                  {result.bonus
                    ? ` (+${result.bonus.toLocaleString("vi-VN")}đ thưởng)`
                    : ""}
                </b>
              </div>
              <div>
                Tổng nhận: <b>{result.totalAmount?.toLocaleString("vi-VN")}đ</b>
              </div>
            </div>
            <Link
              href="/nguoi-dung/vi-tien"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại ví tiền
            </Link>
          </>
        ) : (
          <>
            <div className="mb-4 text-red-600 text-3xl">❌</div>
            <h2 className="text-xl font-bold mb-2">Thanh toán thất bại!</h2>
            <div className="mb-2">
              {result?.message}
              <div>
                Mã giao dịch: <b>{result.orderId}</b>
              </div>
            </div>
            <Link
              href="/nguoi-dung/vi-tien"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại ví tiền
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
