"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import testImg from "@/assets/images/card-img.jpg";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { newsService, NewsItem } from "@/services/newsService";

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

// Đã loại bỏ interface Location

interface NewsProps {
  initialArticles?: Article[];
}

// Mock data using testImg
const mockFeaturedArticle: Article = {
  id: "1",
  title: "Thị Trường Bất Động Sản Kho Bãi Hà Nội Đang Đi Ngang Về Giá",
  slug: "thi-truong-bat-dong-san-kho-bai-ha-noi-dang-di-ngang-ve-gia",
  excerpt:
    "Sự phát triển mạnh của bất động sản công nghiệp khiến thị trường bất động sản kho bãi, nhà xưởng Hà Nội vẫn duy trì sức hút. Tuy nhiên, trong khoảng 1 năm qua, thị trường này đang đi ngang về giá do xu hướng chuyển dịch kho bãi nhà xưởng ra các khu vực tỉnh thành giáp ranh thủ đô tăng mạnh.",
  image: testImg.src,
  publishedAt: "09/06/2025 11:15",
  author: "Biên tập viên",
  category: "Tin tức",
};

const mockHighlightArticles: Article[] = [
  {
    id: "2",
    title: "Hà Nội Tiếp Tục Có Thêm Dự Án Nhà Ở Xã Hội Mới",
    slug: "ha-noi-tiep-tuc-co-them-du-an-nha-o-xa-hoi-moi",
    excerpt: "",
    image: testImg.src,
    publishedAt: "09/06/2025 11:05",
    author: "Biên tập viên",
    category: "Tin tức",
  },
  {
    id: "3",
    title:
      "Vịnh Trung Tâm Cát Bà: Viên Ngọc Xanh Trên Bản Đồ Du Lịch Nghỉ Dưỡng Cao Cấp",
    slug: "vinh-trung-tam-cat-ba-vien-ngoc-xanh",
    excerpt: "",
    image: testImg.src,
    publishedAt: "07/06/2025 08:05",
    author: "Biên tập viên",
    category: "Tin tức",
  },
  {
    id: "4",
    title: "Thị Trường Bất Động Sản Móng Cái Tiếp Tục Tăng Nhiệt",
    slug: "thi-truong-bat-dong-san-mong-cai-tiep-tuc-tang-nhiet",
    excerpt: "",
    image: testImg.src,
    publishedAt: "06/06/2025 11:28",
    author: "Biên tập viên",
    category: "Tin tức",
  },
];

const mockArticles: Article[] = [
  {
    id: "5",
    title:
      "Batdongsan.com.vn Tài Trợ Lễ Hội Bóng Đá Việt Nam - Vương Quốc Anh 2025",
    slug: "batdongsan-tai-tro-le-hoi-bong-da-viet-nam-uk-2025",
    excerpt:
      "Các danh thủ huyền thoại Manchester Reds như Micheal Owen, Paul Scholes, Ryan Giggs,… sẽ đá giao hữu với các ngôi sao bóng đá Việt Nam trong khuôn khổ Lễ hội bóng đá Việt Nam – Vương quốc Anh 2025 được tổ chức tại Đà Nẵng.",
    image: testImg.src,
    publishedAt: "06/06/2025 09:40",
    author: "Ban nội dung",
    category: "Tin tức",
  },
  {
    id: "6",
    title: "Dự Án Hàng Hiệu Noble Palace Tay Thang Long Tăng Tốc Triển Khai",
    slug: "du-an-noble-palace-tay-thang-long-tang-toc-trien-khai",
    excerpt:
      "Noble Palace Tay Thang Long - khu đô thị thấp tầng hàng hiệu hiếm hoi tại phía Tây Hà Nội - đang bước vào giai đoạn nước rút với hàng loạt hạng mục đồng loạt triển khai ba ca liên tục, sẵn sàng bàn giao những căn shophouse đầu tiên từ quý 3/2025.",
    image: testImg.src,
    publishedAt: "06/06/2025 07:50",
    author: "Hải Âu",
    category: "Tin tức",
  },
  {
    id: "7",
    title:
      "DKRA Realty Bắt Tay Đối Tác Chiến Lược Triển Khai Kinh Doanh Khu Đô Thị The 826 EC",
    slug: "dkra-realty-bat-tay-doi-tac-chien-luoc",
    excerpt:
      "Sáng ngày 04/6 Lễ ký kết hợp tác & triển khai kinh doanh dự án The 826 EC giữa Chủ Đầu tư Hai Thành, Tổng Đại lý Tiếp thị & Phân phối DKRA Realty cùng các Đại lý phân phối chiến lược đã diễn ra tại TP. Thủ Đức, TP.HCM.",
    image: testImg.src,
    publishedAt: "05/06/2025 17:30",
    author: "Hải Âu",
    category: "Tin tức",
  },
  {
    id: "8",
    title: "Conic Boulevard: Từ Giấc Mơ An Cư Đến Cuộc Sống Lý Tưởng",
    slug: "conic-boulevard-tu-giac-mo-an-cu-den-cuoc-song-ly-tuong",
    excerpt:
      '"Sống giữa phố thị sôi động nhưng vẫn giữ được sự riêng tư, tiện nghi", đó là cách các gia đình trẻ định nghĩa về chốn an cư: Nhà không chỉ dành để ở, mà còn là không gian sống giúp mỗi người được tận hưởng, kết nối và tái tạo năng lượng mỗi ngày.',
    image: testImg.src,
    publishedAt: "05/06/2025 16:02",
    author: "Hải Âu",
    category: "Tin tức",
    tags: ["Thị trường bất động sản 2025"],
  },
  {
    id: "9",
    title: "Bất Động Sản Bình Định: Giá Rao Bán Đang Đi Ngang",
    slug: "bat-dong-san-binh-dinh-gia-rao-ban-di-ngang",
    excerpt:
      "Trong sự sôi nổi chung của thị trường bất động sản cả nước, thị trường bất động sản Bình Định lại khá trầm lặng. Nguồn cung sơ cấp không nhiều và giá chào bán trên thị trường thứ cấp vẫn duy trì mức đi ngang so với năm ngoái.",
    image: testImg.src,
    publishedAt: "05/06/2025 13:55",
    author: "Nguyễn Nam",
    category: "Tin tức",
    tags: ["Thị trường bất động sản 2025"],
  },
  {
    id: "10",
    title:
      'Khám Phá Căn Hộ The Nelson Được "Đo Ni Đóng Giày" Cho Giới Thượng Lưu Hà Nội',
    slug: "kham-pha-can-ho-the-nelson-duoc-do-ni-dong-giay-cho-gioi-thuong-luu-ha-noi",
    excerpt:
      'Giữa trung tâm Ba Đình, The Nelson kiến tạo không gian sống mang dấu ấn cá nhân với triết lý "private & luxury", nơi mỗi căn hộ phản ánh rõ nét gu thẩm mỹ tinh tế, kín đáo và vị thế, đẳng cấp của chủ nhân.',
    image: testImg.src,
    publishedAt: "05/06/2025 09:00",
    author: "Hải Âu",
    category: "Tin tức",
  },
];

