"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { initializeAuth, getProfileAsync } from "./slices/authSlice";

// Auth initializer component
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());

    // If token exists, try to get user profile
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      dispatch(getProfileAsync());
    }
  }, [dispatch]);

  return <>{children}</>;
}

// Redux provider component
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
