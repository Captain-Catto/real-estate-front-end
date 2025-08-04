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

  // Fetch sidebar config from API only (no localStorage)
  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        setError(null);

        if (!user?.role || !["admin", "employee"].includes(user.role)) {
          setError("Không có quyền truy cập");
          setLoading(false);
          return;
        }

        // Always fetch from backend, get the default/active config
        const response = await SidebarAPI.getSidebarConfig();
        if (response.success && response.data) {
          setConfig(response.data);
        } else {
          setError(response.message || "Không tìm thấy cấu hình sidebar");
        }
      } catch (err) {
        console.error("Error fetching sidebar config:", err);
        setError("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    }

    if (user?.role) {
      fetchConfig();
    }
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

// Management functions for single config only
export function useSidebarManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Get the current active config
  const getCurrentConfig = async (): Promise<SidebarConfig> => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền truy cập");

    try {
      setLoading(true);
      setError(null);

      const response = await SidebarAPI.getSidebarConfig();
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Không tìm thấy cấu hình sidebar");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update the config
  const updateConfig = async (configData: Partial<SidebarConfig>): Promise<SidebarConfig> => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền cập nhật cấu hình");

    try {
      setLoading(true);
      setError(null);

      // Get current config to get the ID
      const currentConfig = await getCurrentConfig();
      
      const response = await SidebarAPI.updateConfig(currentConfig._id, configData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Lỗi khi cập nhật cấu hình");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a specific menu item
  const updateMenuItem = async (itemId: string, itemData: Partial<SidebarMenuItem>): Promise<SidebarConfig> => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền cập nhật menu item");

    try {
      setLoading(true);
      setError(null);

      const currentConfig = await getCurrentConfig();
      
      // Update the specific item
      const updatedItems = currentConfig.items.map(item => 
        item.id === itemId ? { ...item, ...itemData } : item
      );

      return await updateConfig({ items: updatedItems });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add new menu item
  const addMenuItem = async (itemData: Omit<SidebarMenuItem, 'id'>): Promise<SidebarConfig> => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền thêm menu item");

    try {
      setLoading(true);
      setError(null);

      const currentConfig = await getCurrentConfig();
      
      // Generate new ID
      const newId = `item_${Date.now()}`;
      const newItem: SidebarMenuItem = {
        ...itemData,
        id: newId,
      };

      const updatedItems = [...currentConfig.items, newItem];
      return await updateConfig({ items: updatedItems });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove menu item
  const removeMenuItem = async (itemId: string): Promise<SidebarConfig> => {
    if (!isAdmin) throw new Error("Chỉ admin mới có quyền xóa menu item");

    try {
      setLoading(true);
      setError(null);

      const currentConfig = await getCurrentConfig();
      
      // Remove the item and its children
      const updatedItems = currentConfig.items.filter(item => 
        item.id !== itemId && item.parentId !== itemId
      );

      return await updateConfig({ items: updatedItems });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
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

// Hook for sidebar permissions
export function useSidebarPermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const isAdmin = user?.role === "admin";
    const isEmployee = user?.role === "employee";

    return {
      canViewSidebar: isAdmin || isEmployee,
      canEditConfig: isAdmin,
      canCreateConfig: isAdmin,
      canDeleteConfig: isAdmin,
      canReorderItems: isAdmin,
      canManageMenu: isAdmin,
      isAdmin,
      isEmployee,
    };
  }, [user?.role]);

  return { permissions };
}
