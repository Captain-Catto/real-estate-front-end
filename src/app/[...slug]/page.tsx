// Cập nhật để xử lý cả detail và listing pages

import React from "react";
import { PropertyDetail } from "@/components/property-detail/PropertyDetail";
import ProjectDetail from "@/components/project-detail/ProjectDetail";
import { PropertyListing } from "@/components/property-listing/PropertyListing";
import { notFound } from "next/navigation";
import { postService } from "@/services/postsService";
import { locationService } from "@/services/locationService";
import { ProjectService } from "@/services/projectService";
import { createSlug } from "@/utils/helpers";

interface DynamicPageProps {
  params: {
    slug: string[];
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

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = params;
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
        propertyType: post.category || "Chưa xác định",
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
        <PropertyDetail
          property={propertyData}
          breadcrumbData={breadcrumbData}
          transactionType={urlData.transactionType}
        />
      );
    }

    // ⭐ Xử lý trang listing properties theo địa điểm
    else if (urlData.type === "property-listing") {
      console.log("Fetching properties for location:", urlData.location);

      // Define location filter type
      interface LocationFilter {
        status: string;
        type?: string;
        "location.provinceCode"?: string;
        "location.districtCode"?: string;
        "location.wardCode"?: string;
      }

      // Tạo filter object để query database
      const locationFilter: LocationFilter = {
        status: "active",
      };

      // Add type filter - Giữ nguyên giá trị từ URL (mua-ban -> ban, cho-thue -> cho-thue)
      if (urlData.transactionType) {
        locationFilter.type =
          urlData.transactionType === "mua-ban" ? "ban" : "cho-thue";
      }

      // Get location codes
      try {
        // Step 1: Get province code
        if (urlData.location?.city) {
          const provinces = await locationService.getProvinces();
          const province = provinces?.find(
            (p) =>
              p.codename === urlData.location.city ||
              createSlug(p.name) === urlData.location.city
          );
          if (province) {
            locationFilter["location.provinceCode"] = province.code;

            // Step 2: Get district code if province found
            if (urlData.location?.district) {
              const districts = await locationService.getDistricts(
                province.code
              );
              const district = districts?.find(
                (d) =>
                  d.codename === urlData.location.district ||
                  createSlug(d.name) === urlData.location.district
              );
              if (district) {
                locationFilter["location.districtCode"] = district.code;

                // Step 3: Get ward code if district found
                if (urlData.location?.ward) {
                  const wards = await locationService.getWards(
                    province.code,
                    district.code
                  );
                  const ward = wards?.find(
                    (w) =>
                      w.codename === urlData.location.ward ||
                      createSlug(w.name) === urlData.location.ward
                  );
                  if (ward) {
                    locationFilter["location.wardCode"] = ward.code;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error getting location codes:", error);
      }

      console.log("Location filter:", locationFilter);

      // Fetch properties từ database với filter mới
      const posts = await postService.getPostsByFilter(locationFilter);
      console.log("Fetched posts:", posts);

      // Get proper Vietnamese names for breadcrumb
      let locationNames;
      try {
        locationNames = await locationService.getBreadcrumbFromSlug(
          urlData.location?.city || undefined,
          (urlData.location?.district ?? undefined) as string | undefined,
          (urlData.location?.ward ?? undefined) as string | undefined
        );
      } catch (error) {
        console.error("Error getting location names:", error);
      }

      // Sử dụng locationNames cho breadcrumb
      const breadcrumbData = {
        city:
          locationNames?.city ||
          urlData.location?.city?.replace(/-/g, " ") ||
          "",
        district:
          locationNames?.district ||
          (urlData.location?.district ?? "").replace(/-/g, " "),
        ward:
          locationNames?.ward ||
          (urlData.location?.ward ?? "").replace(/-/g, " "),
      };

      return (
        <PropertyListing
          properties={posts || []}
          location={breadcrumbData}
          transactionType={urlData.transactionType || "mua-ban"}
          level={(urlData.level as "ward" | "district" | "city") || "city"}
        />
      );
    }

    // Xử lý project detail và listing tương tự...
    else if (urlData.type === "project-detail") {
      if (!urlData.id) {
        return notFound();
      }

      const project = await ProjectService.getProjectById(urlData.id);

      if (!project) {
        return notFound();
      }

      return <ProjectDetail projectSlug={project.slug} />;
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
