// Cập nhật để xử lý cả detail và listing pages

import React from "react";
import { PropertyDetail } from "@/components/property-detail/PropertyDetail";
import { ProjectDetail } from "@/components/project-detail/ProjectDetail";
import { PropertyListing } from "@/components/property-listing/PropertyListing";
import { notFound } from "next/navigation";
import { postService } from "@/services/postsService";
import { projectService } from "@/services/projectService";

interface DynamicPageProps {
  params: {
    slug: string[];
  };
}

// Utility function để tạo slug
function createSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
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

      const breadcrumbData = urlData.isSeoUrl
        ? {
            city: urlData.location.city.replace(/-/g, " "),
            district: urlData.location.district.replace(/-/g, " "),
            ward: urlData.location.ward.replace(/-/g, " "),
          }
        : post.location &&
          post.location.city &&
          post.location.district &&
          post.location.ward
        ? {
            city: post.location.city,
            district: post.location.district,
            ward: post.location.ward,
          }
        : undefined;

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

      // Tạo filter object để query database
      const locationFilter: any = {};

      if (urlData.location.city) {
        // Convert slug back to original name for querying
        const cityName = urlData.location.city.replace(/-/g, " ");
        locationFilter["location.province"] = new RegExp(cityName, "i");
      }

      if (urlData.location.district) {
        const districtName = urlData.location.district.replace(/-/g, " ");
        locationFilter["location.district"] = new RegExp(districtName, "i");
      }

      if (urlData.location.ward) {
        const wardName = urlData.location.ward.replace(/-/g, " ");
        locationFilter["location.ward"] = new RegExp(wardName, "i");
      }

      // Add transaction type filter
      if (urlData.transactionType) {
        locationFilter.transactionType = urlData.transactionType;
      }

      console.log("Location filter:", locationFilter);

      // Fetch properties từ database
      const properties = await postService.getPostsByFilter(locationFilter);

      console.log(`Found ${properties?.length || 0} properties for location`);

      // Create breadcrumb data
      const breadcrumbData = {
        city: urlData.location.city?.replace(/-/g, " ") || "",
        district: urlData.location.district?.replace(/-/g, " ") || "",
        ward: urlData.location.ward?.replace(/-/g, " ") || "",
      };

      return (
        <PropertyListing
          properties={properties || []}
          location={breadcrumbData}
          transactionType={urlData.transactionType}
          level={urlData.level}
        />
      );
    }

    // Xử lý project detail và listing tương tự...
    else if (urlData.type === "project-detail") {
      const project = await projectService.getProjectById(urlData.id);

      if (!project) {
        return notFound();
      }

      const breadcrumbData = urlData.isSeoUrl
        ? {
            city: urlData.location.city.replace(/-/g, " "),
            district: urlData.location.district.replace(/-/g, " "),
            ward: urlData.location.ward.replace(/-/g, " "),
          }
        : undefined;

      return (
        <ProjectDetail project={project} breadcrumbData={breadcrumbData} />
      );
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
          <p className="text-sm text-gray-400 mt-2">Error: {error.message}</p>
        </div>
      </div>
    );
  }
}
