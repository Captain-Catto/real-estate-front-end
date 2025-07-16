// Cập nhật để xử lý cả detail và listing pages

import React from "react";
import { PropertyDetail } from "@/components/property-detail/PropertyDetail";
import { PropertyListing } from "@/components/property-listing/PropertyListing";
import { notFound } from "next/navigation";
import { postService } from "@/services/postsService";
import { locationService } from "@/services/locationService";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

interface DynamicPageProps {
  params: {
    slug: string[];
  };
  searchParams?: {
    city?: string;
    districts?: string;
    ward?: string;
    [key: string]: string | string[] | undefined;
  };
}

// Parse URL để xác định type và extract data
function parseUrl(slug: string[]) {
  console.log("Parsing URL slug:", slug);

  // URL chi tiết: /mua-ban/ha-noi/cau-giay/dich-vong/12345-chung-cu-cao-cap
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 5) {
    const idSlug = slug[4];
    const id = idSlug.split("-")[0];

    return {
      type: "property-detail",
      id,
      transactionType: slug[0],
      location: {
        city: slug[1],
        district: slug[2],
        ward: slug[3],
      },
      isSeoUrl: true,
    };
  }

  // URL chi tiết fallback: /mua-ban/chi-tiet/12345-title (khi không có đủ thông tin location)
  if (
    (slug[0] === "mua-ban" || slug[0] === "cho-thue") &&
    slug.length === 3 &&
    slug[1] === "chi-tiet"
  ) {
    const idSlug = slug[2];
    const id = idSlug.split("-")[0];

    return {
      type: "property-detail",
      id,
      transactionType: slug[0],
      isSeoUrl: false,
    };
  }

  // URL listing theo khu vực: /mua-ban/tinh-lang-son/huyen-chi-lang/xa-huu-kien
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 4) {
    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {
        city: slug[1],
        district: slug[2],
        ward: slug[3],
      },
      level: "ward", // Listing theo phường/xã
    };
  }

  // URL listing theo quận/huyện: /mua-ban/tinh-lang-son/huyen-chi-lang
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 3) {
    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {
        city: slug[1],
        district: slug[2],
      },
      level: "district", // Listing theo quận/huyện
    };
  }

  // URL listing theo tỉnh/thành: /mua-ban/tinh-lang-son
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 2) {
    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {
        city: slug[1],
      },
      level: "city", // Listing theo tỉnh/thành
    };
  }

  // URL listing với query parameters: /mua-ban?city=...&districts=...&ward=...
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 1) {
    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {}, // Location sẽ được lấy từ searchParams
      level: "query", // Listing với query parameters
    };
  }

  // URL dự án chi tiết: /du-an/ha-noi/nam-tu-liem/my-dinh/12345-vinhomes
  if (slug[0] === "du-an" && slug.length === 5) {
    const idSlug = slug[4];
    const id = idSlug.split("-")[0];

    return {
      type: "project-detail",
      id,
      location: {
        city: slug[1],
        district: slug[2],
        ward: slug[3],
      },
      isSeoUrl: true,
    };
  }

  // URL dự án listing
  if (slug[0] === "du-an" && slug.length >= 2 && slug.length <= 4) {
    return {
      type: "project-listing",
      location: {
        city: slug[1],
        district: slug[2] || null,
        ward: slug[3] || null,
      },
      level:
        slug.length === 2 ? "city" : slug.length === 3 ? "district" : "ward",
    };
  }

  return null;
}

