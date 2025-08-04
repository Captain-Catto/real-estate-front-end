"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/store/slices/authSlice";
import { useMemo, useState, useEffect } from "react";
import { SidebarAPI } from "@/services/sidebarAPI";

export interface SidebarMenuItem {
  id: string;
  title: string;
  path: string;
  parentId?: string;
  order: number;
  isVisible: boolean;
  allowedRoles: ("admin" | "employee")[];
  metadata?: {
    isGroup?: boolean;
    [key: string]: any;
  };
}

export interface SidebarConfig {
  _id: string;
  name: string;
  items: SidebarMenuItem[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedSidebarGroup {
  id: string;
  title: string;
  path: string;
  order: number;
  children: SidebarMenuItem[];
}

export function useSidebarConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SidebarConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sidebar config from API
  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        setError(null);

        if (!user?.role || !["admin", "employee"].includes(user.role)) {
          setError("Không có quyền truy cập");
          return;
        }

        const response = await SidebarAPI.getSidebarConfig();
        if (response.success) {
          setConfig(response.data);
        } else {
          setError(response.message || "Lỗi khi tải cấu hình sidebar");
        }
      } catch (err) {
        console.error("Error fetching sidebar config:", err);
        setError("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [user?.role]);

  // Process items into hierarchical structure
  const processedGroups = useMemo(() => {
    if (!config || !user?.role) return [];

    // Filter items by user role and visibility
    const filteredItems = config.items
      .filter(
        (item) =>
          item.isVisible &&
          item.allowedRoles.includes(user.role as "admin" | "employee")
      )
      .sort((a, b) => a.order - b.order);

    // Separate groups and children
    const groups = filteredItems.filter((item) => item.metadata?.isGroup);
    const children = filteredItems.filter((item) => item.parentId);

    // Build hierarchical structure
    const processedGroups: ProcessedSidebarGroup[] = groups.map((group) => ({
      id: group.id,
      title: group.title,
      path: group.path,
      order: group.order,
      children: children
        .filter((child) => child.parentId === group.id)
        .sort((a, b) => a.order - b.order),
    }));

    return processedGroups.sort((a, b) => a.order - b.order);
  }, [config, user?.role]);

  // Get flat menu items (for breadcrumbs, etc.)
  const flatMenuItems = useMemo(() => {
    if (!config || !user?.role) return [];

    return config.items
      .filter(
        (item) =>
          item.isVisible &&
          item.allowedRoles.includes(user.role as "admin" | "employee") &&
          !item.metadata?.isGroup
      )
      .sort((a, b) => a.order - b.order);
  }, [config, user?.role]);

  // Find menu item by path
  const findMenuByPath = useMemo(() => {
    return (path: string): SidebarMenuItem | undefined => {
      return flatMenuItems.find((item) => item.path === path);
    };
  }, [flatMenuItems]);

  // Get breadcrumb for current path
  const getBreadcrumb = useMemo(() => {
    return (path: string): SidebarMenuItem[] => {
      const currentItem = findMenuByPath(path);
      if (!currentItem) return [];

      const breadcrumb: SidebarMenuItem[] = [currentItem];

      // Find parent group if exists
      if (currentItem.parentId) {
        const parentGroup = config?.items.find(
          (item) => item.id === currentItem.parentId
        );
        if (parentGroup) {
          breadcrumb.unshift(parentGroup);
        }
      }

      return breadcrumb;
    };
  }, [findMenuByPath, config]);

  // Refresh config
  const refreshConfig = async () => {
    if (!user?.role || !["admin", "employee"].includes(user.role)) return;

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.getSidebarConfig();
      if (response.success) {
        setConfig(response.data);
      } else {
        setError(response.message || "Lỗi khi tải cấu hình sidebar");
      }
    } catch (err) {
      console.error("Error refreshing sidebar config:", err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    processedGroups,
    flatMenuItems,
    findMenuByPath,
    getBreadcrumb,
    loading,
    error,
    refreshConfig,
  };
}

// Management functions for admin only
export function useSidebarManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Get all configs
  const getAllConfigs = async () => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền truy cập");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.getAllConfigs();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi tải danh sách cấu hình");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new config
  const createConfig = async (configData: Partial<SidebarConfig>) => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền tạo cấu hình");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.createConfig(configData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi tạo cấu hình");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update config
  const updateConfig = async (
    id: string,
    configData: Partial<SidebarConfig>
  ) => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền cập nhật cấu hình");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.updateConfig(id, configData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi cập nhật cấu hình");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete config
  const deleteConfig = async (id: string) => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền xóa cấu hình");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.deleteConfig(id);
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || "Lỗi khi xóa cấu hình");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set default config
  const setDefaultConfig = async (id: string) => {
    if (!isAdmin)
      throw new Error("Chỉ admin mới có quyền đặt cấu hình mặc định");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.setDefaultConfig(id);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi đặt cấu hình mặc định");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reorder items
  const reorderItems = async (
    configId: string,
    itemOrders: Array<{ id: string; order: number }>
  ) => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền sắp xếp menu");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.reorderItems(configId, itemOrders);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi sắp xếp menu");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add menu item
  const addMenuItem = async (
    configId: string,
    itemData: Partial<SidebarMenuItem>
  ) => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền thêm menu");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.addMenuItem(configId, itemData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi thêm menu item");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove menu item
  const removeMenuItem = async (configId: string, itemId: string) => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền xóa menu");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.removeMenuItem(configId, itemId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi xóa menu item");
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    loading,
    error,
    getAllConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    reorderItems,
    addMenuItem,
    removeMenuItem,
  };
}
