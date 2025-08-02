"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { formatPriceByType, formatArea } from "@/utils/format";

interface PublicUser {
  id: string;
  username: string;
  avatar?: string;
  phoneNumber?: string;
  createdAt: string;
  status: string;
}

interface UserPost {
  _id: string;
  id: string;
  title: string;
  type: "ban" | "cho-thue";
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
  location?: {
    address?: string;
    province?: string;
    district?: string;
    ward?: string;
  };
  slug: string;
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
  const [posts, setPosts] = useState<UserPost[]>([]);
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
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
        const response = await fetch(`${API_BASE_URL}/users/public/${userId}`);

        if (!response.ok) {
          throw new Error("Không thể tải thông tin người dùng");
        }

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        } else {
          throw new Error(data.message || "Có lỗi xảy ra");
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
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
        const response = await fetch(
          `${API_BASE_URL}/posts/public/user/${userId}?page=${currentPage}&limit=${itemsPerPage}&status=active`
        );

        if (!response.ok) {
          throw new Error("Không thể tải danh sách bài viết");
        }

        const data = await response.json();

        if (data.success) {
          const newPosts = data.data.posts || [];

          if (currentPage === 1) {
            setPosts(newPosts);
          } else {
            setPosts((prev) => [...prev, ...newPosts]);
          }

          setTotalPages(data.data.pagination?.totalPages || 1);

          // Calculate stats for first page
          if (currentPage === 1) {
            const totalItems = data.data.pagination?.totalItems || 0;
            const activePosts = newPosts.filter(
              (p: UserPost) => p.status === "active"
            );
            const sellPosts = activePosts.filter(
              (p: UserPost) => p.type === "ban"
            );
            const rentPosts = activePosts.filter(
              (p: UserPost) => p.type === "cho-thue"
            );

            setStats({
              totalPosts: totalItems,
              sellPosts: sellPosts.length,
              rentPosts: rentPosts.length,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setPostsLoading(false);
        setLoadingMore(false);
      }
    };

    fetchPosts();
  }, [userId, currentPage]);

  const filteredPosts = posts.filter((post) => {
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <div
                      key={post._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      <div className="relative h-48">
                        <Image
                          src={post.images[0] || "/default-property.jpg"}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              post.type === "ban"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {post.type === "ban" ? "Bán" : "Cho thuê"}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <FavoriteButton
                            item={{
                              id: post._id,
                              type: "property",
                              title: post.title,
                              price: formatPriceByType(post.price, post.type),
                              location:
                                post.location?.address || "Không xác định",
                              image: post.images[0] || "/default-property.jpg",
                              slug: post.slug,
                              area: formatArea(post.area),
                              bedrooms: post.bedrooms,
                              bathrooms: post.bathrooms,
                              propertyType:
                                post.type === "ban" ? "Bán" : "Cho thuê",
                            }}
                            size="sm"
                          />
                        </div>
                        {post.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            +{post.images.length - 1}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <Link
                          href={`/${
                            post.type === "ban" ? "mua-ban" : "cho-thue"
                          }/chi-tiet/${post.id}-${encodeURIComponent(
                            post.title.toLowerCase().replace(/\s+/g, "-")
                          )}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2 block"
                        >
                          {post.title}
                        </Link>

                        <div className="flex items-center text-xs text-gray-600 mb-3 space-x-3">
                          {post.bedrooms && <span>{post.bedrooms} PN</span>}
                          {post.bathrooms && <span>{post.bathrooms} WC</span>}
                          <span>{formatArea(post.area)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-red-600">
                            {formatPriceByType(post.price, post.type)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(post.updatedAt)}
                          </div>
                        </div>

                        {post.location?.address && (
                          <div className="mt-2 text-xs text-gray-600 line-clamp-1">
                            <svg
                              className="w-3 h-3 inline mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {post.location.address}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
