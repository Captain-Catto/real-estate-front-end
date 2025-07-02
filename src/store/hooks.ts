import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  logoutAllAsync,
  getProfileAsync,
  clearError,
  updateProfile,
  initializeAuth,
} from "./slices/authSlice";
import {
  addFavorite,
  removeFavorite,
  removeFavoriteAsync,
  clearFavorites,
  fetchFavorites,
} from "./slices/favoritesSlices";
import { useEffect, useState, useCallback, useRef } from "react";
import { FavoriteItem } from "@/store/slices/favoritesSlices";

// Cache for profile data
let profileCacheTimestamp = 0;
const PROFILE_CACHE_EXPIRY = 30000; // 30 seconds

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth-specific hooks
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth on app start - with useRef to ensure it only runs once
  const initCalledRef = useRef(false);
  const profileCheckRef = useRef(false);

  useEffect(() => {
    // Only run this effect once
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const initAuth = async () => {
      // Kiểm tra token trong localStorage
      const token = localStorage.getItem("accessToken");

      if (token) {
        // Có token, khôi phục auth state và load profile
        dispatch(initializeAuth());

        try {
          // Load profile để xác thực token
          await dispatch(getProfileAsync()).unwrap();
        } catch (error) {
          // Token không hợp lệ, clear localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } finally {
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []); // Empty dependency array + useRef check ensures this runs exactly once

  // Add a separate effect to check profile periodically, but avoid excessive calls
  useEffect(() => {
    if (!auth.isAuthenticated || profileCheckRef.current) return;

    // Check if we need to refresh the profile based on cache expiry
    if (Date.now() - profileCacheTimestamp < PROFILE_CACHE_EXPIRY) return;

    profileCheckRef.current = true;

    const checkProfile = async () => {
      try {
        await dispatch(getProfileAsync()).unwrap();
        profileCacheTimestamp = Date.now();
      } catch (error) {
        console.error("Error refreshing profile:", error);
      } finally {
        profileCheckRef.current = false;
      }
    };

    checkProfile();
  }, [auth.isAuthenticated, dispatch]);

  return {
    ...auth,
    isInitialized,
    login: (credentials: { email: string; password: string }) =>
      dispatch(loginAsync(credentials)),
    register: (userData: {
      username: string;
      email: string;
      password: string;
    }) => dispatch(registerAsync(userData)),
    logout: () => dispatch(logoutAsync()),
    logoutAll: () => dispatch(logoutAllAsync()),
    getProfile: () => {
      // Check cache before dispatching
      if (Date.now() - profileCacheTimestamp < PROFILE_CACHE_EXPIRY) {
        return Promise.resolve(auth.user);
      }

      profileCacheTimestamp = Date.now();
      return dispatch(getProfileAsync());
    },
    clearError: () => dispatch(clearError()),
    updateProfile: (profileData: any) => dispatch(updateProfile(profileData)),
  };
};

// For favorites, we'll use a more robust loading flag
let favoritesLoading = false;

export const useFavorites = () => {
  const dispatch = useDispatch<AppDispatch>();
  const favorites = useSelector((state: RootState) => state.favorites);
  const loadedRef = useRef(false);

  const fetchUserFavorites = useCallback(() => {
    if (loadedRef.current || favoritesLoading) {
      console.log("Favorites already loaded, skipping");
      return Promise.resolve();
    }

    loadedRef.current = true;
    favoritesLoading = true;

    console.log("Fetching favorites from API");
    return dispatch(fetchFavorites()).finally(() => {
      favoritesLoading = false;
    });
  }, [dispatch]);

  const handleAddFavorite = useCallback(
    (item: FavoriteItem) => {
      return dispatch(addFavorite(item));
    },
    [dispatch]
  );

  const handleRemoveFavorite = useCallback(
    (id: string) => {
      return dispatch(removeFavoriteAsync(id));
    },
    [dispatch]
  );

  return {
    ...favorites,
    fetchUserFavorites,
    addFavorite: handleAddFavorite,
    removeFavorite: handleRemoveFavorite,
    clearFavorites: () => dispatch(clearFavorites()),
  };
};