export default async function DynamicPage({
  params,
  searchParams = {},
}: DynamicPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const urlData = parseUrl(slug);

  console.log("URL Data parsed:", urlData);

  if (!urlData) {
    console.log("No URL data found, returning 404");
    return notFound();
  }

  try {
    // Xử lý trang chi tiết property
    if (urlData.type === "property-detail") {
      console.log("Fetching property with ID:", urlData.id);

      if (!urlData.id) {
        console.log("No ID found in URL");
        return notFound();
      }

      const post = await postService.getPostById(urlData.id);
      console.log("Fetched post data:", post);

      if (!post) {
        console.log("Property not found for ID:", urlData.id);
        return notFound();
      }

      // Transform data như cũ
      const propertyData = {
        id: post._id,
        title: post.title,
        price: post.price || "Thỏa thuận",
        currency: post.currency || "VND",
        location: post.location?.district
          ? `${post.location.district}, ${post.location.province}`
          : post.location?.province || "",
        fullLocation: [
          post.location?.street,
          post.location?.ward,
          post.location?.district,
          post.location?.province,
        ]
          .filter(Boolean)
          .join(", "),
        locationCode: post.location,
        images: post.images || [],
        slug: post.slug || "",
        area: post.area ? `${post.area} m²` : "",
        bedrooms: post.bedrooms,
        bathrooms: post.bathrooms,
        floors: post.floors,
        propertyType: post.category?.name || post.category || "Chưa xác định",
        legalDocs: post.legalDocs || "",
        furniture: post.furniture || "",
        houseDirection: post.houseDirection || "",
        balconyDirection: post.balconyDirection || "",
        roadWidth: post.roadWidth || "",
        frontWidth: post.frontWidth || "",
        description: post.description || "",
        author: {
          username: post.contactName || post.author?.username || "Không rõ",
          phone: post.phone || post.author?.phoneNumber || "Không rõ",
          email: post.email || post.author?.email || "Không rõ",
          avatar: post.author?.avatar || "/default-avatar.png",
        },
        postedDate: post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("vi-VN")
          : "Chưa xác định",
        postType: post.packageId || "Chưa xác định",
        project: post.project || null, // Add project field
        latitude: post.latitude || undefined,
        longitude: post.longitude || undefined,
      };

      // Fetch proper Vietnamese location names for breadcrumb
      let breadcrumbData:
        | { city: string; district: string; ward: string }
        | undefined;

      if (urlData.isSeoUrl && urlData.location) {
        try {
          // Use API to get proper Vietnamese names with diacritics
          const locationNames = await locationService.getBreadcrumbFromSlug(
            urlData.location.city || undefined,
            (urlData.location.district ?? undefined) as string | undefined,
            (urlData.location.ward ?? undefined) as string | undefined
          );

          // Only use API result if we got meaningful data
          if (
            locationNames.city ||
            locationNames.district ||
            locationNames.ward
          ) {
            breadcrumbData = {
              city:
                locationNames.city ||
                urlData.location.city?.replace(/-/g, " ") ||
                "",
              district:
                locationNames.district ||
                urlData.location.district?.replace(/-/g, " ") ||
                "",
              ward:
                locationNames.ward ||
                urlData.location.ward?.replace(/-/g, " ") ||
                "",
            };
          } else {
            // Fallback to slugs converted to readable format
            breadcrumbData = {
              city: urlData.location.city?.replace(/-/g, " ") || "",
              district: urlData.location.district?.replace(/-/g, " ") || "",
              ward: urlData.location.ward?.replace(/-/g, " ") || "",
            };
          }
        } catch (error) {
          console.error("Error fetching breadcrumb data:", error);
          // Fallback to slugs converted to readable format
          breadcrumbData = {
            city: urlData.location.city?.replace(/-/g, " ") || "",
            district: urlData.location.district?.replace(/-/g, " ") || "",
            ward: urlData.location.ward?.replace(/-/g, " ") || "",
          };
        }
      } else if (
        post.location &&
        post.location.province &&
        post.location.district &&
        post.location.ward
      ) {
        // Fallback to post location data
        breadcrumbData = {
          city: post.location.province,
          district: post.location.district,
          ward: post.location.ward,
        };
      }

      return (
        <>
          <Header />
          <PropertyDetail
            property={propertyData}
            breadcrumbData={breadcrumbData}
            transactionType={urlData.transactionType}
          />
          <Footer />
        </>
      );
    }

    // ⭐ Xử lý trang listing properties theo địa điểm
    else if (urlData.type === "property-listing") {
      console.log("Fetching properties for location:", urlData.location);
      console.log("Search parameters from URL:", resolvedSearchParams);

      // Tạo filter object tương thích với backend API searchPosts method
      const searchFilters: Record<string, string | number> = {
        status: "active",
      };

      // Add type filter - Giữ nguyên giá trị từ URL (mua-ban -> ban, cho-thue -> cho-thue)
      if (urlData.transactionType) {
        searchFilters.type =
          urlData.transactionType === "mua-ban" ? "ban" : "cho-thue";
      }

      // Prioritize query parameters if available
      if (resolvedSearchParams.city) {
        searchFilters.city = resolvedSearchParams.city as string;
      } else if (urlData.location?.city) {
        searchFilters.city = urlData.location.city;
      }

      if (resolvedSearchParams.districts) {
        searchFilters.districts = resolvedSearchParams.districts as string;
      } else if (urlData.location?.district) {
        searchFilters.districts = urlData.location.district;
      }

      // Important fix: Check for 'ward' parameter from query string (both singular and plural forms)
      if (resolvedSearchParams.ward) {
        console.log(
          "Found ward (singular) in searchParams:",
          resolvedSearchParams.ward
        );
        searchFilters.wards = resolvedSearchParams.ward as string;
      } else if (resolvedSearchParams.wards) {
        console.log(
          "Found wards (plural) in searchParams:",
          resolvedSearchParams.wards
        );
        searchFilters.wards = resolvedSearchParams.wards as string;
      } else if (urlData.location?.ward) {
        console.log("Found ward in urlData:", urlData.location.ward);
        searchFilters.wards = urlData.location.ward;
      }

      // Add other search parameters that might be in the query string
      ["price", "area", "bedrooms", "bathrooms", "category"].forEach(
        (param) => {
          if (resolvedSearchParams[param]) {
            searchFilters[param] = resolvedSearchParams[param] as string;
          }
        }
      );

      console.log("Final search filters:", searchFilters);
      console.log(
        "Final search filters type check - wards:",
        typeof searchFilters.wards
      );

      // Debug log để kiểm tra location parsing
      console.log("URL Location details:", {
        city: urlData.location?.city,
        district: urlData.location?.district,
        ward: urlData.location?.ward,
        level: urlData.level,
      });

      // Fetch properties từ database với filter mới sử dụng searchPosts method
      const response = await postService.searchPosts(searchFilters);
      console.log("Search response:", response);

      let posts = [];
      if (!response || !response.success) {
        console.error("Search failed:", response?.message || "Unknown error");
        posts = [];
      } else {
        posts = response?.data?.posts || [];
      }
      console.log("Fetched posts:", posts);

      // Get proper Vietnamese names for breadcrumb
      let locationNames;
      try {
        // Use query parameters if available, otherwise use URL path segments
        const citySlug =
          (resolvedSearchParams.city as string) || urlData.location?.city;
        const districtSlug =
          (resolvedSearchParams.districts as string) ||
          urlData.location?.district;
        const wardSlug =
          (resolvedSearchParams.ward as string) ||
          (resolvedSearchParams.wards as string) ||
          urlData.location?.ward;

        console.log("Breadcrumb slug parameters:", {
          citySlug,
          districtSlug,
          wardSlug,
        });

        locationNames = await locationService.getBreadcrumbFromSlug(
          citySlug || undefined,
          districtSlug || undefined,
          wardSlug || undefined
        );
      } catch (error) {
        console.error("Error getting location names:", error);
      }

      // Sử dụng locationNames cho breadcrumb
      const breadcrumbData = {
        city:
          locationNames?.city ||
          (resolvedSearchParams.city as string)?.replace(/[_-]/g, " ") ||
          urlData.location?.city?.replace(/[_-]/g, " ") ||
          "",
        district:
          locationNames?.district ||
          (resolvedSearchParams.districts as string)?.replace(/[_-]/g, " ") ||
          (urlData.location?.district ?? "").replace(/[_-]/g, " "),
        ward:
          locationNames?.ward ||
          (resolvedSearchParams.ward as string)?.replace(/[_-]/g, " ") ||
          (resolvedSearchParams.wards as string)?.replace(/[_-]/g, " ") ||
          (urlData.location?.ward ?? "").replace(/[_-]/g, " "),
      };

      // Debug log để kiểm tra breadcrumbData được truyền vào PropertyListing
      console.log("=== BREADCRUMB DATA DEBUG ===");
      console.log("locationNames from API:", locationNames);
      console.log("searchParams:", {
        city: resolvedSearchParams.city,
        districts: resolvedSearchParams.districts,
        ward: resolvedSearchParams.ward,
        wards: resolvedSearchParams.wards,
      });
      console.log(
        "Final breadcrumbData passed to PropertyListing:",
        breadcrumbData
      );
      console.log("Ward check - locationNames?.ward:", locationNames?.ward);
      console.log(
        "Ward check - fallback:",
        (resolvedSearchParams.ward as string)?.replace(/[_-]/g, " ")
      );
      console.log("=== END DEBUG ===");

      // Determine the level based on available location data
      let level: "ward" | "district" | "city" = "city";
      if (urlData.level === "query") {
        // For query-based URLs, determine level from available parameters
        if (resolvedSearchParams.ward || resolvedSearchParams.wards) {
          level = "ward";
        } else if (resolvedSearchParams.districts) {
          level = "district";
        } else if (resolvedSearchParams.city) {
          level = "city";
        }
      } else {
        level = (urlData.level as "ward" | "district" | "city") || "city";
      }

      return (
        <>
          <Header />
          <PropertyListing
            properties={posts || []}
            location={breadcrumbData}
            transactionType={urlData.transactionType || "mua-ban"}
            level={level}
            searchParams={resolvedSearchParams}
          />
          <Footer />
        </>
      );
    }

    // Xử lý project detail - tạm thời return notFound cho đến khi có ProjectService
    else if (urlData.type === "project-detail") {
      // TODO: Implement project detail when ProjectService is available
      return notFound();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Có lỗi xảy ra
          </h1>
          <p className="text-gray-600">Vui lòng thử lại sau.</p>
          <p className="text-sm text-gray-400 mt-2">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
