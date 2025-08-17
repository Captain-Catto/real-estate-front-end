"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NewsArticleDetail } from "@/components/news/NewsArticleDetail";
import { NewsCategoryPage } from "@/components/news/NewsCategoryPage";
import { newsService } from "@/services/newsService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { NewsItem } from "@/services/newsService";

// Types
interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    slug: string;
    avatar: string;
  };
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  featuredImage?: string;
  category: string;
  views?: number;
  tags: string[];
}

interface NewsSlugClientProps {
  slug: string[];
}

// Valid categories - static fallback
const staticValidCategories = [
  "mua-ban",
  "cho-thue",
  "tai-chinh",
  "phong-thuy",
  "tong-hop",
];

// Transform function
function transformNewsToArticle(news: NewsItem): NewsArticle {
  let excerpt = "Tin tức bất động sản chi tiết";
  if (news.content) {
    const textOnly = news.content.replace(/<\/?[^>]+(>|$)/g, "");
    excerpt = textOnly.substring(0, 160) + (textOnly.length > 160 ? "..." : "");
  }

  return {
    id: news._id,
    slug: news.slug,
    title: news.title,
    content: news.content || "",
    excerpt: excerpt,
    author: {
      name: news.author?.username || "Tác giả",
      slug: news.author?._id?.toString() || "anonymous",
      avatar: news.author?.avatar || "/assets/images/default-avatar.jpg",
    },
    publishedAt: news.publishedAt || news.createdAt,
    updatedAt: news.updatedAt,
    readTime: news.readTime || 3,
    featuredImage: news.featuredImage || "/assets/placeholder-image.jpg",
    category: news.category,
    views: news.views || 0,
    tags: [],
  };
}

export default function NewsSlugClient({ slug }: NewsSlugClientProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<JSX.Element | null>(null);
  const router = useRouter();

  // Check if category is valid
  const isValidCategory = async (category: string): Promise<boolean> => {
    try {
      const response = await newsService.getNewsCategories();
      if (response.success && response.data) {
        const validSlugs = response.data.map((cat) => cat.slug);
        return validSlugs.includes(category);
      }
      return staticValidCategories.includes(category);
    } catch {
      toast.error("Có lỗi xảy ra khi kiểm tra danh mục");
      return staticValidCategories.includes(category);
    }
  };

  // Get article by slug
  const getArticleBySlug = async (
    slug: string
  ): Promise<NewsArticle | null> => {
    try {
      const response = await newsService.getNewsBySlug(slug);

      if (response.success && response.data && response.data.news) {
        return transformNewsToArticle(response.data.news);
      }
      return null;
    } catch {
      toast.error("Có lỗi xảy ra khi lấy bài viết");
      return null;
    }
  };

  // Get articles by category
  const getArticlesByCategory = async (category: string) => {
    try {
      const response = await newsService.getPublishedNews({
        category,
        limit: 12,
        page: 1,
      });

      if (response.success && response.data && response.data.news) {
        return response.data.news.map((news) => ({
          id: news._id,
          title: news.title,
          slug: news.slug,
          excerpt: news.content
            ? news.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160) +
              "..."
            : "",
          image: news.featuredImage || "/assets/placeholder-image.jpg",
          publishedAt: formatDistanceToNow(
            new Date(news.publishedAt || news.createdAt),
            {
              locale: vi,
              addSuffix: true,
            }
          ),
          author: news.author?.username || "Tác giả",
          category: news.category || "tong-hop",
          tags: [],
          views: news.views || 0,
          isHot: news.isHot || false,
          isFeatured: news.isFeatured || false,
        }));
      }

      return [];
    } catch {
      toast.error("Có lỗi xảy ra khi lấy bài viết");
      return [];
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);

      try {
        // Case 1: Single slug - /tin-tuc/something
        if (slug.length === 1) {
          const singleSlug = slug[0];

          // Check if it's a category
          const isCategory = await isValidCategory(singleSlug);
          if (isCategory) {
            const categoryArticles = await getArticlesByCategory(singleSlug);
            setContent(
              <NewsCategoryPage
                category={singleSlug}
                articles={categoryArticles}
              />
            );
            setLoading(false);
            return;
          }

          // Try to find article by slug
          const article = await getArticleBySlug(singleSlug);
          if (article) {
            // Redirect to correct URL format
            router.push(`/tin-tuc/${article.category}/${singleSlug}`);
            return;
          }
        }

        // Case 2: Two slugs - /tin-tuc/category/article-slug
        if (slug.length === 2) {
          const [category, articleSlug] = slug;

          // Check if category is valid
          const isCategory = await isValidCategory(category);
          if (isCategory) {
            const article = await getArticleBySlug(articleSlug);

            const normalizedArticleCategory = String(article?.category || "")
              .trim()
              .toLowerCase();
            const normalizedRequestedCategory = String(category || "")
              .trim()
              .toLowerCase();

            if (
              article &&
              (article.category === category ||
                normalizedArticleCategory === normalizedRequestedCategory)
            ) {
              // Get popular articles in same category
              const popularResponse = await newsService.getPublishedNews({
                limit: 5,
                category,
                sort: "views",
                order: "desc",
              });

              const popularArticles = [];
              if (
                popularResponse.success &&
                popularResponse.data &&
                popularResponse.data.news
              ) {
                for (const item of popularResponse.data.news) {
                  popularArticles.push({
                    id: item._id || "",
                    title: item.title || "Tin tức bất động sản",
                    slug: item.slug || "",
                    category: item.category || "tong-hop",
                  });
                }
              }

              setContent(
                <NewsArticleDetail
                  article={article}
                  popularArticles={popularArticles}
                  category={category}
                />
              );
              setLoading(false);
              return;
            }
          }
        }

        // Not found - show 404
        toast.error("Không tìm thấy bài viết");
        router.push("/404");
      } catch {
        toast.error("Có lỗi xảy ra");
        router.push("/404");
      }

      setLoading(false);
    };

    loadContent();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return content;
}
