import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/news/NewsArticleDetail";
import { NewsCategoryPage } from "@/components/news/NewsCategoryPage";
import testImg from "@/assets/images/card-img.jpg";

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
  tags: string[];
  category: string;
  relatedArticles: string[];
}

// Valid categories
const validCategories = [
  "khu-vuc",
  "tai-chinh",
  "phong-thuy",
  "mua-ban",
  "cho-thue",
  "thi-truong",
  "du-an",
];

// Mock data cho articles không có category
const mockArticles: Record<string, NewsArticle> = {
  "batdongsan-com-vn-tai-tro-le-hoi-bong-da-viet-nam-uk-2025-837111": {
    id: "837111",
    slug: "batdongsan-com-vn-tai-tro-le-hoi-bong-da-viet-nam-uk-2025-837111",
    title:
      "Batdongsan.com.vn Tài Trợ Lễ Hội Bóng Đá Việt Nam - Vương Quốc Anh 2025",
    excerpt:
      "Các danh thủ huyền thoại Manchester Reds sẽ đá giao hữu với các ngôi sao bóng đá Việt Nam",
    content: `
      <p><strong>Các danh thủ huyền thoại Manchester Reds như Micheal Owen, Paul Scholes, Ryan Giggs,… sẽ đá giao hữu với các ngôi sao bóng đá Việt Nam trong khuôn khổ Lễ hội bóng đá Việt Nam – Vương quốc Anh 2025 được tổ chức tại Đà Nẵng. Batdongsan.com.vn là nhà tài trợ đồng hành cùng sự kiện thể thao hấp dẫn này.</strong></p>
      <p>Lễ hội bóng đá Việt Nam – Vương quốc Anh 2025 là chuỗi sự kiện văn hóa, thể thao và đào tạo bóng đá trẻ được tổ chức từ ngày 26 đến ngày 29/6 tại thành phố Đà Nẵng...</p>
    `,
    author: {
      name: "Ban nội dung",
      slug: "bdseditorial",
      avatar: testImg.src,
    },
    publishedAt: "2025-06-06T09:40:00.000Z",
    updatedAt: "2025-06-06T09:40:00.000Z",
    readTime: 3,
    featuredImage: testImg.src,
    tags: ["Sự kiện", "Bóng đá", "Tài trợ"],
    category: "Tin tức tổng hợp",
    relatedArticles: [],
  },
};

// Mock data cho category articles
const mockCategoryArticles: Record<string, Record<string, NewsArticle>> = {
  "tai-chinh": {
    "lai-suat-vay-mua-nha-ngan-hang-nao-thap-nhat-103041": {
      id: "103041",
      slug: "lai-suat-vay-mua-nha-ngan-hang-nao-thap-nhat-103041",
      title: "Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 5/2025",
      excerpt:
        "Cập nhật lãi suất vay mua nhà từ các ngân hàng hàng đầu Việt Nam",
      content: `
        <p><strong>Lãi suất vay mua nhà tháng 5/2025 tiếp tục có những điều chỉnh từ các ngân hàng.</strong></p>
        <p>Các ngân hàng đang áp dụng lãi suất ưu đãi cho khách hàng vay mua nhà...</p>
      `,
      author: {
        name: "Biên tập viên",
        slug: "bdseditorial",
        avatar: testImg.src,
      },
      publishedAt: "2025-05-15T09:00:00.000Z",
      updatedAt: "2025-05-15T09:00:00.000Z",
      readTime: 5,
      featuredImage: testImg.src,
      tags: ["Lãi suất", "Vay vốn", "Ngân hàng"],
      category: "Tài chính",
      relatedArticles: [],
    },
  },
};

// Functions
async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockArticles[slug] || null;
}

async function getArticleByCategoryAndSlug(
  category: string,
  slug: string
): Promise<NewsArticle | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockCategoryArticles[category]?.[slug] || null;
}

async function getArticlesByCategory(category: string) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const mockArticles = [
    {
      id: "1",
      title: `Bài viết mẫu cho danh mục ${category}`,
      slug: `bai-viet-mau-${category}`,
      excerpt: "Đây là bài viết mẫu để test hiển thị theo category",
      image: testImg.src,
      publishedAt: "10/06/2025 14:30",
      author: "Biên tập viên",
      category: category,
      tags: ["test", category],
      views: 100,
    },
  ];

  return mockArticles;
}

interface PageProps {
  params: {
    slug: string[];
  };
}

export default async function NewsSlugPage({ params }: PageProps) {
  const { slug } = params;

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
      const mockPopularArticles = [
        {
          id: "1",
          title: "Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 5/2025",
          slug: "lai-suat-vay-mua-nha-ngan-hang-nao-thap-nhat-103041",
        },
      ];

      return (
        <NewsArticleDetail
          article={article}
          popularArticles={mockPopularArticles}
        />
      );
    }
  }

  // Case 2: Two slugs - /tin-tuc/category/article-slug
  if (slug.length === 2) {
    const [category, articleSlug] = slug;

    if (validCategories.includes(category)) {
      const article = await getArticleByCategoryAndSlug(category, articleSlug);
      if (article) {
        const mockPopularArticles = [
          {
            id: "1",
            title: "Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 5/2025",
            slug: "lai-suat-vay-mua-nha-ngan-hang-nao-thap-nhat-103041",
          },
        ];

        return (
          <NewsArticleDetail
            article={article}
            popularArticles={mockPopularArticles}
            category={category}
          />
        );
      }
    }
  }

  // Not found
  notFound();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = params;

  if (slug.length === 1) {
    const singleSlug = slug[0];

    // Check category first
    if (validCategories.includes(singleSlug)) {
      const categoryNames = {
        "khu-vuc": "Tin tức bất động sản theo khu vực",
        "tai-chinh": "Tin tức tài chính bất động sản",
        "phong-thuy": "Tin tức phong thủy nhà đất",
        "mua-ban": "Tin tức mua bán bất động sản",
        "cho-thue": "Tin tức cho thuê bất động sản",
      };

      return {
        title: categoryNames[singleSlug] || "Tin tức bất động sản",
        description: `${categoryNames[singleSlug]} mới nhất và cập nhật`,
      };
    }

    // Check article
    const article = await getArticleBySlug(singleSlug);
    if (article) {
      return {
        title: `${article.title} | Tin tức`,
        description: article.excerpt,
      };
    }
  }

  if (slug.length === 2) {
    const [category, articleSlug] = slug;

    if (validCategories.includes(category)) {
      const article = await getArticleByCategoryAndSlug(category, articleSlug);
      if (article) {
        return {
          title: `${article.title} | Tin tức`,
          description: article.excerpt,
        };
      }
    }
  }

  return {
    title: "Bài viết không tìm thấy",
  };
}
