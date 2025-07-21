import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NewsArticleDetail } from "@/components/news/NewsArticleDetail";
import { NewsCategoryPage } from "@/components/news/NewsCategoryPage";
import { newsService } from "@/services/newsService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Types
// Đảm bảo định nghĩa này khớp với interface Article trong NewsArticleDetail.tsx
interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string; // Không còn là optional
  author: {
    name: string;
    slug: string; // Không còn là optional
    avatar: string; // Không còn là optional
  };
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  featuredImage?: string;
  category: string;
  views?: number;
  tags: string[]; // Đảm bảo luôn có mảng tags
}

// Valid categories
const validCategories = [
  "mua-ban",
  "cho-thue",
  "tai-chinh",
  "phong-thuy",
  "tong-hop",
];

// Import type từ newsService
import { NewsItem } from "@/services/newsService";

// Hàm chuyển đổi từ định dạng API sang định dạng hiển thị
function transformNewsToArticle(news: NewsItem): NewsArticle {
  // Tạo excerpt từ content nếu không có
  let excerpt = "Tin tức bất động sản chi tiết"; // Giá trị mặc định
  if (news.content) {
    // Loại bỏ các thẻ HTML và cắt ngắn content
    const textOnly = news.content.replace(/<\/?[^>]+(>|$)/g, "");
    excerpt = textOnly.substring(0, 160) + (textOnly.length > 160 ? "..." : "");
  }

  console.log("Transforming API news item:", {
    id: news._id,
    title: news.title,
    slug: news.slug,
    category: news.category,
  });

  // Đảm bảo trả về đúng định dạng cần thiết cho NewsArticleDetail
  return {
    id: news._id,
    slug: news.slug,
    title: news.title,
    content: news.content || "",
    excerpt: excerpt,
    author: {
      name: news.author?.username || "Tác giả",
      slug: news.author?._id?.toString() || "anonymous", // Đảm bảo là string
      avatar: news.author?.avatar || "/assets/images/default-avatar.jpg",
    },
    publishedAt: news.publishedAt || news.createdAt,
    updatedAt: news.updatedAt,
    readTime: news.readTime || 3,
    featuredImage: news.featuredImage || "/assets/placeholder-image.jpg",
    category: news.category,
    views: news.views || 0,
    tags: [], // Mảng tags rỗng
  };
}

// Functions
async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    console.log("Fetching article by slug:", slug);
    const response = await newsService.getNewsBySlug(slug);

    if (response.success && response.data && response.data.news) {
      console.log("Article found:", response.data.news);
      console.log("Article category:", response.data.news.category);

      // Transform API response to our article format
      const transformedArticle = transformNewsToArticle(response.data.news);
      console.log("Transformed article:", {
        id: transformedArticle.id,
        title: transformedArticle.title,
        slug: transformedArticle.slug,
        category: transformedArticle.category,
      });

      return transformedArticle;
    }
    console.log("No article found with slug:", slug);
    return null;
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}

async function getArticlesByCategory(category: string) {
  try {
    console.log("Fetching articles for category:", category);
    const response = await newsService.getPublishedNews({
      category,
      limit: 12,
      page: 1,
    });

    console.log("API response for category:", category, {
      success: response.success,
      hasData: !!response.data,
      newsCount: response.data?.news?.length || 0,
    });

    if (response.success && response.data && response.data.news) {
      console.log(
        `Found ${response.data.news.length} articles for category ${category}`
      );

      if (category === "tong-hop") {
        // Log a few articles for debugging
        console.log(
          "Sample articles in 'tong-hop' category:",
          response.data.news.slice(0, 2).map((news) => ({
            id: news._id,
            title: news.title,
            slug: news.slug,
            category: news.category,
          }))
        );
      }

      // Transform and return articles
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
      }));
    }

    console.log("No articles found for category:", category);
    return [];
  } catch (error) {
    console.error("Error fetching articles by category:", error);
    if (error instanceof Error) {
      console.error(error.stack || "No stack trace");
    }
    return [];
  }
}

interface PageProps {
  params: {
    slug: string[];
  };
}

