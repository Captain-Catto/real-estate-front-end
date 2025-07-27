import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { favoriteService } from "@/services/favoriteService";

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
  addedAt: string;
}

export interface FavoritesState {
  items: FavoriteItem[];
  isLoading: boolean;
  lastUpdated: string | null;
  error: any;
}

// Initial state
const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  lastUpdated: null,
  error: null,
};

// Async thunks
export const fetchFavoritesAsync = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      // Make sure this matches the function name in favoriteService
      const response = await favoriteService.getFavorites();
      if (response.success) {
        // Chuyển đổi dữ liệu từ API sang định dạng FavoriteItem
        return response.data.favorites.map((fav: any) => ({
          id: fav.post._id,
          type: "property" as const,
          title: fav.post.title,
          price: fav.post.price,
          location:
            (fav.post.location.ward || "Không xác định") +
            ", " +
            (fav.post.location.province || "Không xác định"),
          image: fav.post.images[0] || "/placeholder.jpg",
          slug: fav.post.slug || fav.post._id,
          area: fav.post.area + " m²",
          bedrooms: fav.post.bedrooms,
          bathrooms: fav.post.bathrooms,
          propertyType:
            typeof fav.post.category === "object"
              ? fav.post.category?.name
              : fav.post.category,
          addedAt: fav.createdAt,
        }));
      }
      return rejectWithValue("Failed to fetch favorites");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

// For backward compatibility, also export as fetchFavorites
export const fetchFavorites = fetchFavoritesAsync;

export const removeFavoriteAsync = createAsyncThunk(
  "favorites/removeFavoriteAsync",
  async (itemId: string, { rejectWithValue }) => {
    try {
      // Gọi API xóa favorite
      const response = await favoriteService.removeFromFavorites(itemId);
      return { itemId, response };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addFavoriteAsync = createAsyncThunk(
  "favorites/addFavoriteAsync",
  async (itemId: string, { rejectWithValue }) => {
    try {
      // Call API to add to favorites
      const response = await favoriteService.addToFavorites(itemId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue("Failed to add favorite");
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Slice
const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // Thêm một mục vào danh sách yêu thích
    addFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      // Kiểm tra xem đã có trong danh sách chưa
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      }
    },

    // Xóa một mục khỏi danh sách yêu thích
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },

    // Xóa tất cả mục trong danh sách yêu thích
    clearFavorites: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoritesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoritesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchFavoritesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    // Xử lý remove favorite
    builder
      .addCase(removeFavoriteAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFavoriteAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Cập nhật state sau khi xóa thành công
        state.items = state.items.filter(
          (item) => item.id !== action.payload.itemId
        );
        state.error = null;
      })
      .addCase(removeFavoriteAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Handle add favorite
      .addCase(addFavoriteAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addFavoriteAsync.fulfilled, (state, action) => {
        state.isLoading = false;

        // Check if the item already exists
        const exists = state.items.some(
          (item) => item.id === action.payload.favorite.id
        );
        if (!exists) {
          // Convert API response to FavoriteItem format
          const newFavorite: FavoriteItem = {
            id: action.payload.favorite.id,
            type: "property",
            title: action.payload.favorite.title,
            price: action.payload.favorite.price,
            location: action.payload.favorite.location,
            image: action.payload.favorite.image,
            slug: action.payload.favorite.slug,
            area: action.payload.favorite.area,
            bedrooms: action.payload.favorite.bedrooms,
            bathrooms: action.payload.favorite.bathrooms,
            propertyType: action.payload.favorite.propertyType,
            addedAt: new Date().toISOString(), // Use current date if not available
          };
          state.items.push(newFavorite);
        }
        state.error = null;
      })
      .addCase(addFavoriteAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { addFavorite, removeFavorite, clearFavorites } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;
