"use client";

import { useAuth, useFavorites } from "@/store/hooks";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FavoriteItem } from "@/store/slices/favoritesSlices";
import {
  HeartIcon as HeartOutline,
  MapPinIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { formatPriceByType } from "@/utils/format";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";

export default function YeuThichPage() {
  const { user } = useAuth();
  const { favorites, loading, removeFavorite, fetchUserFavorites } =
    useFavorites();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price" | "title">("newest");
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Helper function to generate the correct URL for a property
  const generatePropertyUrl = (property: FavoriteItem) => {
    if (property.type === "project") {
      return `/du-an/${property.slug}`;
    }

    // For properties, extract province and ward from location string
    const locationParts = property.location.split(", ");

    // Make sure we have ward and province
    if (locationParts.length >= 2) {
      // Convert ward and province names to URL-friendly slugs
      // Remove diacritics (Vietnamese accents), convert to lowercase, replace spaces with hyphens
      const ward = locationParts[0]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^\w-]/g, ""); // Remove special characters

      const province = locationParts[1]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^\w-]/g, ""); // Remove special characters

      // Determine transaction type based on property type or title
      const isRental =
        property.propertyType?.toLowerCase()?.includes("thuê") ||
        property.title.toLowerCase().includes("cho thuê");

      const transactionType = isRental ? "cho-thue" : "mua-ban";

      // Fix for province name (ensure "dong-thap" not "ong-thap")
      const fixedProvince = province === "ong-thap" ? "dong-thap" : province;

      // Use ID and add property title as suffix for better SEO
      const propertyIdWithSuffix =
        property.id +
        "-" +
        property.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")
          .substring(0, 30); // Limit the length of the slug

      return `/${transactionType}/${fixedProvince}/${ward}/${propertyIdWithSuffix}`;
    }

    // Fallback if location format is unexpected
    return `/du-an/${property.slug}`;
  };

  useEffect(() => {
    if (user) {
      fetchUserFavorites();
    }
  }, [user, fetchUserFavorites]);

  console.log("Favorites data:", {
    favorites,
  });

  // Format price for display in the UI
  const formatPrice = (price: string) => {
    // Parse price to handle different formats
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d]/g, "")) || 0
        : Number(price) || 0;

    if (numericPrice === 0) return "Thỏa thuận";

    // Default to "ban" type if can't determine
    return formatPriceByType(numericPrice, "ban");
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    setIsRemoving(propertyId);

    // Hiển thị toast loading trước
    const loadingToast = toast.loading("Đang xóa khỏi danh sách yêu thích...");

    try {
      const result = await removeFavorite(propertyId);

      // Đảm bảo dismiss loading toast trước
      toast.dismiss(loadingToast);

      // Thêm delay nhỏ để đảm bảo loading toast đã dismiss
      setTimeout(() => {
        if (result) {
          // Hiển thị toast thành công
          toast.success("Đã xóa khỏi danh sách yêu thích", {
            duration: 3000, // 3 giây
          });
        } else {
          toast.error("Không thể xóa khỏi danh sách yêu thích", {
            duration: 3000,
          });
        }
      }, 100);
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      console.error("Error removing favorite:", error);

      // Thêm delay nhỏ cho error toast
      setTimeout(() => {
        toast.error("Không thể xóa khỏi danh sách yêu thích", {
          duration: 3000,
        });
      }, 100);
    } finally {
      setIsRemoving(null);
    }
  };

  // Filter and sort favorites - updated for real API data
  const filteredFavorites = favorites
    .filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "price":
          // Handle price comparison for string prices
          const priceA = parseFloat(a.price || "0");
          const priceB = parseFloat(b.price || "0");
          return priceB - priceA;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFavorites = filteredFavorites.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <HeartSolid className="h-8 w-8 text-red-500 mr-3" />
              Bất động sản yêu thích
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredFavorites.length} bất động sản trong danh sách yêu thích
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc địa điểm..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Items per page */}
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={6}>6 / trang</option>
              <option value={12}>12 / trang</option>
              <option value={24}>24 / trang</option>
              <option value={48}>48 / trang</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "price" | "title")
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price">Giá cao đến thấp</option>
              <option value="title">Tên A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFavorites.map((property) => (
              <Link
                href={generatePropertyUrl(property)}
                key={property.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow block"
              >
                <div className="relative">
                  <Image
                    src={
                      typeof property.image === "string"
                        ? property.image
                        : property.image[0] || "/placeholder.jpg"
                    }
                    alt={property.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    priority={false}
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation
                        e.stopPropagation(); // Stop event bubbling
                        handleRemoveFavorite(property.id);
                      }}
                      disabled={isRemoving === property.id}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isRemoving === property.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {property.title}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(property.price || "Liên hệ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <i className="fas fa-ruler-combined mr-1"></i>{" "}
                      {property.area}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-bed mr-1"></i>{" "}
                      {property.bedrooms || 0} PN
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-bath mr-1"></i>{" "}
                      {property.bathrooms || 0} WC
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className="text-xs text-gray-500">
                      Thêm vào:{" "}
                      {new Date(property.addedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="flex justify-center"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <HeartOutline className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm
              ? "Không tìm thấy kết quả"
              : "Chưa có bất động sản yêu thích"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Thử thay đổi từ khóa tìm kiếm"
              : "Hãy khám phá và thêm những bất động sản yêu thích của bạn"}
          </p>
          {!searchTerm && (
            <Link
              href="/du-an"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Khám phá bất động sản
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
