"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import parse from "html-react-parser";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Author {
  name: string;
  slug: string;
  avatar: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  featuredImage?: string;
  tags: string[];
  category: string;
}

interface PopularArticle {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  article: Article;
  popularArticles: PopularArticle[];
}

export function NewsArticleDetail({ article, popularArticles }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article.title);

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "zalo":
        shareUrl = `https://zalo.me/share/v2?url=${url}&title=${title}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600">
                  Trang chủ
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/tin-tuc" className="hover:text-blue-600">
                  Tin tức
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href={`/tin-tuc?category=${encodeURIComponent(
                    article.category
                  )}`}
                  className="hover:text-blue-600"
                >
                  {article.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                {article.title}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-8">
              <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Article Header */}
                <div className="p-6 pb-4">
                  {/* Title */}
                  <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {article.title}
                    </h1>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                    <Link
                      href={`/wiki/tac-gia/${article.author.slug}`}
                      className="flex-shrink-0"
                    >
                      <Image
                        src={article.author.avatar}
                        alt={article.author.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </Link>
                    <div>
                      <div className="text-sm text-gray-600">
                        <span>Được đăng bởi </span>
                        <Link
                          href={`/wiki/tac-gia/${article.author.slug}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {article.author.name}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500">
                        Cập nhật lần cuối vào {formatDate(article.updatedAt)} •
                        Đọc trong khoảng {article.readTime} phút
                      </div>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="px-6">
                  <div className="prose prose-lg max-w-none">
                    {parse(article.content)}
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 italic">
                      <strong>Tuyên bố miễn trừ trách nhiệm:</strong> Thông tin
                      được cung cấp chỉ mang tính chất thông tin chung, Công ty
                      cổ phần PropertyGuru Việt Nam không đưa ra bất kỳ tuyên bố
                      hoặc bảo đảm nào liên quan đến thông tin, bao gồm nhưng
                      không giới hạn bất kỳ sự tuyên bố hoặc bảo đảm về tính
                      thích hợp cho bất kỳ mục đích cụ thể nào của thông tin
                      theo phạm vi cho phép tối đa của pháp luật. Mặc dù đã nỗ
                      lực để đảm bảo rằng thông tin được cung cấp trong bài viết
                      này là chính xác, đáng tin cậy và hoàn chỉnh vào thời điểm
                      đăng tải, nhưng thông tin được cung cấp trong bài viết này
                      không nên được dựa vào để đưa ra bất kỳ quyết định tài
                      chính, đầu tư, bất động sản hoặc pháp lý nào. Thêm vào đó,
                      thông tin không thể thay thế lời khuyên từ một chuyên gia
                      được đào tạo, người mà có thể xem xét, đánh giá các sự
                      kiện và hoàn cảnh cá nhân của bạn, và chúng tôi không chịu
                      bất kỳ trách nhiệm nào nếu bạn sử dụng những thông tin này
                      để đưa ra quyết định.
                    </div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="p-6 pt-8">
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Chia sẻ bài viết này
                    </h2>
                    <div className="flex items-center gap-3">
                      {/* Facebook */}
                      <button
                        onClick={() => handleShare("facebook")}
                        className="group relative p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        title="Chia sẻ trên Facebook"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                            fill="#1877F2"
                          />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Chia sẻ trên Facebook
                        </div>
                      </button>

                      {/* LinkedIn */}
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="group relative p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        title="Chia sẻ trên LinkedIn"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                            fill="#0077B5"
                          />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Chia sẻ trên LinkedIn
                        </div>
                      </button>

                      {/* Zalo */}
                      <button
                        onClick={() => handleShare("zalo")}
                        className="group relative p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        title="Chia sẻ trên Zalo"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle cx="12" cy="12" r="12" fill="#0180C7" />
                          <path
                            d="M18.5 8.5c0-3.038-2.462-5.5-5.5-5.5s-5.5 2.462-5.5 5.5c0 2.706 1.956 4.95 4.518 5.4v2.6l2.482-1.35c.334.045.677.05 1-.05 3.038 0 5.5-2.462 5.5-5.5zm-2.75 2.75h-1.375v1.375h-1.375v-1.375h-1.375v-1.375h1.375v-1.375h1.375v1.375h1.375v1.375z"
                            fill="white"
                          />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Chia sẻ trên Zalo
                        </div>
                      </button>

                      {/* Copy Link */}
                      <button
                        onClick={handleCopyLink}
                        className="group relative p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        title="Sao chép đường dẫn"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                            fill="#666"
                          />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {copiedLink ? "Đã sao chép!" : "Sao chép đường dẫn"}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-4">
              <div className="sticky top-8">
                {/* Popular Articles */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Bài viết được xem nhiều nhất
                  </h2>
                  <div className="space-y-4">
                    {popularArticles.map((popularArticle, index) => (
                      <div
                        key={popularArticle.id}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-sm font-bold rounded flex items-center justify-center">
                          {index + 1}
                        </div>
                        <Link
                          href={`/tin-tuc/${popularArticle.slug}`}
                          className="text-gray-900 hover:text-blue-600 font-medium text-sm leading-tight line-clamp-3 transition-colors"
                        >
                          {popularArticle.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
