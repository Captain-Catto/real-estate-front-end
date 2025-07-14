// ❌ TRANG NÀY ĐÃ BỊ XÓA
// Lý do: Hệ thống thông báo được đơn giản hóa, chỉ cần 3 loại tự động:
// 1. 💰 Nạp tiền thành công (tự động từ PaymentController)
// 2. ✅ Tin đăng được duyệt (tự động từ AdminController)
// 3. ❌ Tin đăng bị từ chối (tự động từ AdminController)
//
// Không cần admin tạo thông báo thủ công nữa.
// Redirect về trang chính admin

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RemovedNotificationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect về trang admin chính
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🔄 Đang chuyển hướng...
        </h1>
        <p className="text-gray-600">
          Trang quản lý thông báo đã được loại bỏ. Thông báo sẽ tự động gửi khi
          có giao dịch.
        </p>
      </div>
    </div>
  );
}
