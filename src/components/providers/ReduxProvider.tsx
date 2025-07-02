"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "sonner";
import { initializeAuth } from "@/store/slices/authSlice";
import { fetchFavorites } from "@/store/slices/favoritesSlices";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    // Khởi tạo authentication
    store.dispatch(initializeAuth());

    // Nếu đã đăng nhập, lấy danh sách yêu thích
    const token = localStorage.getItem("accessToken");
    if (token) {
      store.dispatch(fetchFavorites());
    }
  }, []);
  return (
    <Provider store={store}>
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
    </Provider>
  );
}
