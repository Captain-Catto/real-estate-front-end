/**
 * Utility functions for handling dynamic news categories
 */

/**
 * Format category slug to readable title
 * @param slug - Category slug (e.g., "dau-tu-quoc-te")
 * @returns Formatted title (e.g., "Đầu Tư Quốc Tế")
 */
export function formatCategoryTitle(slug: string): string {
  const specialCases: Record<string, string> = {
    bds: "BĐS",
    tphcm: "TP.HCM",
    hn: "Hà Nội",
    "dau-tu": "Đầu Tư",
    "tai-chinh": "Tài Chính",
    "phong-thuy": "Phong Thủy",
    "mua-ban": "Mua Bán",
    "cho-thue": "Cho Thuê",
    "tong-hop": "Tổng Hợp",
    "phap-ly": "Pháp Lý",
    "quy-hoach": "Quy Hoạch",
    "quoc-te": "Quốc Tế",
  };

  return slug
    .split("-")
    .map((word) => {
      // Check if word has special case
      if (specialCases[word]) {
        return specialCases[word];
      }
      // Normal title case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Generate category description based on slug
 * @param slug - Category slug
 * @returns Generated description
 */
export function generateCategoryDescription(slug: string): string {
  const title = formatCategoryTitle(slug);

  const descriptionTemplates = [
    `Cập nhật tin tức ${title.toLowerCase()} mới nhất về thị trường bất động sản`,
    `Thông tin và phân tích ${title.toLowerCase()} trong lĩnh vực bất động sản`,
    `Tin tức ${title.toLowerCase()} và các xu hướng phát triển BĐS`,
  ];

  // Use slug hash to pick consistent template
  const templateIndex = slug.length % descriptionTemplates.length;
  return descriptionTemplates[templateIndex];
}

/**
 * Get category info with fallback for dynamic categories
 * @param slug - Category slug
 * @returns Category info object
 */
export function getCategoryInfo(slug: string): {
  title: string;
  description: string;
} {
  // Static categories with predefined info
  const staticCategories: Record<
    string,
    { title: string; description: string }
  > = {
    "mua-ban": {
      title: "Tin tức mua bán",
      description: "Thông tin thị trường mua bán bất động sản",
    },
    "cho-thue": {
      title: "Tin tức cho thuê",
      description: "Thông tin thị trường cho thuê bất động sản",
    },
    "tai-chinh": {
      title: "Tin tức tài chính",
      description: "Thông tin về lãi suất, vay vốn, chính sách tài chính BĐS",
    },
    "phong-thuy": {
      title: "Phong thủy nhà đất",
      description: "Kiến thức phong thủy trong việc chọn mua và thiết kế nhà",
    },
    "tong-hop": {
      title: "Tin tức tổng hợp",
      description: "Tổng hợp các tin tức mới nhất về thị trường bất động sản",
    },
  };

  // Return static info if available
  if (staticCategories[slug]) {
    return staticCategories[slug];
  }

  // Generate dynamic info
  const formattedTitle = formatCategoryTitle(slug);
  return {
    title: `Tin tức ${formattedTitle}`,
    description: generateCategoryDescription(slug),
  };
}

/**
 * Check if a category slug is valid format
 * @param slug - Category slug to validate
 * @returns Whether slug format is valid
 */
export function isValidCategorySlug(slug: string): boolean {
  // Should contain only lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  // Should not have consecutive hyphens
  const validSlugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return validSlugPattern.test(slug) && slug.length >= 2 && slug.length <= 50;
}
