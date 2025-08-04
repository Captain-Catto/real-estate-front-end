"use client";

import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { EmployeeGuard } from "./RoleGuard";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  fallbackPath?: string;
}

export default function AdminLayout({
  children,
  title,
  description,
  fallbackPath = "/admin",
}: AdminLayoutProps) {
  return (
    <EmployeeGuard redirectTo={fallbackPath}>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="mt-2 text-gray-600">{description}</p>
                )}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </EmployeeGuard>
  );
}
