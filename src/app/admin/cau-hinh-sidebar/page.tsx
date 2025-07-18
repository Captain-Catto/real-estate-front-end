"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import DynamicSidebarManager from "@/components/admin/DynamicSidebarManager";
import { useAuth } from "@/hooks/useAuth";

export default function SidebarConfigPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated, loading: authLoading } = useAuth();

  // Kiểm tra quyền truy cập - chỉ admin mới được vào
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (!hasRole("admin")) {
        router.push("/admin");
        return;
      }
    }
  }, [hasRole, isAuthenticated, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not admin
  if (!hasRole("admin")) {
    return null;
  }

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
