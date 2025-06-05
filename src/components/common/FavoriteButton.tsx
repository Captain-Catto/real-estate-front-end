"use client";
import React, { useState, useEffect } from "react";

export interface FavoriteItem {
  id: string;
  type: "property" | "project";
  title: string;
  price: string;
  location: string;
  image: string;
  slug: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
}

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({
  item,
  className = "",
  size = "md",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if item is favorited on mount
  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorited(
      favorites.some((fav) => fav.id === item.id && fav.type === item.type)
    );
  }, [item.id, item.type]);

  const getFavorites = (): FavoriteItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("real-estate-favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveFavorites = (favorites: FavoriteItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("real-estate-favorites", JSON.stringify(favorites));
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      const favorites = getFavorites();
      const existingIndex = favorites.findIndex(
        (fav) => fav.id === item.id && fav.type === item.type
      );

      let newFavorites: FavoriteItem[];
      let newIsFavorited: boolean;

      if (existingIndex >= 0) {
        // Remove from favorites
        newFavorites = favorites.filter((_, index) => index !== existingIndex);
        newIsFavorited = false;
      } else {
        // Add to favorites
        newFavorites = [...favorites, item];
        newIsFavorited = true;
      }

      saveFavorites(newFavorites);
      setIsFavorited(newIsFavorited);

      // Show notification
      showNotification(newIsFavorited ? "Đã lưu tin" : "Đã bỏ lưu tin");
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string) => {
    // You can implement a toast notification here
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${
        sizeClasses[size]
      } rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
        isFavorited
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isFavorited ? "Bỏ lưu tin" : "Lưu tin"}
    >
      <i className={`${isFavorited ? "fas" : "far"} fa-heart`}></i>
    </button>
  );
}
