import React from "react";
import Image from "next/image";
import testCardImg from "@/assets/images/card-img.jpg";

const newsData = [
  {
    id: 1,
    title:
      "Khu Công Nghiệp Tràng Duệ: Vị Trí, Hiện Trạng Và Bảng Giá Thuê Mới Nhất 2025",
    image: testCardImg,
    time: "Hôm nay",
    slug: "khu-cong-nghiep-trang-due-824818",
  },
  {
    id: 2,
    title: "Bảng Giá Đất Bà Rịa Vũng Tàu Cập Nhật Mới Nhất Theo Từng Khu Vực",
    image: testCardImg,
    time: "Hôm nay",
    slug: "bang-gia-dat-ba-ria-vung-tau-825081",
  },
  {
    id: 3,
    title: "Thị Trường Bất Động Sản Kho Bãi Hà Nội Đang Đi Ngang Về Giá",
    image: testCardImg,
    time: "Hôm nay",
    slug: "thi-truong-bat-dong-san-kho-bai-ha-noi-836601",
  },
];

export function ProjectNews() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Tin tức</h2>
        <a
          href="/tin-tuc"
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <span>Xem tất cả</span>
          <svg
            className="w-4 h-4 ml-1"
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
        </a>
      </div>

      <div className="space-y-4">
        {newsData.map((news) => (
          <a
            key={news.id}
            href={`/wiki/${news.slug}`}
            className="flex space-x-3 group"
          >
            <div className="w-20 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
              <Image
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                width={80}
                height={64}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-3 group-hover:text-blue-600 transition-colors">
                {news.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{news.time}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
