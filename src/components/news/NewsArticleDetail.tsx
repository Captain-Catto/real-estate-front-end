"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import parse from "html-react-parser";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Author {
  name: string;
  slug?: string;
  avatar?: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  featuredImage?: string;
  tags: string[];
  category: string;
  views?: number;
}

interface PopularArticle {
  id: string;
  title: string;
  slug: string;
  category?: string; // Thêm category cho URL chuẩn hóa
}

interface Props {
  article: Article;
  popularArticles: PopularArticle[];
  category?: string;
}

export function NewsArticleDetail({
  article,
  popularArticles,
  category,
}: Props) {
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Updated Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/">Trang chủ</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/tin-tuc">Tin tức</Link>
              </li>
              {category && (
                <>
                  <li>/</li>
                  <li>
                    <Link href={`/tin-tuc/${category}`}>
                      {getCategoryName(category || article.category)}
                    </Link>
                  </li>
                </>
              )}
              <li>/</li>
              <li className="text-gray-900 font-medium truncate">
                {article.title}
              </li>
            </ol>
          </nav>{" "}
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
                    <div className="flex-shrink-0">
                      <Image
                        src={
                          article.author.avatar ||
                          "/assets/images/default-avatar.jpg"
                        }
                        alt={article.author.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </div>
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
                    {popularArticles && popularArticles.length > 0 ? (
                      popularArticles.map((popularArticle, index) => (
                        <div
                          key={popularArticle.id || index}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-sm font-bold rounded flex items-center justify-center">
                            {index + 1}
                          </div>
                          <Link
                            href={`/tin-tuc/${
                              popularArticle.category || "tong-hop"
                            }/${popularArticle.slug}`}
                            className="text-gray-900 hover:text-blue-600 font-medium text-sm leading-tight line-clamp-3 transition-colors"
                          >
                            {popularArticle.title || "Tin tức bất động sản"}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        Không có tin tức phổ biến
                      </p>
                    )}
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

function getCategoryName(category: string) {
  const names: { [key: string]: string } = {
    "tai-chinh": "Tài chính",
    "phong-thuy": "Phong thủy",
    "mua-ban": "Mua bán",
    "cho-thue": "Cho thuê",
    "tong-hop": "Tổng hợp",
  };
  return names[category] || category;
}
