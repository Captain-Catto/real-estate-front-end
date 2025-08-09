"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAppDispatch } from "./hooks";
import { initializeAuth, getProfileAsync } from "./slices/authSlice";
import { fetchFavorites } from "./slices/favoritesSlices";
import { WalletSyncProvider } from "@/components/providers/WalletSyncProvider";

// Auth initializer component
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());

    // If token exists, try to get user profile and favorites
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      dispatch(getProfileAsync());
      dispatch(fetchFavorites());
    }
  }, [dispatch]);

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
