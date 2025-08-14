// Utility functions for package badge display

export interface PackageBadgeInfo {
  text: string;
  className: string;
  priority: number; // For sorting, higher = more premium
}

/**
 * Get badge information based on packageId
 * @param packageId - The package ID (premium, vip, or null/undefined for others)
 * @returns Badge information object
 */
export const getPackageBadge = (
  packageId?: string | null
): PackageBadgeInfo => {
  switch (packageId) {
    case "vip":
      return {
        text: "VIP",
        className:
          "bg-red-500 text-white relative overflow-hidden premium-shimmer",
        priority: 4,
      };
    case "premium":
      return {
        text: "Premium",
        className: "bg-red-500 text-white ",
        priority: 3,
      };
    default:
      // Basic, free, or other packages (no badge)
      return {
        text: "",
        className: "",
        priority: 1,
      };
  }
};

/**
 * Check if a post should display a badge
 * @param packageId - The package ID
 * @returns Boolean indicating if badge should be displayed
 */
export const shouldShowBadge = (packageId?: string | null): boolean => {
  // Only show badges for VIP and Premium packages
  return !!(packageId && ["vip", "premium"].includes(packageId));
};

/**
 * Get package priority for sorting
 * @param packageId - The package ID
 * @returns Priority number (higher = more premium)
 */
export const getPackagePriority = (packageId?: string | null): number => {
  return getPackageBadge(packageId).priority;
};
