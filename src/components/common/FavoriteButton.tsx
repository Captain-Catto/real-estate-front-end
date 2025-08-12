"use client";
import React from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleFavoriteAsync,
  fetchFavoritesAsync,
  selectIsFavorited,
  selectFavoritesLoading,
} from "@/store/slices/favoritesSlices";

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
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();

  // Redux state selectors
  const isFavorited = useAppSelector(selectIsFavorited(item.id));
  const isLoading = useAppSelector(selectFavoritesLoading);

  const handleToggle = async (e?: React.MouseEvent) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validation
    if (!item?.id) {
      toast.error("Không thể thực hiện thao tác này", {
        description: "Thông tin bất động sản không hợp lệ",
      });
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu tin", {
        description: "Bạn cần đăng nhập để sử dụng tính năng này",
        action: {
          label: "Đăng nhập",
          onClick: () => (window.location.href = "/dang-nhap"),
        },
      });
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(
        isFavorited
          ? "Đang xóa khỏi danh sách yêu thích..."
          : "Đang thêm vào danh sách yêu thích..."
      );

      // Dispatch Redux action
      const result = await dispatch(toggleFavoriteAsync(item.id));

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (toggleFavoriteAsync.fulfilled.match(result)) {
        const { action } = result.payload;

        if (action === "removed") {
          toast.success("Đã xóa khỏi danh sách yêu thích", {
            duration: 3000,
          });
        } else if (action === "added") {
          toast.success("Đã thêm vào danh sách yêu thích", {
            duration: 3000,
          });
          // Fetch full favorites data to update the placeholder with real data
          dispatch(fetchFavoritesAsync(true)); // Force refresh after adding
        } else if (action === "already_exists") {
          toast.info("Tin này đã có trong danh sách yêu thích", {
            duration: 3000,
          });
          // Also fetch to ensure we have the complete data
          dispatch(fetchFavoritesAsync(false)); // Don't force refresh if already exists
        }
      } else {
        // Handle error
        const errorMessage = result.payload as string;
        toast.error("Không thể thực hiện thao tác", {
          description: errorMessage || "Đã xảy ra lỗi, vui lòng thử lại sau",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Không thể thực hiện thao tác", {
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
        duration: 3000,
      });
    }
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
          ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
          : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 border border-gray-200 shadow-sm"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isFavorited ? "Bỏ lưu tin" : "Lưu tin"}
      data-item-id={item.id}
    >
      <i className={`${isFavorited ? "fas" : "far"} fa-heart`}></i>
    </button>
  );
}
