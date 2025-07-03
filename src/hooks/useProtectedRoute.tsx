"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useAuthLoading } from "@/store/hooks";

export function useProtectedRoute(redirectTo: string = "/dang-nhap") {
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
}
