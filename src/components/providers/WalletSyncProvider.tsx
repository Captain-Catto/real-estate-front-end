"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";

/**
 * Provider component that handles wallet synchronization across the app
 * This component monitors localStorage and BroadcastChannel events
 * to keep the wallet balance in sync across all tabs
 */
export function WalletSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const lastSyncTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    // Các biến để kiểm soát polling và tránh quá nhiều request
    const SYNC_INTERVAL = 20000; // 20 giây
    const MIN_SYNC_DELAY = 5000; // 5 giây
    let syncInterval: NodeJS.Timeout | null = null;

    // Hàm kiểm tra xem có nên đồng bộ hóa không
    const shouldSync = () => {
      const now = Date.now();
      return now - lastSyncTimeRef.current > MIN_SYNC_DELAY;
    };

    // Hàm đồng bộ hóa ví
    const syncWallet = async () => {
      if (!shouldSync()) return;

      console.log("[WalletSync] Syncing wallet data");
      try {
        // Xóa cache để đảm bảo dữ liệu mới nhất được lấy
        paymentService.invalidateWalletCache();

        // Gọi API để đồng bộ hóa ví với lịch sử thanh toán
        const result = await paymentService.syncWallet();
        if (result.success) {
          console.log("[WalletSync] Wallet synced successfully");
        }
      } catch (error) {
        console.error("[WalletSync] Error syncing wallet:", error);
      } finally {
        lastSyncTimeRef.current = Date.now();
      }
    };

    // Xử lý sự kiện từ localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "wallet_updated" ||
        event.key === "wallet_updated_trigger"
      ) {
        console.log("[WalletSync] Detected wallet update via localStorage");
        syncWallet();
      }
    };

    // Xử lý sự kiện từ BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data?.type === "refresh") {
        console.log(
          "[WalletSync] Received wallet update broadcast",
          event.data
        );
        syncWallet();
      }
    };

    // Thiết lập BroadcastChannel
    if (
      typeof window !== "undefined" &&
      typeof BroadcastChannel !== "undefined"
    ) {
      try {
        broadcastChannelRef.current = new BroadcastChannel("wallet_updates");
        broadcastChannelRef.current.onmessage = handleBroadcastMessage;
        console.log("[WalletSync] BroadcastChannel initialized");
      } catch (e) {
        console.error("[WalletSync] Error setting up BroadcastChannel:", e);
      }
    }

    // Thiết lập polling định kỳ
    syncInterval = setInterval(syncWallet, SYNC_INTERVAL);
    console.log(
      "[WalletSync] Polling initialized with interval",
      SYNC_INTERVAL
    );

    // Thiết lập listener cho localStorage
    window.addEventListener("storage", handleStorageChange);
    console.log("[WalletSync] Storage event listener initialized");

    // Xử lý focus vào tab
    const handleFocus = () => {
      console.log("[WalletSync] Window focused, checking for wallet updates");
      syncWallet();
    };
    window.addEventListener("focus", handleFocus);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }

      if (syncInterval) {
        clearInterval(syncInterval);
      }

      console.log("[WalletSync] Cleaned up all listeners");
    };
  }, [isAuthenticated]);

  // Provider chỉ giám sát và không render thêm UI
  return <>{children}</>;
}
