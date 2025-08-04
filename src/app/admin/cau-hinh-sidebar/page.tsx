"use client";

import AdminLayout from "../../../components/admin/AdminLayout";
import SidebarConfigManager from "../../../components/admin/SidebarConfigManager";
import { withAdminProtection } from "../../../components/admin/withRoleProtection";

function SidebarConfigPage() {
  return (
    <AdminLayout
      title="Cấu hình Sidebar"
      description="Quản lý và tùy chỉnh menu sidebar cho admin và employee"
    >
      <SidebarConfigManager />
    </AdminLayout>
  );
}

// Bảo vệ page này chỉ dành cho admin
export default withAdminProtection(SidebarConfigPage, {
  redirectTo: "/admin",
  showToast: true,
});
