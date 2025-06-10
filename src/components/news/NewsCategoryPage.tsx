import React from "react";
import Link from "next/link";
import Image from "next/image";

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
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
        />
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
  const categoryInfo = {
    "khu-vuc": {
      title: "Tin tức theo khu vực",
      description:
        "Cập nhật tin tức bất động sản tại các tỉnh thành trên cả nước",
    },
    "tai-chinh": {
      title: "Tin tức tài chính",
      description: "Thông tin về lãi suất, vay vốn, chính sách tài chính BĐS",
    },
    "phong-thuy": {
      title: "Phong thủy nhà đất",
      description: "Kiến thức phong thủy trong việc chọn mua và thiết kế nhà",
    },
    "mua-ban": {
      title: "Tin tức mua bán",
      description: "Thông tin thị trường mua bán bất động sản",
    },
    "cho-thue": {
      title: "Tin tức cho thuê",
      description: "Thông tin thị trường cho thuê bất động sản",
    },
  };

  const info = categoryInfo[category];

  // Nếu không tìm thấy category info, hiển thị 404 hoặc fallback
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
    <div className="container mx-auto px-4 py-8">
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
            <p className="text-gray-500">
              Chưa có bài viết nào trong danh mục này
            </p>
            <Link
              href="/tin-tuc"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Xem tất cả tin tức
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
