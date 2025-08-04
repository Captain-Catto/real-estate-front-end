"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { favoriteService } from "@/services/favoriteService";
import { useAuth, useFavorites } from "@/store/hooks";

// Create a global cache to store favorite status
const favoriteStatusCache: Record<
  string,
  { status: boolean; timestamp: number }
> = {};
const CACHE_EXPIRY = 60000; // 1 minute in milliseconds

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
  const { isAuthenticated, user } = useAuth();
  const { fetchUserFavorites } = useFavorites();
  const checkingRef = useRef(false);

  // Check if item is favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !user || checkingRef.current) return;

      // Check cache first
      const cachedStatus = favoriteStatusCache[item.id];
      if (cachedStatus && Date.now() - cachedStatus.timestamp < CACHE_EXPIRY) {
        setIsFavorited(cachedStatus.status);
        return;
      }

      checkingRef.current = true;

      try {
        // Thử tối đa 1 lần - reduced from 2 attempts
        const response = await favoriteService.checkFavoriteStatus(item.id);
        if (response?.success) {
          setIsFavorited(response.data.isFavorited);

          // Update cache
          favoriteStatusCache[item.id] = {
            status: response.data.isFavorited,
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
        // Không hiển thị lỗi cho người dùng
        // Mặc định là không favorite (false)
      } finally {
        checkingRef.current = false;
      }
    };

    checkFavoriteStatus();
  }, [item.id, isAuthenticated, user]);

  // THÊM MỚI: Lắng nghe sự kiện favorites-updated để cập nhật trạng thái
  useEffect(() => {
    const handleFavoritesUpdated = (event: CustomEvent) => {
      // Kiểm tra xem item này có phải là item vừa bị xóa không
      if (
        event.detail?.action === "remove" &&
        event.detail?.itemId === item.id
      ) {
        setIsFavorited(false);
        // Update cache
        favoriteStatusCache[item.id] = {
          status: false,
          timestamp: Date.now(),
        };
      }

      // If this is an add event for this item
      if (event.detail?.action === "add" && event.detail?.itemId === item.id) {
        setIsFavorited(true);
        // Update cache
        favoriteStatusCache[item.id] = {
          status: true,
          timestamp: Date.now(),
        };
      }
    };

    // Thêm event listener với type casting
    window.addEventListener(
      "favorites-updated",
      handleFavoritesUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "favorites-updated",
        handleFavoritesUpdated as EventListener
      );
    };
  }, [item.id]);

  const handleToggle = async (e?: React.MouseEvent) => {
    // Ngăn chặn event bubbling để không trigger parent click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu tin", {
        action: {
          label: "Đăng nhập",
          onClick: () => (window.location.href = "/dang-nhap"),
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Xóa khỏi danh sách yêu thích
        const response = await favoriteService.removeFromFavorites(item.id);
        if (response.success) {
          setIsFavorited(false);

          // Update cache
          favoriteStatusCache[item.id] = {
            status: false,
            timestamp: Date.now(),
          };

          // Toast notification
          toast.success("Đã xóa khỏi danh sách yêu thích", {
            description: `${item.title} đã được bỏ khỏi danh sách đã lưu`,
            icon: "💔",
          });

          // Gửi event với thông tin chi tiết
          window.dispatchEvent(
            new CustomEvent("favorites-updated", {
              detail: {
                action: "remove",
                itemId: item.id,
              },
            })
          );
        } else {
          throw new Error(response.message || "Có lỗi xảy ra");
        }
      } else {
        // Thêm vào danh sách yêu thích
        const response = await favoriteService.addToFavorites(item.id);
        if (response.success) {
          setIsFavorited(true);

          // Update cache
          favoriteStatusCache[item.id] = {
            status: true,
            timestamp: Date.now(),
          };

          // Toast notification
          toast.success("Đã thêm vào danh sách yêu thích", {
            description: `${item.title} đã được lưu vào danh sách của bạn`,
            icon: "❤️",
            action: {
              label: "Xem danh sách",
              onClick: () => (window.location.href = "/nguoi-dung/yeu-thich"),
            },
          });

          // Gửi event với thông tin chi tiết
          window.dispatchEvent(
            new CustomEvent("favorites-updated", {
              detail: {
                action: "add",
                itemId: item.id,
              },
            })
          );
        } else {
          throw new Error(response.message || "Có lỗi xảy ra");
        }
      }

      // Cập nhật danh sách yêu thích trong Redux - but don't wait for it
      fetchUserFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Không thể thực hiện thao tác", {
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
      });
    } finally {
      setIsLoading(false);
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
