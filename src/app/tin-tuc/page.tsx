import { News } from "../../components/news/News";
import { newsService, NewsItem } from "@/services/newsService";

// Transform NewsItem to Article format
function transformNewsToArticle(news: NewsItem) {
  return {
    id: news._id,
    title: news.title,
    slug: news.slug,
    excerpt: news.content
      ? news.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160) + "..."
      : "Tin tức bất động sản",
    image: news.featuredImage || "/assets/placeholder-image.jpg",
    publishedAt: news.publishedAt || news.createdAt,
    author: news.author?.username || "Tác giả",
    category: news.category || "tong-hop",
    tags: [], // NewsItem doesn't have tags property
    views: news.views || 0,
  };
}

// Article type for component
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

// Async server component
export default async function NewsPage() {
  // Server-side data fetching
  let articles: Article[] = [];

  try {
    const response = await newsService.getPublishedNews({
      page: 1,
      limit: 20,
      sort: "publishedAt",
      order: "desc",
    });

    if (response.success && response.data?.news) {
      articles = response.data.news.map(transformNewsToArticle);
    }
  } catch (error) {
    console.error("Error fetching news:", error);
  }

  return <News initialArticles={articles} />;
}

// Optional: Add metadata
export const metadata = {
  title: "Tin tức bất động sản mới nhất",
  description:
    "Thông tin mới, đầy đủ, hấp dẫn về thị trường bất động sản Việt Nam",
};
