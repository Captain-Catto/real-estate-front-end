"use client";
import React from "react";
import { useAppDispatch, useIsFavorite } from "@/store/hooks";
import { toggleFavorite, FavoriteItem } from "@/store/slices/favoritesSlices";

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, "addedAt">;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({
  item,
  className = "",
  showText = false,
  size = "md",
}: FavoriteButtonProps) {
  const dispatch = useAppDispatch();
  const isFavorite = useIsFavorite(item.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(item));
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const iconSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        ${
          isFavorite
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
        }
        shadow-md hover:shadow-lg
        ${className}
      `}
      title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    >
      <i
        className={`
        ${isFavorite ? "fas fa-heart" : "far fa-heart"} 
        ${iconSize[size]}
      `}
      ></i>
      {showText && (
        <span className="ml-1 text-xs font-medium">
          {isFavorite ? "Đã thích" : "Yêu thích"}
        </span>
      )}
    </button>
  );
}
