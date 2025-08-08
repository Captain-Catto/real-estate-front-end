import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ReactNode } from "react";

interface AdminRoleGuardProps {
  children: ReactNode;
}

/**
 * Component bảo vệ role admin - chỉ cho phép admin và employee
 * Nếu không có role phù hợp sẽ redirect về trang chủ
 * Nếu có role nhưng không có quyền cụ thể sẽ để PagePermissionGuard xử lý
 */
export function AdminRoleGuard({ children }: AdminRoleGuardProps) {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    // Nếu chưa đăng nhập -> về trang đăng nhập
    if (!isAuthenticated) {
      router.push("/dang-nhap");
      return;
    }

    // Nếu không có role admin hoặc employee -> về trang chủ
    if (!user || (user.role !== "admin" && user.role !== "employee")) {
      router.push("/");
      return;
    }
  }, [user, isAuthenticated, isInitialized, router]);

  // Hiển thị loading khi đang kiểm tra
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không có role phù hợp, không render gì (sẽ redirect)
  if (
    !isAuthenticated ||
    !user ||
    (user.role !== "admin" && user.role !== "employee")
  ) {
    return null;
  }

  return <>{children}</>;
}
