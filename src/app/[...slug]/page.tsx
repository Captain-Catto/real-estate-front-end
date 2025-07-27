// Cập nhật để xử lý cả detail và listing pages
import React from "react";
import { PropertyDetail } from "@/components/property-detail/PropertyDetail";
import { PropertyListing } from "@/components/property-listing/PropertyListing";
import { notFound } from "next/navigation";
import { postService } from "@/services/postsService";
import { locationService } from "@/services/locationService";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { PropertyData } from "@/types/property";

interface DynamicPageProps {
  params: {
    slug: string[];
  };
  searchParams?: {
    city?: string;
    province?: string;
    ward?: string;
    wards?: string;
    [key: string]: string | string[] | undefined;
  };
}

// Parse URL để xác định type và extract data
function parseUrl(slug: string[]) {
  console.log("Parsing URL slug:", slug);

  // URL chi tiết: /mua-ban/ha-noi/dich-vong/12345-chung-cu-cao-cap
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 4) {
    const idSlug = slug[3];
    const id = idSlug.split("-")[0];

    // Thêm kiểm tra để đảm bảo id là một chuỗi hợp lệ (hỗ trợ cả số thuần và MongoDB ObjectID)
    if (!id || (!/^\d+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id))) {
      console.log("Invalid ID in URL:", idSlug);
      return null;
    }

    return {
      type: "property-detail",
      id,
      transactionType: slug[0],
      location: {
        city: slug[1],
        ward: slug[2],
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

    // Thêm kiểm tra để đảm bảo ID hợp lệ (tương tự như property detail)
    if (!id || (!/^\d+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id))) {
      console.log("Invalid ID in fallback URL:", idSlug);
      return null;
    }

    return {
      type: "property-detail",
      id,
      transactionType: slug[0],
      isSeoUrl: false,
    };
  }

  // URL listing theo khu vực: /mua-ban/tinh-lang-son/xa-huu-kien
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 3) {
    console.log("Detected ward-level URL:", {
      city: slug[1],
      ward: slug[2],
    });

    // Kiểm tra nếu slug[1] không chứa "tinh-" hoặc "thanh-pho-" thì thêm vào
    let citySlug = slug[1];
    if (!citySlug.startsWith("tinh-") && !citySlug.startsWith("thanh-pho-")) {
      console.log("Adding prefix to city slug for better matching");
      // Thêm prefix cho đúng định dạng API
      if (
        citySlug === "ha-noi" ||
        citySlug === "ho-chi-minh" ||
        citySlug === "da-nang" ||
        citySlug === "can-tho" ||
        citySlug === "hai-phong"
      ) {
        citySlug = `thanh-pho-${citySlug}`;
      } else {
        citySlug = `tinh-${citySlug}`;
      }
    }

    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {
        city: citySlug,
        ward: slug[2],
      },
      level: "ward", // Listing theo phường/xã
    };
  }

  // URL listing theo tỉnh/thành: /mua-ban/tinh-lang-son
  if ((slug[0] === "mua-ban" || slug[0] === "cho-thue") && slug.length === 2) {
    // Xử lý đặc biệt cho các tỉnh/thành không có tiền tố
    console.log("Parsing province-level URL:", slug[1]);

    // Đảm bảo chúng ta lưu đúng slug gốc từ URL
    const citySlug = slug[1];

    return {
      type: "property-listing",
      transactionType: slug[0],
      location: {
        city: citySlug,
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

  // URL dự án chi tiết: /du-an/ha-noi/my-dinh/12345-vinhomes
  if (slug[0] === "du-an" && slug.length === 4) {
    const idSlug = slug[3];
    const id = idSlug.split("-")[0];

    // Thêm kiểm tra ID cho dự án (tương tự như property detail)
    if (!id || (!/^\d+$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id))) {
      console.log("Invalid project ID in URL:", idSlug);
      return null;
    }

    return {
      type: "project-detail",
      id,
      location: {
        city: slug[1],
        ward: slug[2],
      },
      isSeoUrl: true,
    };
  }

  // URL dự án listing
  if (slug[0] === "du-an" && slug.length >= 2 && slug.length <= 3) {
    return {
      type: "project-listing",
      location: {
        city: slug[1],
        ward: slug[2] || null,
      },
      level: slug.length === 2 ? "city" : "ward",
    };
  }

  return null;
}

export default async function DynamicPage({
  params,
  searchParams = {},
}: DynamicPageProps) {
  // Đảm bảo chờ đợi params và searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { slug } = resolvedParams;
  const urlData = parseUrl(slug);

  console.log("URL Data parsed:", urlData);
  console.log("Search params:", resolvedSearchParams);

  if (!urlData) {
    console.log("No URL data found, returning 404");
    return notFound();
  }

  try {
    console.log("===== PROCESSING URL TYPE:", urlData.type, "=====");
    // Xử lý trang chi tiết property
    if (urlData.type === "property-detail") {
      console.log("Fetching property with ID:", urlData.id);

      if (!urlData.id) {
        console.log("No ID found in URL");
        return notFound();
      }

      const post = await postService.getPostById(urlData.id);
      console.log("Fetched post data:", post ? "Success" : "Not found");

      if (!post) {
        console.log("Property not found for ID:", urlData.id);
        return notFound();
      }

      // Increment view count on server side to avoid multiple calls
      try {
        await postService.incrementViews(urlData.id);
        console.log("📊 View incremented for post:", urlData.id);
      } catch (error) {
        console.warn("Failed to increment view:", error);
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
      let breadcrumbData = {
        city: "",
        ward: "",
        district: "",
      };

      if (urlData.isSeoUrl && urlData.location) {
        try {
          // Sử dụng API đã được cải tiến để lấy tên tiếng Việt đầy đủ
          const locationNames = await locationService.getBreadcrumbFromSlug(
            urlData.location.city || "",
            null, // District is null in new structure
            urlData.location.ward || ""
          );

          console.log(
            "Kết quả breadcrumb từ API cho trang chi tiết:",
            locationNames
          );

          // Chỉ sử dụng kết quả API nếu có dữ liệu
          if (locationNames) {
            breadcrumbData = {
              city: locationNames.city || "",
              district: "", // Không còn sử dụng district trong cấu trúc mới
              ward: locationNames.ward || "",
            };
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin địa điểm:", error);
          // Fallback đơn giản với URL slugs
          breadcrumbData = {
            city:
              urlData.location.city
                ?.replace(/^tinh-/, "")
                ?.replace(/^thanh-pho-/, "")
                ?.replace(/-/g, " ")
                ?.split(" ")
                ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                ?.join(" ") || "",
            district: "", // Không còn sử dụng district
            ward:
              urlData.location.ward
                ?.replace(/^xa-/, "")
                ?.replace(/^phuong-/, "")
                ?.replace(/^thi-tran-/, "")
                ?.replace(/-/g, " ")
                ?.split(" ")
                ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                ?.join(" ") || "",
          };
        }
      } else if (
        post.location &&
        post.location.province &&
        post.location.ward
      ) {
        // Fallback to post location data if available
        breadcrumbData = {
          city: post.location.province,
          district: post.location.district || "",
          ward: post.location.ward,
        };
      }

      // Thêm district mặc định là chuỗi rỗng cho PropertyDetail component nếu nó đang mong đợi cấu trúc cũ
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
      const searchFilters: Record<string, string | number | boolean> = {
        status: "active",
      };

      // Add type filter - Giữ nguyên giá trị từ URL (mua-ban -> ban, cho-thue -> cho-thue)
      if (urlData.transactionType) {
        searchFilters.type =
          urlData.transactionType === "mua-ban" ? "ban" : "cho-thue";
      }

      // Prioritize query parameters if available
      // Hỗ trợ cả city và province trong query parameters
      let provinceParam = "";

      // Đảm bảo searchParams đã được await
      if (resolvedSearchParams.city) {
        provinceParam = resolvedSearchParams.city as string;
      } else if (resolvedSearchParams.province) {
        provinceParam = resolvedSearchParams.province as string;
      } else if (urlData.location?.city) {
        provinceParam = urlData.location.city;
      }

      // Xử lý đặc biệt cho province để loại bỏ tiền tố
      if (provinceParam) {
        provinceParam = provinceParam
          .replace(/^tinh-/, "")
          .replace(/^thanh-pho-/, "");

        searchFilters.province = provinceParam;
        console.log("Province filter set to:", provinceParam);
      }

      // Không còn sử dụng districts trong cấu trúc mới
      // Nếu vẫn có tham số districts trong query string thì bỏ qua

      // Important fix: Check for 'ward' parameter from query string (both singular and plural forms)
      let wardParam = "";

      // Đã đảm bảo resolvedSearchParams được await ở trên
      if (resolvedSearchParams.ward) {
        wardParam = resolvedSearchParams.ward as string;
      } else if (resolvedSearchParams.wards) {
        wardParam = resolvedSearchParams.wards as string;
      } else if (urlData.location?.ward) {
        wardParam = urlData.location.ward;
      }

      // Xử lý ward param, loại bỏ tiền tố nếu có
      if (wardParam) {
        wardParam = wardParam
          .replace(/^xa-/, "")
          .replace(/^phuong-/, "")
          .replace(/^thi-tran-/, "");

        searchFilters.wards = wardParam;
        console.log("Ward filter set to:", wardParam);
      }

      // Add other search parameters that might be in the query string
      // Đã đảm bảo resolvedSearchParams được await ở trên
      ["price", "area", "bedrooms", "bathrooms", "category"].forEach(
        (param) => {
          if (resolvedSearchParams[param]) {
            searchFilters[param] = resolvedSearchParams[param] as string;
          }
        }
      );

      console.log(
        "Final search filters:",
        JSON.stringify(searchFilters, null, 2)
      );

      // Debug log để kiểm tra location parsing
      console.log("URL Location details:", {
        city: urlData.location?.city,
        ward: urlData.location?.ward,
        level: urlData.level,
      });

      // Debug log để kiểm tra query parameters và slug xử lý
      console.log("Location parameters processing:", {
        originalProvince: urlData.location?.city,
        processedProvince: searchFilters.province,
        originalWard: urlData.location?.ward,
        processedWard: searchFilters.wards,
      });

      // Fetch properties từ database với filter mới sử dụng searchPosts method
      console.log(
        "Calling searchPosts with filters:",
        JSON.stringify(searchFilters)
      );
      const response = await postService.searchPosts(searchFilters);
      console.log("Search response status:", response ? "Success" : "Failed");
      console.log("Search response data structure:", {
        success: response?.success,
        count: Array.isArray(response?.data) ? response.data.length : "N/A",
        dataType: response?.data ? typeof response.data : "N/A",
        isArray: Array.isArray(response?.data),
        firstItem:
          Array.isArray(response?.data) && response.data.length > 0
            ? "Has data"
            : "No data",
      });

      // Log chi tiết hơn về response
      if (response && response.data) {
        console.log("Response data type:", typeof response.data);
        if (Array.isArray(response.data)) {
          console.log("Array length:", response.data.length);
          if (response.data.length === 0) {
            console.log("Empty array returned - no matching properties");
          } else {
            console.log("First item sample:", {
              id: response.data[0]._id,
              title: response.data[0].title,
              province: response.data[0].location?.province,
            });
          }
        } else if (response.data && typeof response.data === "object") {
          console.log("Object data structure:", Object.keys(response.data));

          // Kiểm tra xem có posts array trong response không
          if (response.data.posts) {
            console.log(
              "Found posts array in response.data with length:",
              Array.isArray(response.data.posts)
                ? response.data.posts.length
                : "not an array"
            );

            if (
              Array.isArray(response.data.posts) &&
              response.data.posts.length > 0
            ) {
              console.log("First post in posts array:", {
                id: response.data.posts[0]._id,
                title: response.data.posts[0].title,
                province: response.data.posts[0].location?.province,
              });
            }
          }

          // Kiểm tra xem có thông tin searchCriteria không
          if (response.data.searchCriteria) {
            console.log(
              "Search criteria used by API:",
              response.data.searchCriteria
            );
          }
        } else {
          console.log("Non-array data:", response.data);
        }
      }

      // Đảm bảo posts luôn là một mảng
      // Sử dụng PropertyData để có kiểu dữ liệu nhất quán với component
      let posts: PropertyData[] = [];
      if (!response || !response.success) {
        console.error("Failed to fetch posts:", response);
      } else {
        // Xử lý cả trường hợp data là mảng và object {posts: [...]}
        if (Array.isArray(response.data)) {
          posts = response.data;
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.posts)
        ) {
          posts = response.data.posts;
          console.log(
            "Extracted posts from response.data.posts:",
            posts.length
          );
        } else {
          console.log(
            "Response data is neither array nor contains posts array"
          );
          posts = [];
        }
      }
      console.log("Fetched posts count:", posts.length);

      // Kiểm tra xem có posts không, nếu không thì log thêm thông tin
      if (posts.length === 0) {
        console.log("No posts found for the search filters. Possible reasons:");
        console.log("1. No matching posts in database");
        console.log("2. Province code might be incorrect");
        console.log("3. API endpoint might have changed");
        console.log("4. Database connection issues");

        // Đã loại bỏ xử lý đặc biệt cho tỉnh Đồng Tháp
      }

      // Chuẩn bị slug để gọi API
      let provinceSlug = "";
      let wardSlug = "";

      // 1. Ưu tiên lấy từ query params
      // Đã đảm bảo resolvedSearchParams được await ở trên
      if (resolvedSearchParams.province || resolvedSearchParams.city) {
        provinceSlug = (resolvedSearchParams.province ||
          resolvedSearchParams.city) as string;
      }
      // 2. Lấy từ urlData nếu không có trong query params
      else if (urlData.location?.city) {
        provinceSlug = urlData.location.city;
      }

      // Xử lý đặc biệt cho provinceSlug để loại bỏ tiền tố
      provinceSlug = provinceSlug
        .replace(/^tinh-/, "")
        .replace(/^thanh-pho-/, "");

      // Tương tự cho ward
      // Đã đảm bảo resolvedSearchParams được await ở trên
      if (resolvedSearchParams.ward || resolvedSearchParams.wards) {
        wardSlug = (resolvedSearchParams.ward ||
          resolvedSearchParams.wards) as string;
      } else if (urlData.location?.ward) {
        wardSlug = urlData.location.ward;
      }

      console.log("Slug chuẩn bị gọi API:", { provinceSlug, wardSlug });

      // Lấy tên địa điểm hiển thị đúng với tiếng Việt
      let breadcrumbData = {
        city: "",
        ward: "",
        district: "", // Luôn trống trong cấu trúc mới
      };

      try {
        // Đã loại bỏ việc kiểm tra map dấu tiếng Việt trực tiếp
        console.log("Current province slug:", provinceSlug);

        // Gọi API để lấy dữ liệu địa điểm
        // Đã cải tiến getBreadcrumbFromSlug để xử lý prefix và tìm kiếm chính xác hơn
        const locationNames = await locationService.getBreadcrumbFromSlug(
          provinceSlug,
          null, // không còn sử dụng district
          wardSlug
        );

        console.log("Kết quả lấy tên địa điểm:", locationNames);

        // Kết quả từ API đã có định dạng phù hợp (đã capitalize và có dấu tiếng Việt)
        if (locationNames) {
          breadcrumbData = {
            city: locationNames.city || "",
            district: "", // Luôn trống trong cấu trúc mới
            ward: locationNames.ward || "",
          };
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu địa điểm:", error);

        // Fallback đơn giản nếu API gặp lỗi
        breadcrumbData = {
          city: provinceSlug
            .replace(/^tinh-/, "")
            .replace(/^thanh-pho-/, "")
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          district: "", // Luôn trống trong cấu trúc mới
          ward: wardSlug
            .replace(/^xa-/, "")
            .replace(/^phuong-/, "")
            .replace(/^thi-tran-/, "")
            .replace(/-/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        };
      }

      console.log("Breadcrumb data:", breadcrumbData);

      // Sử dụng kết quả trực tiếp cho locationForDisplay và đảm bảo định dạng phù hợp
      const locationForDisplay = {
        city: breadcrumbData.city,
        district: breadcrumbData.district || "", // Đảm bảo district luôn có giá trị, dù là rỗng
        ward: breadcrumbData.ward || "",
      };

      console.log("Location for display:", locationForDisplay);

      // Đảm bảo dữ liệu được đúng định dạng trước khi truyền vào component
      return (
        <>
          <Header />
          <PropertyListing
            properties={posts}
            location={locationForDisplay}
            transactionType={urlData.transactionType || ""}
            level={(urlData.level as "city" | "district" | "ward") || "city"}
            searchParams={resolvedSearchParams}
          />
          <Footer />
        </>
      );
    }

    // Xử lý trang chi tiết project
    else if (urlData.type === "project-detail") {
      // Phần xử lý dự án sẽ được thêm sau khi hoàn thiện trang property
      return (
        <div className="container mx-auto p-4">
          <h1>Chi tiết dự án đang được phát triển</h1>
        </div>
      );
    }

    // Default case
    return (
      <div className="container mx-auto p-4 my-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Đang tải...</h1>
      </div>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack =
      error instanceof Error ? error.stack : "No stack trace available";

    console.error("===== ERROR FETCHING DATA =====");
    console.error("Error message:", errorMessage);
    console.error("Error details:", error);
    console.error("URL data:", urlData);
    console.error("Stack trace:", errorStack);

    return (
      <div className="container mx-auto p-4 my-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h1>
        <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-left">
            <p className="text-red-600 font-bold">Error: {errorMessage}</p>
          </div>
        )}
      </div>
    );
  }
}
