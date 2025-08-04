"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/store/slices/authSlice";
import { useMemo, useState, useEffect } from "react";
import { SidebarAPI } from "@/services/sidebarAPI";

export interface SidebarMenuItem {
  id: string;
  name: string;
  href: string;
  order: number;
  isActive: boolean;
  roles: UserRole[];
  description?: string;
  children?: SidebarMenuItem[];
}

export interface SidebarGroup {
  id: string;
  name: string;
  order: number;
  items: SidebarMenuItem[];
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

// Default sidebar configuration - Updated with real admin pages
const defaultSidebarConfig: SidebarGroup[] = [
  {
    id: "dashboard",
    name: "Tổng quan",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        href: "/admin",
        order: 1,
        isActive: true,
        roles: ["admin", "employee"],
        description: "Trang tổng quan hệ thống",
      },
      {
        id: "stats",
        name: "Thống kê",
        href: "/admin/thong-ke",
        order: 2,
        isActive: true,
        roles: ["admin"],
        description: "Báo cáo và thống kê chi tiết",
        badge: "Hot",
      },
    ],
    isCollapsible: false,
    defaultExpanded: true,
  },
  {
    id: "content-management",
    name: "Quản lý nội dung",
    items: [
      {
        id: "posts",
        name: "Quản lý tin đăng",
        href: "/admin/quan-ly-tin-dang",
        order: 1,
        isActive: true,
        roles: ["admin", "employee"],
        description: "Quản lý và duyệt tin đăng BĐS",
        badge: "Primary",
      },
      {
        id: "news",
        name: "Quản lý tin tức",
        href: "/admin/quan-ly-tin-tuc",
        order: 2,
        isActive: true,
        roles: ["admin", "employee"],
        description: "Quản lý bài viết tin tức",
      },
      {
        id: "categories",
        name: "Danh mục BĐS",
        href: "/admin/quan-ly-danh-muc",
        order: 3,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý danh mục bất động sản",
      },
      {
        id: "news-section",
        name: "Tin tức",
        href: "/admin/news",
        order: 4,
        isActive: true,
        roles: ["admin", "employee"],
        description: "Quản lý tin tức và bài viết",
      },
    ],
    isCollapsible: true,
    defaultExpanded: true,
  },
  {
    id: "user-management",
    name: "Quản lý người dùng",
    items: [
      {
        id: "users",
        name: "Người dùng",
        href: "/admin/quan-ly-nguoi-dung",
        order: 1,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý tài khoản người dùng",
      },
      {
        id: "contact-management",
        name: "Liên hệ",
        href: "/admin/quan-ly-lien-he",
        order: 2,
        isActive: true,
        roles: ["admin", "employee"],
        description: "Quản lý yêu cầu liên hệ",
      },
      {
        id: "developers",
        name: "Chủ đầu tư",
        href: "/admin/quan-ly-chu-dau-tu",
        order: 3,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý thông tin chủ đầu tư",
      },
    ],
    isCollapsible: true,
    defaultExpanded: false,
  },
  {
    id: "property-data",
    name: "Dữ liệu BĐS",
    items: [
      {
        id: "projects",
        name: "Dự án",
        href: "/admin/quan-ly-du-an",
        order: 1,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý dự án bất động sản",
      },
      {
        id: "locations",
        name: "Địa chính",
        href: "/admin/quan-ly-dia-chinh",
        order: 2,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý tỉnh thành, quận huyện",
      },
      {
        id: "areas",
        name: "Diện tích",
        href: "/admin/quan-ly-dien-tich",
        order: 3,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý khoảng diện tích",
      },
      {
        id: "areas-page",
        name: "Quản lý diện tích",
        href: "/admin/areas",
        order: 4,
        isActive: true,
        roles: ["admin"],
        description: "Trang quản lý diện tích chi tiết",
      },
      {
        id: "prices",
        name: "Khoảng giá",
        href: "/admin/quan-ly-gia",
        order: 5,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý khoảng giá BĐS",
      },
    ],
    isCollapsible: true,
    defaultExpanded: false,
  },
  {
    id: "financial",
    name: "Tài chính",
    items: [
      {
        id: "transactions",
        name: "Giao dịch",
        href: "/admin/quan-ly-giao-dich",
        order: 1,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý giao dịch thanh toán",
      },
      {
        id: "packages",
        name: "Gói tin đăng",
        href: "/admin/quan-ly-gia-tin-dang",
        order: 2,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý gói và giá tin đăng",
      },
    ],
    isCollapsible: true,
    defaultExpanded: false,
  },
  {
    id: "system-settings",
    name: "Cài đặt hệ thống",
    items: [
      {
        id: "general-settings",
        name: "Cài đặt chung",
        href: "/admin/cai-dat",
        order: 1,
        isActive: true,
        roles: ["admin"],
        description: "Cài đặt tổng quan hệ thống",
      },
      {
        id: "header-settings",
        name: "Cài đặt header",
        href: "/admin/cai-dat-header",
        order: 2,
        isActive: true,
        roles: ["admin"],
        description: "Cấu hình header trang web",
      },
      {
        id: "sidebar-config",
        name: "Cấu hình Sidebar",
        href: "/admin/cau-hinh-sidebar",
        order: 3,
        isActive: true,
        roles: ["admin"],
        description: "Quản lý cấu hình menu sidebar",
        badge: "New",
      },
    ],
    isCollapsible: true,
    defaultExpanded: false,
  },
];

