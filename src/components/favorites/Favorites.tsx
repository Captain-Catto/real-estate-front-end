"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites, useFavoritesByType } from "@/store/hooks";
import {
  clearFavorites,
  removeFavoritesByType,
} from "@/store/slices/favoritesSlices";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { useRouter, useSearchParams } from "next/navigation";

// Sort options
const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_low", label: "Giá thấp đến cao" },
  { value: "price_high", label: "Giá cao đến thấp" },
  { value: "name_az", label: "Tên A-Z" },
  { value: "name_za", label: "Tên Z-A" },
];

interface FavoritesWithSortProps {
  initialSort?: string;
}

export function Favorites({ initialSort = "newest" }: FavoritesWithSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { items, isLoading, dispatch } = useFavorites();
  const [activeTab, setActiveTab] = useState<"all" | "property" | "project">(
    "all"
  );
  const [sortBy, setSortBy] = useState(initialSort);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const propertyFavorites = useFavoritesByType("property");
  const projectFavorites = useFavoritesByType("project");

  // Update URL when sort changes
  const updateURL = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort !== "newest") {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }
    const newURL = params.toString() ? `?${params.toString()}` : "";
    router.push(`/tai-khoan/yeu-thich${newURL}`, { scroll: false });
  };

  // Sort items function
  const sortItems = (items: any[], sortType: string) => {
    const sortedItems = [...items];
    switch (sortType) {
      case "oldest":
        return sortedItems.sort(
          (a, b) =>
            new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        );
      case "price_low":
        return sortedItems.sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^0-9]/g, "") || "0");
          const priceB = parseFloat(b.price?.replace(/[^0-9]/g, "") || "0");
          return priceA - priceB;
        });
      case "price_high":
        return sortedItems.sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^0-9]/g, "") || "0");
          const priceB = parseFloat(b.price?.replace(/[^0-9]/g, "") || "0");
          return priceB - priceA;
        });
      case "name_az":
        return sortedItems.sort((a, b) => a.title.localeCompare(b.title));
      case "name_za":
        return sortedItems.sort((a, b) => b.title.localeCompare(a.title));
      default: // newest
        return sortedItems.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
    }
  };

  const filteredItems = () => {
    let items_to_filter;
    switch (activeTab) {
      case "property":
        items_to_filter = propertyFavorites;
        break;
      case "project":
        items_to_filter = projectFavorites;
        break;
      default:
        items_to_filter = items;
    }
    return sortItems(items_to_filter, sortBy);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    setIsDropdownOpen(false);
    updateURL(value);
  };

  const handleClearAll = () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả mục yêu thích?")) {
      dispatch(clearFavorites());
    }
  };

  const handleClearByType = (type: "property" | "project") => {
    const typeText = type === "property" ? "bất động sản" : "dự án";
    if (confirm(`Bạn có chắc chắn muốn xóa tất cả ${typeText} yêu thích?`)) {
      dispatch(removeFavoritesByType(type));
    }
  };

  const selectedSortOption = sortOptions.find(
    (option) => option.value === sortBy
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Danh sách yêu thích
        </h1>
        <p className="text-gray-600">
          Quản lý các bất động sản và dự án bạn quan tâm
        </p>
      </div>

      {/* Tabs and Sort */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("property")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "property"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Bất động sản ({propertyFavorites.length})
          </button>
          <button
            onClick={() => setActiveTab("project")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "project"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Dự án ({projectFavorites.length})
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full lg:w-48 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span>{selectedSortOption?.label}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
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
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full lg:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    option.value === sortBy
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {filteredItems().length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Hiển thị {filteredItems().length} mục yêu thích
          </div>
          <div className="flex items-center gap-2">
            {activeTab !== "all" && filteredItems().length > 0 && (
              <button
                onClick={() => handleClearByType(activeTab)}
                className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Xóa {activeTab === "property" ? "BĐS" : "dự án"}
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredItems().length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <i className="far fa-heart text-gray-300 text-4xl mb-4 block"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === "all"
              ? "Chưa có mục yêu thích nào"
              : `Chưa có ${
                  activeTab === "property" ? "bất động sản" : "dự án"
                } yêu thích nào`}
          </h3>
          <p className="text-gray-500 mb-6">
            Hãy thêm các{" "}
            {activeTab === "all"
              ? "bất động sản hoặc dự án"
              : activeTab === "property"
              ? "bất động sản"
              : "dự án"}{" "}
            bạn quan tâm vào danh sách yêu thích
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/mua-ban"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá bất động sản
            </Link>
            <Link
              href="/du-an"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xem dự án
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems().map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <Link
                  href={`/${item.type === "project" ? "du-an" : "chi-tiet"}/${
                    item.slug
                  }`}
                >
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Favorite Button */}
                <div className="absolute top-3 right-3">
                  <FavoriteButton item={item} />
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 text-xs rounded font-medium">
                  {item.type === "project" ? "Dự án" : "BĐS"}
                </div>
              </div>

              <div className="p-4">
                <Link
                  href={`/${item.type === "project" ? "du-an" : "chi-tiet"}/${
                    item.slug
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </Link>

                {item.price && (
                  <div className="text-red-600 font-semibold mb-2 text-lg">
                    {item.price}
                  </div>
                )}

                <div className="flex items-center text-gray-600 mb-3">
                  <i className="fas fa-map-marker-alt mr-1 text-xs"></i>
                  <span className="text-sm line-clamp-1">{item.location}</span>
                </div>

                {(item.area || item.bedrooms || item.bathrooms) && (
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {item.area && (
                      <span className="flex items-center">
                        <i className="fas fa-ruler-combined mr-1"></i>
                        {item.area}
                      </span>
                    )}
                    {item.bedrooms && (
                      <span className="flex items-center">
                        <i className="fas fa-bed mr-1"></i>
                        {item.bedrooms} PN
                      </span>
                    )}
                    {item.bathrooms && (
                      <span className="flex items-center">
                        <i className="fas fa-bath mr-1"></i>
                        {item.bathrooms} WC
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                  Đã thích: {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown overlay */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
