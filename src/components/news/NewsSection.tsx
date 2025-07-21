"use client";

import { useState, useEffect, useCallback } from "react";
import NewsService, { NewsItem } from "@/services/newsService";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarIcon,
  EyeIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const categoryNames = {
  "mua-ban": "Mua bán",
  "cho-thue": "Cho thuê",
  "tai-chinh": "Tài chính",
  "phong-thuy": "Phong thủy",
  "tong-hop": "Tổng hợp",
};

const categoryColors = {
  "mua-ban": "bg-blue-100 text-blue-800",
  "cho-thue": "bg-green-100 text-green-800",
  "tai-chinh": "bg-purple-100 text-purple-800",
  "phong-thuy": "bg-orange-100 text-orange-800",
  "tong-hop": "bg-gray-100 text-gray-800",
};

interface NewsProps {
  limit?: number;
  showCategories?: boolean;
  showPagination?: boolean;
  category?: string;
}

export default function NewsSection({
  limit = 12,
  showCategories = true,
  showPagination = true,
  category = "all",
}: NewsProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [hotNews, setHotNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNews();
    if (showCategories) {
      fetchFeaturedNews();
      fetchHotNews();
    }
  }, [selectedCategory, currentPage]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      };

      const response = await NewsService.getPublishedNews(params);

      if (response.success) {
        setNewsList(response.data.news);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedNews = async () => {
    try {
      const response = await NewsService.getFeaturedNews(6);
      if (response.success) {
        setFeaturedNews(response.data.news || []);
      }
    } catch (error) {
      console.error("Error fetching featured news:", error);
    }
  };

  const fetchHotNews = async () => {
    try {
      const response = await NewsService.getHotNews(10);
      if (response.success) {
        setHotNews(response.data.news || []);
      }
    } catch (error) {
      console.error("Error fetching hot news:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} phút đọc`;
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tin tức bất động sản
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cập nhật những thông tin mới nhất về thị trường bất động sản, chính
            sách, xu hướng và các bài viết hữu ích
          </p>
        </div>

        {/* Category Tabs */}
        {showCategories && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(categoryNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Featured News */}
        {showCategories && featuredNews.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <StarIcon className="w-6 h-6 text-yellow-500 mr-2" />
                Tin nổi bật
              </h3>
              <Link
                href="/tin-tuc?featured=true"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
              >
                Xem tất cả
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.slice(0, 3).map((news) => (
                <article
                  key={news._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <Link href={`/tin-tuc/${news.slug}`}>
                    <div className="relative h-48">
                      {news.featuredImage ? (
                        <Image
                          src={news.featuredImage}
                          alt={news.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">
                            Không có hình ảnh
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            categoryColors[news.category]
                          }`}
                        >
                          {categoryNames[news.category]}
                        </span>
                      </div>
                      {news.isHot && (
                        <div className="absolute top-4 right-4">
                          <FireIcon className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-6">
                    <Link href={`/tin-tuc/${news.slug}`}>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {news.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {news.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(news.publishedAt || news.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {news.views}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatReadTime(news.readTime)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Main News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* News List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : newsList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {newsList.map((news) => (
                    <article
                      key={news._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                      <Link href={`/tin-tuc/${news.slug}`}>
                        <div className="relative h-48">
                          {news.featuredImage ? (
                            <Image
                              src={news.featuredImage}
                              alt={news.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">
                                Không có hình ảnh
                              </span>
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                categoryColors[news.category]
                              }`}
                            >
                              {categoryNames[news.category]}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-1">
                            {news.isHot && (
                              <FireIcon className="w-5 h-5 text-red-500" />
                            )}
                            {news.isFeatured && (
                              <StarIcon className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="p-6">
                        <Link href={`/tin-tuc/${news.slug}`}>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {news.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {news.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {formatDate(news.publishedAt || news.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              {news.views}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatReadTime(news.readTime)}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {showPagination && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có tin tức nào</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {showCategories && (
            <div className="lg:col-span-1">
              {/* Hot News */}
              {hotNews.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FireIcon className="w-5 h-5 text-red-500 mr-2" />
                    Tin hot
                  </h4>
                  <div className="space-y-4">
                    {hotNews.slice(0, 5).map((news, index) => (
                      <Link
                        key={news._id}
                        href={`/tin-tuc/${news.slug}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {news.title}
                            </h5>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              {formatDate(news.publishedAt || news.createdAt)}
                              <EyeIcon className="w-3 h-3 ml-2 mr-1" />
                              {news.views}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/tin-tuc?hot=true"
                    className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 pt-4 border-t border-gray-200"
                  >
                    Xem tất cả tin hot →
                  </Link>
                </div>
              )}

              {/* Categories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Danh mục tin tức
                </h4>
                <div className="space-y-2">
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === key
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Xem tất cả tin tức
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
