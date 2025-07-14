"use client";
import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Breadcrumb } from "./Breadcrumb";
import { ProjectGallery } from "./ProjectGallery";
import ProjectMap from "./ProjectMap";
import ContactBox from "./ContactBox";
import { RelatedProjects } from "./RelatedProjects";
import { ProjectListings } from "./ProjectListings";
import { ProjectPaymentCalculator } from "./ProjectPaymentCalculator";
import { ProjectFAQ } from "./ProjectFAQ";
import { ProjectService } from "@/services/projectService";
import { Project } from "@/types/project";
import Header from "../header/Header";
import Footer from "../footer/Footer";

interface ProjectDetailProps {
  projectSlug: string;
}

// Status color helper
const getStatusColor = (status: string) => {
  switch (status) {
    case "Đang cập nhật":
      return "bg-gray-100 text-gray-600";
    case "Sắp mở bán":
      return "bg-yellow-100 text-yellow-600";
    case "Đã bàn giao":
      return "bg-green-100 text-green-600";
    case "Đang bán":
      return "bg-blue-100 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function ProjectDetail({ projectSlug }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showMoreFacilities, setShowMoreFacilities] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectData = await ProjectService.getProjectBySlug(projectSlug);

        if (!projectData) {
          notFound();
          return;
        }

        setProject(projectData);
      } catch (error) {
        console.error("Error fetching project:", error);
        setError("Có lỗi xảy ra khi tải thông tin dự án");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectSlug]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
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
        <Footer />
      </div>
    );
  }

  const favoriteItem = {
    id: project.id,
    type: "project" as const,
    title: project.name,
    price: project.priceRange,
    location: project.address || "",
    image:
      project.images && project.images.length > 0
        ? project.images[0]
        : "/images/default-project.jpg",
    slug: project.slug,
    area: project.area,
    totalUnits: project.totalUnits,
    developer: project.developer?.name || "N/A",
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Dự án", href: "/du-an" },
    {
      label: project.address?.split(", ")[1] || "Thành phố",
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

  return (
    <>
      <Header />
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
                  {project.address}
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
                  {project.totalUnits?.toLocaleString() || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Tổng số căn</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {project.area || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Diện tích</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {project.priceRange || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Khoảng giá</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {project.developer?.name || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Chủ đầu tư</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                {
                  id: "listings",
                  label: "Tin đăng trong dự án",
                  subtitle: `${project.totalUnits || 0} căn`,
                },
                {
                  id: "info",
                  label: "Thông tin tổng quan",
                  subtitle: "Chi tiết dự án",
                },
                {
                  id: "location",
                  label: "Vị trí & Tiện ích",
                  subtitle: "Bản đồ & xung quanh",
                },
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
                  <h3 className="text-lg font-medium mb-3">Thông số dự án</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(project.specifications || {}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b border-gray-100"
                        >
                          <span className="text-gray-600">{key}</span>
                          <span className="font-medium text-right">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Mô tả dự án</h3>
                  <div
                    className={`prose max-w-none ${
                      !showMoreInfo ? "line-clamp-3" : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: project.description || "Chưa có thông tin mô tả",
                    }}
                  />
                  {project.description && project.description.length > 200 && (
                    <button
                      onClick={() => setShowMoreInfo(!showMoreInfo)}
                      className="text-blue-600 hover:text-blue-700 mt-2 text-sm"
                    >
                      {showMoreInfo ? "Thu gọn" : "Xem thêm"}
                    </button>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {project.numberOfTowers && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Số tòa nhà</span>
                      <span className="font-medium">
                        {project.numberOfTowers}
                      </span>
                    </div>
                  )}
                  {project.density && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Mật độ xây dựng</span>
                      <span className="font-medium">{project.density}</span>
                    </div>
                  )}
                </div>

                {/* Facilities */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Tiện ích dự án</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(project.facilities || [])
                      .slice(0, showMoreFacilities ? undefined : 8)
                      .map((facility: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <i className="fas fa-check text-green-500"></i>
                          <span className="text-sm">{facility}</span>
                        </div>
                      ))}
                  </div>
                  {(project.facilities || []).length > 8 && (
                    <button
                      onClick={() => setShowMoreFacilities(!showMoreFacilities)}
                      className="text-blue-600 hover:text-blue-700 mt-4 text-sm flex items-center"
                    >
                      {showMoreFacilities
                        ? "Thu gọn"
                        : `Xem thêm +${
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
                />

                {/* Location Insights */}
                {project.locationInsights && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Tiện ích xung quanh
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(project.locationInsights).map(
                        ([type, items]) => {
                          if (!items || items.length === 0) return null;

                          const typeLabels = {
                            schools: {
                              label: "Trường học",
                              icon: "fa-graduation-cap",
                            },
                            hospitals: { label: "Y tế", icon: "fa-hospital" },
                            supermarkets: {
                              label: "Mua sắm",
                              icon: "fa-shopping-cart",
                            },
                            parks: { label: "Công viên", icon: "fa-tree" },
                            restaurants: {
                              label: "Ăn uống",
                              icon: "fa-utensils",
                            },
                          };

                          const typeInfo =
                            typeLabels[type as keyof typeof typeLabels];
                          if (!typeInfo) return null;

                          return (
                            <div
                              key={type}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <i
                                  className={`fas ${typeInfo.icon} mr-2 text-blue-500`}
                                ></i>
                                {typeInfo.label}
                              </h4>
                              <div className="space-y-2">
                                {items
                                  .slice(0, 3)
                                  .map((item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-sm"
                                    >
                                      <span className="text-gray-700">
                                        {item.name}
                                      </span>
                                      <span className="text-gray-500">
                                        {item.distance}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
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
              <div className="sticky top-35 space-y-6">
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
      <Footer />
    </>
  );
}
