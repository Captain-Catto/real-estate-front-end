"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { postService } from "@/services/postsService";
import { locationService } from "@/services/locationService";

interface SimilarPost {
  _id: string;
  title: string;
  price: number;
  currency: string;
  area: number;
  location: {
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
  locationNames?: {
    provinceName?: string;
    districtName?: string;
    wardName?: string;
  };
  images: string[];
  type: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  project?: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  package?: "free" | "basic" | "premium" | "vip";
  priority?: "normal" | "premium" | "vip";
}

interface SimilarPostsProps {
  postId: string;
  limit?: number;
}

const SimilarPosts: React.FC<SimilarPostsProps> = ({ postId, limit = 6 }) => {
  const [similarPosts, setSimilarPosts] = useState<SimilarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<{
    searchMethod?: string;
    hasProject?: boolean;
    ward?: string;
    district?: string;
    category?: {
      _id?: string;
      name?: string;
      slug?: string;
    };
    type?: string;
  } | null>(null);

  useEffect(() => {
    const fetchSimilarPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await postService.getSimilarPosts(postId, limit);

        // Lấy thông tin tên địa chỉ cho mỗi bài đăng
        const postsWithLocationNames = await Promise.all(
          (response.posts || []).map(async (post: SimilarPost) => {
            if (
              post.location &&
              ((typeof post.location.province === "string" &&
                !isNaN(Number(post.location.province))) ||
                (typeof post.location.district === "string" &&
                  !isNaN(Number(post.location.district))) ||
                (typeof post.location.ward === "string" &&
                  !isNaN(Number(post.location.ward))))
            ) {
              try {
                const locationNames = await locationService.getLocationNames(
                  post.location.province,
                  post.location.district,
                  post.location.ward
                );

                return {
                  ...post,
                  locationNames,
                };
              } catch (error) {
                console.error("Error fetching location names:", error);
                return post;
              }
            }
            return post;
          })
        );

        setSimilarPosts(postsWithLocationNames);
        setCriteria(response.criteria || null);

        console.log("🔍 Similar posts loaded:", postsWithLocationNames);
      } catch (err) {
        console.error("Error fetching similar posts:", err);
        setError("Không thể tải tin đăng tương tự");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchSimilarPosts();
    }
  }, [postId, limit]);

  // Loại bỏ hàm getPackageLabel không sử dụng
  const formatPrice = (price: number, currency: string = "VND") => {
    if (!price) return "Thỏa thuận";

    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ ${currency}`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu ${currency}`;
    } else {
      return `${price.toLocaleString()} ${currency}`;
    }
  };

  const formatArea = (area: number) => {
    if (!area) return "Chưa rõ";
    return `${area} m²`;
  };

  // Utility function to create SEO-friendly slugs
  const createSlug = (text: string): string => {
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
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Tin đăng tương tự</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Tin đăng tương tự</h3>
        <div className="text-center py-8">
          <i className="fas fa-exclamation-triangle text-3xl text-gray-400 mb-3"></i>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (similarPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Tin đăng tương tự</h3>
        <div className="text-center py-8">
          <i className="fas fa-search text-3xl text-gray-400 mb-3"></i>
          <p className="text-gray-500">Không tìm thấy tin đăng tương tự</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Tin đăng tương tự</h3>
      </div>

      {/* Search criteria info */}
      {criteria && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-sm text-blue-700">
            <i className="fas fa-info-circle mr-2"></i>
            <span>
              Tìm kiếm dựa trên:{" "}
              {criteria.searchMethod === "project" && "cùng dự án"}
              {criteria.searchMethod === "ward" && "cùng phường/xã"}
              {criteria.searchMethod === "district" && "cùng quận/huyện"}
              {criteria.searchMethod === "ward_district" &&
                "cùng phường/xã và quận/huyện"}
              {criteria.searchMethod === "category" &&
                "cùng loại hình và danh mục"}
              {!criteria.searchMethod && (
                <>
                  {criteria.hasProject && "cùng dự án, "}
                  {criteria.ward && "cùng phường/xã, "}
                  {criteria.district && "cùng quận/huyện, "}
                  cùng loại hình
                </>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarPosts.map((post) => {
          // Generate SEO-friendly URL if location data is available
          let href = "";
          const transactionType =
            post.type === "cho-thue" ? "cho-thue" : "mua-ban";

          if (
            post.locationNames &&
            post.locationNames.provinceName &&
            post.locationNames.districtName &&
            post.locationNames.wardName
          ) {
            // Full location path with SEO-friendly URL: /mua-ban/province/district/ward/id-title
            href = `/${transactionType}/${createSlug(
              post.locationNames.provinceName
            )}/${createSlug(post.locationNames.districtName)}/${createSlug(
              post.locationNames.wardName
            )}/${post._id}-${createSlug(post.title)}`;
          } else {
            // Fallback to simplified URL: /mua-ban/chi-tiet/id-title
            href = `/${transactionType}/chi-tiet/${post._id}-${createSlug(
              post.title
            )}`;
          }

          return (
            <Link
              key={post._id}
              href={href}
              className="block group hover:shadow-lg transition-shadow duration-200 h-full"
            >
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
                {/* Image with fixed height */}
                <div className="relative h-48 bg-gray-200 flex-shrink-0">
                  {post.images && post.images.length > 0 ? (
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-image text-3xl text-gray-400"></i>
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    {post.package === "vip" ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-500 text-white">
                        VIP
                      </span>
                    ) : post.package === "premium" ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-orange-500 text-white">
                        Premium
                      </span>
                    ) : post.package === "basic" ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500 text-white">
                        Cơ bản
                      </span>
                    ) : post.package === "free" ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-500 text-white">
                        Miễn phí
                      </span>
                    ) : null}
                  </div>

                  {/* Project badge */}
                  {post.project && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                        Dự án
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>

                  <div className="space-y-2 text-sm text-gray-600 mb-3 flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-red-600 text-base">
                        {formatPrice(post.price, post.currency || "VND")}
                      </span>
                      <span>{formatArea(post.area)}</span>
                    </div>

                    <div className="flex items-start mb-2">
                      <i className="fas fa-map-marker-alt mr-2 text-gray-400 mt-1 flex-shrink-0"></i>
                      <span className="text-sm font-medium text-gray-800">
                        {post.locationNames ? (
                          <>
                            {post.location?.street &&
                              `${post.location.street}, `}
                            {post.locationNames.wardName &&
                              `${post.locationNames.wardName}, `}
                            {post.locationNames.districtName ||
                              post.location?.district ||
                              "Chưa rõ vị trí"}
                          </>
                        ) : post.location ? (
                          <>
                            {post.location.street &&
                              `${post.location.street}, `}
                            {post.location.ward && `${post.location.ward}, `}
                            {post.location.district || "Chưa rõ vị trí"}
                          </>
                        ) : (
                          "Chưa rõ vị trí"
                        )}
                      </span>
                    </div>

                    {post.project && (
                      <div className="flex items-start">
                        <i className="fas fa-building mr-1 text-gray-400 mt-1 flex-shrink-0"></i>
                        <span className="line-clamp-1">
                          {post.project.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <span>{post.category?.name || "Chưa phân loại"}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarPosts;
