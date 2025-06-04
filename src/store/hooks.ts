import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Favorites-specific hooks
export const useFavorites = () => {
  const favorites = useAppSelector((state) => state.favorites);
  const dispatch = useAppDispatch();

  return {
    ...favorites,
    dispatch,
  };
};

// Check if item is favorited
export const useIsFavorite = (id: string) => {
  return useAppSelector((state) =>
    state.favorites.items.some((item) => item.id === id)
  );
};

// Get favorites by type
export const useFavoritesByType = (type: "property" | "project") => {
  return useAppSelector((state) =>
    state.favorites.items.filter((item) => item.type === type)
  );
};

// Get favorites count
export const useFavoritesCount = () => {
  return useAppSelector((state) => state.favorites.items.length);
};