export default async function NewsSlugPage(props: PageProps) {
  // Chờ params.slug trước khi sử dụng để tránh lỗi
  const { slug } = await Promise.resolve(props.params);

  // Case 1: Single slug - /tin-tuc/something
  if (slug.length === 1) {
    const singleSlug = slug[0];

    // Check if it's a category
    if (validCategories.includes(singleSlug)) {
      const categoryArticles = await getArticlesByCategory(singleSlug);
      return (
        <NewsCategoryPage category={singleSlug} articles={categoryArticles} />
      );
    }

    // Try to find article by slug (no category)
    const article = await getArticleBySlug(singleSlug);
    if (article) {
      // Chuyển hướng sang URL đúng định dạng: /tin-tuc/category/slug
      redirect(`/tin-tuc/${article.category}/${singleSlug}`);
    }
  }

  // Case 2: Two slugs - /tin-tuc/category/article-slug
  if (slug.length === 2) {
    const [category, articleSlug] = slug;

    if (validCategories.includes(category)) {
      // Lấy bài viết theo slug
      const article = await getArticleBySlug(articleSlug);

      console.log("Checking article category match:", {
        requestedCategory: category,
        articleCategory: article?.category,
        requestedType: typeof category,
        articleType: typeof article?.category,
        requestedLength: category?.length,
        articleLength: article?.category?.length,
        doesMatch: article?.category === category,
        areEqual: article?.category === "tong-hop" && category === "tong-hop",
        categoryLiteral: "tong-hop",
      });

      // Chuẩn hóa danh mục trước khi so sánh để xử lý dấu cách, chữ hoa/thường
      const normalizedArticleCategory = String(article?.category || "")
        .trim()
        .toLowerCase();
      const normalizedRequestedCategory = String(category || "")
        .trim()
        .toLowerCase();

      console.log("Normalized categories:", {
        normalizedArticleCategory,
        normalizedRequestedCategory,
        normalizedMatch:
          normalizedArticleCategory === normalizedRequestedCategory,
      });

      if (
        article &&
        (article.category === category ||
          normalizedArticleCategory === normalizedRequestedCategory)
      ) {
        // Lấy các bài viết phổ biến trong cùng danh mục
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
          // Chắc chắn data.news tồn tại và là một mảng
          for (const item of popularResponse.data.news) {
            popularArticles.push({
              id: item._id || "",
              title: item.title || "Tin tức bất động sản",
              slug: item.slug || "",
              category: item.category || "tong-hop", // Đảm bảo luôn có category
            });
          }
          console.log("Processed popular articles:", popularArticles);
        }

        return (
          <NewsArticleDetail
            article={article}
            popularArticles={popularArticles}
            category={category}
          />
        );
      }
    }
  }

  // Not found
  notFound();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  // Chờ params trước khi sử dụng để tránh lỗi
  const params = await Promise.resolve(props.params);
  const { slug } = params;

  if (slug.length === 1) {
    const singleSlug = slug[0];

    // Check category first
    if (validCategories.includes(singleSlug)) {
      const categoryNames: Record<string, string> = {
        "mua-ban": "Tin tức mua bán bất động sản",
        "cho-thue": "Tin tức cho thuê bất động sản",
        "tai-chinh": "Tin tức tài chính bất động sản",
        "phong-thuy": "Tin tức phong thủy nhà đất",
        "tong-hop": "Tin tức bất động sản tổng hợp",
      };

      return {
        title: categoryNames[singleSlug] || "Tin tức bất động sản",
        description: `${
          categoryNames[singleSlug] || "Tin tức bất động sản"
        } mới nhất và cập nhật`,
      };
    }

    // Check article
    const article = await getArticleBySlug(singleSlug);
    if (article) {
      return {
        title: `${article.title} | Tin tức`,
        description: article.excerpt || "Tin tức bất động sản chi tiết",
      };
    }
  }

  if (slug.length === 2) {
    const [category, articleSlug] = slug;

    if (validCategories.includes(category)) {
      const article = await getArticleBySlug(articleSlug);
      // Chuẩn hóa danh mục trước khi so sánh
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
        return {
          title: `${article.title} | Tin tức`,
          description: article.excerpt || "Tin tức bất động sản chi tiết",
        };
      }
    }
  }

  return {
    title: "Bài viết không tìm thấy",
  };
}
