"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPriceByType, formatArea } from "@/utils/format";
import { postService } from "@/services/postsService";
import testImg from "@/assets/images/card-img.jpg";
import { toast } from "sonner";

interface Listing {
  id: string;
  type: "ban" | "cho-thue";
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  direction?: string;
  images: string[];
  postedDate: string;
  agent: {
    name: string;
    phone: string;
    avatar?: string;
  };
  slug: string;
}

interface ProjectListingsProps {
  projectId: string;
  projectName: string;
}

export function ProjectListings({
  projectId,
  projectName,
}: ProjectListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "ban" | "cho-thue">("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [_totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        console.log("Fetching listings for project:", {
          projectId,
          projectName,
          projectIdType: typeof projectId,
          projectIdLength: projectId?.length,
        });

        if (!projectId) {
          console.warn("No projectId provided");
          setListings([]);
          return;
        }

        const response = await postService.getPostsByProject(
          projectId,
          1,
          itemsPerPage
        );

        console.log("Project listings API response:", {
          success: response.success,
          dataType: typeof response.data,
          postsCount: response.data?.posts?.length || 0,
          totalPages: response.data?.pagination?.totalPages || 0,
          message: response.message,
        });

        if (response.success) {
          console.log("Fetched project listings:", response.data.posts);
          const transformedListings = response.data.posts || [];
          const totalPagesFromAPI = response.data?.pagination?.totalPages || 1;

          setListings(transformedListings);
          setCurrentPage(1);
          setTotalPages(totalPagesFromAPI);
          setHasMore(totalPagesFromAPI > 1);

          console.log("Pagination info:", {
            currentPage: 1,
            totalPages: totalPagesFromAPI,
            hasMore: totalPagesFromAPI > 1,
            transformedListings: transformedListings.length,
          });

          if (transformedListings.length === 0) {
            console.log("No listings found for project:", projectId);
          }
        } else {
          toast.error("Không thể tải danh sách tin đăng");
          setListings([]);
          setHasMore(false);
        }
      } catch {
        toast.error("Lỗi khi tải tin đăng của dự án");
        setListings([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [projectId, projectName, itemsPerPage]);

  // Function to load more listings
  const loadMoreListings = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      console.log("Loading more listings, page:", nextPage);

      const response = await postService.getPostsByProject(
        projectId,
        nextPage,
        itemsPerPage
      );

      if (response.success && response.data?.posts) {
        const newListings = response.data.posts;
        console.log("Loaded more listings:", newListings.length);

        // Append new listings to existing ones
        setListings((prevListings) => [...prevListings, ...newListings]);
        setCurrentPage(nextPage);

        // Check if there are more pages
        const totalPagesFromAPI = response.data?.pagination?.totalPages || 1;
        setHasMore(nextPage < totalPagesFromAPI);

        console.log("Updated pagination:", {
          currentPage: nextPage,
          totalPages: totalPagesFromAPI,
          hasMore: nextPage < totalPagesFromAPI,
        });
      }
    } catch {
      toast.error("Lỗi khi tải thêm tin đăng");
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (activeTab === "all") return true;
    return listing.type === activeTab;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "area-asc":
        return a.area - b.area;
      case "area-desc":
        return b.area - a.area;
      case "newest":
      default:
        return (
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
    }
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
              >
                <div className="w-full h-48 sm:w-32 sm:h-24 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">
          Tin rao tại {projectName} ({filteredListings.length})
        </h2>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="area-asc">Diện tích nhỏ đến lớn</option>
            <option value="area-desc">Diện tích lớn đến nhỏ</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: "all", label: "Tất cả", count: listings.length },
          {
            key: "ban",
            label: "Bán",
            count: listings.filter((l) => l.type === "ban").length,
          },
          {
            key: "cho-thue",
            label: "Cho thuê",
            count: listings.filter((l) => l.type === "cho-thue").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "all" | "ban" | "cho-thue")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.charAt(0)}</span>
            <span className="ml-1">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Listings */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L9 4.414V17a1 1 0 102 0V4.414l7.293 7.293a1 1 0 001.414-1.414l-9-9z" />
          </svg>
          <p className="text-gray-500">Chưa có tin rao nào cho dự án này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedListings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Image */}
                <div className="w-full sm:w-32 flex-shrink-0">
                  <div className="relative w-full h-48 sm:h-24">
                    <Image
                      src={listing.images[0] || testImg.src}
                      alt={listing.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          listing.type === "ban"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {listing.type === "ban" ? "Bán" : "Cho thuê"}
                      </span>
                    </div>
                    {listing.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        +{listing.images.length - 1}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col h-full">
                    <Link
                      href={`/${
                        listing.type === "ban" ? "mua-ban" : "cho-thue"
                      }/chi-tiet/${listing.id}-${encodeURIComponent(
                        listing.title.toLowerCase().replace(/\s+/g, "-")
                      )}`}
                      className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2"
                    >
                      {listing.title}
                    </Link>

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L9 4.414V17a1 1 0 102 0V4.414l7.293 7.293a1 1 0 001.414-1.414l-9-9z" />
                        </svg>
                        {listing.bedrooms} PN
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {listing.bathrooms} WC
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formatArea(listing.area)}
                      </span>
                      {listing.floor && (
                        <span className="flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Tầng {listing.floor}
                        </span>
                      )}
                      {listing.direction && (
                        <span className="flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {listing.direction}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
                      <div className="text-lg sm:text-xl font-bold text-red-600">
                        {formatPriceByType(listing.price, listing.type)}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          {listing.agent.avatar && (
                            <Image
                              src={listing.agent.avatar}
                              alt={listing.agent.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          )}
                          <span className="line-clamp-1">
                            {listing.agent.name}
                          </span>
                        </div>

                        <a
                          href={`tel:${listing.agent.phone}`}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          Gọi
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {sortedListings.length > 0 && hasMore && (
        <div className="text-center mt-6 flex justify-center">
          <button
            onClick={loadMoreListings}
            disabled={loadingMore}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loadingMore ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
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
              "Xem thêm tin đăng"
            )}
          </button>
        </div>
      )}

      {/* Show message when no more posts */}
      {sortedListings.length > 0 && !hasMore && currentPage > 1 && (
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Đã hiển thị tất cả {listings.length} tin rao.
          </p>
        </div>
      )}
    </div>
  );
}
