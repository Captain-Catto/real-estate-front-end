"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category, categoryService } from "@/services/categoryService";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface NavbarCategoriesProps {
  type: "property" | "project";
  className?: string;
}

export default function NavbarCategories({
  type,
  className = "",
}: NavbarCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

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

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Desktop Menu */}
      <div className="hidden lg:flex space-x-6">
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category._id}
            href={`${getBaseUrl()}/${category.slug}`}
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap"
          >
            {category.name}
          </Link>
        ))}
        {categories.length > 6 && (
          <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <span>Khác</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {categories.slice(6).map((category) => (
                  <Link
                    key={category._id}
                    href={`${getBaseUrl()}/${category.slug}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category._id}
              href={`${getBaseUrl()}/${category.slug}`}
              className="text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded hover:bg-gray-100"
            >
              {category.name}
            </Link>
          ))}
        </div>
        {categories.length > 8 && (
          <Link
            href={getBaseUrl()}
            className="block text-sm text-blue-600 hover:text-blue-800 mt-2 text-center"
          >
            Xem tất cả danh mục →
          </Link>
        )}
      </div>
    </div>
  );
}
