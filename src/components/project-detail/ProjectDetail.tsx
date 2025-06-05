"use client";
import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Breadcrumb } from "./Breadcrumb";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectMap } from "./ProjectMap";
import { ContactBox } from "./ContactBox";
import { RelatedProjects } from "./RelatedProjects";
import { ProjectListings } from "./ProjectListings";
import { ProjectPaymentCalculator } from "./ProjectPaymentCalculator";
import { ProjectFAQ } from "./ProjectFAQ";
import imgTest from "@/assets/images/card-img.jpg";

interface Project {
  id: string;
  name: string;
  slug: string;
  address: string;
  fullLocation: string;
  latitude: number;
  longitude: number;
  developer: {
    name: string;
    logo: string;
    phone: string;
    email: string;
  };
  images: (string | StaticImageData)[];
  videos?: string[];
  totalUnits: number;
  area: string;
  numberOfTowers: number;
  density: string;
  status: "Đang cập nhật" | "Sắp mở bán" | "Đã bàn giao" | "Đang bán";
  priceRange: string;
  description: string;
  facilities: string[];
  specifications: {
    [key: string]: string;
  };
  locationInsights: {
    schools: Array<{ name: string; distance: string }>;
    hospitals: Array<{ name: string; distance: string }>;
    supermarkets: Array<{ name: string; distance: string }>;
    parks: Array<{ name: string; distance: string }>;
    restaurants: Array<{ name: string; distance: string }>;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface ProjectDetailProps {
  projectSlug: string; // Change to projectSlug
}

// Mock data tĩnh
const MOCK_PROJECTS: Record<string, Project> = {
  "masteri-an-phu": {
    id: "masteri-an-phu",
    name: "Masteri An Phú",
    slug: "masteri-an-phu",
    address: "Đường Hà Nội, Phường Thảo Điền",
    fullLocation: "Quận 2, TP.HCM",
    latitude: 10.8017,
    longitude: 106.7417,
    developer: {
      name: "Tập đoàn Masterise Homes",
      logo: "/images/masterise-logo.jpg",
      phone: "0283.123.4567",
      email: "info@masterisehomes.com",
    },
    images: [imgTest, imgTest, imgTest, imgTest, imgTest],
    videos: ["/videos/masteri-tour.mp4"],
    totalUnits: 1200,
    area: "15.2 ha",
    numberOfTowers: 6,
    density: "28%",
    status: "Đang bán",
    priceRange: "3.8 - 7.5 tỷ",
    description: `
      <p>Masteri An Phú là dự án căn hộ cao cấp tại quận 2, TP.HCM với vị trí đắc địa bên bờ sông Sài Gòn.</p>
      <p>Dự án có 6 tòa tháp với 1200 căn hộ và đầy đủ tiện ích hiện đại như hồ bơi vô cực, sky garden, gym...</p>
      <p>Masterise Homes cam kết mang đến không gian sống đẳng cấp quốc tế cho cư dân.</p>
    `,
    facilities: [
      "Hồ bơi vô cực",
      "Sky Garden",
      "Phòng gym cao cấp",
      "Spa & Wellness",
      "Khu vui chơi trẻ em",
      "Sân tennis",
      "Khu BBQ",
      "Co-working space",
      "Hầm để xe thông minh",
      "An ninh 24/7",
      "Concierge service",
      "Shuttle bus",
    ],
    specifications: {
      "Tổng diện tích": "15.2 ha",
      "Số tòa nhà": "6 tòa",
      "Tổng số căn": "1200 căn",
      "Mật độ xây dựng": "28%",
      "Chiều cao": "35 tầng",
      "Năm khởi công": "2020",
      "Năm hoàn thiện": "2024",
      "Chủ đầu tư": "Masterise Homes",
      "Đơn vị thi công": "Coteccons",
      "Đơn vị thiết kế": "Foster + Partners",
      "Hướng chính": "Đông Nam",
      "Loại hình": "Căn hộ chung cư cao cấp",
    },
    locationInsights: {
      schools: [
        { name: "Trường Quốc tế ISHCMC", distance: "800m" },
        { name: "Trường ĐH RMIT", distance: "2.5km" },
        { name: "Trường mầm non Sakura", distance: "500m" },
      ],
      hospitals: [
        { name: "Bệnh viện Columbia Asia", distance: "1.2km" },
        { name: "Phòng khám Family Medical", distance: "600m" },
      ],
      supermarkets: [
        { name: "Vincom Mega Mall", distance: "800m" },
        { name: "Metro An Phú", distance: "1km" },
        { name: "Satra Mart", distance: "400m" },
      ],
      parks: [
        { name: "Công viên Landmark 81", distance: "3km" },
        { name: "Công viên Tao Đàn", distance: "8km" },
      ],
      restaurants: [
        { name: "The Deck Saigon", distance: "1.5km" },
        { name: "Pizza 4P's Thảo Điền", distance: "1km" },
        { name: "Starbucks An Phú", distance: "600m" },
      ],
    },
    faqs: [
      {
        question: "Dự án có view sông không?",
        answer:
          "Có, nhiều căn hộ tại Masteri An Phú có view trực diện sông Sài Gòn và view toàn cảnh thành phố rất đẹp.",
      },
      {
        question: "Có dịch vụ đưa đón không?",
        answer:
          "Có, dự án có dịch vụ shuttle bus miễn phí đưa đón cư dân đến các trung tâm thương mại và ga metro.",
      },
      {
        question: "Chính sách thanh toán như thế nào?",
        answer:
          "Hỗ trợ vay ngân hàng lên đến 70%, lãi suất ưu đãi. Có thể thanh toán theo tiến độ xây dựng.",
      },
    ],
  },
  "vinhomes-central-park": {
    id: "vinhomes-central-park",
    name: "Vinhomes Central Park",
    slug: "vinhomes-central-park",
    address: "208 Nguyễn Hữu Cảnh",
    fullLocation: "Bình Thạnh, TP.HCM",
    latitude: 10.7879,
    longitude: 106.7197,
    developer: {
      name: "Tập đoàn Vingroup",
      logo: "/images/vingroup-logo.jpg",
      phone: "0283.567.8900",
      email: "info@vingroup.net",
    },
    images: [imgTest, imgTest, imgTest, imgTest, imgTest],
    videos: ["/videos/vinhomes-cp-tour.mp4"],
    totalUnits: 2800,
    area: "25.5 ha",
    numberOfTowers: 12,
    density: "30%",
    status: "Đã bàn giao",
    priceRange: "4.5 - 12 tỷ",
    description: `
      <p>Vinhomes Central Park là khu đô thị phức hợp cao cấp tại trung tâm TP.HCM.</p>
      <p>Dự án có công viên trung tâm 14ha và đầy đủ tiện ích như Vincom, trường học, bệnh viện...</p>
      <p>Với vị trí đắc địa và hệ thống tiện ích hoàn hảo, đây là nơi lý tưởng để an cư lập nghiệp.</p>
    `,
    facilities: [
      "Công viên trung tâm 14ha",
      "Vincom Center",
      "Trường quốc tế",
      "Bệnh viện Vinmec",
      "Hồ bơi Olympic",
      "Gym & Spa",
      "Sân tennis",
      "Khu thể thao",
      "Khu vui chơi trẻ em",
      "Phòng họp cao cấp",
      "An ninh 24/7",
      "Dịch vụ concierge",
    ],
    specifications: {
      "Tổng diện tích": "25.5 ha",
      "Số tòa nhà": "12 tòa",
      "Tổng số căn": "2800 căn",
      "Mật độ xây dựng": "30%",
      "Chiều cao": "45 tầng",
      "Năm khởi công": "2015",
      "Năm hoàn thiện": "2018",
      "Chủ đầu tư": "Vingroup",
      "Đơn vị thi công": "Coteccons",
      "Đơn vị thiết kế": "ARUP",
      "Hướng chính": "Nam",
      "Loại hình": "Căn hộ chung cư cao cấp",
    },
    locationInsights: {
      schools: [
        { name: "Vinschool Central Park", distance: "100m" },
        { name: "Trường ĐH Kinh tế", distance: "2km" },
        { name: "Trường THPT Lê Quý Đôn", distance: "1.5km" },
      ],
      hospitals: [
        { name: "Vinmec Central Park", distance: "200m" },
        { name: "Bệnh viện Chợ Rẫy", distance: "3km" },
      ],
      supermarkets: [
        { name: "Vincom Center", distance: "100m" },
        { name: "Saigon Centre", distance: "2km" },
        { name: "BigC An Lạc", distance: "4km" },
      ],
      parks: [
        { name: "Công viên trung tâm", distance: "0m" },
        { name: "Công viên 23/9", distance: "3km" },
      ],
      restaurants: [
        { name: "The Observatory", distance: "500m" },
        { name: "Bitexco Sky Bar", distance: "3km" },
        { name: "McDonald's", distance: "1km" },
      ],
    },
    faqs: [
      {
        question: "Có gần metro không?",
        answer: "Có, dự án cách ga metro Bến Thành chỉ 10 phút đi xe.",
      },
      {
        question: "Tiện ích nội khu như thế nào?",
        answer:
          "Đầy đủ tiện ích với công viên 14ha, Vincom, trường học, bệnh viện ngay trong khu.",
      },
      {
        question: "Có chỗ đậu xe không?",
        answer:
          "Có hầm đỗ xe rộng rãi với đủ chỗ cho tất cả cư dân và khách thăm.",
      },
    ],
  },
  "anland-premium": {
    id: "anland-premium",
    name: "Anland Premium",
    slug: "anland-premium",
    address: "Đường Tố Hữu, Phường La Khê",
    fullLocation: "Hà Đông, Hà Nội",
    latitude: 20.977093188994164,
    longitude: 105.76226999361447,
    developer: {
      name: "Công ty CP Tập đoàn Nam Cường Hà Nội",
      logo: "/images/developer-logo.jpg",
      phone: "0243.123.4567",
      email: "info@namcuong.vn",
    },
    images: [imgTest, imgTest, imgTest, imgTest],
    videos: ["/videos/project-tour.mp4"],
    totalUnits: 575,
    area: "12.5 ha",
    numberOfTowers: 4,
    density: "25%",
    status: "Đã bàn giao",
    priceRange: "2.5 - 4.2 tỷ",
    description: `
      <p>Dự án Anland Premium tọa lạc tại vị trí đắc địa Hà Đông, Hà Nội với thiết kế hiện đại và đầy đủ tiện ích.</p>
      <p>Với tổng diện tích 12.5 ha, dự án bao gồm 4 tòa nhà cao tầng với 575 căn hộ cao cấp.</p>
      <p>Anland Premium được thiết kế theo phong cách hiện đại, tích hợp đầy đủ các tiện ích nội khu như hồ bơi, khu vui chơi trẻ em, gym, spa...</p>
    `,
    facilities: [
      "Hồ bơi ngoài trời",
      "Phòng gym hiện đại",
      "Khu vui chơi trẻ em",
      "Sân tennis",
      "Khu BBQ",
      "Spa & Sauna",
      "Hầm để xe",
      "An ninh 24/7",
      "Thang máy cao tốc",
      "Hệ thống PCCC",
      "Khu thương mại",
      "Trường mầm non",
    ],
    specifications: {
      "Tổng diện tích": "12.5 ha",
      "Số tòa nhà": "4 tòa",
      "Tổng số căn": "575 căn",
      "Mật độ xây dựng": "25%",
      "Chiều cao": "25 tầng",
      "Năm khởi công": "2018",
      "Năm hoàn thiện": "2020",
      "Chủ đầu tư": "Nam Cường Group",
      "Đơn vị thi công": "Coteccons",
      "Đơn vị thiết kế": "Nikken Sekkei",
      "Hướng chính": "Đông Nam",
      "Loại hình": "Căn hộ chung cư",
    },
    locationInsights: {
      schools: [
        { name: "Trường THPT Hà Đông", distance: "500m" },
        { name: "Trường ĐH Thủy Lợi", distance: "1.2km" },
        { name: "Trường mầm non Sao Mai", distance: "300m" },
      ],
      hospitals: [
        { name: "Bệnh viện Hà Đông", distance: "800m" },
        { name: "Phòng khám Đa khoa Medlatec", distance: "1.5km" },
      ],
      supermarkets: [
        { name: "BigC Hà Đông", distance: "1km" },
        { name: "Vinmart Tố Hữu", distance: "400m" },
        { name: "Metro Cash & Carry", distance: "2km" },
      ],
      parks: [
        { name: "Công viên Hà Đông", distance: "600m" },
        { name: "Công viên Chu Văn An", distance: "1.8km" },
      ],
      restaurants: [
        { name: "KFC Hà Đông", distance: "800m" },
        { name: "Lotteria Tố Hữu", distance: "500m" },
        { name: "Pizza Hut", distance: "1.2km" },
      ],
    },
    faqs: [
      {
        question: "Dự án có những loại căn hộ nào?",
        answer:
          "Dự án có các loại căn hộ từ 1-3 phòng ngủ với diện tích từ 45m² đến 120m², phù hợp với nhu cầu của nhiều gia đình khác nhau.",
      },
      {
        question: "Chính sách bảo hành của dự án như thế nào?",
        answer:
          "Chủ đầu tư cam kết bảo hành kết cấu 10 năm, hoàn thiện 24 tháng và thiết bị 12 tháng theo quy định của pháp luật.",
      },
      {
        question: "Có chỗ đậu xe không?",
        answer:
          "Dự án có hầm đỗ xe riêng biệt với đủ chỗ đậu cho tất cả các căn hộ, đảm bảo an toàn và thuận tiện.",
      },
    ],
  },
};

export function ProjectDetail({ projectSlug }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showMoreFacilities, setShowMoreFacilities] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const projectData = MOCK_PROJECTS[projectSlug];

        if (!projectData) {
          notFound();
          return;
        }

        setProject(projectData);
      } catch (error) {
        console.error("Error fetching project:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectSlug]);

  // Loading state
  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading Skeleton */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>

              {/* Gallery Skeleton */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>

              {/* Quick Info Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const favoriteItem = {
    id: project.id,
    type: "project" as const,
    title: project.name,
    price: project.priceRange,
    location: project.fullLocation,
    image: project.images?.[0] || "/images/default-project.jpg",
    slug: project.slug,
    area: project.area,
    totalUnits: project.totalUnits,
    developer: project.developer?.name || "N/A",
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Dự án", href: "/du-an" },
    {
      label: project.fullLocation.split(", ")[1] || "Thành phố",
      href: "/du-an",
    },
    { label: project.name, href: "#", isActive: true },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    document.getElementById(tabId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang cập nhật":
        return "bg-blue-100 text-blue-600";
      case "Sắp mở bán":
        return "bg-orange-100 text-orange-600";
      case "Đã bàn giao":
        return "bg-green-100 text-green-600";
      case "Đang bán":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {project.address}.
                <button
                  onClick={() => handleTabClick("location")}
                  className="text-blue-600 hover:text-blue-700 ml-1"
                >
                  Xem bản đồ
                </button>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <FavoriteButton item={favoriteItem} />
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <i className="fas fa-share-alt"></i>
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>

          {/* Project Gallery */}
          <ProjectGallery
            images={project.images || []}
            videos={project.videos}
            title={project.name}
          />

          {/* Status Badge */}
          <div className="mt-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                project.status
              )}`}
            >
              {project.status}
            </span>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {project.totalUnits}
              </div>
              <div className="text-sm text-gray-500">căn hộ</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {project.area}
              </div>
              <div className="text-sm text-gray-500">diện tích</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {project.numberOfTowers}
              </div>
              <div className="text-sm text-gray-500">tòa</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {project.density}
              </div>
              <div className="text-sm text-gray-500">mật độ xây dựng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              {
                id: "listings",
                label: "Bán & Cho thuê",
                subtitle: "Danh sách tin rao",
              },
              {
                id: "info",
                label: "Tổng quan",
                subtitle: "Giới thiệu về dự án",
              },
              { id: "location", label: "Vị trí", subtitle: "Bản đồ dự án" },
              {
                id: "payment",
                label: "Ước tính khoản vay",
                subtitle: "Hỗ trợ tính lãi suất",
              },
              {
                id: "faq",
                label: "Câu hỏi thường gặp",
                subtitle: "Hỗ trợ thắc mắc",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="text-sm font-medium">{tab.label}</div>
                <div className="text-xs text-gray-400">{tab.subtitle}</div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Listings */}
            <section id="listings">
              <ProjectListings
                projectId={project.id}
                projectName={project.name}
              />
            </section>

            {/* Project Overview */}
            <section id="info" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Tổng quan {project.name}
              </h2>

              {/* Specifications Table */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(project.specifications || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b"
                      >
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  )}
                </div>

                {/* Toggle More Info */}
                <button
                  onClick={() => setShowMoreInfo(!showMoreInfo)}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
                >
                  {showMoreInfo ? "Thu gọn" : "Thông tin chi tiết"}
                  <i
                    className={`fas fa-chevron-${
                      showMoreInfo ? "up" : "down"
                    } ml-1`}
                  ></i>
                </button>

                {showMoreInfo && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(project.specifications || {}).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between py-2">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: project.description || "",
                  }}
                />
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tiện ích</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(project.facilities || [])
                    .slice(0, showMoreFacilities ? undefined : 8)
                    .map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <i className="fas fa-check-circle text-green-500 text-sm"></i>
                        <span className="text-sm">{facility}</span>
                      </div>
                    ))}
                </div>

                {(project.facilities || []).length > 8 && (
                  <button
                    onClick={() => setShowMoreFacilities(!showMoreFacilities)}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {showMoreFacilities
                      ? "Thu gọn"
                      : `Xem thêm ${
                          (project.facilities || []).length - 8
                        } tiện ích`}
                    <i
                      className={`fas fa-chevron-${
                        showMoreFacilities ? "up" : "down"
                      } ml-1`}
                    ></i>
                  </button>
                )}
              </div>
            </section>

            {/* Location & Map */}
            <section
              id="location"
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-4">
                Vị trí dự án {project.name}
              </h2>
              <ProjectMap
                latitude={project.latitude}
                longitude={project.longitude}
                title={project.name}
                address={project.fullLocation}
                locationInsights={project.locationInsights}
              />
            </section>

            {/* Payment Calculator */}
            <section id="payment">
              <ProjectPaymentCalculator />
            </section>

            {/* FAQ */}
            <section id="faq">
              <ProjectFAQ
                faqs={project.faqs || []}
                projectName={project.name}
              />
            </section>

            {/* Related Projects */}
            <RelatedProjects currentProjectId={project.id} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <ContactBox
                developer={project.developer}
                projectId={project.id}
                projectName={project.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
