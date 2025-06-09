import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/news/NewsArticleDetail";
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

// Mock function to fetch article data
async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock data - replace with real API call
  // Mock data - replace with real API call
  const mockArticles: Record<string, NewsArticle> = {
    "batdongsan-com-vn-tai-tro-le-hoi-bong-da-viet-nam-uk-2025-837111": {
      id: "837111",
      slug: "batdongsan-com-vn-tai-tro-le-hoi-bong-da-viet-nam-uk-2025-837111",
      title:
        "Batdongsan.com.vn Tài Trợ Lễ Hội Bóng Đá Việt Nam - Vương Quốc Anh 2025, Quy Tụ Dàn Huyền Thoại Sân Cỏ",
      excerpt:
        "Các danh thủ huyền thoại Manchester Reds như Micheal Owen, Paul Scholes, Ryan Giggs,… sẽ đá giao hữu với các ngôi sao bóng đá Việt Nam trong khuôn khổ Lễ hội bóng đá Việt Nam – Vương quốc Anh 2025 được tổ chức tại Đà Nẵng.",
      content: `
        <p><strong>Các danh thủ huyền thoại Manchester Reds như Micheal Owen, Paul Scholes, Ryan Giggs,… sẽ đá giao hữu với các ngôi sao bóng đá Việt Nam trong khuôn khổ Lễ hội bóng đá Việt Nam – Vương quốc Anh 2025 được tổ chức tại Đà Nẵng. Batdongsan.com.vn là nhà tài trợ đồng hành cùng sự kiện thể thao hấp dẫn này.</strong></p>

        <p>Lễ hội bóng đá Việt Nam – Vương quốc Anh 2025 là chuỗi sự kiện văn hóa, thể thao và đào tạo bóng đá trẻ được tổ chức từ ngày 26 đến ngày 29/6 tại thành phố Đà Nẵng, với mục tiêu thúc đẩy kết nối du lịch và thể thao, góp phần thúc đẩy kinh tế và quảng bá hình ảnh Đà Nẵng. Tâm điểm của lễ hội là trận cầu giao hữu giữa các huyền thoại bóng đá Anh quốc Manchester Reds với đội tuyển Vietnam All Stars sẽ diễn ra vào ngày 27/6 tại sân vận động Hòa Xuân.</p>

        <p>Batdongsan.com.vn là một trong những nhà tài trợ đồng hành cùng sự kiện thể thao – văn hóa hấp dẫn này, góp phần mang đến cho người hâm mộ cơ hội trực tiếp xem các danh thủ huyền thoại của câu lạc bộ Manchester United cũng như bóng đá Anh thi đấu.</p>

        <figure class="wp-block-image size-full">
          <img src="${testImg.src}" alt="Ông Hà Nghiệm tại buổi họp báo" loading="lazy">
          <figcaption><em>Ông Hà Nghiệm – Giám đốc chi nhánh Đà Nẵng của Batdongsan.com.vn tại buổi họp báo Lễ hội Bóng đá Việt Nam – Vương quốc Anh 2025.</em></figcaption>
        </figure>

        <p>Trận đấu giao hữu giữa các huyền thoại Manchester Reds và đội Vietnam All Stars – sẽ quy tụ nhiều danh thủ huyền thoại của "Man đỏ" như Paul Scholes, Michael Owen, Ryan Giggs, Kléberson, Teddy Sheringham,… Cộng đồng yêu bóng đá tại Việt Nam sẽ có cơ hội được trực tiếp hòa mình vào những khoảnh khắc đáng nhớ cùng những thần tượng sân cỏ.</p>

        <p>Bên cạnh trận cầu kinh điển, hàng loạt hoạt động khác như tọa đàm xúc tiến đầu tư, chia sẻ về tiềm năng hợp tác đầu tư – du lịch Việt Nam – Vương quốc Anh cũng sẽ được tổ chức trong khuôn khổ Lễ hội bóng đá Việt Nam – Vương quốc Anh 2025. Người hâm mộ bóng đá cũng sẽ được đắm chìm trong một không gian lễ hội thực thụ, với các hoạt động biểu diễn nghệ thuật, giao lưu với khán giả, hứa hẹn một mùa hè sôi động, "rực lửa" dành cho các tín đồ "túc cầu giáo" tại Việt Nam.</p>

        <p>Nhân sự kiện thể thao đỉnh cao được nhiều người hâm mộ chờ đón này, Batdongsan.com.vn triển khai chương trình khuyến mại <strong>Đua Top nạp nhanh</strong>, trao tặng vé tham dự sự kiện cho những khách hàng nạp tiền nhanh và đủ điều kiện mỗi ngày.</p>

        <figure class="wp-block-image size-full">
          <img src="${testImg.src}" alt="Chương trình khuyến mại" loading="lazy">
        </figure>

        <p>Thời gian áp dụng: 01/06 – 15/06/2025 (chỉ tính các ngày làm việc, không áp dụng vào thứ bảy & chủ nhật)</p>

        <p>Phần thưởng: 01 vé xem bóng đá tại Lễ hội Bóng đá Việt Nam – Anh Quốc mỗi ngày dành cho:</p>

        <ul>
          <li>Top 5 Khách hàng cá nhân nạp từ 20 triệu đồng trở lên</li>
          <li>Top 5 Khách hàng doanh nghiệp nạp từ 50 triệu đồng trở lên</li>
        </ul>

        <p>Đừng bỏ lỡ cơ hội sở hữu tấm vé xem trận cầu đỉnh cao của những danh thủ huyền thoại Manchester Reds và hòa mình vào không khí sôi động tại Lễ hội Bóng đá Việt Nam – Anh Quốc 2025!</p>

        <p>Xem thể lệ chi tiết của chương trình khuyến mại <a href="https://trogiup.batdongsan.com.vn/docs/nap-nhanh-tay-rinh-ngay-ve-xem-bong-da" target="_blank" rel="noreferrer noopener">TẠI ĐÂY</a>.</p>

        <p><strong>Batdongsan.com.vn</strong></p>

        <p>Xem thêm:</p>

        <p><a href="/tin-tuc/batdongsan-com-vn-chay-cung-le-hoi-bong-da-viet-nam-brazil-2024-801726" target="_blank" rel="noreferrer noopener">Batdongsan.com.vn "Cháy" Cùng Lễ Hội Bóng Đá Việt Nam – Brazil 2024</a></p>
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
      category: "Tin tức công ty",
      relatedArticles: [],
    },
    // Thêm bài viết mới cho URL bạn đang test
    "lai-suat-vay-mua-nha-ngan-hang-nao-thap-nhat-103041": {
      id: "103041",
      slug: "lai-suat-vay-mua-nha-ngan-hang-nao-thap-nhat-103041",
      title: "Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 5/2025",
      excerpt:
        "Cập nhật lãi suất vay mua nhà mới nhất từ các ngân hàng hàng đầu Việt Nam tháng 5/2025. So sánh lãi suất để chọn gói vay phù hợp nhất.",
      content: `
    <p><strong>Thị trường bất động sản Việt Nam đang có những chuyển biến tích cực, lãi suất vay mua nhà từ các ngân hàng cũng liên tục được điều chỉnh để hỗ trợ người dân tiếp cận với nguồn vốn.</strong></p>

    <p>Theo khảo sát mới nhất, lãi suất vay mua nhà tại các ngân hàng dao động từ 6.5% - 12%/năm tùy theo từng gói sản phẩm và đối tượng khách hàng.</p>

    <figure class="wp-block-image size-full">
      <img src="${testImg.src}" alt="Lãi suất vay mua nhà" loading="lazy">
      <figcaption><em>Bảng so sánh lãi suất vay mua nhà các ngân hàng tháng 5/2025</em></figcaption>
    </figure>

    <p>Dưới đây là bảng lãi suất vay mua nhà cập nhật từ các ngân hàng lớn:</p>

    <ul>
      <li>Vietcombank: 6.5% - 9.5%/năm</li>
      <li>BIDV: 6.8% - 9.8%/năm</li>
      <li>VietinBank: 6.7% - 9.7%/năm</li>
      <li>Agribank: 6.9% - 10%/năm</li>
      <li>Techcombank: 7% - 10.5%/năm</li>
    </ul>

    <p>Để được hưởng lãi suất ưu đãi, khách hàng cần đáp ứng các điều kiện về thu nhập, tài sản thế chấp và hồ sơ tín dụng.</p>
  `,
      author: {
        name: "Ban nội dung",
        slug: "bdseditorial",
        avatar: testImg.src,
      },
      publishedAt: "2025-05-15T10:00:00.000Z",
      updatedAt: "2025-05-15T10:00:00.000Z",
      readTime: 5,
      featuredImage: testImg.src,
      tags: ["Lãi suất", "Vay mua nhà", "Ngân hàng"],
      category: "Tài chính",
      relatedArticles: [],
    },
  };

  return mockArticles[slug] || null;
}

// Mock function to fetch popular articles
async function getPopularArticles() {
  return [
    {
      id: "1",
      title: "Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 5/2025",
      slug: "lai-suat-vay-mua-nha-ngan-hang-nao-thap-nhat-103041",
    },
    {
      id: "2",
      title: "3 Phân Khúc Dẫn Dắt Thị Trường Bất Động Sản Quý 1/2025",
      slug: "thi-truong-bat-dong-san-evr-794652",
    },
    {
      id: "3",
      title: "Diễn Biến Trái Chiều Giá Chung Cư Hà Nội",
      slug: "dien-bien-trai-chieu-gia-chung-cu-Ha-noi-cd-hn-833912",
    },
    {
      id: "4",
      title: "Thị Trường Bất Động Sản Tháng 4/2025: Giảm Nhẹ Một Số Phân Khúc",
      slug: "thi-truong-bat-dong-san-thang-4-2025-cuoc-giam-toc-tren-dien-rong-835222",
    },
    {
      id: "5",
      title: "Môi Giới Đất Nền Đồng Loạt Quay Lại Với Nghề",
      slug: "moi-gioi-dat-nen-dong-loat-quay-tro-lai-voi-nghe-cd-hn-836089",
    },
  ];
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Bài viết không tìm thấy",
    };
  }

  return {
    title: `${article.title} | Tin tức`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

// Main page component
export default async function NewsArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const [article, popularArticles] = await Promise.all([
    getArticleBySlug(params.slug),
    getPopularArticles(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <NewsArticleDetail article={article} popularArticles={popularArticles} />
  );
}

// Generate static params for ISR (optional)
export async function generateStaticParams() {
  // Return empty array for dynamic routes or fetch popular article slugs
  return [];
}
