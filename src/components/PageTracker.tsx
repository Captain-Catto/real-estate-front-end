"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/services/trackingService";

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    // Get full path including query parameters
    const fullPath =
      searchParams.size > 0
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

    // Track the page view
    trackPageView(fullPath);
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}
