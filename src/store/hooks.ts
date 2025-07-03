import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { useCallback } from "react";
import {
  addFavoriteAsync,
  removeFavoriteAsync,
  fetchFavorites, // Updated to match the actual export name
} from "./slices/favoritesSlices";
import { clearError as clearAuthError } from "./slices/authSlice";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loading = useAppSelector((state) => state.auth.loading);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const error = useAppSelector((state) => state.auth.error);

  // Add the clearError function
  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return { user, isAuthenticated, loading, isInitialized, error, clearError };
};

// Favorites hook
export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const loading = useAppSelector((state) => state.favorites.isLoading); // Note the property is isLoading not loading
  const error = useAppSelector((state) => state.favorites.error);
  const { isAuthenticated } = useAuth();

  // Fix the function name to match the actual export
  const fetchUserFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false };
    }

    try {
      await dispatch(fetchFavorites()).unwrap(); // Updated function name
      return { success: true };
    } catch (err) {
      console.error("Failed to fetch user favorites:", err);
      return { success: false, error: err };
    }
  }, [dispatch, isAuthenticated]);

  const isFavorite = useCallback(
    (propertyId: string) => favorites.some((item) => item.id === propertyId),
    [favorites]
  );

  const addFavorite = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        // Handle unauthenticated case - perhaps redirect to login
        return false;
      }

      try {
        await dispatch(addFavoriteAsync(propertyId)).unwrap();
        return true;
      } catch (err) {
        console.error("Failed to add property to favorites:", err);
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const removeFavorite = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await dispatch(removeFavoriteAsync(propertyId)).unwrap();
        return true;
      } catch (err) {
        console.error("Failed to remove property from favorites:", err);
        return false;
      }
    },
    [dispatch, isAuthenticated]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (isFavorite(propertyId)) {
        return await removeFavorite(propertyId);
      } else {
        return await addFavorite(propertyId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    fetchUserFavorites,
  };
};