const mockPopularArticles: Article[] = [
  {
    id: "p1",
    title: "Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 5/2025",
    slug: "lai-suat-vay-mua-nha-moi-nhat-thang-5-2025",
    excerpt: "",
    image: "",
    publishedAt: "",
    author: "",
    category: "",
    views: 15420,
  },
  {
    id: "p2",
    title: "3 Phân Khúc Dẫn Dắt Thị Trường Bất Động Sản Quý 1/2025",
    slug: "3-phan-khuc-dan-dat-thi-truong-quy-1-2025",
    excerpt: "",
    image: "",
    publishedAt: "",
    author: "",
    category: "",
    views: 12380,
  },
  {
    id: "p3",
    title: "Diễn Biến Trái Chiều Giá Chung Cư Hà Nội",
    slug: "dien-bien-trai-chieu-gia-chung-cu-ha-noi",
    excerpt: "",
    image: "",
    publishedAt: "",
    author: "",
    category: "",
    views: 9870,
  },
  {
    id: "p4",
    title: "Thị Trường Bất Động Sản Tháng 4/2025: Giảm Nhẹ Một Số Phân Khúc",
    slug: "thi-truong-bat-dong-san-thang-4-2025",
    excerpt: "",
    image: "",
    publishedAt: "",
    author: "",
    category: "",
    views: 8650,
  },
  {
    id: "p5",
    title: "Môi Giới Đất Nền Đồng Loạt Quay Lại Với Nghề",
    slug: "moi-gioi-dat-nen-dong-loat-quay-lai",
    excerpt: "",
    image: "",
    publishedAt: "",
    author: "",
    category: "",
    views: 7230,
  },
];

// Đã loại bỏ mockHotLocations và mockBigLocations theo yêu cầu

export function News({ initialArticles = [] }: NewsProps) {
  const [articles, setArticles] = useState<Article[]>(
    initialArticles.length > 0 ? initialArticles : []
  );
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [hotArticles, setHotArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] =
    useState<Article[]>(mockPopularArticles);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all types of articles
  useEffect(() => {
    const fetchAllArticles = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error("Error fetching articles:", error);

        // Fallback to mock data if API calls fail
        setArticles(mockArticles);
        setFeaturedArticles([mockFeaturedArticle, ...mockHighlightArticles]);
        setHotArticles(mockHighlightArticles);
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
    } catch (error) {
      console.error("Error loading more articles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 max-w-6xl mx-auto">
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
                Batdongsan.com.vn.
              </p>
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
                <Link
                  href={`/tin-tuc/${mockFeaturedArticle.slug}`}
                  className="block group"
                >
                  <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                    <Image
                      src={mockFeaturedArticle.image}
                      alt={mockFeaturedArticle.title}
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
                        {mockFeaturedArticle.publishedAt} •{" "}
                        {mockFeaturedArticle.category}
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold mb-3 line-clamp-2">
                        {mockFeaturedArticle.title}
                      </h3>
                      <p className="text-sm lg:text-base opacity-90 line-clamp-3">
                        {mockFeaturedArticle.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Side Articles (Hot News) */}
            <div className="space-y-4">
              {hotArticles.length > 0
                ? hotArticles.slice(0, 3).map((article) => (
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
                : mockHighlightArticles.map((article) => (
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
                          href={`/tin-tuc/${article.slug}`}
                          className="line-clamp-3"
                        >
                          {article.title}
                        </Link>
                      </h3>
                    </div>
                  ))}
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
              <div className="sticky top-6 space-y-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Danh mục tin tức
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/tin-tuc/mua-ban"
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      Mua bán
                    </Link>
                    <Link
                      href="/tin-tuc/cho-thue"
                      className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                    >
                      Cho thuê
                    </Link>
                    <Link
                      href="/tin-tuc/tai-chinh"
                      className="px-3 py-2 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    >
                      Tài chính
                    </Link>
                    <Link
                      href="/tin-tuc/phong-thuy"
                      className="px-3 py-2 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors"
                    >
                      Phong thủy
                    </Link>
                    <Link
                      href="/tin-tuc/tong-hop"
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      Tổng hợp
                    </Link>
                  </div>
                </div>
              </div>
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
