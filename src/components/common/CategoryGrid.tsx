"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category, categoryService } from "@/services/categoryService";

interface CategoryGridProps {
  type: "property" | "project";
  title?: string;
  showAll?: boolean;
  className?: string;
}

export default function CategoryGrid({
  type,
  title,
  showAll = false,
  className = "",
}: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await categoryService.getByProjectType(
          type === "project"
        );
        // Filter active categories and sort by order
        const activeCategories = result
          .filter((cat) => cat.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  const getBaseUrl = () => {
    return type === "project" ? "/du-an" : "/mua-ban";
  };

  const displayCategories = showAll ? categories : categories.slice(0, 8);

  if (loading) {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayCategories.map((category) => (
          <Link
            key={category._id}
            href={`${getBaseUrl()}/${category.slug}`}
            className="group"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md hover:border-blue-300 transition-all duration-200 group-hover:bg-blue-50">
              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {category.name}
              </div>
              {category.description && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {category.description}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {!showAll && categories.length > 8 && (
        <div className="text-center mt-6">
          <Link
            href={getBaseUrl()}
            className="inline-flex items-center px-6 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            Xem tất cả danh mục
          </Link>
        </div>
      )}
    </div>
  );
}
