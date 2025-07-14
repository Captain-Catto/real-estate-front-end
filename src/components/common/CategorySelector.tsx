"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useCategories } from "@/hooks/useCategories";

interface CategorySelectorProps {
  value?: string;
  onChange: (categorySlug: string) => void;
  type: "property" | "project";
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function CategorySelector({
  value,
  onChange,
  type,
  placeholder = "Chọn danh mục",
  className = "",
  required = false,
  disabled = false,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { categories, loading } = useCategories({
    type,
    activeOnly: true,
    sortByOrder: true,
  });

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected category
  const selectedCategory = categories.find((cat) => cat.slug === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (categorySlug: string) => {
    onChange(categorySlug);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-left
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }
          ${isOpen ? "border-blue-500 ring-2 ring-blue-500" : ""}
        `}
      >
        <span className={selectedCategory ? "text-gray-900" : "text-gray-500"}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Đang tải...</div>
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="py-1">
                {filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => handleSelect(category.slug)}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between
                      ${
                        value === category.slug
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-900"
                      }
                    `}
                  >
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {category.description}
                        </div>
                      )}
                    </div>
                    {value === category.slug && (
                      <CheckIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy danh mục phù hợp"
                    : "Không có danh mục"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Required indicator */}
      {required && (
        <span className="absolute top-2 right-8 text-red-500 text-sm">*</span>
      )}
    </div>
  );
}
