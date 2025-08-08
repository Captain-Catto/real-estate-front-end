"use client";

import ContactManagement from "../../../components/admin/ContactManagement";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminGuard from "@/components/auth/AdminGuard";
import { PERMISSIONS } from "@/constants/permissions";

function ContactManagementPage() {
  return (
    <AdminLayout
      title="Quản lý liên hệ"
      description="Xem và quản lý các tin nhắn liên hệ từ khách hàng"
    >
      <ContactManagement />
    </AdminLayout>
  );
}

// Wrap component with AdminGuard
export default function ProtectedContactManagementPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.SETTINGS.VIEW]}>
      <ContactManagementPage />
    </AdminGuard>
  );
}
