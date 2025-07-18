"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
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
};

// Default employee menu items
const defaultEmployeeMenuItems: SidebarMenuItem[] = [
  {
    id: "dashboard",
    name: "Tổng quan",
    href: "/employee",
    icon: "HomeIcon",
    order: 1,
    isActive: true,
    roles: ["admin", "employee"],
  },
  {
    id: "posts",
    name: "Quản lý tin đăng",
    href: "/employee/quan-ly-tin-dang",
    icon: "DocumentTextIcon",
    order: 2,
    isActive: true,
    roles: ["admin", "employee"],
  },
  {
    id: "users",
    name: "Quản lý người dùng",
    href: "/employee/quan-ly-nguoi-dung",
    icon: "UserGroupIcon",
    order: 3,
    isActive: true,
    roles: ["employee"],
  },
  {
    id: "news",
    name: "Tin tức",
    href: "/employee/quan-ly-tin-tuc",
    icon: "NewspaperIcon",
    order: 4,
    isActive: true,
    roles: ["admin", "employee"],
  },
  {
    id: "transactions",
    name: "Giao dịch",
    href: "/employee/quan-ly-giao-dich",
    icon: "CurrencyDollarIcon",
    order: 5,
    isActive: true,
    roles: ["employee"],
  },
];

export default function DynamicEmployeeSidebar() {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>(
    defaultEmployeeMenuItems
  );

  // Load dynamic menu configuration
  useEffect(() => {
    const savedItems = localStorage.getItem("sidebarMenuItems");
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        // Convert admin paths to employee paths and filter for employee role
        const employeeItems = parsedItems
          .filter((item: SidebarMenuItem) => item.roles.includes("employee"))
          .map((item: SidebarMenuItem) => ({
            ...item,
            href: item.href.replace("/admin/", "/employee/"),
          }));

        if (employeeItems.length > 0) {
          setMenuItems(employeeItems);
        }
      } catch (error) {
        console.error("Error loading employee sidebar configuration:", error);
        // Keep default items on error
      }
    }
  }, []);

  // Filter menu items based on active status and employee role
  const visibleMenuItems = menuItems
    .filter((item) => item.isActive && item.roles.includes("employee"))
    .sort((a, b) => a.order - b.order);

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">🏠 BĐS Employee</h1>
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
          <div>Role: employee</div>
          <div>
            Items: {visibleMenuItems.length}/{menuItems.length}
          </div>
        </div>
      )}
    </aside>
  );
}
