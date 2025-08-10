"use client";
import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "./Breadcrumb";
import { ProjectGallery } from "./ProjectGallery";
import { DisplayMap } from "../property-detail/DisplayMap";
import ContactBox from "./ContactBox";
import { RelatedProjects } from "./RelatedProjects";
import { ProjectListings } from "./ProjectListings";
import { ProjectPaymentCalculator } from "./ProjectPaymentCalculator";
import { ProjectFAQ } from "./ProjectFAQ";
import { ProjectDetailInfo } from "./ProjectDetailInfo";
import { ProjectLocationInfo } from "./ProjectLocationInfo";
import { ProjectService } from "@/services/projectService";
import { Project } from "@/types/project";
import { useLocationNames } from "@/hooks/useLocationNames";
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

  // Get location names for better display
  const { locationNames, loading: locationLoading } = useLocationNames(
    project?.location?.provinceCode,
    undefined, // không có district
    project?.location?.wardCode
  );

  // Build location display string with fallback logic
  const getLocationDisplay = () => {
    if (locationLoading) {
      return (
        <span className="flex items-center">
          <span className="animate-pulse bg-gray-200 h-4 w-32 rounded mr-2"></span>
          <span className="text-sm text-gray-500">(Đang tải vị trí...)</span>
        </span>
      );
    }

    // Hiển thị location đầy đủ: [address], [ward], [district], [province]
    const locationParts = [];

    // Thêm địa chỉ chi tiết nếu có (bao gồm cả "ahihi")
    if (project?.address) {
      locationParts.push(project.address);
    }

    // Thêm các cấp hành chính theo thứ tự ward -> province (không có district)
    if (locationNames.wardName) locationParts.push(locationNames.wardName);
    if (locationNames.provinceName)
      locationParts.push(locationNames.provinceName);

    if (locationParts.length > 0) {
      return locationParts.join(", ");
    }

    // Fallback: sử dụng fullLocationName từ API nếu có
    if (locationNames.fullLocationName) {
      return locationNames.fullLocationName;
    }

    // Final fallback: hiển thị mã vị trí để debug
    if (project?.location) {
      const { provinceCode, wardCode } = project.location;
      return `Mã vị trí: ${wardCode ? `${wardCode}, ` : ""}${
        provinceCode || "N/A"
      }`;
    }

    return "Địa chỉ chưa cập nhật";
  };

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("🔍 Fetching project with slug:", projectSlug);
        const projectData = await ProjectService.getProjectBySlug(projectSlug);

        console.log("✅ Fetched project data:", projectData);

        if (!projectData) {
          console.warn("❌ No project data returned for slug:", projectSlug);
          notFound();
          return;
        }

        console.log("📊 Project data details:", {
          id: projectData.id,
          name: projectData.name,
          slug: projectData.slug,
          hasLocation: !!projectData.location,
          locationCodes: projectData.location
            ? {
                provinceCode: projectData.location.provinceCode,
                wardCode: projectData.location.wardCode,
              }
            : null,
        });

        setProject(projectData);

        // Debug location data
        console.log("📍 Project location data:", {
          location: projectData.location,
          address: projectData.address,
        });
      } catch (error) {
        console.error("💥 Error fetching project:", error);
        setError("Có lỗi xảy ra khi tải thông tin dự án");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectSlug]);

  // Debug location names
  useEffect(() => {
    console.log("📍 Location names updated:", {
      locationNames,
      locationLoading,
      projectLocation: project?.location,
    });
  }, [locationNames, locationLoading, project?.location]);

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

  // Build dynamic breadcrumb based on project location
  const buildProjectBreadcrumb = () => {
    const items: Array<{ label: string; href: string; isActive?: boolean }> = [
      { label: "Trang chủ", href: "/" },
      { label: "Dự án", href: "/du-an" },
    ];

    // Only add location breadcrumbs if we have the names (not loading)
    if (!locationLoading) {
      // Add province level if available
      if (project.location?.provinceCode && locationNames.provinceName) {
        items.push({
          label: locationNames.provinceName,
          href: `/du-an?provinceCode=${project.location.provinceCode}`,
        });

        // Add ward level if available
        if (project.location?.wardCode && locationNames.wardName) {
          items.push({
            label: locationNames.wardName,
            href: `/du-an?provinceCode=${project.location.provinceCode}&wardCode=${project.location.wardCode}`,
          });
        }
      }
    }

    // Add project as final breadcrumb
    items.push({
      label: project.name,
      href: "#",
      isActive: true,
    });

    return items;
  };

  const breadcrumbItems = buildProjectBreadcrumb();

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
                <div className="text-gray-600 mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>{getLocationDisplay()}</span>
                  </div>
                  <button
                    onClick={() => handleTabClick("location")}
                    className="text-blue-600 hover:text-blue-700 ml-6 text-sm"
                  >
                    Xem bản đồ
                  </button>
                </div>
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
                  subtitle: `Xem tất cả tin đăng `,
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
              <section id="info">
                <ProjectDetailInfo project={project} />
              </section>

              {/* Location & Map */}
              <section id="location">
                <ProjectLocationInfo project={project} />

                {/* Map Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Bản đồ vị trí
                  </h3>
                  <DisplayMap
                    latitude={project.latitude}
                    longitude={project.longitude}
                    title={project.name}
                    address={project.address}
                  />
                </div>
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
              <RelatedProjects
                currentProjectId={project.id}
                currentProjectLocation={project.location}
                currentProjectDeveloper={project.developer?.name}
              />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
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
