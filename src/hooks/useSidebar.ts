"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useMemo, useEffect, useState } from "react";
import {
  fetchSidebarConfig,
  updateSidebarItem,
  addSidebarItem,
  deleteSidebarItem,
  reorderSidebarItems,
  clearError,
  clearConfig,
  type SidebarMenuItem,
  type ProcessedSidebarGroup,
} from "@/store/slices/sidebarSlice";
import { permissionService } from "@/services/permissionService";

/**
 * Check if user has required permissions for an item
 */
const hasRequiredPermissions = (
  itemPermissions: string[] | undefined,
  userPermissions: string[],
  isAdmin: boolean
): boolean => {
  // Admin has all permissions
  if (isAdmin) return true;

  // No permissions required
  if (!itemPermissions || itemPermissions.length === 0) return true;

  // Check if user has at least one required permission
  return itemPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
};

/**
 * Main sidebar hook - handles reading sidebar configuration
 * Simplified and optimized version with permission checking
 */
export function useSidebar() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { config, loading, error } = useAppSelector((state) => state.sidebar);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  // Fetch user permissions for employees
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user) {
        setUserPermissions([]);
        setPermissionsLoading(false); // Don't keep loading when no user
        return;
      }

      if (isAdmin) {
        setUserPermissions([]);
        setPermissionsLoading(false);
        return;
      }

      try {
        setPermissionsLoading(true);
        const response = await permissionService.getUserPermissions(user.id);
        if (response.success && response.data.permissions) {
          setUserPermissions(response.data.permissions);
        }
      } catch (error) {
        console.error("Failed to fetch user permissions:", error);
        setUserPermissions([]);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchUserPermissions();
  }, [user, isAdmin]);

  // Auto-fetch config when user is authenticated
  useEffect(() => {
    if (user?.role && ["admin", "employee"].includes(user.role) && !config) {
      dispatch(fetchSidebarConfig());
    }
  }, [user?.role, config, dispatch]);

  // Clear config on logout
  useEffect(() => {
    if (!user?.role || !["admin", "employee"].includes(user.role)) {
      dispatch(clearConfig());
    }
  }, [user?.role, dispatch]);

  // Process items into groups and children with permission checking
  const processedGroups = useMemo((): ProcessedSidebarGroup[] => {
    if (!config || !user?.role || permissionsLoading) return [];

    const filteredItems = config.items
      .filter(
        (item) =>
          item.isVisible &&
          item.allowedRoles.includes(user.role as "admin" | "employee") &&
          hasRequiredPermissions(
            item.metadata?.permissions,
            userPermissions,
            isAdmin
          )
      )
      .sort((a, b) => a.order - b.order);

    const groups = filteredItems.filter((item) => item.metadata?.isGroup);
    const children = filteredItems.filter((item) => item.parentId);

    // Fallback: create default group if no groups exist
    if (groups.length === 0 && filteredItems.length > 0) {
      return [
        {
          id: "default-menu",
          title: "Menu Chính",
          path: "#",
          order: 0,
          children: filteredItems,
        },
      ];
    }

    // Build hierarchical structure
    return groups
      .map((group) => {
        const groupChildren = children
          .filter((child) => child.parentId === group.id)
          .sort((a, b) => a.order - b.order);

        // Only show group if it has visible children (or it's admin)
        if (groupChildren.length === 0 && !isAdmin) {
          return null;
        }

        return {
          id: group.id,
          title: group.title,
          path: group.path,
          order: group.order,
          children: groupChildren,
        };
      })
      .filter((group): group is ProcessedSidebarGroup => group !== null)
      .sort((a, b) => a.order - b.order);
  }, [config, user?.role, userPermissions, isAdmin, permissionsLoading]);

  // Get flat menu items (for breadcrumbs, permissions, etc.) with permission checking
  const flatMenuItems = useMemo(() => {
    if (!config || !user?.role || permissionsLoading) return [];

    return config.items
      .filter(
        (item) =>
          item.isVisible &&
          item.allowedRoles.includes(user.role as "admin" | "employee") &&
          !item.metadata?.isGroup &&
          hasRequiredPermissions(
            item.metadata?.permissions,
            userPermissions,
            isAdmin
          )
      )
      .sort((a, b) => a.order - b.order);
  }, [config, user?.role, userPermissions, isAdmin, permissionsLoading]);

  return {
    config,
    processedGroups,
    flatMenuItems,
    loading: loading || permissionsLoading,
    error,
  };
}

/**
 * Sidebar management hook - handles CRUD operations (Admin only)
 */
export function useSidebarManagement() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.sidebar);

  const isAdmin = user?.role === "admin";

  const updateItem = async (
    itemId: string,
    itemData: Partial<SidebarMenuItem>
  ) => {
    if (!isAdmin) throw new Error("Access denied");

    const result = await dispatch(updateSidebarItem({ itemId, itemData }));
    if (updateSidebarItem.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload;
  };

  const addItem = async (itemData: Omit<SidebarMenuItem, "id">) => {
    if (!isAdmin) throw new Error("Access denied");

    const result = await dispatch(addSidebarItem(itemData));
    if (addSidebarItem.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload;
  };

  const removeItem = async (itemId: string) => {
    if (!isAdmin) throw new Error("Access denied");

    const result = await dispatch(deleteSidebarItem(itemId));
    if (deleteSidebarItem.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload;
  };

  const reorderItems = async (
    itemOrders: Array<{ id: string; order: number }>
  ) => {
    if (!isAdmin) throw new Error("Access denied");

    const result = await dispatch(reorderSidebarItems(itemOrders));
    if (reorderSidebarItems.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload;
  };

  const clearSidebarError = () => dispatch(clearError());

  return {
    isAdmin,
    loading,
    error,
    updateItem,
    addItem,
    removeItem,
    reorderItems,
    clearError: clearSidebarError,
  };
}
