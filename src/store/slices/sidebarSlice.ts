import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
    icon?: string;
    badge?: string;
    permissions?: string[];
    [key: string]: unknown;
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

interface SidebarState {
  config: SidebarConfig | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

const initialState: SidebarState = {
  config: null,
  loading: false,
  error: null,
  lastUpdated: 0,
};

// Async thunks
export const fetchSidebarConfig = createAsyncThunk(
  "sidebar/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await SidebarAPI.getSidebarConfig();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(
          response.message || "Không tìm thấy cấu hình sidebar"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Lỗi kết nối server"
      );
    }
  }
);

export const updateSidebarConfig = createAsyncThunk(
  "sidebar/updateConfig",
  async (configData: Partial<SidebarConfig>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { sidebar: SidebarState };
      const currentConfig = state.sidebar.config;

      if (!currentConfig) {
        return rejectWithValue("Không tìm thấy cấu hình hiện tại");
      }

      const response = await SidebarAPI.updateConfig(
        currentConfig._id,
        configData
      );
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Lỗi khi cập nhật cấu hình");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Lỗi kết nối server"
      );
    }
  }
);

export const updateSidebarItem = createAsyncThunk(
  "sidebar/updateItem",
  async (
    {
      itemId,
      itemData,
    }: { itemId: string; itemData: Partial<SidebarMenuItem> },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const state = getState() as { sidebar: SidebarState };
      const currentConfig = state.sidebar.config;

      if (!currentConfig) {
        return rejectWithValue("Không tìm thấy cấu hình hiện tại");
      }

      // Update the specific item in the config
      const updatedItems = currentConfig.items.map((item) =>
        item.id === itemId ? { ...item, ...itemData } : item
      );

      // Update the entire config
      const result = await dispatch(
        updateSidebarConfig({ items: updatedItems })
      );
      if (updateSidebarConfig.fulfilled.match(result)) {
        return result.payload;
      } else {
        return rejectWithValue("Lỗi khi cập nhật item");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Lỗi kết nối server"
      );
    }
  }
);

export const addSidebarItem = createAsyncThunk(
  "sidebar/addItem",
  async (
    itemData: Omit<SidebarMenuItem, "id">,
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const state = getState() as { sidebar: SidebarState };
      const currentConfig = state.sidebar.config;

      if (!currentConfig) {
        return rejectWithValue("Không tìm thấy cấu hình hiện tại");
      }

      // Generate new ID
      const newId = `item_${Date.now()}`;
      const newItem: SidebarMenuItem = {
        ...itemData,
        id: newId,
      };

      const updatedItems = [...currentConfig.items, newItem];

      // Update the entire config
      const result = await dispatch(
        updateSidebarConfig({ items: updatedItems })
      );
      if (updateSidebarConfig.fulfilled.match(result)) {
        return result.payload;
      } else {
        return rejectWithValue("Lỗi khi thêm item");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Lỗi kết nối server"
      );
    }
  }
);

export const deleteSidebarItem = createAsyncThunk(
  "sidebar/deleteItem",
  async (itemId: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as { sidebar: SidebarState };
      const currentConfig = state.sidebar.config;

      if (!currentConfig) {
        return rejectWithValue("Không tìm thấy cấu hình hiện tại");
      }

      // Remove the item and its children
      const updatedItems = currentConfig.items.filter(
        (item) => item.id !== itemId && item.parentId !== itemId
      );

      // Update the entire config
      const result = await dispatch(
        updateSidebarConfig({ items: updatedItems })
      );
      if (updateSidebarConfig.fulfilled.match(result)) {
        return result.payload;
      } else {
        return rejectWithValue("Lỗi khi xóa item");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Lỗi kết nối server"
      );
    }
  }
);

export const reorderSidebarItems = createAsyncThunk(
  "sidebar/reorderItems",
  async (
    itemOrders: Array<{ id: string; order: number }>,
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const state = getState() as { sidebar: SidebarState };
      const currentConfig = state.sidebar.config;

      if (!currentConfig) {
        return rejectWithValue("Không tìm thấy cấu hình hiện tại");
      }

      // Update orders
      const updatedItems = currentConfig.items.map((item) => {
        const newOrder = itemOrders.find((order) => order.id === item.id);
        return newOrder ? { ...item, order: newOrder.order } : item;
      });

      // Update the entire config
      const result = await dispatch(
        updateSidebarConfig({ items: updatedItems })
      );
      if (updateSidebarConfig.fulfilled.match(result)) {
        return result.payload;
      } else {
        return rejectWithValue("Lỗi khi sắp xếp items");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Lỗi kết nối server"
      );
    }
  }
);

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearConfig: (state) => {
      state.config = null;
      state.loading = false;
      state.error = null;
      state.lastUpdated = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch config
      .addCase(fetchSidebarConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSidebarConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchSidebarConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update config
      .addCase(updateSidebarConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSidebarConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(updateSidebarConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update item
      .addCase(updateSidebarItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSidebarItem.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(updateSidebarItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add item
      .addCase(addSidebarItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSidebarItem.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(addSidebarItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete item
      .addCase(deleteSidebarItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSidebarItem.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(deleteSidebarItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reorder items
      .addCase(reorderSidebarItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderSidebarItems.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(reorderSidebarItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearConfig } = sidebarSlice.actions;
export default sidebarSlice.reducer;
