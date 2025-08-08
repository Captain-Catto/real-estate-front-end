"use client";

import AdminLayout from "../../../components/admin/AdminLayout";
import SidebarConfigManager from "../../../components/admin/SidebarConfigManager";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";

function SidebarConfigPageInternal() {
  return (
    <AdminLayout
      title="Cấu hình Sidebar"
      description="Quản lý và tùy chỉnh menu sidebar cho admin và employee"
    >
      <SidebarConfigManager />
    </AdminLayout>
  );
}

// Wrap component with AdminGuard
export default function ProtectedSidebarConfigPage() {
  return (
    <AdminGuard 
      permissions={[PERMISSIONS.SETTINGS.EDIT]}
    >
      <SidebarConfigPageInternal />
    </AdminGuard>
  );
}
