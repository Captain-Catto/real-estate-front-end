"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  newsService,
  NewsItem as ServiceNewsItem,
} from "@/services/newsService";

export function ProjectNews() {
  const [news, setNews] = useState<ServiceNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await newsService.getFeaturedNews(5);

        if (response.success && response.data?.news) {
          setNews(response.data.news);
        }
      } catch (error) {
        console.error("Error fetching featured news:", error);
        setError("Không thể tải tin tức");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  console.log("ProjectNews news:", news);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tin tức nổi bật
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tin tức nổi bật
        </h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tin tức nổi bật</h3>
        <Link
          href="/tin-tuc"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Xem tất cả
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-newspaper text-2xl"></i>
          </div>
          <p className="text-gray-600">Chưa có tin tức nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((article) => (
            <Link
              key={article._id}
              href={`/tin-tuc/${article.slug}`}
              className="block group hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
            >
              <div className="flex gap-3">
                {/* Article Image */}
                <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={article.featuredImage || "/images/default-news.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Article Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-tight mb-1">
                    {article.title}
                  </h4>

                  {article.excerpt && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectNews;
