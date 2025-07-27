"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import DynamicSidebarManager from "@/components/admin/DynamicSidebarManager";
import { useAuth } from "@/hooks/useAuth";

export default function SidebarConfigPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated, user } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!accessChecked && user) {
      setAccessChecked(true);

      if (!isAuthenticated) {
        router.push("/dang-nhap");
        return;
      }

      const hasAccess = hasRole("admin");
      if (!hasAccess) {
        // Nếu không có quyền, chuyển hướng về trang admin
        router.push("/admin");
        return;
      }
    }
  }, [hasRole, isAuthenticated, router, user, accessChecked]);

  // Show loading while checking authentication and permissions
  if (!user || !accessChecked) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  // Access denied screen
  if (!isAuthenticated || !hasRole("admin")) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Không có quyền truy cập
          </div>
          <div className="text-gray-600">
            Chỉ admin mới có thể truy cập trang cấu hình sidebar.
          </div>
        </div>
      </div>
    );
  }

  // Only render admin interface if user has proper permissions
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <DynamicSidebarManager />
          </div>
        </main>
      </div>
    </div>
  );
}
