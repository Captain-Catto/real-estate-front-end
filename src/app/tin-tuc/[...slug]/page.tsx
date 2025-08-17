import { Metadata } from "next";
import { newsService } from "@/services/newsService";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import NewsSlugClient from "@/components/news/NewsSlugClient";

// Valid categories - static fallback
const staticValidCategories = [
  "mua-ban",
  "cho-thue",
  "tai-chinh",
  "phong-thuy",
  "tong-hop",
];

// Check if category is valid (for metadata generation)
async function isValidCategory(category: string): Promise<boolean> {
  try {
    const response = await newsService.getNewsCategories();
    if (response.success && response.data) {
      const validSlugs = response.data.map((cat) => cat.slug);
      return validSlugs.includes(category);
    }
    return staticValidCategories.includes(category);
  } catch (error) {
    console.error("Error checking category validity:", error);
    return staticValidCategories.includes(category);
  }
}

// Get article by slug (for metadata generation)
async function getArticleBySlug(slug: string) {
  try {
    const response = await newsService.getNewsBySlug(slug);

    if (response.success && response.data && response.data.news) {
      return response.data.news;
    }
    return null;
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function NewsSlugPage(props: PageProps) {
  const { slug } = await props.params;

  return (
    <>
      <Header />
      <NewsSlugClient slug={slug} />
      <Footer />
    </>
  );
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await Promise.resolve(props.params);
  const { slug } = params;

  if (slug.length === 1) {
    const singleSlug = slug[0];

    // Check category first
    const isCategory = await isValidCategory(singleSlug);
    if (isCategory) {
      try {
        const response = await newsService.getNewsCategories();
        if (response.success && response.data) {
          const category = response.data.find((cat) => cat.slug === singleSlug);
          const categoryName = category?.name || "Tin tức bất động sản";

          return {
            title: `Tin tức ${categoryName}`,
            description: `${categoryName} mới nhất và cập nhật`,
          };
        }
      } catch (error) {
        console.error("Error fetching category info:", error);
      }

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
      const excerpt = article.content
        ? article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160) +
          "..."
        : "Tin tức bất động sản chi tiết";

      return {
        title: `${article.title} | Tin tức`,
        description: excerpt,
      };
    }
  }

  if (slug.length === 2) {
    const [category, articleSlug] = slug;

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
        const excerpt = article.content
          ? article.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160) +
            "..."
          : "Tin tức bất động sản chi tiết";

        return {
          title: `${article.title} | Tin tức`,
          description: excerpt,
        };
      }
    }
  }

  return {
    title: "Bài viết không tìm thấy",
  };
}
