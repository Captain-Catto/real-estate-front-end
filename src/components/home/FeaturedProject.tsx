"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";

// Import slick styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const projects = [
  {
    id: 1,
    name: "Verosa Park Khang Điền",
    price: "100 triệu/m²",
    area: "8,1 ha",
    location: "Quận 9, Hồ Chí Minh",
    image: "/assets/projects/verosa-park.jpg",
    status: "Đã bán giao",
    slug: "verosa-park-khang-dien",
  },
  {
    id: 2,
    name: "Sunshine City Saigon",
    price: "85 triệu/m²",
    area: "12,5 ha",
    location: "Quận 7, Hồ Chí Minh",
    image: "/assets/projects/sunshine-city.jpg",
    status: "Mở bán",
    slug: "sunshine-city-saigon",
  },
  {
    id: 3,
    name: "Golden River View",
    price: "120 triệu/m²",
    area: "6,8 ha",
    location: "Quận 4, Hồ Chí Minh",
    image: "/assets/projects/golden-river.jpg",
    status: "Sắp mở bán",
    slug: "golden-river-view",
  },
  {
    id: 4,
    name: "Eco Park Green City",
    price: "75 triệu/m²",
    area: "15,2 ha",
    location: "Hà Đông, Hà Nội",
    image: "/assets/projects/eco-park.jpg",
    status: "Đang xây dựng",
    slug: "eco-park-green-city",
  },
  {
    id: 5,
    name: "The Manor Luxury",
    price: "150 triệu/m²",
    area: "4,5 ha",
    location: "Quận 1, Hồ Chí Minh",
    image: "/assets/projects/the-manor.jpg",
    status: "Mở bán",
    slug: "the-manor-luxury",
  },
  {
    id: 6,
    name: "Vinhomes Ocean Park",
    price: "95 triệu/m²",
    area: "20,3 ha",
    location: "Gia Lâm, Hà Nội",
    image: "/assets/projects/vinhomes-ocean.jpg",
    status: "Đã bàn giao",
    slug: "vinhomes-ocean-park",
  },
];

export function FeaturedProject() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mở bán":
        return "bg-green-600";
      case "Đã bán giao":
      case "Đã bàn giao":
        return "bg-blue-600";
      case "Sắp mở bán":
        return "bg-orange-600";
      case "Đang xây dựng":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4.5,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3.5,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dự án nổi bật
          </h2>
          <p className="text-lg text-gray-600">
            Khám phá những dự án bất động sản uy tín và chất lượng
          </p>
        </div>

        {/* React Slick Carousel */}
        <div className="relative">
          <Slider {...settings}>
            {projects.map((project) => (
              <div key={project.id} className="px-3">
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative">
                    <Link href={`/du-an/${project.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Status Badge */}
                        <div
                          className={`absolute top-3 left-3 ${getStatusColor(
                            project.status
                          )} text-white px-2 py-1 text-xs font-medium rounded`}
                        >
                          {project.status}
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="p-6">
                    <Link href={`/du-an/${project.slug}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                    </Link>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Giá từ:</span>
                        <span className="font-semibold text-red-600">
                          {project.price}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Diện tích:
                        </span>
                        <span className="font-medium">{project.area}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 mb-4">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm line-clamp-1">
                        {project.location}
                      </span>
                    </div>

                    <Link
                      href={`/du-an/${project.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      Xem chi tiết
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
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/du-an"
            className="inline-flex items-center px-8 py-3 border-2 text-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-300 border-gray-300 hover:border-gray-400"
          >
            Xem tất cả dự án
            <svg
              className="w-5 h-5 ml-2"
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
    </section>
  );
}
