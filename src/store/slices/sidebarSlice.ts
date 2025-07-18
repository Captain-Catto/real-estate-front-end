import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
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

interface SidebarState {
  menuItems: SidebarMenuItem[];
  groups: SidebarGroup[];
  groupExpanded: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: SidebarState = {
  menuItems: fallbackMenuItems,
  groups: defaultGroups,
  groupExpanded: {},
  loading: false,
  error: null,
  isInitialized: false,
};

// Async thunk để fetch sidebar configuration
export const fetchSidebarConfig = createAsyncThunk(
  "sidebar/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching sidebar config from backend...");

      // Try to fetch from backend first
      const response = await SidebarConfigService.getSidebarConfig();
      if (response.success && response.data.length > 0) {
        console.log(
          "✅ Loaded sidebar config from backend:",
          response.data.length,
          "items"
        );
        return {
          menuItems: response.data,
          source: "backend",
        };
      }

      // Fallback to localStorage
      const savedItems = localStorage.getItem("sidebarMenuItems");
      if (savedItems) {
        try {
          const parsedItems = JSON.parse(savedItems);
          console.log(
            "✅ Loaded sidebar config from localStorage:",
            parsedItems.length,
            "items"
          );
          return {
            menuItems: parsedItems,
            source: "localStorage",
          };
        } catch {
          console.log("⚠️ Failed to parse localStorage, using fallback items");
          return {
            menuItems: fallbackMenuItems,
            source: "fallback",
          };
        }
      }

      console.log("ℹ️ No saved config found, using fallback items");
      return {
        menuItems: fallbackMenuItems,
        source: "fallback",
      };
    } catch (error) {
      console.error("❌ Error loading sidebar config:", error);
      return rejectWithValue("Không thể tải cấu hình sidebar");
    }
  }
);

// Async thunk để save sidebar configuration
export const saveSidebarConfig = createAsyncThunk(
  "sidebar/saveConfig",
  async (menuItems: SidebarMenuItem[], { rejectWithValue }) => {
    try {
      console.log("💾 Saving sidebar config...");

      const response = await SidebarConfigService.updateSidebarConfig(
        menuItems
      );
      if (response.success) {
        // Also save to localStorage as backup
        localStorage.setItem("sidebarMenuItems", JSON.stringify(menuItems));
        console.log("✅ Sidebar config saved successfully");
        return menuItems;
      } else {
        throw new Error(response.message || "Failed to save config");
      }
    } catch (error) {
      console.error("❌ Error saving sidebar config:", error);
      // Still save to localStorage even if backend fails
      localStorage.setItem("sidebarMenuItems", JSON.stringify(menuItems));
      return rejectWithValue(
        "Không thể lưu cấu hình sidebar vào server, đã lưu local"
      );
    }
  }
);

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    // Toggle group expanded state
    toggleGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      state.groupExpanded[groupId] = !state.groupExpanded[groupId];
    },

    // Set group expanded state
    setGroupExpanded: (
      state,
      action: PayloadAction<{ groupId: string; expanded: boolean }>
    ) => {
      const { groupId, expanded } = action.payload;
      state.groupExpanded[groupId] = expanded;
    },

    // Update menu items locally (for immediate UI updates)
    updateMenuItems: (state, action: PayloadAction<SidebarMenuItem[]>) => {
      state.menuItems = action.payload;
      // Also save to localStorage
      localStorage.setItem("sidebarMenuItems", JSON.stringify(action.payload));
    },

    // Update groups locally
    updateGroups: (state, action: PayloadAction<SidebarGroup[]>) => {
      state.groups = action.payload;
      // Also save to localStorage
      localStorage.setItem("sidebarGroups", JSON.stringify(action.payload));
    },

    // Initialize group expanded state from groups
    initializeGroupExpanded: (state) => {
      const initialExpanded = state.groups.reduce((acc, group) => {
        acc[group.id] = group.isExpanded;
        return acc;
      }, {} as Record<string, boolean>);

      // Also set ungrouped to be expanded by default
      initialExpanded["ungrouped"] = true;

      state.groupExpanded = initialExpanded;
    },

    // Load groups from localStorage
    loadGroupsFromStorage: (state) => {
      const savedGroups = localStorage.getItem("sidebarGroups");
      if (savedGroups) {
        try {
          const parsedGroups = JSON.parse(savedGroups);
          state.groups = parsedGroups;
          console.log("✅ Loaded sidebar groups from localStorage");
        } catch {
          console.log(
            "⚠️ Failed to parse groups from localStorage, using defaults"
          );
        }
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset to defaults
    resetToDefaults: (state) => {
      state.menuItems = fallbackMenuItems;
      state.groups = defaultGroups;
      localStorage.removeItem("sidebarMenuItems");
      localStorage.removeItem("sidebarGroups");
      console.log("🔄 Reset sidebar to defaults");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sidebar config
      .addCase(fetchSidebarConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSidebarConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload.menuItems;
        state.isInitialized = true;
        console.log(`✅ Sidebar config loaded from ${action.payload.source}`);
      })
      .addCase(fetchSidebarConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.menuItems = fallbackMenuItems; // Fallback to default items
        state.isInitialized = true;
        console.log("❌ Failed to fetch sidebar config, using fallback");
      })

      // Save sidebar config
      .addCase(saveSidebarConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSidebarConfig.fulfilled, (state) => {
        state.loading = false;
        // Không cập nhật menuItems để tránh vòng lặp vô tận
        console.log("✅ Sidebar config saved successfully");
      })
      .addCase(saveSidebarConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log("⚠️ Failed to save sidebar config to backend");
      });
  },
});

export const {
  toggleGroup,
  setGroupExpanded,
  updateMenuItems,
  updateGroups,
  initializeGroupExpanded,
  loadGroupsFromStorage,
  clearError,
  resetToDefaults,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;

// Selectors
export const selectSidebarMenuItems = (state: { sidebar: SidebarState }) =>
  state.sidebar.menuItems;
export const selectSidebarGroups = (state: { sidebar: SidebarState }) =>
  state.sidebar.groups;
export const selectSidebarGroupExpanded = (state: { sidebar: SidebarState }) =>
  state.sidebar.groupExpanded;
export const selectSidebarLoading = (state: { sidebar: SidebarState }) =>
  state.sidebar.loading;
export const selectSidebarError = (state: { sidebar: SidebarState }) =>
  state.sidebar.error;
export const selectSidebarIsInitialized = (state: { sidebar: SidebarState }) =>
  state.sidebar.isInitialized;

// Memoized complex selectors
export const selectFilteredMenuItems = createSelector(
  [
    selectSidebarMenuItems,
    (
      _state: { sidebar: SidebarState },
      userRole: "admin" | "employee" | undefined
    ) => userRole,
  ],
  (menuItems, userRole) => {
    if (!userRole) return [];

    return menuItems
      .filter((item) => item.isActive && item.roles.includes(userRole))
      .sort((a, b) => a.order - b.order);
  }
);

export const selectGroupedMenuItems = createSelector(
  [selectFilteredMenuItems],
  (filteredItems) => {
    return filteredItems.reduce((acc, item) => {
      const groupId = item.groupId || "ungrouped";
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(item);
      return acc;
    }, {} as Record<string, SidebarMenuItem[]>);
  }
);
