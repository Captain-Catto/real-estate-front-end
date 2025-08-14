import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { favoriteService } from "@/services/favoriteService";
import { locationService } from "@/services/locationService";
import type { RootState } from "../index";

// Types
export interface FavoriteItem {
  id: string;
  type: "property" | "project";
  title: string;
  price?: string;
  location: string;
  image: string | string[];
  slug: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  description?: string;
  addedAt: string;
}

export interface FavoritesState {
  items: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchFavoritesAsync = createAsyncThunk(
  "favorites/fetchFavorites",
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      // Check if user is authenticated first
      if (!state.auth.isAuthenticated || !state.auth.accessToken) {
        return rejectWithValue("User not authenticated");
      }

      const lastFetched = state.favorites.lastFetched;
      const now = Date.now();

      // Skip if fetched within last 30 seconds unless forced
      if (!forceRefresh && lastFetched && now - lastFetched < 30000) {
        return state.favorites.items;
      }

      const response = await favoriteService.getFavorites();

      if (response.success && response.data.favorites) {
        const rawFavorites: any[] = response.data.favorites;

        // Transform to FavoriteItem format with location names
        const transformedFavorites = await Promise.all(
          rawFavorites
            .filter((fav) => fav?.post?._id)
            .map(async (fav) => {
              let locationText = "Không xác định";

              if (fav.post.location) {
                try {
                  const locationNames = await locationService.getLocationNames(
                    fav.post.location.province,
                    fav.post.location.ward
                  );
                  locationText =
                    [locationNames.wardName, locationNames.provinceName]
                      .filter(Boolean)
                      .join(", ") || "Không xác định";
                } catch {
                  locationText =
                    [fav.post.location.ward, fav.post.location.province]
                      .filter(Boolean)
                      .join(", ") || "Không xác định";
                }
              }

              return {
                id: fav.post._id,
                type: "property" as const,
                title: fav.post.title,
                price: fav.post.price,
                location: locationText,
                image: fav.post.images?.[0] || "/placeholder.jpg",
                slug: fav.post.slug || fav.post._id,
                area: fav.post.area ? `${fav.post.area} m²` : undefined,
                bedrooms: fav.post.bedrooms,
                bathrooms: fav.post.bathrooms,
                propertyType:
                  typeof fav.post.category === "object"
                    ? fav.post.category?.name
                    : fav.post.category,
                description: fav.post.description,
                addedAt: fav.createdAt,
              };
            })
        );

        return transformedFavorites;
      }

      return rejectWithValue("Failed to fetch favorites");
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

export const toggleFavoriteAsync = createAsyncThunk(
  "favorites/toggleFavorite",
  async (itemId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      // Check if user is authenticated first
      if (!state.auth.isAuthenticated || !state.auth.accessToken) {
        return rejectWithValue("User not authenticated");
      }

      const isCurrentlyFavorited = state.favorites.items.some(
        (item: FavoriteItem) => item.id === itemId
      );

      if (isCurrentlyFavorited) {
        // Remove from favorites
        const response = await favoriteService.removeFromFavorites(itemId);
        if (response.success) {
          return { action: "removed", itemId };
        } else {
          return rejectWithValue(
            response.message || "Failed to remove favorite"
          );
        }
      } else {
        // Add to favorites
        const response = await favoriteService.addToFavorites(itemId);
        if (response.success) {
          return { action: "added", itemId, data: response.data };
        } else {
          // Handle case where item is already in favorites
          if (response.message?.includes("already in favorites")) {
            return { action: "already_exists", itemId };
          }
          return rejectWithValue(response.message || "Failed to add favorite");
        }
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

// Create the slice
const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // Clear all favorites
    clearFavorites: (state) => {
      state.items = [];
      state.error = null;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites
      .addCase(fetchFavoritesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoritesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchFavoritesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle favorite
      .addCase(toggleFavoriteAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { action: actionType, itemId } = action.payload;

        if (actionType === "removed") {
          // Remove item from favorites immediately
          state.items = state.items.filter((item) => item.id !== itemId);
        } else if (actionType === "added") {
          // Add item to favorites immediately with minimal data
          // Check if item already exists to avoid duplicates
          const exists = state.items.some((item) => item.id === itemId);
          if (!exists) {
            // Create a minimal favorite item - will be updated with full data later
            const placeholderItem = {
              id: itemId,
              type: "property" as const,
              title: "Đang tải...",
              price: undefined,
              location: "Đang cập nhật...",
              image: "/placeholder.jpg",
              slug: itemId,
              addedAt: new Date().toISOString(),
            };
            state.items.push(placeholderItem);
          }
        } else if (actionType === "already_exists") {
          // Item already exists - ensure it's in the state
          const exists = state.items.some((item) => item.id === itemId);
          if (!exists) {
            // Add placeholder if somehow missing from state
            const placeholderItem = {
              id: itemId,
              type: "property" as const,
              title: "Đang tải...",
              price: undefined,
              location: "Đang tải...",
              image: "/placeholder.jpg",
              slug: itemId,
              addedAt: new Date().toISOString(),
            };
            state.items.push(placeholderItem);
          }
        }
        state.error = null;
      })
      .addCase(toggleFavoriteAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFavorites, clearError } = favoritesSlice.actions;
export default favoritesSlice.reducer;

// Selectors
export const selectFavorites = (state: { favorites: FavoritesState }) =>
  state.favorites.items;
export const selectFavoritesLoading = (state: { favorites: FavoritesState }) =>
  state.favorites.isLoading;
export const selectFavoritesError = (state: { favorites: FavoritesState }) =>
  state.favorites.error;
export const selectIsFavorited =
  (itemId: string) => (state: { favorites: FavoritesState }) =>
    state.favorites.items.some((item) => item.id === itemId);
