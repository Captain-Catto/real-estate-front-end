"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";

// Import slick styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface FeaturedProjectType {
  _id: string;
  name: string;
  slug: string;
  priceRange: string;
  area: string;
  address: string;
  status: string;
  images: string[];
  developer: {
    name: string;
    logo: string;
  };
}

export function FeaturedProject() {
  const [projects, setProjects] = useState<FeaturedProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured projects from API
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/featured?limit=8`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data?.projects) {
          setProjects(data.data.projects);
        } else {
          throw new Error(data.message || "Không thể tải dữ liệu dự án");
        }
      } catch (error) {
        console.error("Error fetching featured projects:", error);
        setError("Không thể tải dữ liệu dự án nổi bật");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang bán":
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
        breakpoint: 1280,
        settings: {
          slidesToShow: 3.5,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.8,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "20px",
        },
      },
    ],
  };

  return (
    <section className="py-8 md:py-8 bg-gray-50 my-8">
      <div className="container mx-auto px-4">
        {/* Header với layout flex - tiêu đề bên trái, nút bên phải */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 md:mb-12">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              Dự án nổi bật
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Khám phá những dự án bất động sản uy tín và chất lượng
            </p>
          </div>

          {/* Nút xem tất cả bên phải */}
          <div className="self-start sm:self-auto">
            <Link
              href="/du-an"
              className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2 transition-colors duration-200 text-sm md:text-base"
            >
              Xem tất cả
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* React Slick Carousel */}
        <div className="relative">
          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-40 md:h-48 bg-gray-300"></div>
                  <div className="p-4 md:p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-5 md:h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Projects slider */}
          {!loading && !error && projects.length > 0 && (
            <Slider {...settings}>
              {projects.map((project) => (
                <div key={project._id} className="px-2 md:px-3">
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="relative">
                      <Link href={`/du-an/${project.slug}`}>
                        <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                          <Image
                            src={
                              project.images && project.images.length > 0
                                ? project.images[0]
                                : "/assets/projects/default-project.jpg"
                            }
                            alt={project.name}
                            fill
                            sizes="(max-width: 640px) 90vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Status Badge */}
                          <div
                            className={`absolute top-2 md:top-3 left-2 md:left-3 ${getStatusColor(
                              project.status
                            )} text-white px-2 py-1 text-xs font-medium rounded`}
                          >
                            {project.status}
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="p-4 md:p-6">
                      <Link href={`/du-an/${project.slug}`}>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 md:line-clamp-1">
                          {project.name}
                        </h3>
                      </Link>

                      <div className="space-y-2 mb-3 md:mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs md:text-sm text-gray-600">
                            Giá từ:
                          </span>
                          <span className="font-semibold text-red-600 text-sm md:text-base">
                            {project.priceRange || "Liên hệ"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs md:text-sm text-gray-600">
                            Diện tích:
                          </span>
                          <span className="font-medium text-sm md:text-base">
                            {project.area}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start text-gray-600 mb-3 md:mb-4">
                        <svg
                          className="w-3 h-3 md:w-4 md:h-4 mr-2 mt-0.5 flex-shrink-0"
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
                        <span className="text-xs md:text-sm line-clamp-2">
                          {project.address || "Chưa cập nhật địa chỉ"}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-3 md:mb-4">
                        <svg
                          className="w-3 h-3 md:w-4 md:h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="text-xs md:text-sm line-clamp-1">
                          {project.developer?.name || "Chưa có thông tin"}
                        </span>
                      </div>

                      <Link
                        href={`/du-an/${project.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs md:text-sm transition-colors"
                      >
                        Xem chi tiết
                        <svg
                          className="w-3 h-3 md:w-4 md:h-4 ml-1"
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
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Hiện tại chưa có dự án nổi bật
              </p>
              <Link
                href="/du-an"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Xem tất cả dự án
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
