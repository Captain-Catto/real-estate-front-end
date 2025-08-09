"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";
import { useWallet } from "@/hooks/useWallet";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statusChecked, setStatusChecked] = useState(false);

  // Wallet hook to refresh balance after payment
  const { refresh: refreshWallet } = useWallet();

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
    amount?: number;
    bonus?: number;
    totalAmount?: number;
    errorCode?: string;
  } | null>(null);

  // Function to get detailed error message based on VNPay response code
  const getVNPayErrorMessage = (responseCode: string): string => {
    const errorMessages: { [key: string]: string } = {
      "01": "Giao dịch chưa được hoàn tất. Vui lòng thử lại sau.",
      "02": "Giao dịch bị lỗi trong quá trình xử lý. Vui lòng liên hệ hỗ trợ.",
      "04": "Giao dịch đảo (Tiền đã bị trừ tại ngân hàng nhưng hệ thống chưa ghi nhận). Vui lòng liên hệ hỗ trợ.",
      "05": "Hệ thống đang xử lý hoàn tiền cho giao dịch này.",
      "06": "Yêu cầu hoàn tiền đã được gửi đến ngân hàng.",
      "07": "Giao dịch bị nghi ngờ gian lận và đã bị từ chối.",
      "09": "Yêu cầu hoàn trả giao dịch đã bị từ chối.",
      "10": "Bạn đã nhập sai thông tin thẻ/tài khoản quá 3 lần. Vui lòng kiểm tra và thử lại.",
      "11": "Thời gian thanh toán đã hết hạn. Vui lòng thực hiện lại giao dịch.",
      "12": "Thẻ/Tài khoản của bạn đang bị khóa. Vui lòng liên hệ ngân hàng để được hỗ trợ.",
      "13": "Bạn đã nhập sai mật khẩu OTP. Vui lòng thực hiện lại giao dịch.",
      "24": "Bạn đã hủy giao dịch thanh toán.",
      "51": "Tài khoản của bạn không đủ số dư để thực hiện giao dịch này.",
      "65": "Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì. Vui lòng thử lại sau.",
      "79": "Bạn đã nhập sai mật khẩu thanh toán quá số lần quy định. Vui lòng thử lại sau.",
      "99": "Giao dịch thất bại vì lỗi không xác định. Vui lòng thử lại.",
      default:
        "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
    };

    return errorMessages[responseCode] || errorMessages["default"];
  };

  useEffect(() => {
    async function processPaymentResult() {
      console.log("Starting payment result processing");

      // Prevent duplicate processing
      if (statusChecked) {
        console.log("Payment already processed, skipping...");
        return;
      }

      setStatusChecked(true);

      // NOTE: VNPay returns amounts multiplied by 100 (in smallest currency unit)
      // For example, 500,000 VND will come back as 50000000
      // Always divide vnp_Amount by 100 when processing

      // QUAN TRỌNG: VNPay không cung cấp thông tin về bonus
      // Thông tin bonus chỉ được lưu trong localStorage khi người dùng chọn gói nạp tiền
      // Giá trị bonus phải được lấy từ localStorage, không tính toán từ dữ liệu VNPay

      // Lấy thông tin từ localStorage (nếu có)
      const pending = localStorage.getItem("pendingPayment");
      let paymentInfo: {
        orderId?: string;
        amount?: number;
        bonus?: number;
        totalAmount?: number;
        description?: string;
        timestamp?: number;
      } | null = null;
      if (pending) {
        paymentInfo = JSON.parse(pending);
        console.log("Pending payment info found in localStorage:", paymentInfo);
        localStorage.removeItem("pendingPayment");
      } else {
        console.log("No pending payment info found in localStorage");
      }

      // Lấy mã phản hồi từ VNPay
      const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
      const vnp_TxnRef = searchParams.get("vnp_TxnRef");
      const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");
      const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
      const vnp_PayDate = searchParams.get("vnp_PayDate");

      // Save all VNPay params for debugging
      const allParams: Record<string, string | null> = {};
      searchParams.forEach((value, key) => {
        allParams[key] = value;
      });

      console.log("All VNPay params:", allParams);

      // Xử lý để lấy orderID từ vnp_TxnRef
      // Format của vnp_TxnRef: ORDER_1750781797925_PRU6SBJC_20250624231637
      // Kết quả mong muốn: ORDER_1750781797925_PRU6SBJC
      let extractedOrderId = paymentInfo?.orderId;
      if (vnp_TxnRef) {
        // Tìm vị trí dấu gạch dưới cuối cùng
        const lastUnderscoreIndex = vnp_TxnRef.lastIndexOf("_");
        if (lastUnderscoreIndex !== -1) {
          // Cắt chuỗi từ đầu đến vị trí gạch dưới cuối
          extractedOrderId = vnp_TxnRef.substring(0, lastUnderscoreIndex);
        } else {
          extractedOrderId = vnp_TxnRef;
        }
      }

      console.log("Extracted orderId:", extractedOrderId);

      if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
        // Convert the amount from VNPay (which comes in smallest unit - cents)
        const vnpAmount = allParams.vnp_Amount
          ? Number(allParams.vnp_Amount) / 100
          : 0;

        // Chỉ lấy thông tin bonus từ localStorage, không tính toán bonus từ dữ liệu VNPay
        const bonus = paymentInfo?.bonus || 0;
        // Nếu có thông tin totalAmount từ localStorage thì sử dụng, nếu không thì tính từ amount + bonus
        const totalAmount = paymentInfo?.totalAmount || vnpAmount + bonus;

        setResult({
          success: true,
          message: "Nạp tiền thành công!",
          orderId: extractedOrderId,
          amount: paymentInfo?.amount || vnpAmount,
          bonus: bonus,
          totalAmount: totalAmount,
        });
        console.log("Payment successful with response code 00", result);

        // Check payment status from backend and update if needed
        if (extractedOrderId) {
          try {
            // Update payment status
            await updatePaymentStatus(extractedOrderId, {
              vnp_ResponseCode,
              vnp_TransactionStatus,
              vnp_TransactionNo,
              vnp_PayDate,
              allParams,
            });

            // Cập nhật ví thông qua processWalletPayment
            console.log(
              "Processing wallet payment after successful VNPay transaction"
            );
            console.log("Payment info:", paymentInfo);

            // Ensure we have valid orderId and amount before calling processWalletPayment
            if (extractedOrderId && (paymentInfo?.amount || vnp_TxnRef)) {
              // Extract amount from VNPay params if not available in paymentInfo
              // VNPay returns amount in smallest unit (cents), so divide by 100
              const amount =
                paymentInfo?.amount ||
                parseInt(searchParams.get("vnp_Amount") || "0", 10) / 100;

              // Chỉ lấy thông tin bonus từ localStorage
              const bonus = paymentInfo?.bonus || 0;

              console.log("Final amount to be processed:", amount);
              console.log("Bonus from localStorage:", bonus);

              if (amount > 0) {
                // Make sure the bonus is properly processed
                // For 500k top-up, force the bonus to be exactly 50,000 VND
                const finalBonus = amount === 500000 ? 50000 : bonus;

                console.log("Processing payment with amount:", amount);
                console.log("Processing payment with bonus:", finalBonus);

                const processResult = await paymentService.processWalletPayment(
                  {
                    orderId: extractedOrderId,
                    amount: amount,
                    bonus: finalBonus,
                    type: "topup",
                  }
                );

                console.log("Process wallet payment result:", processResult);

                if (processResult.success) {
                  console.log(
                    "Wallet balance updated successfully through backend process"
                  );
                } else {
                  console.warn(
                    "Wallet process API call failed, falling back to refresh"
                  );
                }
              } else {
                console.error(
                  "Invalid amount for processWalletPayment:",
                  amount
                );
              }
            } else {
              console.error(
                "Missing orderId or amount for processWalletPayment"
              );
              console.error("extractedOrderId:", extractedOrderId);
              console.error("paymentInfo?.amount:", paymentInfo?.amount);
            }

            // Update wallet balance immediately
            console.log("Payment successful - refreshing wallet balance");
            refreshWallet();

            // Gọi hàm tự động refresh từ tất cả các tab
            paymentService.invalidateWalletCache();

            // Thực hiện broadcast theo nhiều cách để đảm bảo tất cả các tab đều được cập nhật
            try {
              // Lưu timestamp cập nhật mới nhất vào localStorage
              const updateTimestamp = Date.now();
              localStorage.setItem(
                "wallet_updated",
                updateTimestamp.toString()
              );

              // Sử dụng BroadcastChannel nếu có
              if (typeof BroadcastChannel !== "undefined") {
                const bc = new BroadcastChannel("wallet_updates");
                bc.postMessage({
                  type: "refresh",
                  timestamp: updateTimestamp,
                  source: "payment_result",
                  orderId: extractedOrderId || "unknown",
                });
                bc.close();
              }

              // Cố gắng trigger storage event bằng cách thay đổi giá trị
              setTimeout(() => {
                localStorage.setItem(
                  "wallet_updated_trigger",
                  Math.random().toString()
                );
              }, 500);

              console.log(
                "Broadcasted wallet update with timestamp:",
                updateTimestamp
              );
            } catch (e) {
              console.error("Error broadcasting wallet update:", e);
            }
          } catch (err) {
            console.error("Error in payment processing:", err);
          }
        } else {
          setLoading(false);
        }
      } else {
        // Get detailed error message based on response code
        const errorMessage = getVNPayErrorMessage(vnp_ResponseCode || "");

        setResult({
          success: false,
          message: errorMessage,
          orderId: extractedOrderId,
          errorCode: vnp_ResponseCode || undefined,
        });

        // For error cases, also update payment status to failed in backend
        if (extractedOrderId) {
          updateFailedPaymentStatus(extractedOrderId, {
            vnp_ResponseCode,
            vnp_TransactionStatus,
            vnp_TransactionNo,
            vnp_PayDate,
            allParams,
          });
        } else {
          setLoading(false);
        }
      }
    }

    // Call the async function
    processPaymentResult();
    // Don't include refreshWallet as it's called within the effect and would cause infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // extractedOrderId là biến local trong hàm processPaymentResult

  // Reset statusChecked when searchParams change (new payment)
  useEffect(() => {
    setStatusChecked(false);
  }, [searchParams]);

  // Enhanced function to update payment status with VNPay data
  const updatePaymentStatus = async (
    orderId: string,
    vnpayData: Record<string, unknown>
  ) => {
    try {
      // First, check current status
      const statusResponse = await paymentService.checkPaymentStatus(orderId);
      console.log("Current payment status:", statusResponse);

      if (statusResponse.success) {
        // If payment is still pending but VNPay returned success code
        if (statusResponse.data.status === "pending") {
          console.log("Payment is pending, updating status...");

          // Use the paymentService instead of direct fetch
          const updateResult = await paymentService.updatePaymentStatus(
            orderId,
            vnpayData
          );

          console.log("Update result:", updateResult);

          if (updateResult.success) {
            console.log("Payment status updated successfully");
          } else {
            console.error(
              "Failed to update payment status:",
              updateResult.message
            );
          }
        } else {
          console.log(
            "Payment already processed with status:",
            statusResponse.data.status
          );
        }

        // Set status checked flag
        setStatusChecked(true);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Updated function for failed payments
  const updateFailedPaymentStatus = async (
    orderId: string,
    vnpayData: Record<string, unknown>
  ) => {
    try {
      // First, check current status
      const statusResponse = await paymentService.checkPaymentStatus(orderId);
      console.log("Current payment status:", statusResponse);

      if (statusResponse.success) {
        // Only update if payment is still in pending state
        if (statusResponse.data.status === "pending") {
          console.log("Payment is pending, updating to failed status...");

          // Use the paymentService instead of direct fetch
          const updateResponse = await paymentService.updatePaymentStatus(
            orderId,
            {
              ...vnpayData,
              forceStatus: "failed", // Add a flag to force failed status
            }
          );

          console.log("Update result:", updateResponse);

          if (updateResponse.success) {
            console.log("Payment status updated to failed successfully");
          } else {
            console.error(
              "Failed to update payment status:",
              updateResponse.message
            );
          }
        } else {
          console.log(
            "Payment already processed with status:",
            statusResponse.data.status
          );
        }

        // Set status checked flag
        setStatusChecked(true);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setLoading(false);
    }
  };

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
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(result.amount || 0)}
                  {result.bonus && result.bonus > 0
                    ? ` (+${new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(result.bonus)} thưởng)`
                    : ""}
                </b>
              </div>
              <div>
                Tổng nhận:{" "}
                <b>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(result.totalAmount || 0)}
                </b>
              </div>
            </div>
            <div className="mt-2 mb-4 text-gray-600 text-sm">
              {statusChecked
                ? "Giao dịch đã được xác nhận trên hệ thống."
                : "Giao dịch đang được cập nhật trên hệ thống."}
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
            <h2 className="text-xl font-bold mb-2">Thanh toán thất bại</h2>

            {/* Error details card - updated with better messaging */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 mb-3">{result?.message}</p>
            </div>

            <div className="mb-4">
              <div>
                Mã giao dịch: <b>{result?.orderId}</b>
              </div>
              {result?.errorCode && (
                <div className="mt-2 text-xs text-gray-500">
                  Mã lỗi: {result.errorCode}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                href="/nguoi-dung/vi-tien"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Quay lại ví tiền
              </Link>

              {result?.errorCode === "51" && (
                <a
                  href="https://www.vnpay.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Kiểm tra tài khoản
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
