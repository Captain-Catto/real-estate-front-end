"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { newsService } from "@/services/newsService";
import { toast } from "sonner";

// Định nghĩa kiểu dữ liệu cho news
interface TransformedNewsItem {
  id: string;
  title: string;
  image: string;
  time: string;
  slug: string;
  isHot?: boolean;
  isFeatured?: boolean;
  category?: string; // Thêm category cho URL chuẩn
  description?: string; // Thêm description để hiển thị
  author?: {
    username: string;
    email?: string;
    avatar?: string;
  }; // Thêm author information
}

// Định nghĩa kiểu dữ liệu NewsItem từ API
interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  createdAt: string;
  isHot?: boolean;
  isFeatured?: boolean;
  content?: string;
  category: string; // Thêm trường category để dùng trong URL
  author: {
    username: string;
    email?: string;
    avatar?: string;
  }; // Thêm author từ API
}

interface NewsDataState {
  "tin-noi-bat": TransformedNewsItem[];
  "tin-tuc": TransformedNewsItem[];
}

// Placeholder data khi đang tải
const placeholderData: NewsDataState = {
  "tin-noi-bat": [
    {
      id: "loading1",
      title: "Đang tải tin nổi bật...",
      image: "/assets/placeholder-image.jpg",
      time: "",
      slug: "",
    },
  ],
  "tin-tuc": [
    {
      id: "loading2",
      title: "Đang tải tin tức...",
      image: "/assets/placeholder-image.jpg",
      time: "",
      slug: "",
    },
  ],
};

const tabs = [
  { key: "tin-noi-bat", label: "Tin nổi bật" },
  { key: "tin-tuc", label: "Tin tức" },
];

// Sử dụng API service thực tế từ newsService

// Hàm chuyển đổi từ NewsItem sang TransformedNewsItem
const transformNewsItem = (item: NewsItem): TransformedNewsItem => {
  // Tạo description từ content (lấy 150 ký tự đầu)
  const getDescription = (content: string): string => {
    if (!content) return "";
    // Remove HTML tags và lấy text thuần
    const textOnly = content.replace(/<[^>]*>/g, "");
    return textOnly.length > 150
      ? textOnly.substring(0, 150) + "..."
      : textOnly;
  };

  return {
    id: item._id,
    title: item.title,
    image: item.featuredImage || "/assets/placeholder-image.jpg",
    time: formatDistanceToNow(new Date(item.createdAt), {
      locale: vi,
      addSuffix: true,
    }),
    slug: item.slug,
    isHot: item.isHot,
    isFeatured: item.isFeatured,
    category: item.category, // Thêm category cho URL chuẩn
    description: getDescription(item.content || ""), // Thêm description
    author: item.author, // Thêm author data
  };
};

const FixedNewsSection = () => {
  const [activeTab, setActiveTab] = useState("tin-noi-bat");
  const [selectedNews, setSelectedNews] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [newsData, setNewsData] = useState<NewsDataState>(placeholderData);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        // Gọi các API riêng biệt để lấy tin nổi bật và tin nóng
        const [featuredResponse, hotResponse] = await Promise.all([
          newsService.getFeaturedNews(5),
          newsService.getHotNews(5),
        ]);

        console.log("Featured news response:", featuredResponse);
        console.log("Hot news response:", hotResponse);

        // Xử lý tin nổi bật
        const featuredNews =
          featuredResponse.success && featuredResponse.data.news
            ? featuredResponse.data.news.map((item) => transformNewsItem(item))
            : [];

        // Xử lý tin nóng
        const hotNews =
          hotResponse.success && hotResponse.data.news
            ? hotResponse.data.news.map((item) => transformNewsItem(item))
            : [];

        // Update state with real data
        setNewsData({
          "tin-noi-bat":
            featuredNews.length > 0
              ? featuredNews
              : placeholderData["tin-noi-bat"],
          "tin-tuc": hotNews.length > 0 ? hotNews : placeholderData["tin-tuc"],
        });
      } catch {
        toast.error("Không thể tải tin tức");
        // Keep placeholder data in case of error
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Handle client-side mounting and screen size
  useEffect(() => {
    setIsMounted(true);

    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const currentNews = newsData[activeTab as keyof typeof newsData] || [];
  const featuredNews = currentNews[selectedNews];

  const handleNewsHover = (index: number) => {
    if (isMounted && isDesktop) {
      setSelectedNews(index);
    }
  };

  const handleNewsClick = (
    index: number,
    slug: string,
    category: string = "tong-hop"
  ) => {
    if (!isMounted) return;

    // Chỉ đặt tin được chọn để hiển thị trên giao diện
    setSelectedNews(index);

    // Chỉ chuyển hướng trên mobile/tablet
    if (!isDesktop) {
      window.location.href = `/tin-tuc/${category}/${slug}`;
    }
  };
  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setSelectedNews(0);
  };

  const getNewsItemClassName = (index: number) => {
    const baseClass =
      "p-4 rounded-lg cursor-pointer transition-all duration-200";

    if (!isMounted) {
      return `${baseClass} hover:bg-gray-50 bg-white`;
    }

    if (selectedNews === index && isDesktop) {
      return `${baseClass} bg-red-50 border-l-4 border-red-600`;
    }

    return `${baseClass} hover:bg-gray-50 bg-white`;
  };

  return (
    <section className="my-8 py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 md:gap-8 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`pb-3 px-3 md:px-2 text-base md:text-lg font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-gray-600 border-b-2 border-red-600"
                    : "text-gray-600 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View More Link */}
          <div className="flex justify-end mt-4">
            <Link
              href="/tin-tuc"
              className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-medium"
            >
              <span>Xem thêm</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News - Desktop Only */}
          <div className="hidden lg:block space-y-4">
            {featuredNews && (
              <div className="group h-full flex flex-col">
                <Link
                  href={`/tin-tuc/${featuredNews.category || "tong-hop"}/${
                    featuredNews.slug
                  }`}
                  className="flex-1 flex flex-col"
                >
                  <div className="relative h-80 mb-4 overflow-hidden rounded-lg flex-shrink-0">
                    <Image
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      fill
                      sizes="50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                    {featuredNews.title}
                  </h3>
                  {featuredNews.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">
                      {featuredNews.description}
                    </p>
                  )}
                </Link>
                <div className="flex items-center text-sm text-gray-500 mt-auto">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{featuredNews.time}</span>
                  {featuredNews.author && (
                    <>
                      <span className="mx-1">|</span>
                      <span>{featuredNews.author.username}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* News List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                <p className="mt-2 text-gray-600">Đang tải tin tức...</p>
              </div>
            ) : (
              currentNews.map((news, index) => (
                <div
                  key={news.id}
                  onClick={() =>
                    handleNewsClick(index, news.slug, news.category)
                  }
                  onMouseEnter={() => handleNewsHover(index)}
                  className={getNewsItemClassName(index)}
                >
                  {/* Mobile/Tablet Layout - Direct Navigation */}
                  <div className="lg:hidden">
                    <Link
                      href={`/tin-tuc/${news.category || "tong-hop"}/${
                        news.slug
                      }`}
                      className="flex gap-4"
                    >
                      <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 text-sm mb-1">
                          {news.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{news.time}</span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Desktop Layout - Preview + Click to Select */}
                  <div className="hidden lg:block">
                    <Link
                      href={`/tin-tuc/${news.category || "tong-hop"}/${
                        news.slug
                      }`}
                      className="block"
                    >
                      <h4 className="font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2 mb-2">
                        {news.title}
                      </h4>
                    </Link>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{news.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FixedNewsSection;
