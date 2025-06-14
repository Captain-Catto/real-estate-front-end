"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: HomeIcon,
  },
  {
    name: "Quản lý BĐS",
    href: "/admin/properties",
    icon: BuildingOfficeIcon,
  },
  {
    name: "Quản lý tin đăng",
    href: "/admin/posts",
    icon: DocumentTextIcon,
  },
  {
    name: "Quản lý người dùng",
    href: "/admin/quan-ly-nguoi-dung",
    icon: UserGroupIcon,
  },
  {
    name: "Tin tức",
    href: "/admin/news",
    icon: NewspaperIcon,
  },
  {
    name: "Giao dịch",
    href: "/admin/transactions",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Thống kê",
    href: "/admin/analytics",
    icon: ChartBarIcon,
  },
  {
    name: "Cài đặt",
    href: "/admin/settings",
    icon: CogIcon,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">🏠 BĐS Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
