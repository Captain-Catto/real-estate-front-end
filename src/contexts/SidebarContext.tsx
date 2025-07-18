"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import SidebarConfigService from "@/services/sidebarConfigService";
import { SidebarMenuItem, SidebarGroup } from "@/components/admin/AdminSidebar";

// Default fallback menu items
const fallbackMenuItems: SidebarMenuItem[] = [
  {
    id: "dashboard",
    name: "Tổng quan",
    href: "/admin",
    icon: "HomeIcon",
    order: 1,
    isActive: true,
    roles: ["admin", "employee"],
    groupId: "dashboard",
  },
  {
    id: "posts",
    name: "Quản lý tin đăng",
    href: "/admin/quan-ly-tin-dang",
    icon: "DocumentTextIcon",
    order: 2,
    isActive: true,
    roles: ["admin", "employee"],
    groupId: "content-management",
  },
  {
    id: "users",
    name: "Quản lý người dùng",
    href: "/admin/quan-ly-nguoi-dung",
    icon: "UserGroupIcon",
    order: 3,
    isActive: true,
    roles: ["admin"],
    groupId: "user-management",
  },
  {
    id: "news",
    name: "Tin tức",
    href: "/admin/quan-ly-tin-tuc",
    icon: "NewspaperIcon",
    order: 4,
    isActive: true,
    roles: ["admin", "employee"],
    groupId: "content-management",
  },
  {
    id: "transactions",
    name: "Giao dịch",
    href: "/admin/quan-ly-giao-dich",
    icon: "CurrencyDollarIcon",
    order: 5,
    isActive: true,
    roles: ["admin"],
    groupId: "financial",
  },
  {
    id: "stats",
    name: "Thống kê",
    href: "/admin/thong-ke",
    icon: "ChartBarIcon",
    order: 6,
    isActive: true,
    roles: ["admin"],
    groupId: "financial",
  },
  {
    id: "settings",
    name: "Cài đặt",
    href: "/admin/cai-dat",
    icon: "CogIcon",
    order: 7,
    isActive: true,
    roles: ["admin"],
    groupId: "system",
  },
  {
    id: "sidebar-config",
    name: "Cấu hình Sidebar",
    href: "/admin/cau-hinh-sidebar",
    icon: "CogIcon",
    order: 8,
    isActive: true,
    roles: ["admin"],
    groupId: "system",
  },
  {
    id: "locations",
    name: "Quản lý địa chính",
    href: "/admin/quan-ly-dia-chinh",
    icon: "MapIcon",
    order: 9,
    isActive: true,
    roles: ["admin"],
    groupId: "data-management",
  },
  {
    id: "projects",
    name: "Quản lý dự án",
    href: "/admin/quan-ly-du-an",
    icon: "BuildingOfficeIcon",
    order: 10,
    isActive: true,
    roles: ["admin"],
    groupId: "data-management",
  },
  {
    id: "developers",
    name: "Quản lý chủ đầu tư",
    href: "/admin/quan-ly-chu-dau-tu",
    icon: "UserGroupIcon",
    order: 11,
    isActive: true,
    roles: ["admin"],
    groupId: "user-management",
  },
  {
    id: "categories",
    name: "Quản lý danh mục",
    href: "/admin/quan-ly-danh-muc",
    icon: "DocumentTextIcon",
    order: 12,
    isActive: true,
    roles: ["admin"],
    groupId: "data-management",
  },
  {
    id: "areas",
    name: "Quản lý diện tích",
    href: "/admin/quan-ly-dien-tich",
    icon: "DocumentTextIcon",
    order: 13,
    isActive: true,
    roles: ["admin"],
    groupId: "data-management",
  },
  {
    id: "prices",
    name: "Quản lý giá",
    href: "/admin/quan-ly-gia",
    icon: "DocumentTextIcon",
    order: 14,
    isActive: true,
    roles: ["admin"],
    groupId: "data-management",
  },
];

