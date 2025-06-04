import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface FavoriteItem {
  id: string;
  type: "property" | "project"; // Loại: bất động sản hoặc dự án
  title: string;
  price?: string;
  location: string;
  image: string;
  slug: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  addedAt: string; // ISO date string
}

export interface FavoritesState {
  items: FavoriteItem[];
  isLoading: boolean;
  lastUpdated: string | null;
}

// Initial state
const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  lastUpdated: null,
};

// Slice
const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // Add to favorites
    addToFavorites: (
      state,
      action: PayloadAction<Omit<FavoriteItem, "addedAt">>
    ) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (!existingItem) {
        const newItem: FavoriteItem = {
          ...action.payload,
          addedAt: new Date().toISOString(),
        };
        state.items.unshift(newItem); // Add to beginning
        state.lastUpdated = new Date().toISOString();
      }
    },

    // Remove from favorites
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },

    // Toggle favorite
    toggleFavorite: (
      state,
      action: PayloadAction<Omit<FavoriteItem, "addedAt">>
    ) => {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingIndex >= 0) {
        // Remove if exists
        state.items.splice(existingIndex, 1);
      } else {
        // Add if doesn't exist
        const newItem: FavoriteItem = {
          ...action.payload,
          addedAt: new Date().toISOString(),
        };
        state.items.unshift(newItem);
      }
      state.lastUpdated = new Date().toISOString();
    },

    // Clear all favorites
    clearFavorites: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Bulk update favorites (for sync from server)
    setFavorites: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.items = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    // Remove items by type
    removeFavoritesByType: (
      state,
      action: PayloadAction<"property" | "project">
    ) => {
      state.items = state.items.filter((item) => item.type !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  setLoading,
  setFavorites,
  removeFavoritesByType,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
