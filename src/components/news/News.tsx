"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import testImg from "@/assets/images/card-img.jpg";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { newsService } from "@/services/newsService";
import { showErrorToast } from "@/utils/errorHandler";

// Types
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  publishedAt: string;
  author: string;
  category: string;
  tags?: string[];
  views?: number;
}

interface NewsCategory {
  id: string;
  name: string;
  slug: string;
}

// Đã loại bỏ interface Location

interface NewsProps {
  initialArticles?: Article[];
}

// Helper function to get category color
const getCategoryColor = (slug: string) => {
  const colorMap: Record<string, string> = {
    "mua-ban": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "cho-thue": "bg-green-100 text-green-800 hover:bg-green-200",
    "tai-chinh": "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "phong-thuy": "bg-orange-100 text-orange-800 hover:bg-orange-200",
    "tong-hop": "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };
  return colorMap[slug] || "bg-blue-100 text-blue-800 hover:bg-blue-200";
};

export function News({ initialArticles = [] }: NewsProps) {
  const [articles, setArticles] = useState<Article[]>(
    initialArticles.length > 0 ? initialArticles : []
  );
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [hotArticles, setHotArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all types of articles
  useEffect(() => {
    const fetchAllArticles = async () => {
      setLoading(true);
      try {
        // Fetch categories first
        const categoriesResponse = await newsService.getNewsCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        // Fetch regular articles
        const articlesResponse = await newsService.getPublishedNews({
          page: 1,
          limit: 10,
        });

        if (articlesResponse.success && articlesResponse.data) {
          const transformedArticles = articlesResponse.data.news.map(
            (item) => ({
              id: item._id,
              title: item.title,
              slug: item.slug,
              excerpt: item.content
                ? item.content
                    .replace(/<\/?[^>]+(>|$)/g, "")
                    .substring(0, 160) + "..."
                : "",
              image: item.featuredImage || testImg.src,
              publishedAt: new Date(
                item.publishedAt || item.createdAt
              ).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              author: item.author?.username || "Biên tập viên",
              category: item.category || "tong-hop",
              tags: [],
              views: item.views || 0,
            })
          );

          setArticles(transformedArticles);
          setTotalPages(articlesResponse.data.pagination?.totalPages || 1);
        }

        // Fetch featured articles
        const featuredResponse = await newsService.getPublishedNews({
          featured: true,
          limit: 4,
        });

        if (featuredResponse.success && featuredResponse.data) {
          const transformedFeatured = featuredResponse.data.news.map(
            (item) => ({
              id: item._id,
              title: item.title,
              slug: item.slug,
              excerpt: item.content
                ? item.content
                    .replace(/<\/?[^>]+(>|$)/g, "")
                    .substring(0, 160) + "..."
                : "",
              image: item.featuredImage || testImg.src,
              publishedAt: new Date(
                item.publishedAt || item.createdAt
              ).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              author: item.author?.username || "Biên tập viên",
              category: item.category || "tong-hop",
              tags: [],
              views: item.views || 0,
            })
          );

          setFeaturedArticles(transformedFeatured);
        }

        // Fetch hot articles
        const hotResponse = await newsService.getPublishedNews({
          hot: true,
          limit: 3,
        });

        if (hotResponse.success && hotResponse.data) {
          const transformedHot = hotResponse.data.news.map((item) => ({
            id: item._id,
            title: item.title,
            slug: item.slug,
            excerpt: item.content
              ? item.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160) +
                "..."
              : "",
            image: item.featuredImage || testImg.src,
            publishedAt: new Date(
              item.publishedAt || item.createdAt
            ).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            author: item.author?.username || "Biên tập viên",
            category: item.category || "tong-hop",
            tags: [],
            views: item.views || 0,
          }));

          setHotArticles(transformedHot);
        }

        // Fetch popular articles (by view count)
        const popularResponse = await newsService.getPublishedNews({
          sort: "views",
          order: "desc",
          limit: 5,
        });

        if (
          popularResponse.success &&
          popularResponse.data &&
          popularResponse.data.news.length > 0
        ) {
          const transformedPopular = popularResponse.data.news.map((item) => ({
            id: item._id,
            title: item.title,
            slug: item.slug,
            category: item.category || "tong-hop",
            excerpt: "",
            image: "",
            publishedAt: "",
            author: "",
            views: item.views || 0,
          }));

          setPopularArticles(transformedPopular);
        }
      } catch {
        showErrorToast("Không thể tải tin tức");
        // No fallback to mock data - just keep empty arrays
      } finally {
        setLoading(false);
      }
    };

    if (initialArticles.length === 0) {
      fetchAllArticles();
    }
  }, [initialArticles]);

  const loadMoreArticles = async () => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await newsService.getPublishedNews({
        page: nextPage,
        limit: 10,
      });

      if (response.success && response.data) {
        const newArticles = response.data.news.map((item) => ({
          id: item._id,
          title: item.title,
          slug: item.slug,
          excerpt: item.content
            ? item.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160) +
              "..."
            : "",
          image: item.featuredImage || testImg.src,
          publishedAt: new Date(
            item.publishedAt || item.createdAt
          ).toLocaleDateString("vi-VN"),
          author: item.author?.username || "Biên tập viên",
          category: item.category || "tong-hop",
          tags: [],
          views: item.views || 0,
        }));

        setArticles((prev) => [...prev, ...newArticles]);
        setPage(nextPage);
      }
    } catch {
      showErrorToast("Không thể tải thêm tin tức");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 max-w-7xl mx-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="flex justify-center mb-8">
            <div className="w-full lg:w-2/3 text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Tin tức bất động sản mới nhất
              </h1>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                Thông tin mới, đầy đủ, hấp dẫn về thị trường bất động sản Việt
                Nam thông qua dữ liệu lớn về giá, giao dịch, nguồn cung - cầu và
                khảo sát thực tế của đội ngũ phóng viên, biên tập của
                realestate.com.
              </p>
            </div>
          </div>

          {/* News Categories Section */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/tin-tuc/${category.slug}`}
                    className={`px-4 py-2 rounded-full text-sm transition-colors font-medium ${getCategoryColor(
                      category.slug
                    )}`}
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                // Fallback to default categories while loading
                <>
                  <Link
                    href="/tin-tuc/mua-ban"
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors font-medium"
                  >
                    Mua bán
                  </Link>
                  <Link
                    href="/tin-tuc/cho-thue"
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors font-medium"
                  >
                    Cho thuê
                  </Link>
                  <Link
                    href="/tin-tuc/tai-chinh"
                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors font-medium"
                  >
                    Tài chính
                  </Link>
                  <Link
                    href="/tin-tuc/phong-thuy"
                    className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors font-medium"
                  >
                    Phong thủy
                  </Link>
                  <Link
                    href="/tin-tuc/tong-hop"
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors font-medium"
                  >
                    Tổng hợp
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Featured Articles Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Featured Article */}
            <div className="lg:col-span-2">
              {featuredArticles.length > 0 ? (
                <Link
                  href={`/tin-tuc/${featuredArticles[0].category}/${featuredArticles[0].slug}`}
                  className="block group"
                >
                  <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                    <Image
                      src={featuredArticles[0].image}
                      alt={featuredArticles[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-sm">
                        TIN NỔI BẬT
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="text-sm mb-2 opacity-90">
                        {featuredArticles[0].publishedAt} •{" "}
                        {featuredArticles[0].author}
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold mb-3 line-clamp-2">
                        {featuredArticles[0].title}
                      </h3>
                      <p className="text-sm lg:text-base opacity-90 line-clamp-3">
                        {featuredArticles[0].excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative h-64 lg:h-80 rounded-lg bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Đang tải tin nổi bật...</p>
                </div>
              )}
            </div>

            {/* Side Articles (Hot News) */}
            <div className="space-y-4">
              {hotArticles.length > 0 ? (
                hotArticles.slice(0, 3).map((article) => (
                  <div
                    key={article.id}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">
                        {article.publishedAt}
                      </span>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-sm">
                        TIN NÓNG
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      <Link
                        href={`/tin-tuc/${article.category}/${article.slug}`}
                        className="line-clamp-3"
                      >
                        {article.title}
                      </Link>
                    </h3>
                  </div>
                ))
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-center">
                    Đang tải tin nóng...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-3">
              {/* Articles List */}
              <div className="space-y-6">
                {loading ? (
                  // Loading skeleton
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="w-full lg:w-1/3 h-48 lg:h-32 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  articles.map((article) => (
                    <article
                      key={article.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-1/3 relative">
                          <Link
                            href={`/tin-tuc/${article.slug}`}
                            className="block relative h-48 lg:h-full min-h-[200px]"
                          >
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                {article.category === "mua-ban"
                                  ? "Mua bán"
                                  : article.category === "cho-thue"
                                  ? "Cho thuê"
                                  : article.category === "tai-chinh"
                                  ? "Tài chính"
                                  : article.category === "phong-thuy"
                                  ? "Phong thủy"
                                  : "Tổng hợp"}
                              </span>
                              {article.id.includes("hot") && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                                  TIN NÓNG
                                </span>
                              )}
                              {article.id.includes("featured") && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  NỔI BẬT
                                </span>
                              )}
                            </div>
                          </Link>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="text-sm text-gray-500 mb-2">
                            {article.publishedAt} • {article.author}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                            <Link
                              href={`/tin-tuc/${article.slug}`}
                              className="line-clamp-2"
                            >
                              {article.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 line-clamp-3 mb-4">
                            {article.excerpt}
                          </p>
                          {article.tags && (
                            <div className="flex flex-wrap gap-2">
                              {article.tags.map((tag, index) => (
                                <Link
                                  key={index}
                                  href={`/wiki/tag/${tag}`}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                >
                                  {tag}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Load More Button */}
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreArticles}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>

              {/* Mobile Sections */}
              <div className="xl:hidden mt-8 space-y-8">
                {/* Popular Articles Mobile */}
                <PopularArticles articles={popularArticles} />
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden xl:block space-y-8">
              {/* Popular Articles */}
              <PopularArticles articles={popularArticles} />

              {/* Tag Cloud - Added instead of location sections */}
              <div className="sticky top-6 space-y-8"></div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Popular Articles Component
function PopularArticles({ articles }: { articles: Article[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Bài viết được xem nhiều nhất
      </h2>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={article.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {index + 1}
            </div>
            <Link
              href={`/tin-tuc/${article.category || "tong-hop"}/${
                article.slug
              }`}
              className="text-gray-900 hover:text-blue-600 transition-colors font-medium line-clamp-3 text-sm"
            >
              {article.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Đã loại bỏ HotLocations và BigLocations Component theo yêu cầu
