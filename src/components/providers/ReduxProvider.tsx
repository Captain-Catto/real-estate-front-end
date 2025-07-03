"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "sonner";
import { initializeAuth, getProfileAsync } from "@/store/slices/authSlice";
import { fetchFavorites } from "@/store/slices/favoritesSlices";
import { WalletSyncProvider } from "./WalletSyncProvider";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize authentication first
      await store.dispatch(initializeAuth());

      // Check if we have a token
      const token = localStorage.getItem("accessToken");

      // If we have a token, get user profile and favorites
      if (token) {
        try {
          await store.dispatch(getProfileAsync()).unwrap();
          store.dispatch(fetchFavorites());
        } catch (error) {
          console.error("Error initializing app:", error);
          // If profile fetch fails, token might be invalid - no additional action needed
        }
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <WalletSyncProvider>
        {children}
        <Toaster
          position="top-right"
          closeButton
          richColors
          toastOptions={{
            duration: 4000,
            className: "custom-toast",
          }}
        />
      </WalletSyncProvider>
    </Provider>
  );
}
