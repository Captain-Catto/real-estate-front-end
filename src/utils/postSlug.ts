/**
 * Utility functions for creating SEO-friendly post slugs
 */

import { toast } from "sonner";

// Interface for location data
interface LocationData {
  name?: string;
  code?: string;
  _id?: string;
}

// Interface for post data
interface PostSlugData {
  _id: string;
  title: string;
  type?: string;
  location?: {
    province?: string | LocationData;
    ward?: string | LocationData;
    district?: string | LocationData;
    street?: string;
  };
}

/**
 * Creates a slug from text (Vietnamese-friendly)
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove multiple hyphens
    .trim();
}

/**
 * Creates listing URL for breadcrumb navigation
 * Format: /type/province for province-level
 * Format: /type/province/ward for ward-level
 */
export function createListingSlug(
  transactionType: string,
  province?: string,
  ward?: string
): string {
  if (!province) {
    return `/${transactionType}`;
  }

  const provinceSlug = createSlug(province);

  if (!ward) {
    return `/${transactionType}/${provinceSlug}`;
  }

  const wardSlug = createSlug(ward);
  return `/${transactionType}/${provinceSlug}/${wardSlug}`;
}

/**
 * Creates a SEO-friendly URL for a post
 * Format: /mua-ban/province/ward/id-title or /cho-thue/province/ward/id-title
 * Fallback: /mua-ban/chi-tiet/id-title or /cho-thue/chi-tiet/id-title (if location missing)
 */
export function createPostSlug(postData: PostSlugData): string {
  const { _id, title, type = "ban", location } = postData;

  // Create title slug
  const titleSlug = createSlug(title);
  const idSlug = `${_id}-${titleSlug}`;

  // Determine transaction type
  const transactionType = type === "cho-thue" ? "cho-thue" : "mua-ban";

  // Try to create full SEO URL with location
  if (location?.province && location?.ward) {
    try {
      // Get province and ward names
      let provinceName = "";
      let wardName = "";

      // Handle different location data formats
      if (typeof location.province === "string") {
        provinceName = location.province;
      } else if (location.province?.name) {
        provinceName = location.province.name;
      }

      if (typeof location.ward === "string") {
        wardName = location.ward;
      } else if (location.ward?.name) {
        wardName = location.ward.name;
      }

      if (provinceName && wardName) {
        const provinceSlug = createSlug(provinceName);
        const wardSlug = createSlug(wardName);

        // Return full SEO URL: /mua-ban/province/ward/id-title or /cho-thue/province/ward/id-title
        return `/${transactionType}/${provinceSlug}/${wardSlug}/${idSlug}`;
      }
    } catch {
      toast.error("Lỗi không thể tạo slug cho bài viết");
    }
  }

  // Fallback URL: /mua-ban/chi-tiet/id-title or /cho-thue/chi-tiet/id-title
  return `/${transactionType}/chi-tiet/${idSlug}`;
}

/**
 * Parse a slug URL to extract post ID and location info
 */
export function parsePostSlug(slug: string[]): {
  type: "property-detail" | "property-listing" | null;
  id?: string;
  transactionType?: string;
  location?: {
    province?: string;
    ward?: string;
  };
  isSeoUrl?: boolean;
  level?: string;
} | null {
  if (!slug || slug.length === 0) return null;

  // Fallback format: /mua-ban/chi-tiet/id-title or /cho-thue/chi-tiet/id-title
  if (
    (slug[0] === "mua-ban" || slug[0] === "cho-thue") &&
    slug.length === 3 &&
    slug[1] === "chi-tiet"
  ) {
    const idSlug = slug[2];
    const id = idSlug.split("-")[0];

    if (!id || (!/^\d+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id))) {
      return null;
    }

    return {
      type: "property-detail",
      id,
      transactionType: slug[0],
      isSeoUrl: false,
    };
  }

  // New format: /mua-ban/province/ward/id-title or /cho-thue/province/ward/id-title
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 4) {
    const idSlug = slug[3];
    const id = idSlug.split("-")[0];

    // Validate ID (MongoDB ObjectID or numeric)
    if (id && !/^\d+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id)) {
      // If not a valid ID, this is a listing URL
      return {
        type: "property-listing",
        transactionType: slug[0],
        location: {
          province: slug[1],
          ward: slug[2],
        },
        level: "ward",
        isSeoUrl: true,
      };
    }

    if (!id) {
      return {
        type: "property-listing",
        transactionType: slug[0],
        location: {
          province: slug[1],
          ward: slug[2],
        },
        level: "ward",
        isSeoUrl: true,
      };
    }

    return {
      type: "property-detail",
      id,
      transactionType: slug[0],
      location: {
        province: slug[1],
        ward: slug[2],
      },
      isSeoUrl: true,
    };
  }

  // Ward-level listing: /mua-ban/province/ward
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 3) {
    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {
        province: slug[1],
        ward: slug[2],
      },
      level: "ward",
      isSeoUrl: true,
    };
  }

  // Province-level listing: /mua-ban/province
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 2) {
    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {
        province: slug[1],
      },
      level: "province",
      isSeoUrl: true,
    };
  }

  // Old format support: /province/ward/id-title (backward compatibility)
  if (slug.length === 3) {
    const idSlug = slug[2];
    const id = idSlug.split("-")[0];

    // Validate ID (MongoDB ObjectID or numeric)
    if (!id || (!/^\d+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id))) {
      return null;
    }

    return {
      type: "property-detail",
      id,
      location: {
        province: slug[0],
        ward: slug[1],
      },
      isSeoUrl: true,
    };
  }

  // Base transaction listing: /mua-ban or /cho-thue
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 1) {
    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {},
      level: "base",
      isSeoUrl: true,
    };
  }

  return null;
}
