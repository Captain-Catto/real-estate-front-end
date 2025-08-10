import { useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";

// Global flag to prevent multiple simultaneous refreshes
let isRefreshing = false;

/**
 * Hook to auto-refresh notifications on specific events
 * Particularly useful for wallet-related operations where payments might trigger new notifications
 */
export function useNotificationRefresh() {
  const { forceRefresh } = useNotifications();
  const listenerAdded = useRef(false);

  useEffect(() => {
    // Prevent duplicate listeners
    if (listenerAdded.current) return;

    // Listen for wallet update events via localStorage
    const handleStorageChange = (e: StorageEvent) => {
      console.log("🔍 Storage change detected:", e.key, e.newValue);
      if (e.key === "wallet_updated" && e.newValue) {
        console.log("💰 Wallet updated, refreshing notifications");
        forceRefresh();
        // Clear the flag
        localStorage.removeItem("wallet_updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    listenerAdded.current = true;

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      listenerAdded.current = false;
    };
  }, [forceRefresh]);
}

/**
 * Helper function to trigger notification refresh when wallet changes
 * Call this after successful payments or wallet operations
 */
export function triggerNotificationRefresh() {
  if (isRefreshing) {
    console.log("🔄 Notification refresh already in progress, skipping...");
    return;
  }

  isRefreshing = true;
  console.log("🔄 Triggering notification refresh...");

  // Set a flag in localStorage to trigger refresh across tabs
  localStorage.setItem("wallet_updated", Date.now().toString());

  // Also trigger the storage event in the current tab
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "wallet_updated",
      newValue: Date.now().toString(),
    })
  );

  // Clear the flag after a short delay
  setTimeout(() => {
    isRefreshing = false;
  }, 1000);
}
