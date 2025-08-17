"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";
import { toast } from "sonner";

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

    // TEMPORARY: Disable polling completely to stop infinite loops
    // TODO: Re-enable with proper coordination between components
    const SYNC_INTERVAL = 999999999; // Effectively disable polling
    const MIN_SYNC_DELAY = 60000; // 1 minute minimum
    let syncInterval: NodeJS.Timeout | null = null;

    // Hàm kiểm tra xem có nên đồng bộ hóa không
    const shouldSync = () => {
      const now = Date.now();
      return now - lastSyncTimeRef.current > MIN_SYNC_DELAY;
    };

    // Hàm đồng bộ hóa ví
    const syncWallet = async () => {
      if (!shouldSync()) return;

      // EMERGENCY FIX: Disable console.log to prevent infinite logging
      // console.log("[WalletSync] Syncing wallet data");
      try {
        // Xóa cache để đảm bảo dữ liệu mới nhất được lấy
        paymentService.invalidateWalletCache();

        // Gọi API để đồng bộ hóa ví với lịch sử thanh toán
        const result = await paymentService.syncWallet();
        if (result.success) {
          // EMERGENCY FIX: Disable console.log to prevent infinite logging
          // console.log("[WalletSync] Wallet synced successfully");
        }
      } catch {
        toast.error("Lỗi đồng bộ ví điện tử");
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
        // EMERGENCY FIX: Temporarily disable to prevent infinite loop
        console.log(
          "[WalletSync] DISABLED - Would have synced on storage change"
        );
        // syncWallet();
      }
    };

    // Xử lý sự kiện từ BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data?.type === "refresh") {
        // EMERGENCY FIX: Temporarily disable to prevent infinite loop
        console.log("[WalletSync] DISABLED - Would have synced on broadcast");
        // syncWallet();
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
        // EMERGENCY FIX: Disable console.log to prevent infinite logging
        // console.log("[WalletSync] BroadcastChannel initialized");
      } catch {
        toast.error("Lỗi thiết lập đồng bộ ví điện tử");
      }
    }

    // Thiết lập polling định kỳ
    syncInterval = setInterval(syncWallet, SYNC_INTERVAL);
    // EMERGENCY FIX: Disable console.log to prevent infinite logging
    // console.log(
    //   "[WalletSync] Polling initialized with interval",
    //   SYNC_INTERVAL
    // );

    // Thiết lập listener cho localStorage
    window.addEventListener("storage", handleStorageChange);
    // EMERGENCY FIX: Disable console.log to prevent infinite logging
    // console.log("[WalletSync] Storage event listener initialized");

    // Xử lý focus vào tab
    const handleFocus = () => {
      // EMERGENCY FIX: Temporarily disable to prevent infinite loop
      console.log("[WalletSync] DISABLED - Would have synced on focus");
      // syncWallet();
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

      // EMERGENCY FIX: Disable console.log to prevent infinite logging
      // console.log("[WalletSync] Cleaned up all listeners");
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
