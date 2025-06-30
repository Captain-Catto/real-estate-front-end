"use client";
import { useState, Fragment, useRef, useEffect, useCallback } from "react";
import { Transition, Dialog } from "@headlessui/react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import { useEditPostModal } from "@/hooks/useEditPostModal";
import EditPostModal from "@/components/modals/EditPostModal/EditPostModal";
import UserHeader from "@/components/user/UserHeader";
import { postService } from "@/services/postsService";
import { useAuth } from "@/store/hooks";
import { useRouter } from "next/navigation";

export default function QuanLyTinPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const editModal = useEditPostModal();

  // Mock user data
  const userData = {
    name: "Lê Quang Trí Đạt",
    avatar: "Đ",
    balance: "0 đ",
    greeting: "Chào buổi sáng 🌤",
  };

  // State cho post
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho notification popup
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);
  const desktopNotificationRef = useRef<HTMLDivElement>(null);
  const [activeNotificationTab, setActiveNotificationTab] = useState("ALL");

  // State cho search và filter
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("0");
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // State cho các filter mới
  const [filterType, setFilterType] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("7");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // State cho delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deletePostTitle, setDeletePostTitle] = useState<string>("");

  // Tự động đẩy về login nếu chưa đăng nhập
  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  // Handle edit post
  const handleEditPost = (post: any) => {
    editModal.openModal(post);
  };

  // Handle delete post
  const handleDeletePost = (postId: string, postTitle: string) => {
    setDeletePostId(postId);
    setDeletePostTitle(postTitle);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!deletePostId) return;
    // Thực tế sẽ gọi API để xóa tin đăng
    setShowDeleteModal(false);
    setDeletePostId(null);
    setDeletePostTitle("");
    // Có thể reload data hoặc update state
  };

  // Filter options với count thực tế
  const filterOptions = [
    { id: "all", label: "Tất cả", count: posts.length },
    {
      id: "active",
      label: "Đang hiển thị",
      count: posts.filter((p) => p.status === "active").length,
    },
    {
      id: "pending",
      label: "Chờ duyệt",
      count: posts.filter((p) => p.status === "pending").length,
    },
    {
      id: "inactive",
      label: "Hết hạn",
      count: posts.filter((p) => p.status === "inactive").length,
    },
    {
      id: "denied",
      label: "Không duyệt",
      count: posts.filter((p) => p.status === "denied").length,
    },
    {
      id: "removed",
      label: "Đã hạ",
      count: posts.filter((p) => p.status === "removed").length,
    },
  ];

  // Filter posts based on current filters
  const filteredPosts = posts.filter((post) => {
    // Filter by status
    if (activeFilter !== "all" && post.status !== activeFilter) {
      return false;
    }
    // Filter by type
    if (filterType !== "all" && post.type !== filterType) {
      return false;
    }
    // Filter by search
    if (
      searchValue &&
      !post.title?.toLowerCase().includes(searchValue.toLowerCase()) &&
      !post._id?.toLowerCase().includes(searchValue.toLowerCase())
    ) {
      return false;
    }
    // Filter by date range
    const postDate = new Date(post.createdAt);
    const now = new Date();
    if (filterDateRange === "7") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (postDate < sevenDaysAgo) return false;
    } else if (filterDateRange === "30") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (postDate < thirtyDaysAgo) return false;
    } else if (
      filterDateRange === "custom" &&
      customStartDate &&
      customEndDate
    ) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      if (postDate < startDate || postDate > endDate) return false;
    }
    return true;
  });

  // Type options
  const typeOptions = [
    { id: "all", label: "Tất cả loại tin" },
    { id: "ban", label: "Tin bán" },
    { id: "cho-thue", label: "Tin cho thuê" },
  ];

  // Date range options
  const dateRangeOptions = [
    { id: "7", label: "7 ngày qua" },
    { id: "30", label: "30 ngày qua" },
    { id: "custom", label: "Tùy chọn" },
  ];

  // Lấy bài viết từ API khi load trang
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    PostService.getUserPosts(1, 50)
      .then((res) => {
        const apiPosts = res.data?.posts || res.posts || res.data || [];
        if (!ignore) setPosts(apiPosts);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Lỗi khi tải bài viết");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Handle click outside để đóng popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Kiểm tra notification refs
      const clickedInsideMobile =
        mobileNotificationRef.current?.contains(target);
      const clickedInsideDesktop =
        desktopNotificationRef.current?.contains(target);

      if (!clickedInsideMobile && !clickedInsideDesktop) {
        setShowNotificationPopup(false);
      }

      // Kiểm tra filter ref
      const clickedInsideFilter = filterRef.current?.contains(target);
      if (!clickedInsideFilter && !showFilterModal) {
        setShowFilterPopup(false);
      }
    };

    if (showNotificationPopup || showFilterPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationPopup, showFilterPopup, showFilterModal]);

  // Handle apply filters
  const handleApplyFilters = () => {
    setShowFilterPopup(false);
    setShowFilterModal(false);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setActiveFilter("0");
    setFilterType("all");
    setFilterDateRange("7");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  // Handle filter button click
  const handleFilterClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isMobile = window.innerWidth < 640;

      if (isMobile) {
        setShowFilterModal(!showFilterModal);
      } else {
        setShowFilterPopup(!showFilterPopup);
      }
    },
    [showFilterModal, showFilterPopup]
  );

  // Map trạng thái sang label và màu
  const getStatusLabelAndColor = (statusId: string) => {
    const statusMap: Record<string, { label: string; colorClass: string }> = {
      active: {
        label: "Đang hiển thị",
        colorClass: "bg-green-100 text-green-800",
      },
      pending: {
        label: "Chờ duyệt",
        colorClass: "bg-yellow-100 text-yellow-800",
      },
      denied: { label: "Không duyệt", colorClass: "bg-red-100 text-red-800" },
      inactive: { label: "Hết hạn", colorClass: "bg-gray-100 text-gray-800" },
      removed: { label: "Đã hạ", colorClass: "bg-gray-100 text-gray-600" },
    };
    return (
      statusMap[statusId] || {
        label: "Không xác định",
        colorClass: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (!isInitialized) {
    // Có thể show spinner hoặc loading UI
    return <div>Đang kiểm tra đăng nhập...</div>;
  }

  if (!user) {
    return null;
  }

  // Filter Content Component
  const FilterContent = ({
    onClose,
    isModal = false,
  }: {
    onClose?: () => void;
    isModal?: boolean;
  }) => (
    <div className={`${isModal ? "flex flex-col h-full" : ""}`}>
      {/* Scrollable Content */}
      <div
        className={`${
          isModal ? "flex-1 overflow-y-auto" : "max-h-96 overflow-y-auto"
        } p-4`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Bộ lọc tin đăng
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Đặt lại
          </button>
        </div>

        {/* Loại tin */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Loại tin</h4>
          <div className="space-y-2">
            {typeOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="type"
                  value={option.id}
                  checked={filterType === option.id}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Ngày đăng */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Ngày đăng</h4>
          <div className="space-y-2">
            {dateRangeOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="dateRange"
                  value={option.id}
                  checked={filterDateRange === option.id}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>

          {/* Custom Date Range */}
          {filterDateRange === "custom" && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Trạng thái tin */}
        <div className={`${isModal ? "mb-0" : "mb-6"}`}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Trạng thái tin
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filterOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="status"
                  value={option.id}
                  checked={activeFilter === option.id}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option.label} ({option.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div
        className={`${
          isModal
            ? "border-t border-gray-200 p-4"
            : "border-t border-gray-200 p-4"
        } bg-white ${isModal ? "rounded-none" : "rounded-b-lg"}`}
      >
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (onClose) onClose();
              setShowFilterPopup(false);
              setShowFilterModal(false);
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex">
        {/* Sidebar - Hide on mobile and tablet */}
        <div className="w-24 min-h-screen p-4 hidden lg:block">
          <UserSidebar />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow w-full">
          {/* Header Section - Chỉ sử dụng UserHeader component */}
          <UserHeader
            userData={userData}
            showNotificationButton={true}
            showWalletButton={true}
          />

          {/* Content Area - Quản lý tin đăng */}
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Quản lý tin đăng
              </h1>
              <p className="text-sm text-gray-600">
                Quản lý tất cả tin đăng bất động sản của bạn
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-gray-400"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="square"
                          strokeWidth="2"
                          d="m20 20-3.95-3.95M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Nhập mã tin hoặc tiêu đề tin"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Filter Button */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={handleFilterClick}
                    type="button"
                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-gray-600"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2 3.83333C2 2.82081 2.82081 2 3.83333 2H12.1667C13.1792 2 14 2.82081 14 3.83333V4.78105C14 5.26728 13.8068 5.73359 13.463 6.07741L10.2441 9.29636C10.0878 9.45264 10 9.6646 10 9.88562V13.3333C10 13.5579 9.85023 13.755 9.63382 13.8151L6.63382 14.6484C6.48327 14.6902 6.32183 14.6593 6.19744 14.5647C6.07304 14.4702 6 14.3229 6 14.1667V9.88562C6 9.66461 5.9122 9.45264 5.75592 9.29636L2.53697 6.07741C2.19315 5.73359 2 5.26728 2 4.78105V3.83333ZM3.83333 3C3.3731 3 3 3.3731 3 3.83333V4.78105C3 5.00206 3.0878 5.21402 3.24408 5.3703L6.46303 8.58926C6.80685 8.93307 7 9.39939 7 9.88562V13.5088L9 12.9533V9.88562C9 9.39939 9.19315 8.93307 9.53697 8.58926L12.7559 5.3703C12.9122 5.21402 13 5.00206 13 4.78105V3.83333C13 3.3731 12.6269 3 12.1667 3H3.83333Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="hidden sm:inline">Bộ lọc</span>
                    <span className="sm:hidden">Lọc</span>
                  </button>

                  {/* Desktop Filter Dropdown */}
                  <Transition
                    show={showFilterPopup}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20 hidden sm:block">
                      <FilterContent />
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            {/* Filter Tags - Hidden on mobile */}
            <div className="mb-6 hidden sm:block">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveFilter(option.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === option.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div>Đang tải bài viết...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => {
                  const statusInfo = getStatusLabelAndColor(post.status);
                  return (
                    <div
                      key={post._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full lg:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 text-sm">
                            Hình ảnh
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div>
                              <Link
                                href={`/tin-dang/${post.id}`}
                                className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer block"
                              >
                                {" "}
                                {post.title}
                              </Link>{" "}
                              <p className="text-sm text-gray-600">
                                Mã tin: {post._id}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.colorClass}`}
                              >
                                {statusInfo.label}
                              </span>
                              {post.featured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  Nổi bật
                                </span>
                              )}
                            </div>
                          </div>

                          {/* THÊM PHẦN HIỂN THỊ LÝ DO KHÔNG DUYỆT */}
                          {post.status === "denied" && post.rejectionReason && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="text-red-600 mt-0.5 flex-shrink-0"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                  />
                                  <path
                                    fill="currentColor"
                                    d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                                  />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-red-800 mb-1">
                                    Lý do không duyệt:
                                  </h4>
                                  <p className="text-sm text-red-700 leading-relaxed">
                                    {post.rejectionReason}
                                  </p>
                                  {post.rejectionDate && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Ngày từ chối:{" "}
                                      {new Date(
                                        post.rejectionDate
                                      ).toLocaleDateString("vi-VN")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Giá:</span>{" "}
                              {post.price}
                            </div>
                            <div>
                              <span className="font-medium">Diện tích:</span>{" "}
                              {post.area}
                            </div>
                            <div>
                              <span className="font-medium">Lượt xem:</span>{" "}
                              {post.views}
                            </div>
                            <div>
                              <span className="font-medium">Hết hạn:</span>{" "}
                              {new Date(post.expiryDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Địa chỉ:</span>{" "}
                              {post.location.street}, {post.location.ward},{" "}
                              {post.location.district}, {post.location.province}
                            </p>

                            <div className="flex gap-2">
                              {post.status === "denied" ? (
                                <>
                                  <button
                                    onClick={() => handleEditPost(post)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Chỉnh sửa & Đăng lại
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeletePost(post._id, post.title)
                                    }
                                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                  >
                                    Xóa tin
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditPost(post)}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeletePost(post._id, post.title)
                                    }
                                    className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                                  >
                                    Xóa
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Add Edit Modal */}
                            <EditPostModal
                              isOpen={editModal.isOpen}
                              onClose={editModal.closeModal}
                              currentStep={editModal.currentStep}
                              editingPost={editModal.editingPost}
                              formData={editModal.formData}
                              selectedImages={editModal.selectedImages}
                              selectedPackage={editModal.selectedPackage}
                              nextStep={editModal.nextStep}
                              prevStep={editModal.prevStep}
                              updateFormData={editModal.updateFormData}
                              setSelectedImages={editModal.setSelectedImages}
                              setSelectedPackage={editModal.setSelectedPackage}
                              handleSubmit={editModal.handleSubmit}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="mb-4">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mx-auto text-gray-400"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchValue || activeFilter !== "0" || filterType !== "all"
                    ? "Không tìm thấy kết quả"
                    : "Chưa có tin đăng nào"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchValue || activeFilter !== "0" || filterType !== "all"
                    ? "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Bạn chưa có tin đăng nào. Hãy tạo tin đăng đầu tiên để bắt đầu bán hoặc cho thuê bất động sản."}
                </p>
                <Link href="/nguoi-dung/dang-tin">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Đăng tin ngay
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <Dialog
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        className="relative z-50 sm:hidden"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-end justify-center">
          <Dialog.Panel className="w-full bg-white rounded-t-xl shadow-xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Bộ lọc tin đăng
              </Dialog.Title>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-500"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto">
              <FilterContent
                onClose={() => setShowFilterModal(false)}
                isModal={true}
              />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL - ĐƠN GIẢN */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-red-600"
                >
                  <path
                    fill="currentColor"
                    d="M7 21q-.825 0-1.413-.588T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.588 1.413T17 21H7ZM17 6H7v13h10V6ZM9 17h2V8H9v9Zm4 0h2V8h-2v9ZM7 6v13V6Z"
                  />
                </svg>
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Xác nhận xóa tin đăng
                </Dialog.Title>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Bạn có chắc chắn muốn xóa tin đăng này không?
              </p>
              <p className="text-sm text-gray-800 font-medium bg-gray-50 p-2 rounded">
                `&quot;`{deletePostTitle}`&quot;`
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
              >
                Xóa tin đăng
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          {/* Tổng quan */}
          <Link
            href="/nguoi-dung/tong-quan"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
              />
            </svg>
            <span className="text-xs font-medium">Tổng quan</span>
          </Link>

          {/* Quản lý tin */}
          <Link
            href="/nguoi-dung/quan-ly-tin-rao-ban-cho-thue"
            className="flex flex-col items-center py-2 px-1 text-blue-600 bg-blue-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25zm8.14 2.452a.75.75 0 1 0-1.2-.9L8.494 9.23l-.535-.356a.75.75 0 1 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.668.048a.75.75 0 1 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-2.668 5.953a.75.75 0 1 0-1.2-.9l-1.446 1.928-.535-.356a.75.75 0 0 0-.832 1.248l1.125.75a.75.75 0 0 0 1.016-.174zm2.61.047a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Quản lý</span>
          </Link>

          {/* Đăng tin */}
          <Link
            href="/nguoi-dung/dang-tin"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-1"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.75 2C8.16421 2 8.5 2.33579 8.5 2.75V7H12.75C13.1642 7 13.5 7.33579 13.5 7.75C13.5 8.16421 13.1642 8.5 12.75 8.5H8.5V12.75C8.5 13.1642 8.16421 13.5 7.75 13.5C7.33579 13.5 7 13.1642 7 12.75V8.5H2.75C2.33579 8.5 2 8.16421 2 7.75C2 7.33579 2.33579 7 2.75 7H7V2.75C7 2.33579 7.33579 2 7.75 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs">Đăng tin</span>
          </Link>

          {/* Nạp tiền */}
          <Link
            href="/nap-tien"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
              />
            </svg>
            <span className="text-xs">Ví tiền</span>
          </Link>

          {/* Tài khoản */}
          <Link
            href="/nguoi-dung/tai-khoan"
            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <path
                fill="currentColor"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <span className="text-xs">Tài khoản</span>
          </Link>
        </div>
      </div>

      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
