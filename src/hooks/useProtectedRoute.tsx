"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";

export const useProtectedRoute = (redirectTo: string = "/dang-nhap") => {
  const { isAuthenticated, isInitialized, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi đã initialized
    if (isInitialized) {
      if (sessionExpired) {
        // Session expired, redirect to login with message
        router.push(`${redirectTo}?expired=true`);
      } else if (!isAuthenticated) {
        // Not logged in, redirect to login
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isInitialized, sessionExpired, router, redirectTo]);

  return {
    isLoading: !isInitialized,
    isAuthenticated,
    sessionExpired,
  };
};
