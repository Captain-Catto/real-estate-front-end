"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Breadcrumb } from "@/components/property-detail/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import { ProjectSearchBar } from "./ProjectSearchBar";
import { ProjectCard } from "./ProjectCard";
import { ProjectNews } from "./ProjectNews";
import testCardImg from "@/assets/images/card-img.jpg";
import { Menu, Transition } from "@headlessui/react";
import Header from "../header/Header";
import Footer from "../footer/Footer";

interface ProjectPageProps {
  title: string;
  totalCount: number;
}

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    title: "Vinhomes Golden City",
    status: "updating",
    area: "240,57 ha",
    units: 4937,
    location:
      "Phường Hòa Nghĩa, Quận Dương Kinh và xã Đông Phương, xã Đại Đồng, huyện Kiến Thụy, Hải Phòng",
    summary:
      "Vinhomes Golden City là khu đô thị thông minh nằm tại cửa ngõ phía Đông Nam tọa lạc tại quận Dương Kinh và huyện Kiến Thụy do Công ty Cổ phần Vinhomes làm chủ đầu tư...",
    images: [testCardImg, testCardImg, testCardImg],
    imageCount: 9,
    developer: "Tập đoàn Vingroup",
    developerLogo: testCardImg,
    slug: "vinhomes-golden-city-pj6350",
  },
  {
    id: "2",
    title: "The Fullton",
    status: "updating",
    area: "25 ha",
    units: null,
    location: "Xã Tân Quang, Huyện Văn Lâm, Hưng Yên",
    summary:
      "The Fullton là dự án thấp tầng đầu tiên của CapitaLand Development tại Hưng Yên, nằm trong khu đô thị Vinhomes Ocean Park 3 thuộc huyện Văn Lâm, tỉnh Hưng Yên...",
    images: [testCardImg, testCardImg, testCardImg],
    imageCount: 6,
    developer: "CapitaLand Development (Việt Nam)",
    developerLogo: testCardImg,
    slug: "the-fullton-pj6346",
  },
  // Add more mock projects...
];

const sortOptions = [
  { value: "1", label: "Mới nhất" },
  { value: "2", label: "Mới cập nhật" },
  { value: "3", label: "Giá cao nhất" },
  { value: "4", label: "Giá thấp nhất" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function ProjectPage({ title, totalCount }: ProjectPageProps) {
  const [sortBy, setSortBy] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Format numbers consistently
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Dự án", href: "/du-an", isActive: true },
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const getCurrentSortLabel = () => {
    return (
      sortOptions.find((option) => option.value === sortBy)?.label || "Mới nhất"
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Search Bar */}
          <ProjectSearchBar />

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Project Listings */}
            <div className="flex-1">
              {/* Breadcrumb */}
              <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} />
              </div>

              {/* Page Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>

              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {/* Project Count */}
                <div>
                  <span className="text-gray-700">
                    Hiện đang có{" "}
                    <span className="font-semibold text-gray-900">
                      {formatNumber(totalCount)}
                    </span>{" "}
                    dự án
                  </span>
                </div>

                {/* Sort Dropdown */}
                <div className="w-full sm:w-auto">
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span>{getCurrentSortLabel()}</span>
                        <svg
                          className="w-4 h-4 ml-2 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Menu.Button>
                    </div>

                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 sm:right-0 z-50 mt-2 w-full sm:w-48 origin-top-left sm:origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {sortOptions.map((option) => (
                            <Menu.Item key={option.value}>
                              {({ active }) => (
                                <button
                                  onClick={() => handleSortChange(option.value)}
                                  className={classNames(
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700",
                                    sortBy === option.value
                                      ? "bg-blue-50 text-blue-600"
                                      : "",
                                    "block w-full text-left px-4 py-2 text-sm"
                                  )}
                                >
                                  {option.label}
                                </button>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>

              {/* Project List */}
              <div className="space-y-4 mb-8">
                {mockProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mb-8"
              />
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <ProjectNews />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
