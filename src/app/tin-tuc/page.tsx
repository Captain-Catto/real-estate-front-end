import { toast } from "sonner";
import { News } from "../../components/news/News";

// Async server component
export default async function NewsPage() {
  // Server-side data fetching
  let articles = [];

  try {
    // Replace with your actual API endpoint
    const response = await fetch("http://localhost:3000/api/news", {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (response.ok) {
      articles = await response.json();
    }
  } catch {
    toast.error("Có lỗi xảy ra khi lấy tin tức");
  }

  return <News initialArticles={articles} />;
}

// Optional: Add metadata
export const metadata = {
  title: "Tin tức bất động sản mới nhất",
  description:
    "Thông tin mới, đầy đủ, hấp dẫn về thị trường bất động sản Việt Nam",
};
