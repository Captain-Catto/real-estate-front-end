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

export function FavoritesPage() {
  const { items, isLoading, dispatch } = useFavorites();
  const [activeTab, setActiveTab] = useState<"all" | "property" | "project">(
    "all"
  );

  const propertyFavorites = useFavoritesByType("property");
  const projectFavorites = useFavoritesByType("project");

  const filteredItems = () => {
    switch (activeTab) {
      case "property":
        return propertyFavorites;
      case "project":
        return projectFavorites;
      default:
        return items;
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 w-fit">
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
                    <span className="text-sm line-clamp-1">
                      {item.location}
                    </span>
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
                    Đã thích:{" "}
                    {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
