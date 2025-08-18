"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import {
  FavoriteButton,
  FavoriteItem,
} from "@/components/common/FavoriteButton";
import { formatPriceByType, formatArea } from "@/utils/format";
import {
  generatePostSlug,
  convertBackendTransactionType,
} from "@/utils/slugUtils";
import { getPackageBadge, shouldShowBadge } from "@/utils/packageBadgeUtils";
import { adminPostsService, Post } from "@/services/postsService";
import { getPublicUser } from "@/services/userService";
import { locationService } from "@/services/locationService";
import { showErrorToast } from "@/utils/errorHandler";

interface PublicUser {
  id: string;
  username: string;
  avatar?: string;
  phoneNumber?: string;
  createdAt: string;
  status: string;
}

interface UserStats {
  totalPosts: number;
  sellPosts: number;
  rentPosts: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.userId as string;

  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsWithFullData, setPostsWithFullData] = useState<
    (Post & { fullAddress?: string; fullSlug?: string })[]
  >([]);
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    sellPosts: 0,
    rentPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "ban" | "cho-thue">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const itemsPerPage = 12;

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function để tính thời gian đăng (giống FeaturedProperties)
  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Đăng hôm nay";
    } else if (diffDays === 1) {
      return "Đăng hôm qua";
    } else if (diffDays < 7) {
      return `Đăng ${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "Đăng 1 tuần trước" : `Đăng ${weeks} tuần trước`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? "Đăng 1 tháng trước" : `Đăng ${months} tháng trước`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? "Đăng 1 năm trước" : `Đăng ${years} năm trước`;
    }
  };

  // Helper function để tạo địa chỉ đầy đủ từ location
  const getFullAddress = async (post: Post): Promise<string> => {
    try {
      let fullAddress = "";
      let provinceName = "";
      let wardName = "";

      // Lấy tên province và ward nếu có
      if (post.location?.province && post.location?.ward) {
        const locationNames = await locationService.getLocationNames(
          post.location.province,
          post.location.ward
        );
        provinceName = locationNames.provinceName || "";
        wardName = locationNames.wardName || "";
      }

      // Kết hợp street + ward + province
      const addressParts = [];

      if (post.location?.street) {
        addressParts.push(post.location.street);
      }

      if (wardName) {
        addressParts.push(wardName);
      }

      if (provinceName) {
        addressParts.push(provinceName);
      }

      fullAddress = addressParts.join(", ");

      return fullAddress || "Không xác định";
    } catch {
      showErrorToast("Có lỗi xảy ra khi lấy địa chỉ đầy đủ");
      return (
        post.location?.street || post.location?.province || "Không xác định"
      );
    }
  };

  // Helper function để tạo slug với location names đầy đủ
  const createFullPostSlug = async (post: Post): Promise<string> => {
    try {
      let provinceName = "";
      let wardName = "";

      if (post.location?.province && post.location?.ward) {
        const locationNames = await locationService.getLocationNames(
          post.location.province,
          post.location.ward
        );
        provinceName = locationNames.provinceName || post.location.province;
        wardName = locationNames.wardName || post.location.ward;
      }

      return generatePostSlug({
        type: convertBackendTransactionType(post.type),
        province: provinceName,
        ward: wardName,
        postId: post._id,
        title: post.title,
      });
    } catch {
      showErrorToast("Có lỗi xảy ra khi tạo slug bài viết");
      // Fallback to simple format
      return `/${convertBackendTransactionType(post.type)}/chi-tiet/${
        post._id
      }-${post.title.toLowerCase().replace(/\s+/g, "-")}`;
    }
  };

  // Handle phone button click
  const handlePhoneClick = async () => {
    if (!user?.phoneNumber) return;

    if (!showPhone) {
      // First click: show phone number
      setShowPhone(true);
    } else {
      // Second click: copy to clipboard
      try {
        await navigator.clipboard.writeText(user.phoneNumber);
        // You could add a toast notification here
        alert("Đã copy số điện thoại!");
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = user.phoneNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Đã copy số điện thoại!");
      }
    }
  };

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await getPublicUser(userId);

        if (response.success && response.user) {
          setUser(response.user);
        } else {
          throw new Error(response.message || "Có lỗi xảy ra");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;

      try {
        setPostsLoading(currentPage === 1);
        const response = await adminPostsService.getPublicUserPosts(userId, {
          page: currentPage,
          limit: itemsPerPage,
          status: "active",
        });

        if (response.success) {
          const newPosts = response.data.posts || [];

          if (currentPage === 1) {
            setPosts(newPosts);
          } else {
            setPosts((prev) => [...prev, ...newPosts]);
          }

          setTotalPages(response.data.pagination?.totalPages || 1);

          // Calculate stats for first page
          if (currentPage === 1) {
            const totalItems = response.data.pagination?.totalItems || 0;
            const activePosts = newPosts.filter(
              (p: Post) => p.status === "active"
            );
            const sellPosts = activePosts.filter((p: Post) => p.type === "ban");
            const rentPosts = activePosts.filter(
              (p: Post) => p.type === "cho-thue"
            );

            setStats({
              totalPosts: totalItems,
              sellPosts: sellPosts.length,
              rentPosts: rentPosts.length,
            });
          }
        }
      } catch (err) {
        showErrorToast("Có lỗi xảy ra khi lấy bài viết");
      } finally {
        setPostsLoading(false);
        setLoadingMore(false);
      }
    };

    fetchPosts();
  }, [userId, currentPage]);

  // Transform posts to include full address and full slug
  useEffect(() => {
    const transformPosts = async () => {
      if (posts.length === 0) {
        setPostsWithFullData([]);
        return;
      }

      const postsWithData = await Promise.all(
        posts.map(async (post) => {
          const fullAddress = await getFullAddress(post);
          const fullSlug = await createFullPostSlug(post);
          console.log(`Post ${post._id} data:`, {
            title: post.title,
            street: post.location?.street,
            province: post.location?.province,
            ward: post.location?.ward,
            fullAddress,
            fullSlug,
          });
          return { ...post, fullAddress, fullSlug };
        })
      );

      setPostsWithFullData(postsWithData);
    };

    transformPosts();
  }, [posts]);

  const filteredPosts = postsWithFullData.filter((post) => {
    if (activeTab === "all") return true;
    return post.type === activeTab;
  });

  const loadMorePosts = () => {
    if (currentPage < totalPages && !loadingMore) {
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4">
                    <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy người dùng
            </h2>
            <p className="text-gray-600">
              Người dùng này không tồn tại hoặc đã bị xóa.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* User Details */}
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                  <Image
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username}
                    fill
                    className="object-cover rounded-full border-2 border-gray-200"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.username}
                  </h1>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tham gia từ: {formatDate(user.createdAt)}
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <button
                          onClick={handlePhoneClick}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          {showPhone ? user.phoneNumber : "Hiện số điện thoại"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Stats Cards */}
                <div className="flex flex-wrap gap-4">
                  <div className="p-1 bg-gray-50 rounded-lg sm:p-4 text-center min-w-[100px]">
                    <div className="text-xl font-bold text-blue-600 mb-1">
                      {stats.totalPosts}
                    </div>
                    <div className="text-xs text-gray-600">Tổng tin đăng</div>
                  </div>
                  <div className="p-1 bg-gray-50 rounded-lg sm:p-4 text-center min-w-[100px]">
                    <div className="text-xl font-bold text-red-600 mb-1">
                      {posts.filter((p) => p.type === "ban").length}
                    </div>
                    <div className="text-xs text-gray-600">Tin bán</div>
                  </div>
                  <div className="p-1 bg-gray-50 rounded-lg sm:p-4 text-center min-w-[100px]">
                    <div className="text-xl font-bold text-purple-600 mb-1">
                      {posts.filter((p) => p.type === "cho-thue").length}
                    </div>
                    <div className="text-xs text-gray-600">Tin cho thuê</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Tin đăng đang hiển thị ({filteredPosts.length})
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {[
                { key: "all", label: "Tất cả", count: posts.length },
                {
                  key: "ban",
                  label: "Bán",
                  count: posts.filter((p) => p.type === "ban").length,
                },
                {
                  key: "cho-thue",
                  label: "Cho thuê",
                  count: posts.filter((p) => p.type === "cho-thue").length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(tab.key as "all" | "ban" | "cho-thue")
                  }
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Posts Grid */}
            {postsLoading && currentPage === 1 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-32 md:h-48 bg-gray-300"></div>
                    <div className="p-3 md:p-4">
                      <div className="h-3 md:h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 md:h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-4 md:h-6 bg-gray-300 rounded mb-2 w-1/2"></div>
                      <div className="h-3 md:h-4 bg-gray-300 rounded mb-3 w-2/3"></div>
                      <div className="flex justify-between pt-2 md:pt-3 border-t">
                        <div className="h-3 md:h-4 bg-gray-300 rounded w-8 md:w-12"></div>
                        <div className="h-3 md:h-4 bg-gray-300 rounded w-8 md:w-12"></div>
                        <div className="h-3 md:h-4 bg-gray-300 rounded w-8 md:w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L9 4.414V17a1 1 0 102 0V4.414l7.293 7.293a1 1 0 001.414-1.414l-9-9z" />
                </svg>
                <p className="text-gray-500">Chưa có tin đăng nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {filteredPosts.map((post) => {
                    // Create favorite item data (giống FeaturedProperties)
                    const favoriteItem: FavoriteItem = {
                      id: post._id,
                      type: "property",
                      title: post.title,
                      price: formatPriceByType(post.price, post.type),
                      location: post.fullAddress || "Không xác định",
                      image: post.images[0] || "/default-property.jpg",
                      slug:
                        post.fullSlug ||
                        `/${convertBackendTransactionType(
                          post.type
                        )}/chi-tiet/${post._id}`,
                      area: formatArea(post.area),
                      bedrooms: post.bedrooms,
                      bathrooms: post.bathrooms,
                      propertyType: post.type === "ban" ? "Bán" : "Cho thuê",
                    };

                    return (
                      <Link
                        key={post._id}
                        href={
                          post.fullSlug ||
                          `/${convertBackendTransactionType(
                            post.type
                          )}/chi-tiet/${post._id}`
                        }
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                      >
                        {/* Image */}
                        <div className="relative h-32 md:h-48">
                          <Image
                            src={post.images[0] || "/default-property.jpg"}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                          {/* Package Badge */}
                          {shouldShowBadge(post.package || "free") && (
                            <div className="absolute top-2 md:top-3 left-2 md:left-3">
                              <span
                                className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium ${
                                  getPackageBadge(post.package || "free")
                                    .className
                                }`}
                              >
                                {getPackageBadge(post.package || "free").text}
                              </span>
                            </div>
                          )}
                          {/* Favorite Button */}
                          <div className="absolute top-2 md:top-3 right-2 md:right-3">
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              className="inline-block"
                            >
                              <FavoriteButton
                                item={favoriteItem}
                                className="backdrop-blur-sm shadow-md"
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 md:p-4">
                          <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[3rem]">
                            {post.title}
                          </h3>
                          <div className="text-lg md:text-xl font-bold text-red-600 mb-1 md:mb-2">
                            {formatPriceByType(post.price, post.type)}
                          </div>
                          <div className="flex items-start text-gray-600 mb-2 md:mb-3">
                            <svg
                              className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-xs md:text-sm leading-4 line-clamp-2">
                              {post.fullAddress || "Không xác định"}
                            </span>
                          </div>

                          {/* Time ago */}
                          <div className="mb-2 md:mb-3">
                            <span className="text-xs md:text-sm text-gray-500">
                              {getTimeAgo(post.createdAt)}
                            </span>
                          </div>

                          {/* Property details */}
                          <div className="flex gap-4 text-xs md:text-sm text-gray-500 border-t pt-2 md:pt-3">
                            {post.bedrooms !== undefined &&
                              post.bedrooms !== null && (
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-bed"></i>
                                  {post.bedrooms} PN
                                </span>
                              )}
                            {post.bathrooms !== undefined &&
                              post.bathrooms !== null && (
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-bath"></i>
                                  {post.bathrooms} WC
                                </span>
                              )}
                            {post.area && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-ruler-combined"></i>
                                {formatArea(post.area)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {currentPage < totalPages && (
                  <div className="text-center mt-6">
                    <button
                      onClick={loadMorePosts}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang tải...
                        </>
                      ) : (
                        "Xem thêm"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