// Default groups
const defaultGroups: SidebarGroup[] = [
  {
    id: "dashboard",
    name: "Tổng quan",
    icon: "HomeIcon",
    order: 1,
    isActive: true,
    isExpanded: true,
    description: "Dashboard và thống kê tổng quan",
  },
  {
    id: "content-management",
    name: "Quản lý nội dung",
    icon: "DocumentTextIcon",
    order: 2,
    isActive: true,
    isExpanded: true,
    description: "Quản lý tin đăng, tin tức và nội dung",
  },
  {
    id: "user-management",
    name: "Quản lý người dùng",
    icon: "UserGroupIcon",
    order: 3,
    isActive: true,
    isExpanded: true,
    description: "Quản lý người dùng, chủ đầu tư",
  },
  {
    id: "data-management",
    name: "Quản lý dữ liệu",
    icon: "MapIcon",
    order: 4,
    isActive: true,
    isExpanded: true,
    description: "Quản lý địa chính, dự án, danh mục",
  },
  {
    id: "financial",
    name: "Tài chính",
    icon: "CurrencyDollarIcon",
    order: 5,
    isActive: true,
    isExpanded: true,
    description: "Quản lý giao dịch, thống kê tài chính",
  },
  {
    id: "system",
    name: "Cài đặt hệ thống",
    icon: "CogIcon",
    order: 6,
    isActive: true,
    isExpanded: true,
    description: "Cài đặt và cấu hình hệ thống",
  },
];

interface SidebarContextType {
  menuItems: SidebarMenuItem[];
  groups: SidebarGroup[];
  loading: boolean;
  error: string | null;
  refetchSidebarConfig: () => Promise<void>;
  updateMenuItems: (newItems: SidebarMenuItem[]) => void;
  updateGroups: (newGroups: SidebarGroup[]) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [menuItems, setMenuItems] =
    useState<SidebarMenuItem[]>(fallbackMenuItems);
  const [groups, setGroups] = useState<SidebarGroup[]>(defaultGroups);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Determine user role from auth context
  const userRole = user?.role as "admin" | "employee" | undefined;
  const hasValidRole = userRole === "admin" || userRole === "employee";

  const loadSidebarConfig = async () => {
    // Don't load if user is not authenticated or doesn't have valid role
    if (!isAuthenticated || !hasValidRole) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from backend first
      const response = await SidebarConfigService.getSidebarConfig();
      if (response.success && response.data.length > 0) {
        setMenuItems(response.data);
        console.log(
          "✅ Loaded sidebar config from backend:",
          response.data.length,
          "items"
        );
      } else {
        // Fallback to localStorage
        const savedItems = localStorage.getItem("sidebarMenuItems");
        if (savedItems) {
          try {
            const parsedItems = JSON.parse(savedItems);
            setMenuItems(parsedItems);
            console.log(
              "✅ Loaded sidebar config from localStorage:",
              parsedItems.length,
              "items"
            );
          } catch {
            setMenuItems(fallbackMenuItems);
            console.log(
              "⚠️ Failed to parse localStorage, using fallback items"
            );
          }
        } else {
          setMenuItems(fallbackMenuItems);
          console.log("ℹ️ No saved config found, using fallback items");
        }
      }

      // Load groups from localStorage if available
      const savedGroups = localStorage.getItem("sidebarGroups");
      if (savedGroups) {
        try {
          const parsedGroups = JSON.parse(savedGroups);
          setGroups(parsedGroups);
          console.log("✅ Loaded sidebar groups from localStorage");
        } catch {
          setGroups(defaultGroups);
          console.log(
            "⚠️ Failed to parse groups from localStorage, using defaults"
          );
        }
      }
    } catch (error) {
      console.error("❌ Error loading sidebar config:", error);
      setError("Không thể tải cấu hình sidebar");
      // Fallback to default items
      setMenuItems(fallbackMenuItems);
      setGroups(defaultGroups);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch once when user is authenticated and has valid role
  useEffect(() => {
    if (isAuthenticated && hasValidRole && !hasInitialized) {
      console.log("🔄 Initializing sidebar config for role:", userRole);
      loadSidebarConfig().then(() => {
        setHasInitialized(true);
      });
    }
  }, [isAuthenticated, hasValidRole, hasInitialized, userRole]);

  const refetchSidebarConfig = async () => {
    console.log("🔄 Manually refetching sidebar config");
    await loadSidebarConfig();
  };

  const updateMenuItems = (newItems: SidebarMenuItem[]) => {
    setMenuItems(newItems);
    // Also update localStorage
    localStorage.setItem("sidebarMenuItems", JSON.stringify(newItems));
    console.log("✅ Updated menu items:", newItems.length, "items");
  };

  const updateGroups = (newGroups: SidebarGroup[]) => {
    setGroups(newGroups);
    // Also update localStorage
    localStorage.setItem("sidebarGroups", JSON.stringify(newGroups));
    console.log("✅ Updated groups:", newGroups.length, "groups");
  };

  const value: SidebarContextType = {
    menuItems,
    groups,
    loading,
    error,
    refetchSidebarConfig,
    updateMenuItems,
    updateGroups,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
