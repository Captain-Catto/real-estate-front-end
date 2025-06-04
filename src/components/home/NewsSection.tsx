"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Sample news data
const newsData = {
  "tin-noi-bat": [
    {
      id: 1,
      title: "Thay Đổi Cách Tính Giá Điện Sinh Hoạt Từ 6 Bậc Xuống Còn 5 Bậc",
      image: "/assets/news/bang-gia-dien.jpg",
      time: "2 ngày trước",
      slug: "thay-doi-cach-tinh-gia-dien-sinh-hoat",
    },
    {
      id: 2,
      title: "Bất Động Sản Hà Nội 2025: Những Điểm Nhấn Nổi Bật Nửa Đầu Năm",
      image: "/assets/news/bat-dong-san-ha-noi.jpg",
      time: "6 ngày trước",
      slug: "bat-dong-san-ha-noi-2025-nhung-diem-nhan-noi-bat",
    },
    {
      id: 3,
      title: "Siêu Dự Án Đổ Bộ, Đất Nền Cần Giờ Tăng Giá Mạnh",
      image: "/assets/news/can-gio.jpg",
      time: "6 ngày trước",
      slug: "sieu-du-an-do-bo-dat-nen-can-gio-tang-gia-manh",
    },
    {
      id: 4,
      title:
        "Chung Cư Hà Nội: Giá Trên Thị Trường Thứ Cấp Sẽ Tiếp Tục Có Sự Điều Chỉnh",
      image: "/assets/news/chung-cu-ha-noi.jpg",
      time: "9 giờ trước",
      slug: "chung-cu-ha-noi-gia-tren-thi-truong-thu-cap",
    },
    {
      id: 5,
      title: "Đất Nền Quốc Oai – Giá Tăng Nhưng Giao Dịch Chậm Chạp",
      image: "/assets/news/quoc-oai.jpg",
      time: "1 ngày trước",
      slug: "dat-nen-quoc-oai-gia-tang-nhung-giao-dich-cham-chap",
    },
    {
      id: 6,
      title: "Nhà Ở Xã Hội Trên Thị Trường Thứ Cấp Bắt Đầu Hạ Nhiệt",
      image: "/assets/news/nha-o-xa-hoi.jpg",
      time: "2 ngày trước",
      slug: "nha-o-xa-hoi-tren-thi-truong-thu-cap-bat-dau-ha-nhiet",
    },
  ],
  "tin-tuc": [
    {
      id: 7,
      title: "Thị Trường Bất Động Sản TP.HCM Quý 2/2025",
      image: "/assets/news/thi-truong-hcm.jpg",
      time: "3 giờ trước",
      slug: "thi-truong-bat-dong-san-hcm-quy-2-2025",
    },
    {
      id: 8,
      title: "Dự Án Căn Hộ Mới Tại Quận 7 Sắp Ra Mắt",
      image: "/assets/news/du-an-quan-7.jpg",
      time: "5 giờ trước",
      slug: "du-an-can-ho-moi-tai-quan-7",
    },
    {
      id: 9,
      title: "Xu Hướng Đầu Tư Bất Động Sản 2025",
      image: "/assets/news/xu-huong-dau-tu.jpg",
      time: "1 ngày trước",
      slug: "xu-huong-dau-tu-bat-dong-san-2025",
    },
    {
      id: 10,
      title: "Giá Bất Động Sản TP.HCM Tăng Nhẹ Trong Quý 2",
      image: "/assets/news/gia-bds-hcm.jpg",
      time: "2 ngày trước",
      slug: "gia-bat-dong-san-hcm-tang-nhe-trong-quy-2",
    },
  ],
};

const tabs = [
  { key: "tin-noi-bat", label: "Tin nổi bật" },
  { key: "tin-tuc", label: "Tin tức" },
];

export function NewsSection() {
  const [activeTab, setActiveTab] = useState("tin-noi-bat");
  const [selectedNews, setSelectedNews] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting and screen size
  useEffect(() => {
    setIsMounted(true);

    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const currentNews = newsData[activeTab as keyof typeof newsData] || [];
  const featuredNews = currentNews[selectedNews];

  const handleNewsHover = (index: number) => {
    if (isMounted && isDesktop) {
      setSelectedNews(index);
    }
  };

  const handleNewsClick = (index: number, slug: string) => {
    if (!isMounted) return;

    if (isDesktop) {
      setSelectedNews(index);
    } else {
      window.location.href = `/tin-tuc/${slug}`;
    }
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setSelectedNews(0);
  };

  const getNewsItemClassName = (index: number) => {
    const baseClass =
      "p-4 rounded-lg cursor-pointer transition-all duration-200";

    if (!isMounted) {
      return `${baseClass} hover:bg-gray-50 bg-white`;
    }

    if (selectedNews === index && isDesktop) {
      return `${baseClass} bg-red-50 border-l-4 border-red-600`;
    }

    return `${baseClass} hover:bg-gray-50 bg-white`;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 md:gap-8 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`pb-3 px-3 md:px-2 text-base md:text-lg font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-gray-600 border-b-2 border-red-600"
                    : "text-gray-600 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View More Link */}
          <div className="flex justify-end mt-4">
            <Link
              href="/tin-tuc"
              className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-medium"
            >
              <span>Xem thêm</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News - Desktop Only */}
          <div className="hidden lg:block space-y-4">
            {featuredNews && (
              <div className="group">
                <Link href={`/tin-tuc/${featuredNews.slug}`}>
                  <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      fill
                      sizes="50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                    {featuredNews.title}
                  </h3>
                </Link>
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{featuredNews.time}</span>
                </div>
              </div>
            )}
          </div>

          {/* News List */}
          <div className="space-y-2">
            {currentNews.map((news, index) => (
              <div
                key={news.id}
                onClick={() => handleNewsClick(index, news.slug)}
                onMouseEnter={() => handleNewsHover(index)}
                className={getNewsItemClassName(index)}
              >
                {/* Mobile/Tablet Layout - Direct Navigation */}
                <div className="lg:hidden">
                  <Link href={`/tin-tuc/${news.slug}`} className="flex gap-4">
                    <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 text-sm mb-1">
                        {news.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{news.time}</span>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Desktop Layout - Preview + Click to Select */}
                <div className="hidden lg:block">
                  <h4 className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 mb-2">
                    {news.title}
                  </h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{news.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
