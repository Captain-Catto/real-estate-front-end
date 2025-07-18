"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  NewspaperIcon,
  CurrencyDollarIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

// Import interfaces from DynamicSidebarManager
export interface SidebarMenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  order: number;
  isActive: boolean;
  roles: ("admin" | "employee")[];
  description?: string;
  parentId?: string;
  children?: SidebarMenuItem[];
  groupId?: string;
}

export interface SidebarGroup {
  id: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
  isExpanded: boolean;
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const {
    groups,
    groupedMenuItems,
    groupExpanded,
    loading,
    error,
    isInitialized,
    userRole,
    hasValidRole,
    toggleGroup,
  } = useSidebar();

  console.log("🔄 AdminSidebar re-render:", {
    pathname,
    isAuthenticated,
    loading,
    isInitialized,
    userRole,
    hasValidRole,
    groupedMenuItemsLength: Object.keys(groupedMenuItems).length,
  });

  // Show loading state while checking auth or loading sidebar config
  if (loading || !isAuthenticated || !hasValidRole || !isInitialized) {
    return (
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">🏠 BĐS Admin</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          {!isAuthenticated ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2 text-sm text-gray-600">Đang xác thực...</div>
            </div>
          ) : !hasValidRole ? (
            <div className="text-center">
              <div className="text-red-600 text-sm">
                Bạn không có quyền truy cập vào trang này
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2 text-sm text-gray-600">
                Đang tải sidebar...
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Show error state
  if (error) {
    return (
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">🏠 BĐS Admin</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-600 text-sm mb-2">⚠️ Lỗi tải sidebar</div>
            <div className="text-gray-500 text-xs">{error}</div>
          </div>
        </div>
      </aside>
    );
  }

  // Dynamic title based on user role
  const getTitle = () => {
    switch (userRole) {
      case "admin":
        return "🏠 BĐS Admin";
      case "employee":
        return "🏠 BĐS Employee";
      default:
        return "🏠 BĐS";
    }
  };
  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {groups
          .filter((group) => group.isActive)
          .sort((a, b) => a.order - b.order)
          .map((group) => {
            const groupItems = groupedMenuItems[group.id] || [];
            const GroupIcon =
              iconMap[group.icon as keyof typeof iconMap] || HomeIcon;
            const isExpanded = groupExpanded[group.id];

            if (groupItems.length === 0) return null;

            return (
              <div key={group.id} className="mb-2">
                {/* Group Header - Clickable */}
                <div
                  className="px-6 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <GroupIcon className="w-3 h-3" />
                      <span>{group.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {groupItems.length}
                      </span>
                    </div>
                    <div
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Group Items - Collapsible */}
                {isExpanded && (
                  <div className="space-y-1 pb-2">
                    {groupItems.map((item: SidebarMenuItem) => {
                      const isActive = pathname === item.href;
                      const IconComponent =
                        iconMap[item.icon as keyof typeof iconMap] || HomeIcon;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <IconComponent className="w-5 h-5 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        {/* Ungrouped items */}
        {(() => {
          const ungroupedItems = groupedMenuItems["ungrouped"] || [];
          if (ungroupedItems.length > 0) {
            const isExpanded = groupExpanded["ungrouped"];

            return (
              <div key="ungrouped" className="mb-2">
                {/* Ungrouped Header - Clickable */}
                <div
                  className="px-6 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup("ungrouped")}
                >
                  <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Khác</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {ungroupedItems.length}
                      </span>
                    </div>
                    <div
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Ungrouped Items - Collapsible */}
                {isExpanded && (
                  <div className="space-y-1 pb-2">
                    {ungroupedItems.map((item: SidebarMenuItem) => {
                      const isActive = pathname === item.href;
                      const IconComponent =
                        iconMap[item.icon as keyof typeof iconMap] || HomeIcon;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <IconComponent className="w-5 h-5 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })()}
      </nav>
    </aside>
  );
}
