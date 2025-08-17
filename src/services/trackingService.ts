import { API_BASE_URL } from "@/services/authService";

/**
 * Track a page view
 * @param path URL path that was visited
 */
export const trackPageView = async (path: string) => {
  try {
    // Don't track admin pages
    if (path.startsWith("/admin")) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/stats/track-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
      // No credentials needed for public endpoint
    });

    if (!response.ok) {
      // Silent fail - don't interrupt user experience for tracking
    }
  } catch {
    // Silent fail - don't interrupt user experience for tracking
  }
};