// Đọc config từ localStorage - function helper
const getStoredConfig = () => {
  if (typeof window === "undefined") return defaultSidebarConfig;

  try {
    const stored = localStorage.getItem("sidebarConfig");
    if (stored) {
      const parsedConfig = JSON.parse(stored);
      // Validate config structure
      if (Array.isArray(parsedConfig) && parsedConfig.length > 0) {
        return parsedConfig;
      }
    }
  } catch (error) {
    console.error("Error reading sidebar config from localStorage:", error);
  }

  return defaultSidebarConfig;
};

/**
 * Hook để quản lý cấu hình sidebar dựa trên role của user
 */
export function useSidebarConfig(customConfig?: SidebarGroup[]) {
  const { user, isAuthenticated } = useAuth();

  // State để force re-render khi config thay đổi
  const [configVersion, setConfigVersion] = useState(0);
  const [apiConfig, setApiConfig] = useState<SidebarGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load config từ API khi component mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const loadConfigFromAPI = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await SidebarAPI.getSidebarConfig();

        if (response.success) {
          setApiConfig(response.data.groups);
          console.log(
            "✅ Loaded sidebar config from API:",
            response.data.groups
          );
        } else {
          throw new Error("Failed to load sidebar config");
        }
      } catch (err) {
        console.warn(
          "⚠️ Failed to load from API, using localStorage fallback:",
          err
        );
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to localStorage
        const storedConfig = getStoredConfig();
        setApiConfig(storedConfig);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigFromAPI();
  }, [isAuthenticated, configVersion]);

  // Listen for localStorage changes (fallback)
  useEffect(() => {
    const handleStorageChange = () => {
      setConfigVersion((prev) => prev + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filteredSidebarConfig = useMemo(() => {
    if (!isAuthenticated || !user?.role) return [];

    // Sử dụng config từ API nếu có, fallback localStorage, cuối cùng default
    const config = customConfig || apiConfig || getStoredConfig();
    const userRole = user.role;

    return config
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item: SidebarMenuItem) =>
            item.isActive && item.roles.includes(userRole)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [user?.role, isAuthenticated, customConfig, apiConfig]);

  const getMenuItemsCount = useMemo(() => {
    return filteredSidebarConfig.reduce(
      (total, group) => total + group.items.length,
      0
    );
  }, [filteredSidebarConfig]);

  const hasAccessToMenuItem = (menuId: string) => {
    return filteredSidebarConfig.some((group) =>
      group.items.some((item: SidebarMenuItem) => item.id === menuId)
    );
  };

  const getMenuItemByHref = (href: string) => {
    for (const group of filteredSidebarConfig) {
      const item = group.items.find(
        (item: SidebarMenuItem) => item.href === href
      );
      if (item) return item;
    }
    return null;
  };

  const getGroupsWithAccess = () => {
    return filteredSidebarConfig.map((group) => ({
      id: group.id,
      name: group.name,
      itemsCount: group.items.length,
      hasAccess: group.items.length > 0,
    }));
  };

  // Function để update config và gọi API
  const updateSidebarConfig = async (newConfig: SidebarGroup[]) => {
    try {
      // Cập nhật state local trước để UI responsive
      setApiConfig(newConfig);

      // Gọi API để lưu vào backend
      const response = await SidebarAPI.updateSidebarConfig(newConfig);

      if (response.success) {
        // Lưu vào localStorage làm backup
        localStorage.setItem("sidebarConfig", JSON.stringify(newConfig));
        console.log("✅ Config updated successfully via API!");
      } else {
        throw new Error(response.message || "Failed to update config");
      }
    } catch (error) {
      console.error("❌ Error saving sidebar config:", error);
      // Fallback: lưu localStorage
      localStorage.setItem("sidebarConfig", JSON.stringify(newConfig));
      // Trigger re-render để show fallback config
      setConfigVersion((prev) => prev + 1);
      throw error;
    }
  };

  // Function để reset về config mặc định
  const resetSidebarConfig = async () => {
    try {
      // Gọi API để reset
      const response = await SidebarAPI.resetSidebarConfig();

      if (response.success) {
        // Cập nhật state với config mới từ API
        setApiConfig(response.data.groups);
        // Xóa localStorage
        localStorage.removeItem("sidebarConfig");
        console.log("✅ Config reset to default via API!");
      } else {
        throw new Error(response.message || "Failed to reset config");
      }
    } catch (error) {
      console.error("❌ Error resetting sidebar config:", error);
      // Fallback: xóa localStorage và trigger re-render
      localStorage.removeItem("sidebarConfig");
      setConfigVersion((prev) => prev + 1);
      throw error;
    }
  };

  return {
    sidebarConfig: filteredSidebarConfig,
    menuItemsCount: getMenuItemsCount,
    hasAccessToMenuItem,
    getMenuItemByHref,
    getGroupsWithAccess,
    updateSidebarConfig,
    resetSidebarConfig,
    userRole: user?.role || null,
    isLoading,
    error,
  };
}

/**
 * Hook để kiểm tra quyền truy cập vào một menu item cụ thể
 */
export function useMenuAccess(menuId: string) {
  const { hasAccessToMenuItem } = useSidebarConfig();
  return hasAccessToMenuItem(menuId);
}

/**
 * Hook để lấy thông tin về các quyền sidebar của user hiện tại
 */
export function useSidebarPermissions() {
  const { user } = useAuth();
  const { sidebarConfig, menuItemsCount, getGroupsWithAccess } =
    useSidebarConfig();

  const permissions = useMemo(() => {
    if (!user?.role) return null;

    const groupsAccess = getGroupsWithAccess();
    const totalGroups = defaultSidebarConfig.length;
    const accessibleGroups = groupsAccess.filter((g) => g.hasAccess).length;

    return {
      role: user.role,
      totalMenuItems: menuItemsCount,
      accessibleGroups,
      totalGroups,
      accessPercentage: Math.round((accessibleGroups / totalGroups) * 100),
      groupsAccess,
    };
  }, [user?.role, menuItemsCount, getGroupsWithAccess]);

  return {
    permissions,
    sidebarConfig,
  };
}

export default useSidebarConfig;
