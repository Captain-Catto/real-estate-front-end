"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAppDispatch, useAuth } from "./hooks";
import { initializeAuth, restoreAuthAsync } from "./slices/authSlice";
import { fetchFavoritesAsync } from "./slices/favoritesSlices";
import { WalletSyncProvider } from "@/components/providers/WalletSyncProvider";

// Auth initializer component
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, isInitialized } = useAuth();

  useEffect(() => {
    // Only initialize once when component first mounts
    if (!isInitialized) {
      console.log("🔑 Initializing authentication system...");

      // Initialize auth state first
      dispatch(initializeAuth());

      // Try to restore authentication from refresh token
      const restoreAuthentication = async () => {
        try {
          console.log("🔄 Attempting to restore authentication...");
          const result = await dispatch(restoreAuthAsync()).unwrap();
          console.log("✅ Authentication restored successfully:", result);
        } catch (error) {
          console.log(
            "ℹ️ No valid refresh token found, user needs to login:",
            error
          );
          // This is normal - user just needs to login
          // Don't treat this as an error
        }
      };

      // Add a small delay to ensure proper initialization order
      const timeoutId = setTimeout(() => {
        restoreAuthentication();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, isInitialized]);

  // Separate useEffect to handle fetching user data when authenticated
  useEffect(() => {
    // Only fetch favorites after auth is fully initialized and user is authenticated
    if (isInitialized && isAuthenticated && accessToken) {
      console.log("🔑 Authentication state ready, fetching user favorites...");
      // Delay favorites fetch slightly to ensure auth state is stable
      const timeoutId = setTimeout(() => {
        dispatch(fetchFavoritesAsync(false)); // Don't force refresh
      }, 200); // Increased delay slightly

      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, isAuthenticated, accessToken, dispatch]);

  return <>{children}</>;
}

// Redux provider component
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WalletSyncProvider>
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster
          position="top-right"
          closeButton
          richColors
          expand
          visibleToasts={4}
          offset={20}
        />
      </WalletSyncProvider>
    </Provider>
  );
}
