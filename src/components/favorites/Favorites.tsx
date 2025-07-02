"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  Fragment,
  useCallback,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/store/hooks";
import { clearFavorites, fetchFavorites } from "@/store/slices/favoritesSlices";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Pagination } from "@/components/common/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Transition, Dialog, Tab } from "@headlessui/react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import UserHeader from "../user/UserHeader";

// Sort options
const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_low", label: "Giá thấp đến cao" },
  { value: "price_high", label: "Giá cao đến thấp" },
  { value: "name_az", label: "Tên A-Z" },
  { value: "name_za", label: "Tên Z-A" },
];

// Items per page
const ITEMS_PER_PAGE = 5;

interface FavoritesWithSortProps {
  initialSort?: string;
}

export function Favorites({ initialSort = "newest" }: FavoritesWithSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { items, isLoading, fetchUserFavorites, removeFavorite } =
    useFavorites();
  const [activeTab, setActiveTab] = useState<"all" | "property" | "project">(
    "all"
  );
  const [sortBy, setSortBy] = useState(initialSort);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState({
    title: "",
    description: "",
  });
  // Add a flag to prevent excessive API calls
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Tạo bộ lọc theo loại sử dụng useMemo để tránh tính toán lại khi không cần thiết
  const propertyFavorites = useMemo(() => {
    return items.filter((item) => item.type === "property");
  }, [items]);

  const projectFavorites = useMemo(() => {
    return items.filter((item) => item.type === "project");
  }, [items]);

  // Refresh data khi mount component - with proper dependency control
  useEffect(() => {
    if (!initialFetchDone) {
      fetchUserFavorites();
      setInitialFetchDone(true);
    }
  }, [fetchUserFavorites, initialFetchDone]);

  // Reset to first page when tab or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortBy]);

  // Update URL when sort or tab changes - using a memoized function
  const updateURL = useCallback(
    (newSort: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSort !== "newest") {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }

      // Set tab in URL
      if (activeTab !== "all") {
        params.set("tab", activeTab);
      } else {
        params.delete("tab");
      }

      // Add page to URL if not on first page
      if (currentPage > 1) {
        params.set("page", currentPage.toString());
      } else {
        params.delete("page");
      }

      const newURL = params.toString() ? `?${params.toString()}` : "";
      router.push(`/nguoi-dung/yeu-thich${newURL}`, { scroll: false });
    },
    [activeTab, router, searchParams, currentPage]
  );

  // Kiểm tra tab từ URL khi component mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && (tabParam === "property" || tabParam === "project")) {
      setActiveTab(tabParam);
    }

    // Get page from URL
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
  }, [searchParams]);

  // Sort items function - memoized to prevent recalculation
  const sortItems = useCallback((items: any[], sortType: string) => {
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
  }, []);

  // Get filtered and sorted items
  const allFilteredItems = useMemo(() => {
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
  }, [
    activeTab,
    items,
    propertyFavorites,
    projectFavorites,
    sortBy,
    sortItems,
  ]);

  // Paginate the filtered items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allFilteredItems, currentPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(allFilteredItems.length / ITEMS_PER_PAGE);
  }, [allFilteredItems]);

  const handleSort = useCallback(
    (value: string) => {
      setSortBy(value);
      // Reset to page 1 when sorting changes
      setCurrentPage(1);
      // Update URL with new sort and reset page
      const params = new URLSearchParams(searchParams.toString());
      if (value !== "newest") {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      if (activeTab !== "all") {
        params.set("tab", activeTab);
      } else {
        params.delete("tab");
      }
      params.delete("page"); // Reset page when sort changes
      const newURL = params.toString() ? `?${params.toString()}` : "";
      router.push(`/nguoi-dung/yeu-thich${newURL}`, { scroll: false });
    },
    [activeTab, router, searchParams]
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab as "all" | "property" | "project");
      // Reset to page 1 when tab changes
      setCurrentPage(1);
      // Update URL with new tab and reset page
      const params = new URLSearchParams(searchParams.toString());
      if (sortBy !== "newest") {
        params.set("sort", sortBy);
      } else {
        params.delete("sort");
      }
      if (tab !== "all") {
        params.set("tab", tab);
      } else {
        params.delete("tab");
      }
      params.delete("page"); // Reset page when tab changes
      const newURL = params.toString() ? `?${params.toString()}` : "";
      router.push(`/nguoi-dung/yeu-thich${newURL}`, { scroll: false });
    },
    [sortBy, router, searchParams]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      // Update URL with new page
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        params.set("page", page.toString());
      } else {
        params.delete("page");
      }
      if (sortBy !== "newest") {
        params.set("sort", sortBy);
      }
      if (activeTab !== "all") {
        params.set("tab", activeTab);
      }
      const newURL = params.toString() ? `?${params.toString()}` : "";
      router.push(`/nguoi-dung/yeu-thich${newURL}`, { scroll: false });
    },
    [activeTab, router, searchParams, sortBy]
  );

  const handleClearAll = useCallback(() => {
    setConfirmMessage({
      title: "Xóa tất cả mục yêu thích",
      description:
        "Bạn có chắc chắn muốn xóa tất cả mục yêu thích? Hành động này không thể hoàn tác.",
    });
    setConfirmAction(() => () => {
      dispatch(clearFavorites());
      toast.success("Đã xóa tất cả mục yêu thích", {
        description: "Danh sách yêu thích của bạn đã được xóa.",
      });
    });
    setConfirmDialogOpen(true);
  }, [dispatch]);

  const handleClearByType = useCallback(
    (type: "property" | "project") => {
      const typeText = type === "property" ? "bất động sản" : "dự án";
      setConfirmMessage({
        title: `Xóa tất cả ${typeText} yêu thích`,
        description: `Bạn có chắc chắn muốn xóa tất cả ${typeText} khỏi danh sách yêu thích? Hành động này không thể hoàn tác.`,
      });
      setConfirmAction(() => () => {
        // Lọc ra các item thuộc type cần xóa và thực hiện xóa lần lượt
        const itemsToRemove = items.filter((item) => item.type === type);
        itemsToRemove.forEach((item) => {
          removeFavorite(item.id);
        });
        toast.success(`Đã xóa tất cả ${typeText}`, {
          description: `${typeText} đã được xóa khỏi danh sách yêu thích của bạn.`,
        });
      });
      setConfirmDialogOpen(true);
    },
    [items, removeFavorite]
  );

  const selectedSortOption = useMemo(
    () => sortOptions.find((option) => option.value === sortBy),
    [sortBy]
  );

  if (isLoading) {
    return <FavoritesLoadingSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Filter Tabs - Using Headless UI Tab */}
      <Tab.Group
        selectedIndex={
          activeTab === "all" ? 0 : activeTab === "property" ? 1 : 2
        }
        onChange={(index) =>
          handleTabChange(
            index === 0 ? "all" : index === 1 ? "property" : "project"
          )
        }
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500 flex items-center">
            <span className="mr-2">
              Tổng số {allFilteredItems.length} tin đăng
            </span>
          </div>

          {/* Sort Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500">
              {selectedSortOption?.label || "Mới nhất"}
              <svg
                className="w-5 h-5 ml-2 -mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          onClick={() => handleSort(option.value)}
                          className={`${active ? "bg-gray-100" : ""} ${
                            option.value === sortBy
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          } group flex items-center w-full px-4 py-2 text-sm text-left`}
                        >
                          {option.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Favorites content with pagination */}
        {allFilteredItems.length > 0 ? (
          <>
            {/* Display paginated items */}
            <div>
              {paginatedItems.map((item) => (
                <FavoriteCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination component */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showPages={5}
                  className="py-4"
                />
              </div>
            )}
          </>
        ) : (
          <FavoritesContent items={[]} isEmpty={true} type={activeTab} />
        )}

        {/* Confirm Dialog - Headless UI */}
        <Transition show={confirmDialogOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setConfirmDialogOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {confirmMessage.title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {confirmMessage.description}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setConfirmDialogOpen(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => {
                        confirmAction();
                        setConfirmDialogOpen(false);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </Tab.Group>
    </div>
  );
}

// Memoize the FavoritesContent component to prevent unnecessary re-renders
const FavoritesContent = React.memo(
  ({ items, isEmpty, type }: FavoritesContentProps) => {
    if (isEmpty) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <i className="far fa-heart text-gray-300 text-4xl mb-4 block"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {type === "all"
              ? "Chưa có mục yêu thích nào"
              : `Chưa có ${
                  type === "property" ? "bất động sản" : "dự án"
                } yêu thích nào`}
          </h3>
          <p className="text-gray-500 mb-6">
            Hãy thêm các{" "}
            {type === "all"
              ? "bất động sản hoặc dự án"
              : type === "property"
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
      );
    }

    return (
      <div>
        {items.map((item) => (
          <FavoriteCard key={item.id} item={item} />
        ))}
      </div>
    );
  }
);

// Memoize the FavoriteCard component
const FavoriteCard = React.memo(({ item }: { item: any }) => {
  return (
    <div className="border-b border-gray-100 mb-4 pb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-96 h-72 md:h-64">
          <Link
            href={`/${item.type === "project" ? "du-an" : "chi-tiet"}/${
              item.slug
            }`}
          >
            <div className="relative h-full w-full">
              <Image
                src={
                  typeof item.image === "string" ? item.image : item.image[0]
                }
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={(e) => {
                  // Fallback nếu ảnh lỗi
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />
            </div>
          </Link>

          {/* Type Badge */}
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 text-xs font-semibold uppercase">
            {item.type === "project" ? "VIP KIM CƯƠNG" : "VIP KIM CƯƠNG"}
          </div>
        </div>

        <div className="flex-1">
          <Link
            href={`/${item.type === "project" ? "du-an" : "chi-tiet"}/${
              item.slug
            }`}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase">
              {item.title ||
                "LIỀN KỀ 96M2 GIÁ 12,6 TỶ, ĐT 144M2 GIÁ 21,5 TỶ, BIỆT THỰ 228M2 GIÁ 36 TỶ"}
            </h3>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="text-red-600 font-bold text-lg">
              {item.price || "12,58 tỷ"}
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="font-medium">{item.area || "96 m²"}</span>
              <span>·</span>
              <span>{item.pricePerM2 || "131 tr/m²"}</span>
            </div>
          </div>

          <div className="flex items-center text-gray-600 mb-4">
            <i className="fas fa-map-marker-alt mr-2 text-xs"></i>
            <span className="text-sm">
              {item.location || "Đan Phượng, Hà Nội"}
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-4 line-clamp-2">
            {item.description ||
              "Quý khách hàng liên hệ sớm để được tư vấn chọn căn theo đúng nhu cầu. Liên hệ: 0942 906 ***. Chính sách bán hàng: Khách hàng không vay chiết khấu 12 - 14,5%. Thanh toán theo tiến độ chiết khấu 3,5%..."}
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden relative">
                <Image
                  src={item.agent?.avatar || "/images/agent-placeholder.png"}
                  alt={item.agent?.name || "Agent"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-sm font-medium">
                {item.agent?.name || "Thế Hùng"}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {item.postedTime || "Đăng hôm nay"}
            </div>
            <div className="ml-auto">
              <button className="flex items-center gap-1 text-sm font-medium text-blue-600 border border-blue-200 rounded-md px-3 py-2 hover:bg-blue-50">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
                </svg>
                0942 906 *** · Hiện số
              </button>
            </div>
            {/* Favorite Button */}
            <div>
              <FavoriteButton item={item} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Add displayNames for the memoized components
FavoritesContent.displayName = "FavoritesContent";
FavoriteCard.displayName = "FavoriteCard";

// Keep the interface and skeleton components as they were
interface FavoritesContentProps {
  items: any[];
  isEmpty: boolean;
  type: "all" | "property" | "project";
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

function FavoritesLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Title Skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>

      {/* Actions Row Skeleton */}
      <div className="flex justify-between mb-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-b border-gray-100 mb-4 pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-64 w-full md:w-96" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
