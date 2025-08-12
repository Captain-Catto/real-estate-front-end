import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryInfo } from "@/utils/categoryUtils";

// Import Article interface từ News.tsx hoặc tạo types riêng
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
  isHot?: boolean;
  isFeatured?: boolean;
}

interface NewsCategoryPageProps {
  category: string;
  articles: Article[];
}

// Component ArticleCard để hiển thị từng bài viết
function ArticleCard({
  article,
  categoryPath,
}: {
  article: Article;
  categoryPath: string;
}) {
  return (
    <Link
      href={`/tin-tuc/${categoryPath}/${article.slug}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-video relative">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover"
        />
        {/* Hot/Featured tags */}
        <div className="absolute top-2 left-2 flex gap-2 z-10">
          {article.isHot && (
            <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              TIN NÓNG
            </span>
          )}
          {article.isFeatured && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              TIN NỔI BẬT
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{article.author}</span>
          <span>{article.publishedAt}</span>
        </div>
      </div>
    </Link>
  );
}

export function NewsCategoryPage({
  category,
  articles,
}: NewsCategoryPageProps) {
  // Debug: Log dữ liệu articles để kiểm tra
  console.log("NewsCategoryPage - Category:", category);
  console.log("NewsCategoryPage - Articles:", articles);
  console.log("NewsCategoryPage - First article tags:", {
    isHot: articles[0]?.isHot,
    isFeatured: articles[0]?.isFeatured,
  });

  // Sử dụng utility function để lấy thông tin category
  const info = getCategoryInfo(category);

  // Nếu không có thông tin category (trường hợp hiếm khi xảy ra)
  if (!info) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Danh mục không tìm thấy
          </h1>
          <Link href="/tin-tuc" className="text-blue-600 hover:text-blue-800">
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/">Trang chủ</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/tin-tuc">Tin tức</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{info.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{info.title}</h1>
        <p className="text-gray-600">{info.description}</p>
      </div>

      {/* Articles Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bài viết mới nhất
        </h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                categoryPath={category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có bài viết nào
            </h3>
            <p className="text-gray-500 mb-4">
              Danh mục &quot;{info.title}&quot; hiện chưa có bài viết nào. Hãy
              quay lại sau để xem các bài viết mới nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/tin-tuc"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Xem tất cả tin tức
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
