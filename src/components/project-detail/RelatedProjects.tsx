"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";

interface RelatedProject {
  id: string;
  name: string;
  slug: string;
  location: string;
  priceRange: string;
  image: string;
  status: string;
  developer: string;
  totalUnits: number;
  completionYear: number;
  distance?: string;
}

interface RelatedProjectsProps {
  currentProjectId: string;
}

export function RelatedProjects({ currentProjectId }: RelatedProjectsProps) {
  const [projects, setProjects] = useState<RelatedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "nearby" | "developer" | "similar"
  >("nearby");

  useEffect(() => {
    const fetchRelatedProjects = async () => {
      setLoading(true);
      try {
        // Mock data - replace with real API call
        const mockProjects: RelatedProject[] = [
          {
            id: "2",
            name: "Vinhomes Ocean Park 3",
            slug: "vinhomes-ocean-park-3",
            location: "Hưng Yên",
            priceRange: "1.8 - 3.2 tỷ",
            image: "/images/project-2.jpg",
            status: "Đang bán",
            developer: "Vingroup",
            totalUnits: 5000,
            completionYear: 2025,
            distance: "2.5km",
          },
          {
            id: "3",
            name: "Ecopark Grand",
            slug: "ecopark-grand",
            location: "Hưng Yên",
            priceRange: "2.1 - 4.5 tỷ",
            image: "/images/project-3.jpg",
            status: "Sắp mở bán",
            developer: "Ecopark",
            totalUnits: 3200,
            completionYear: 2026,
            distance: "3.8km",
          },
          {
            id: "4",
            name: "Times City Park Hill",
            slug: "times-city-park-hill",
            location: "Hai Bà Trưng, Hà Nội",
            priceRange: "3.5 - 6.8 tỷ",
            image: "/images/project-4.jpg",
            status: "Đang bán",
            developer: "Vingroup",
            totalUnits: 2800,
            completionYear: 2024,
            distance: "12km",
          },
          {
            id: "5",
            name: "Sunshine City",
            slug: "sunshine-city",
            location: "Tây Hồ, Hà Nội",
            priceRange: "4.2 - 8.5 tỷ",
            image: "/images/project-5.jpg",
            status: "Đã bàn giao",
            developer: "Sunshine Group",
            totalUnits: 4500,
            completionYear: 2023,
            distance: "15km",
          },
        ];

        setTimeout(() => {
          setProjects(mockProjects);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching related projects:", error);
        setLoading(false);
      }
    };

    fetchRelatedProjects();
  }, [currentProjectId]);

  const getFilteredProjects = () => {
    switch (activeTab) {
      case "nearby":
        return projects
          .filter((p) => p.distance)
          .sort(
            (a, b) =>
              parseFloat(a.distance || "0") - parseFloat(b.distance || "0")
          );
      case "developer":
        return projects.filter((p) => p.developer === "Vingroup");
      case "similar":
        return projects.filter((p) => p.status === "Đang bán");
      default:
        return projects;
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredProjects = getFilteredProjects();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Dự án liên quan</h2>
        <Link
          href="/du-an"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Xem tất cả
          <i className="fas fa-arrow-right ml-1"></i>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: "nearby", label: "Lân cận", subtitle: "Cùng khu vực" },
          { key: "developer", label: "Cùng CĐT", subtitle: "Vingroup" },
          { key: "similar", label: "Tương tự", subtitle: "Cùng phân khúc" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3 px-4 rounded-md text-center transition-colors ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="text-sm font-medium">{tab.label}</div>
            <div className="text-xs text-gray-400">{tab.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-building text-gray-300 text-3xl mb-3"></i>
          <p className="text-gray-500">Không có dự án nào trong danh mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/du-an/${project.slug}`}
              className="group block"
            >
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                {/* Project Image */}
                <div className="relative h-48">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Distance Badge */}
                  {project.distance && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {project.distance}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>

                {/* Project Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {project.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
                    {project.location}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-red-600">
                      {project.priceRange}
                    </div>
                    <div className="text-sm text-gray-500">
                      {project.completionYear}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      <i className="fas fa-building mr-1"></i>
                      {project.totalUnits.toLocaleString()} căn
                    </span>
                    <span className="font-medium text-blue-600">
                      {project.developer}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* View More */}
      {filteredProjects.length > 0 && (
        <div className="text-center mt-6">
          <Link
            href="/du-an"
            className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>Xem thêm dự án</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      )}
    </div>
  );
}
