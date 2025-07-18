import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchSidebarConfig,
  saveSidebarConfig,
  toggleGroup,
  setGroupExpanded,
  updateMenuItems,
  updateGroups,
  initializeGroupExpanded,
  clearError,
  resetToDefaults,
} from "@/store/slices/sidebarSlice";
import { SidebarMenuItem, SidebarGroup } from "@/components/admin/AdminSidebar";

export function useSidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useAuth();

  // Debug: Log entire state to check what's available
  const entireState = useSelector((state: RootState) => state);
  console.log("🔍 Debug: Entire Redux state:", entireState);

  // Selectors - sử dụng typing explicit với safe access
  const menuItems = useSelector(
    (state: RootState) => state.sidebar?.menuItems || []
  );
  const groups = useSelector((state: RootState) => state.sidebar?.groups || []);
  const groupExpanded = useSelector(
    (state: RootState) => state.sidebar?.groupExpanded || {}
  );
  const loading = useSelector(
    (state: RootState) => state.sidebar?.loading || false
  );
  const error = useSelector((state: RootState) => state.sidebar?.error || null);
  const isInitialized = useSelector(
    (state: RootState) => state.sidebar?.isInitialized || false
  );

  // Determine user role
  const userRole = user?.role as "admin" | "employee" | undefined;
  const hasValidRole = userRole === "admin" || userRole === "employee";

  // Filtered menu items based on user role - sử dụng useMemo để tránh re-compute
  const filteredMenuItems = useMemo(() => {
    if (!userRole) return [];
    return menuItems
      .filter(
        (item: SidebarMenuItem) =>
          item.isActive && item.roles.includes(userRole)
      )
      .sort((a: SidebarMenuItem, b: SidebarMenuItem) => a.order - b.order);
  }, [menuItems, userRole]);

  const groupedMenuItems = useMemo(() => {
    return filteredMenuItems.reduce(
      (acc: Record<string, SidebarMenuItem[]>, item: SidebarMenuItem) => {
        const groupId = item.groupId || "ungrouped";
        if (!acc[groupId]) {
          acc[groupId] = [];
        }
        acc[groupId].push(item);
        return acc;
      },
      {} as Record<string, SidebarMenuItem[]>
    );
  }, [filteredMenuItems]);

  // Initialize sidebar configuration when user is authenticated
  // Sử dụng một cơ chế đơn giản hơn để tránh re-fetch
  useEffect(() => {
    // Chỉ log khi debug
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 useSidebar useEffect triggered:", {
        isAuthenticated,
        hasValidRole,
        isInitialized,
        userRole,
        loading,
        userId: user?.id,
      });
    }

    // Chỉ initialize khi tất cả conditions đều true VÀ chưa được initialized
    if (
      isAuthenticated &&
      hasValidRole &&
      !isInitialized &&
      !loading &&
      user?.id
    ) {
      console.log(
        "🚀 Initializing sidebar for user:",
        user.id,
        "role:",
        userRole
      );

      // Fetch menu items configuration (groups will be loaded automatically from defaults)
      dispatch(fetchSidebarConfig());
    }
  }, [
    dispatch,
    isAuthenticated,
    hasValidRole,
    isInitialized,
    userRole,
    loading,
    user?.id,
  ]);

  // Initialize group expanded state after groups are loaded
  useEffect(() => {
    if (groups.length > 0 && Object.keys(groupExpanded).length === 0) {
      dispatch(initializeGroupExpanded());
    }
  }, [dispatch, groups, groupExpanded]);

  // Actions
  const actions = {
    // Toggle group expanded/collapsed state
    toggleGroup: (groupId: string) => {
      dispatch(toggleGroup(groupId));
    },

    // Set specific group expanded state
    setGroupExpanded: (groupId: string, expanded: boolean) => {
      dispatch(setGroupExpanded({ groupId, expanded }));
    },

    // Update menu items (with auto-save to backend)
    updateMenuItems: async (newItems: SidebarMenuItem[]) => {
      // Update UI immediately
      dispatch(updateMenuItems(newItems));

      // Save to backend (async)
      try {
        await dispatch(saveSidebarConfig(newItems)).unwrap();
      } catch (error) {
        console.warn("Failed to save to backend, but saved locally:", error);
      }
    },

    // Update groups
    updateGroups: (newGroups: SidebarGroup[]) => {
      dispatch(updateGroups(newGroups));
    },

    // Refresh configuration from backend
    refetchConfig: async () => {
      try {
        await dispatch(fetchSidebarConfig()).unwrap();
        console.log("✅ Sidebar config refreshed");
      } catch (error) {
        console.error("❌ Failed to refresh sidebar config:", error);
        throw error;
      }
    },

    // Save current configuration to backend
    saveConfig: async (items?: SidebarMenuItem[]) => {
      try {
        const itemsToSave = items || menuItems;
        await dispatch(saveSidebarConfig(itemsToSave)).unwrap();
        console.log("✅ Sidebar config saved");
      } catch (error) {
        console.error("❌ Failed to save sidebar config:", error);
        throw error;
      }
    },

    // Reset to default configuration
    resetToDefaults: () => {
      dispatch(resetToDefaults());
    },

    // Clear error state
    clearError: () => {
      dispatch(clearError());
    },
  };

  return {
    // State
    menuItems,
    groups,
    groupExpanded,
    filteredMenuItems,
    groupedMenuItems,
    loading,
    error,
    isInitialized,

    // User info
    userRole,
    hasValidRole,

    // Actions
    ...actions,
  };
}

// Hook for components that only need to read sidebar state
export function useSidebarState() {
  const { user } = useAuth();
  const userRole = user?.role as "admin" | "employee" | undefined;

  const menuItems = useSelector(
    (state: RootState) => state.sidebar?.menuItems || []
  );
  const groups = useSelector((state: RootState) => state.sidebar?.groups || []);
  const groupExpanded = useSelector(
    (state: RootState) => state.sidebar?.groupExpanded || {}
  );
  const loading = useSelector(
    (state: RootState) => state.sidebar?.loading || false
  );
  const error = useSelector((state: RootState) => state.sidebar?.error || null);
  const isInitialized = useSelector(
    (state: RootState) => state.sidebar?.isInitialized || false
  );

  // Filtered menu items - sử dụng useMemo thay vì selectors
  const filteredMenuItems = useMemo(() => {
    if (!userRole) return [];
    return menuItems
      .filter(
        (item: SidebarMenuItem) =>
          item.isActive && item.roles.includes(userRole)
      )
      .sort((a: SidebarMenuItem, b: SidebarMenuItem) => a.order - b.order);
  }, [menuItems, userRole]);

  const groupedMenuItems = useMemo(() => {
    return filteredMenuItems.reduce(
      (acc: Record<string, SidebarMenuItem[]>, item: SidebarMenuItem) => {
        const groupId = item.groupId || "ungrouped";
        if (!acc[groupId]) {
          acc[groupId] = [];
        }
        acc[groupId].push(item);
        return acc;
      },
      {} as Record<string, SidebarMenuItem[]>
    );
  }, [filteredMenuItems]);

  return {
    menuItems,
    groups,
    groupExpanded,
    filteredMenuItems,
    groupedMenuItems,
    loading,
    error,
    isInitialized,
    userRole,
    hasValidRole: userRole === "admin" || userRole === "employee",
  };
}
