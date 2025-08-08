"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState(5);

  // Auto redirect logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        const nextCount = prev - 1;
        if (nextCount <= 0) {
          clearInterval(timer);

          // Smart redirect based on user role
          if (!isAuthenticated) {
            router.push("/dang-nhap"); // Not logged in -> login page
          } else if (user?.role === "admin" || user?.role === "employee") {
            router.push("/admin"); // Admin/employees -> admin dashboard
          } else {
            router.push("/"); // Regular users -> homepage
          }
        }
        return nextCount;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, user, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Không có quyền truy cập
          </h1>

          <p className="text-gray-600 mb-8">
            {!isAuthenticated
              ? "Bạn cần đăng nhập để truy cập trang này."
              : user?.role === "admin" || user?.role === "employee"
              ? "Bạn không có quyền để truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền tương ứng."
              : "Bạn không có quyền truy cập khu vực quản trị. Vui lòng liên hệ quản trị viên để được cấp quyền."}
          </p>

          {/* Auto redirect countdown */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Tự động chuyển hướng trong{" "}
              <span className="font-bold text-lg">{countdown}</span> giây...
            </p>
          </div>

          {/* Manual redirect buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push("/dang-nhap");
                } else if (
                  user?.role === "admin" ||
                  user?.role === "employee"
                ) {
                  router.push("/admin");
                } else {
                  router.push("/");
                }
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {!isAuthenticated
                ? "Đăng nhập"
                : user?.role === "admin" || user?.role === "employee"
                ? "Về trang admin"
                : "Về trang chủ"}
            </button>

            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại trang trước
            </button>
          </div>

          {/* Help section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Cần hỗ trợ?
            </h3>
            <p className="text-sm text-blue-700">
              Liên hệ với quản trị viên hệ thống để được cấp quyền truy cập phù
              hợp.
            </p>
          </div>

          {/* User info debug (only show in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-3 bg-gray-100 rounded-lg text-left">
              <p className="text-xs text-gray-600">
                <strong>Debug Info:</strong>
                <br />
                User: {user?.email || "Not logged in"}
                <br />
                Role: {user?.role || "No role"}
                <br />
                Authenticated: {isAuthenticated ? "Yes" : "No"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
