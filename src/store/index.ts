import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./slices/favoritesSlices";
import authReducer from "./slices/authSlice";
import walletReducer from "./slices/walletSlice";
import sidebarReducer from "./slices/sidebarSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    auth: authReducer,
    wallet: walletReducer,
    sidebar: sidebarReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
