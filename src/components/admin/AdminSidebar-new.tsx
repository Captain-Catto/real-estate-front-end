"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarConfig } from "@/hooks/useSidebarConfig";
import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { processedGroups, loading, error } = useSidebarConfig();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(processedGroups.map((g) => g.id))
  );

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Show loading state while checking auth or loading config
  if (!isAuthenticated || !user || loading) {
    return (
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">BĐS Admin</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-2 text-sm text-gray-600">
              {loading ? "Đang tải menu..." : "Đang xác thực..."}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Show error state
  if (error) {
    return (
      <aside className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">BĐS Admin</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center text-red-600">
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="block">
          <h1 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
            BĐS Admin
          </h1>
        </Link>
        <div className="mt-1 text-sm text-gray-600">Chào {user.email}</div>
        <div className="mt-1 text-xs text-blue-600 font-medium capitalize">
          {user.role}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {processedGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const hasChildren = group.children.length > 0;

            return (
              <div key={group.id}>
                {/* Group Header */}
                <div
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                    transition-colors duration-200
                    ${
                      hasChildren
                        ? "hover:bg-gray-50 text-gray-700 font-medium"
                        : pathname === group.path
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }
                  `}
                  onClick={() => {
                    if (hasChildren) {
                      toggleGroup(group.id);
                    }
                  }}
                >
                  {hasChildren ? (
                    <span className="text-sm">{group.title}</span>
                  ) : (
                    <Link href={group.path} className="flex-1 text-sm">
                      {group.title}
                    </Link>
                  )}

                  {hasChildren && (
                    <ChevronRightIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </div>

                {/* Group Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {group.children.map((item) => {
                      const isActive = pathname === item.path;

                      return (
                        <Link
                          key={item.id}
                          href={item.path}
                          className={`
                            block px-3 py-2 rounded-lg text-sm transition-colors duration-200
                            ${
                              isActive
                                ? "bg-blue-100 text-blue-700 font-medium border-l-4 border-blue-500"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            }
                          `}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <div>Menu được tùy chỉnh</div>
          <div className="mt-1">
            Role: <span className="font-medium capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
