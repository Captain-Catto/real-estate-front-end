"use client";

import ContactManagement from "../../../components/admin/ContactManagement";
import AdminLayout from "../../../components/admin/AdminLayout";

export default function ContactManagementPage() {
  return (
    <AdminLayout
      title="Quản lý liên hệ"
      description="Xem và quản lý các tin nhắn liên hệ từ khách hàng"
    >
      <ContactManagement />
    </AdminLayout>
  );
}
