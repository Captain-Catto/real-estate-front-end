const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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

    const response = await fetch(`${API_BASE_URL}/api/stats/track-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
      // No credentials needed for public endpoint
    });

    if (!response.ok) {
      // Silent fail - don't interrupt user experience for tracking
      console.error("Failed to track page view");
    }
  } catch (error) {
    // Silent fail - don't interrupt user experience
    console.error("Error tracking page view:", error);
  }
};
