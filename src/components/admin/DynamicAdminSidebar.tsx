"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

export interface SidebarMenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: ("admin" | "employee")[];
  description?: string;
}

// Icon mapping
const iconMap = {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  MapIcon,
  BuildingOfficeIcon,
};

// Default fallback menu items
const defaultMenuItems: SidebarMenuItem[] = [
  {
    id: "dashboard",
    name: "Tổng quan",
    href: "/admin",
    icon: "HomeIcon",
    order: 1,
    isActive: true,
    roles: ["admin", "employee"],
  },
  {
    id: "posts",
    name: "Quản lý tin đăng",
    href: "/admin/quan-ly-tin-dang",
    icon: "DocumentTextIcon",
    order: 2,
    isActive: true,
    roles: ["admin", "employee"],
  },
  {
    id: "users",
    name: "Quản lý người dùng",
    href: "/admin/quan-ly-nguoi-dung",
    icon: "UserGroupIcon",
    order: 3,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "news",
    name: "Tin tức",
    href: "/admin/quan-ly-tin-tuc",
    icon: "NewspaperIcon",
    order: 4,
    isActive: true,
    roles: ["admin", "employee"],
  },
  {
    id: "transactions",
    name: "Giao dịch",
    href: "/admin/quan-ly-giao-dich",
    icon: "CurrencyDollarIcon",
    order: 5,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "stats",
    name: "Thống kê",
    href: "/admin/thong-ke",
    icon: "ChartBarIcon",
    order: 6,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "settings",
    name: "Cài đặt",
    href: "/admin/cai-dat",
    icon: "CogIcon",
    order: 7,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "sidebar-config",
    name: "Cấu hình Sidebar",
    href: "/admin/cau-hinh-sidebar",
    icon: "CogIcon",
    order: 8,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "locations",
    name: "Quản lý địa chính",
    href: "/admin/quan-ly-dia-chinh",
    icon: "MapIcon",
    order: 9,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "projects",
    name: "Quản lý dự án",
    href: "/admin/quan-ly-du-an",
    icon: "BuildingOfficeIcon",
    order: 10,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "developers",
    name: "Quản lý chủ đầu tư",
    href: "/admin/quan-ly-chu-dau-tu",
    icon: "UserGroupIcon",
    order: 11,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "categories",
    name: "Quản lý danh mục",
    href: "/admin/quan-ly-danh-muc",
    icon: "DocumentTextIcon",
    order: 12,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "areas",
    name: "Quản lý diện tích",
    href: "/admin/quan-ly-dien-tich",
    icon: "DocumentTextIcon",
    order: 13,
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "prices",
    name: "Quản lý giá",
    href: "/admin/quan-ly-gia",
    icon: "DocumentTextIcon",
    order: 14,
    isActive: true,
    roles: ["admin"],
  },
];

export default function DynamicAdminSidebar() {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();
  const [menuItems, setMenuItems] =
    useState<SidebarMenuItem[]>(defaultMenuItems);

  // Determine user role
  const userRole = hasRole("admin") ? "admin" : "employee";

  // Load dynamic menu configuration
  useEffect(() => {
    const savedItems = localStorage.getItem("sidebarMenuItems");
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setMenuItems(parsedItems);
      } catch (error) {
        console.error("Error loading sidebar configuration:", error);
        // Keep default items on error
      }
    }
  }, []);

  // Filter menu items based on user role and active status
  const visibleMenuItems = menuItems
    .filter((item) => item.isActive && item.roles.includes(userRole))
    .sort((a, b) => a.order - b.order);

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">
          🏠 BĐS {userRole === "admin" ? "Admin" : "Employee"}
        </h1>
        {/* Show current user info */}
        {user && (
          <div className="mt-2 text-sm text-gray-600">
            {user.username || user.email}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {visibleMenuItems.map((item) => {
          const IconComponent =
            iconMap[item.icon as keyof typeof iconMap] || HomeIcon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                  : ""
              }`}
            >
              <IconComponent
                className={`w-5 h-5 mr-3 ${
                  isActive ? "text-blue-500" : "text-gray-500"
                }`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info for debugging */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-400">
          <div>Role: {userRole}</div>
          <div>
            Items: {visibleMenuItems.length}/{menuItems.length}
          </div>
        </div>
      )}
    </aside>
  );
}
