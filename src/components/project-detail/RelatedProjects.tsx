"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProjectService } from "@/services/projectService";
import { Project } from "@/types/project";
import { showErrorToast } from "@/utils/errorHandler";

interface RelatedProjectsProps {
  currentProjectId: string;
  currentProjectLocation?: {
    provinceCode?: string;
    wardCode?: string;
  };
  currentProjectDeveloper?: string;
}

export function RelatedProjects({
  currentProjectId,
  currentProjectLocation,
  currentProjectDeveloper,
}: RelatedProjectsProps) {
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProjects = async () => {
      try {
        setLoading(true);

        console.log(
          "🔍 Fetching related projects for currentProjectId:",
          currentProjectId
        );
        console.log("📍 Current project location:", currentProjectLocation);
        console.log("🏢 Current project developer:", currentProjectDeveloper);

        let relatedProjectsResults: Project[] = [];

        // Strategy 1: Find projects by the same developer first
        if (currentProjectDeveloper) {
          console.log("🔍 Step 1: Finding projects by same developer...");
          try {
            // Try to find by developer ID first (more precise)
            const developerResponse =
              await ProjectService.getProjectsWithFilters({
                limit: 8,
                page: 1,
                status: "Đang bán", // Use correct Vietnamese status
              });

            const developerProjects = developerResponse.projects
              .filter((project) => project.id !== currentProjectId)
              .filter((project) => {
                // Check if developer matches by ID or name
                const projectDev = project.developer;
                if (!projectDev) return false;

                // If developer is populated object, check name
                if (typeof projectDev === "object" && projectDev.name) {
                  return projectDev.name
                    .toLowerCase()
                    .includes(currentProjectDeveloper.toLowerCase());
                }

                // If developer is string ID, compare directly
                if (typeof projectDev === "string") {
                  return projectDev === currentProjectDeveloper;
                }

                return false;
              });

            console.log(
              `✅ Found ${developerProjects.length} projects by same developer`
            );
            relatedProjectsResults = [...developerProjects];
          } catch (error) {
            console.warn("⚠️ Error fetching projects by developer:", error);
          }
        }

        // Strategy 2: If we don't have enough projects, find by location
        if (
          relatedProjectsResults.length < 4 &&
          currentProjectLocation?.provinceCode
        ) {
          console.log("🔍 Step 2: Finding projects by same location...");
          try {
            const locationResponse =
              await ProjectService.getProjectsWithFilters({
                limit: 8,
                page: 1,
                provinceCode: currentProjectLocation.provinceCode,
                status: "Đang bán", // Use correct Vietnamese status
              });

            const locationProjects = locationResponse.projects
              .filter((project) => project.id !== currentProjectId)
              .filter((project) => {
                // Exclude projects already found by developer
                return !relatedProjectsResults.some(
                  (existing) => existing.id === project.id
                );
              });

            console.log(
              `✅ Found ${locationProjects.length} additional projects by location`
            );
            relatedProjectsResults = [
              ...relatedProjectsResults,
              ...locationProjects,
            ];
          } catch (error) {
            console.warn("⚠️ Error fetching projects by location:", error);
          }
        }

        // Strategy 3: If still not enough, get any active projects
        if (relatedProjectsResults.length < 4) {
          console.log("🔍 Step 3: Finding any selling projects...");
          try {
            const fallbackResponse =
              await ProjectService.getProjectsWithFilters({
                limit: 6,
                page: 1,
                status: "Đang bán",
              });

            const fallbackProjects = fallbackResponse.projects
              .filter((project) => project.id !== currentProjectId)
              .filter((project) => {
                // Exclude projects already found
                return !relatedProjectsResults.some(
                  (existing) => existing.id === project.id
                );
              });

            console.log(
              `✅ Found ${fallbackProjects.length} fallback projects`
            );
            relatedProjectsResults = [
              ...relatedProjectsResults,
              ...fallbackProjects,
            ];
          } catch (error) {
            console.warn("⚠️ Error fetching fallback projects:", error);
          }
        }

        // Limit to 4 projects and prioritize by developer match
        const finalResults = relatedProjectsResults.slice(0, 4).sort((a, b) => {
          // Prioritize projects by same developer
          const aDeveloperMatch =
            currentProjectDeveloper &&
            ((typeof a.developer === "object" &&
              a.developer?.name
                ?.toLowerCase()
                .includes(currentProjectDeveloper.toLowerCase())) ||
              (typeof a.developer === "string" &&
                a.developer === currentProjectDeveloper));
          const bDeveloperMatch =
            currentProjectDeveloper &&
            ((typeof b.developer === "object" &&
              b.developer?.name
                ?.toLowerCase()
                .includes(currentProjectDeveloper.toLowerCase())) ||
              (typeof b.developer === "string" &&
                b.developer === currentProjectDeveloper));

          if (aDeveloperMatch && !bDeveloperMatch) return -1;
          if (!aDeveloperMatch && bDeveloperMatch) return 1;
          return 0;
        });

        setRelatedProjects(finalResults);
        console.log("✅ Final related projects count:", finalResults.length);
        console.log("📊 Related projects breakdown:", {
          byDeveloper: finalResults.filter(
            (p) =>
              currentProjectDeveloper &&
              ((typeof p.developer === "object" &&
                p.developer?.name
                  ?.toLowerCase()
                  .includes(currentProjectDeveloper.toLowerCase())) ||
                (typeof p.developer === "string" &&
                  p.developer === currentProjectDeveloper))
          ).length,
          byLocation: finalResults.filter(
            (p) =>
              p.location?.provinceCode ===
                currentProjectLocation?.provinceCode &&
              !(
                currentProjectDeveloper &&
                ((typeof p.developer === "object" &&
                  p.developer?.name
                    ?.toLowerCase()
                    .includes(currentProjectDeveloper.toLowerCase())) ||
                  (typeof p.developer === "string" &&
                    p.developer === currentProjectDeveloper))
              )
          ).length,
          others: finalResults.filter(
            (p) =>
              p.location?.provinceCode !==
                currentProjectLocation?.provinceCode &&
              !(
                currentProjectDeveloper &&
                ((typeof p.developer === "object" &&
                  p.developer?.name
                    ?.toLowerCase()
                    .includes(currentProjectDeveloper.toLowerCase())) ||
                  (typeof p.developer === "string" &&
                    p.developer === currentProjectDeveloper))
              )
          ).length,
        });
      } catch {
        showErrorToast("Không thể tải dự án liên quan");
        setRelatedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentProjectId) {
      fetchRelatedProjects();
    }
  }, [currentProjectId, currentProjectLocation, currentProjectDeveloper]);

  const getProjectImage = (project: Project): string => {
    console.log(`🔍 Processing images for project: ${project.name}`, {
      images: project.images,
      imageCount: project.images?.length || 0,
    });

    // Always use database images if available, even if they are placeholders
    if (project.images && project.images.length > 0) {
      // First, try to find a non-placeholder image
      const validImage = project.images.find(
        (img) =>
          img &&
          !img.includes("logo_placeholder") &&
          !img.includes("via.placeholder.com") &&
          !img.includes("placeholder")
      );

      if (validImage) {
        console.log(`✅ Found valid image for: ${project.name}`, validImage);
        return validImage;
      }

      // If only placeholder images exist, use the first one from database
      const firstImage = project.images[0];
      console.log(
        `🖼️ Using database image (even if placeholder) for: ${project.name}`,
        firstImage
      );
      return firstImage;
    }

    console.log(
      `📷 No images found for project: ${project.name}, using fallback`
    );
    // Only use fallback if no images exist at all
    const seed = encodeURIComponent(project.name || "default");
    return `https://picsum.photos/seed/${seed}/400/300`;
  };

  const formatPrice = (priceRange: string) => {
    if (!priceRange) return "Liên hệ";
    return priceRange;
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Dự án liên quan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="bg-gray-300 h-48 w-full"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!relatedProjects.length) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Dự án liên quan
          </h2>
          <div className="text-center py-8">
            <p className="text-gray-500">
              Không có dự án liên quan nào được tìm thấy.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Dự án liên quan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProjects.map((project) => (
            <Link
              key={project.id}
              href={`/du-an/${project.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={getProjectImage(project)}
                  alt={project.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={(e) => {
                    showErrorToast(
                      `Không thể tải hình ảnh dự án: ${project.name}`
                    );
                    const target = e.target as HTMLImageElement;
                    const seed = encodeURIComponent(project.name || "fallback");
                    const fallbackUrl = `https://picsum.photos/seed/${seed}/400/300`;
                    console.log(`🔄 Setting fallback image:`, fallbackUrl);
                    target.src = fallbackUrl;
                  }}
                  onLoad={() => {
                    console.log(
                      `✅ Image loaded successfully for: ${project.name}`
                    );
                  }}
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>

                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  📍 {project.address || "Địa chỉ đang cập nhật"}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    {formatPrice(project.priceRange)}
                  </span>

                  {project.status && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {project.status}
                    </span>
                  )}
                </div>

                {project.developer?.name && (
                  <p className="text-xs text-gray-500 mt-2">
                    Chủ đầu tư: {project.developer.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/du-an"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem tất cả dự án
            <svg
              className="ml-2 w-4 h-4"
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
