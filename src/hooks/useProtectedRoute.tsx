"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";

export const useProtectedRoute = (redirectTo: string = "/dang-nhap") => {
  const { isAuthenticated, isInitialized, sessionExpired, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi đã initialized VÀ không còn loading
    if (isInitialized && !loading) {
      if (sessionExpired) {
        // Session expired, redirect to login with message
        router.push(`${redirectTo}?expired=true`);
      } else if (!isAuthenticated) {
        // Not logged in, redirect to login
        router.push(redirectTo);
      }
    }
  }, [
    isAuthenticated,
    isInitialized,
    sessionExpired,
    loading,
    router,
    redirectTo,
  ]);

  return {
    isLoading: !isInitialized || loading,
    isAuthenticated,
    sessionExpired,
  };
};
