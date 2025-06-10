"use client";
import { useState, Fragment, useRef, useEffect, useCallback } from "react";
import { Transition, Dialog } from "@headlessui/react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import UserSidebar from "@/components/user/UserSidebar";
import { useEditPostModal } from "@/hooks/useEditPostModal";
import EditPostModal from "@/components/modals/EditPostModal/EditPostModal";

// Mock data for posts
const mockPosts = [
  {
    id: "BDS001",
    title: "Bán căn hộ 2PN tại Vinhomes Central Park, Q. Bình Thạnh",
    type: "ban",
    status: "7", // Đang hiển thị
    price: "5.2 tỷ",
    area: "75m²",
    location: "Quận Bình Thạnh, TP.HCM",
    createdDate: "2025-06-08",
    expiryDate: "2025-07-08",
    views: 245,
    image: "/api/placeholder/300/200",
    featured: true,
  },
  {
    id: "BDS002",
    title: "Cho thuê biệt thự đơn lập Phú Mỹ Hưng, Q7",
    type: "cho-thue",
    status: "6", // Chờ hiển thị
    price: "35 triệu/tháng",
    area: "250m²",
    location: "Quận 7, TP.HCM",
    createdDate: "2025-06-09",
    expiryDate: "2025-07-09",
    views: 89,
    image: "/api/placeholder/300/200",
    featured: false,
  },
  {
    id: "BDS003",
    title: "Bán nhà mặt tiền đường Nguyễn Văn Cừ, Q5",
    type: "ban",
    status: "2", // Chờ duyệt
    price: "12.5 tỷ",
    area: "120m²",
    location: "Quận 5, TP.HCM",
    createdDate: "2025-06-10",
    expiryDate: "2025-07-10",
    views: 0,
    image: "/api/placeholder/300/200",
    featured: false,
  },
  {
    id: "BDS004",
    title: "Cho thuê căn hộ Studio The Gold View, Q4",
    type: "cho-thue",
    status: "10", // Sắp hết hạn
    price: "18 triệu/tháng",
    area: "45m²",
    location: "Quận 4, TP.HCM",
    createdDate: "2025-06-05",
    expiryDate: "2025-06-15",
    views: 156,
    image: "/api/placeholder/300/200",
    featured: true,
  },
  {
    id: "BDS005",
    title: "Bán đất nền dự án Saigon Mystery Villas, Q2",
    type: "ban",
    status: "8", // Hết hạn
    price: "85 triệu/m²",
    area: "200m²",
    location: "Quận 2, TP.HCM",
    createdDate: "2025-06-04",
    expiryDate: "2025-05-20",
    views: 324,
    image: "/api/placeholder/300/200",
    featured: false,
  },
  {
    id: "BDS006",
    title: "Cho thuê văn phòng cao cấp Bitexco Financial Tower",
    type: "cho-thue",
    status: "5", // Không duyệt
    price: "120 triệu/tháng",
    area: "500m²",
    location: "Quận 1, TP.HCM",
    createdDate: "2025-06-06",
    expiryDate: "2025-07-06",
    views: 67,
    image: "/api/placeholder/300/200",
    featured: false,
    rejectionReason:
      "Hình ảnh không rõ ràng, thiếu thông tin pháp lý về quyền sở hữu", // THÊM LÝ DO TỪ CHỐI
    rejectionDate: "2025-06-07", // THÊM NGÀY TỪ CHỐI
  },
  // THÊM MỘT BÀI ĐĂNG KHÔNG DUYỆT KHÁC
  {
    id: "BDS007",
    title: "Bán căn hộ chung cư Landmark 81, Q. Bình Thạnh",
    type: "ban",
    status: "5", // Không duyệt
    price: "15 tỷ",
    area: "120m²",
    location: "Quận Bình Thạnh, TP.HCM",
    createdDate: "2025-06-03",
    expiryDate: "2025-07-03",
    views: 23,
    image: "/api/placeholder/300/200",
    featured: false,
    rejectionReason:
      "Giá cả không phù hợp với thị trường, thiếu giấy tờ chứng minh quyền sở hữu",
    rejectionDate: "2025-06-04",
  },
];

export default function QuanLyTinPage() {
  // Mock user data
  const userData = {
    name: "Lê Quang Trí Đạt",
    avatar: "Đ",
    balance: "0 đ",
    greeting: "Chào buổi sáng 🌤",
  };

  const editModal = useEditPostModal();

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

  // State cho delete confirmation - CHỈ CẦN STATE ĐƠN GIẢN
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deletePostTitle, setDeletePostTitle] = useState<string>("");

  // Handle edit post
  const handleEditPost = (post: any) => {
    editModal.openModal(post);
  };

  // Handle delete post - ĐƠN GIẢN HÓA
  const handleDeletePost = (postId: string, postTitle: string) => {
    setDeletePostId(postId);
    setDeletePostTitle(postTitle);
    setShowDeleteModal(true);
  };

  // Confirm delete - XÓA VĨNH VIỄN
  const confirmDelete = () => {
    if (!deletePostId) return;

    console.log(`Deleting post ${deletePostId}`);
    // Thực tế sẽ gọi API để xóa tin đăng
    // await deletePost(deletePostId);

    setShowDeleteModal(false);
    setDeletePostId(null);
    setDeletePostTitle("");

    // Có thể reload data hoặc update state
  };

  // Filter options với count thực tế - CẬP NHẬT COUNT
  const filterOptions = [
    { id: "0", label: "Tất cả", count: mockPosts.length }, // 7 bài đăng
    {
      id: "8",
      label: "Hết hạn",
      count: mockPosts.filter((p) => p.status === "8").length, // 1
    },
    {
      id: "10",
      label: "Sắp hết hạn",
      count: mockPosts.filter((p) => p.status === "10").length, // 1
    },
    {
      id: "7",
      label: "Đang hiển thị",
      count: mockPosts.filter((p) => p.status === "7").length, // 1
    },
    {
      id: "6",
      label: "Chờ hiển thị",
      count: mockPosts.filter((p) => p.status === "6").length, // 1
    },
    {
      id: "3",
      label: "Chờ xuất bản",
      count: mockPosts.filter((p) => p.status === "3").length, // 0
    },
    {
      id: "2",
      label: "Chờ duyệt",
      count: mockPosts.filter((p) => p.status === "2").length, // 1
    },
    {
      id: "12",
      label: "Chờ thanh toán",
      count: mockPosts.filter((p) => p.status === "12").length, // 0
    },
    {
      id: "5",
      label: "Không duyệt",
      count: mockPosts.filter((p) => p.status === "5").length, // 2
    },
    {
      id: "9",
      label: "Đã hạ",
      count: mockPosts.filter((p) => p.status === "9").length, // 0
    },
  ];

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

  // Filter posts based on current filters
  const filteredPosts = mockPosts.filter((post) => {
    // Filter by status
    if (activeFilter !== "0" && post.status !== activeFilter) {
      return false;
    }

    // Filter by type
    if (filterType !== "all" && post.type !== filterType) {
      return false;
    }

    // Filter by search
    if (
      searchValue &&
      !post.title.toLowerCase().includes(searchValue.toLowerCase()) &&
      !post.id.toLowerCase().includes(searchValue.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range
    const postDate = new Date(post.createdDate);
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

  // Get status label and color
  const getStatusInfo = (statusId: string) => {
    const status = filterOptions.find((opt) => opt.id === statusId);
    const colors = {
      "7": "bg-green-100 text-green-800", // Đang hiển thị
      "6": "bg-blue-100 text-blue-800", // Chờ hiển thị
      "2": "bg-yellow-100 text-yellow-800", // Chờ duyệt
      "3": "bg-purple-100 text-purple-800", // Chờ xuất bản
      "5": "bg-red-100 text-red-800", // Không duyệt
      "8": "bg-gray-100 text-gray-800", // Hết hạn
      "9": "bg-gray-100 text-gray-800", // Đã hạ
      "10": "bg-orange-100 text-orange-800", // Sắp hết hạn
      "12": "bg-indigo-100 text-indigo-800", // Chờ thanh toán
    };

    return {
      label: status?.label || "Không xác định",
      colorClass:
        colors[statusId as keyof typeof colors] || "bg-gray-100 text-gray-800",
    };
  };

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

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen w-full">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow">
              {/* Header Section */}
              <div className="bg-white border-b border-gray-200 p-2 sm:p-6 rounded-t-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Side - User Info */}
                  <div className="flex items-center justify-between w-full lg:w-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {userData.avatar}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-600 mb-1">
                            {userData.greeting}
                          </p>
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-gray-900">
                              {userData.name}
                            </p>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              className="text-gray-600"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.64645 2.31307C5.84171 2.11781 6.15829 2.11781 6.35355 2.31307L10.7441 6.70359C11.46 7.41955 11.46 8.58035 10.7441 9.29631L6.35355 13.6868C6.15829 13.8821 5.84171 13.8821 5.64645 13.6868C5.45118 13.4916 5.45118 13.175 5.64645 12.9797L10.037 8.5892C10.3624 8.26377 10.3624 7.73613 10.037 7.41069L5.64645 3.02018C5.45118 2.82492 5.45118 2.50834 5.64645 2.31307Z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Wallet & Actions */}
                  <div className="mt-4 lg:mt-0 flex items-center gap-4 lg:w-auto">
                    {/* Wallet Info */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex-1 lg:flex-none h-[48px]">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-green-600"
                          >
                            <path
                              fill="currentColor"
                              d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM10 7V19H14V7H10ZM8 7V19H8V7ZM16 7V19H16V7ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13 10 12.1 10 11 10.9 9 12 9Z"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 leading-tight">
                            Số dư
                          </span>
                          <span className="font-semibold text-gray-900 text-sm leading-tight">
                            {userData.balance}
                          </span>
                        </div>
                      </div>

                      <Link href="/nap-tien" className="flex-1 lg:flex-none">
                        <button className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors w-full lg:w-auto justify-center h-[48px]">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="text-white"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.16536 3.66861C2.70513 3.66861 2.33203 4.04171 2.33203 4.50194V6.00002H13.6628C13.6628 5.49936 13.6629 4.99894 13.6625 4.49846C13.6621 4.04021 13.2902 3.66861 12.8307 3.66861H3.16536ZM13.6628 7.00002V7.49872C13.6628 7.77486 13.8866 7.99872 14.1628 7.99872C14.4389 7.99872 14.6628 7.77486 14.6628 7.49872V6.50002C14.6628 6.34503 14.6628 6.19 14.6628 6.03496C14.6628 5.52268 14.6629 5.01015 14.6625 4.49768C14.6617 3.4862 13.8409 2.66861 12.8307 2.66861H3.16536C2.15284 2.66861 1.33203 3.48942 1.33203 4.50194V11.4974C1.33203 12.5099 2.15284 13.3307 3.16536 13.3307H8.99609C9.27224 13.3307 9.49609 13.1069 9.49609 12.8307C9.49609 12.5546 9.27224 12.3307 8.99609 12.3307H3.16536C2.70513 12.3307 2.33203 11.9577 2.33203 11.4974V7.00002H13.6628ZM12.832 8.99999C13.1082 8.99999 13.332 9.22385 13.332 9.49999V11H14.832C15.1082 11 15.332 11.2238 15.332 11.5C15.332 11.7761 15.1082 12 14.832 12H13.332V13.5C13.332 13.7761 13.1082 14 12.832 14C12.5559 14 12.332 13.7761 12.332 13.5V12H10.832C10.5559 12 10.332 11.7761 10.332 11.5C10.332 11.2238 10.5559 11 10.832 11H12.332V9.49999C12.332 9.22385 12.5559 8.99999 12.832 8.99999Z"
                              fill="currentColor"
                            />
                          </svg>
                          Nạp tiền
                        </button>
                      </Link>
                    </div>

                    {/* THÊM NOTIFICATION - Mobile Notification */}
                    <div className="lg:hidden">
                      <div className="relative" ref={mobileNotificationRef}>
                        <button
                          onClick={() =>
                            setShowNotificationPopup(!showNotificationPopup)
                          }
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative cursor-pointer"
                          title="Thông báo"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-gray-600 group-hover:text-blue-500 transition-colors duration-200"
                          >
                            <path
                              d="M14.7999 18.2998C14.7999 19.8298 13.6299 20.9998 12.0999 20.9998C10.5699 20.9998 9.3999 19.8298 9.3999 18.2998"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              stroke="currentColor"
                            />
                            <path
                              d="M18.2222 12.6632C18.2222 10.65 18.2222 8.63684 18.2222 8.63684C18.2222 5.49632 15.4667 3 12 3C8.53333 3 5.77778 5.49632 5.77778 8.63684C5.77778 8.63684 5.77778 10.65 5.77778 12.6632C5.77778 15.8842 4 18.3 4 18.3H20C20 18.3 18.2222 15.8842 18.2222 12.6632Z"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              stroke="currentColor"
                            />
                          </svg>
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              3
                            </span>
                          </span>
                        </button>

                        {/* Mobile Notification Popup */}
                        <Transition
                          show={showNotificationPopup}
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-150"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                            <div
                              className="container scroll-bar"
                              style={{ maxHeight: "calc(100vh - 60px - 48px)" }}
                            >
                              {/* Header */}
                              <div className="header">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                      Thông báo
                                    </h3>
                                    <button className="text-xs text-gray-500 hover:text-gray-700">
                                      Đánh dấu tất cả đã đọc
                                    </button>
                                  </div>

                                  {/* Notification Tabs */}
                                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                    {["ALL", "UNREAD", "SYSTEM"].map((tab) => (
                                      <button
                                        key={tab}
                                        onClick={() =>
                                          setActiveNotificationTab(tab)
                                        }
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                          activeNotificationTab === tab
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                      >
                                        {tab === "ALL"
                                          ? "Tất cả"
                                          : tab === "UNREAD"
                                          ? "Chưa đọc"
                                          : "Hệ thống"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Tab Body */}
                              <div
                                className="tab-body"
                                style={{ overflow: "auto" }}
                              >
                                {/* Empty State */}
                                <div className="px-4 py-8">
                                  <div className="text-center">
                                    <div className="mb-4 flex items-center justify-center">
                                      <svg
                                        width="100"
                                        height="100"
                                        viewBox="0 0 130 130"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="sm:w-32 sm:h-32"
                                      >
                                        <path
                                          d="M118.42 75.84C118.43 83.2392 116.894 90.5589 113.91 97.33H16.0901C12.8945 90.0546 11.3623 82.1579 11.605 74.2154C11.8478 66.2728 13.8594 58.4844 17.4933 51.4177C21.1272 44.3511 26.2919 38.1841 32.6109 33.3662C38.93 28.5483 46.2444 25.2008 54.021 23.5676C61.7976 21.9345 69.8407 22.0568 77.564 23.9257C85.2874 25.7946 92.4966 29.363 98.6662 34.3709C104.836 39.3787 109.811 45.6999 113.228 52.8739C116.645 60.0478 118.419 67.8937 118.42 75.84Z"
                                          fill="#F2F2F2"
                                        ></path>
                                        <path
                                          d="M4.58008 97.3301H125.42"
                                          stroke="#63666A"
                                          strokeWidth="1.5"
                                          strokeMiterlimit="10"
                                          strokeLinecap="round"
                                        ></path>
                                        <path
                                          d="M67.8105 114.8C73.1014 114.8 77.3905 110.511 77.3905 105.22C77.3905 99.9293 73.1014 95.6401 67.8105 95.6401C62.5196 95.6401 58.2305 99.9293 58.2305 105.22C58.2305 110.511 62.5196 114.8 67.8105 114.8Z"
                                          fill="#A7A7A7"
                                          stroke="#63666A"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        ></path>
                                        <path
                                          d="M87.5702 65.5702C86.2602 53.8802 76.3802 49.7402 67.8102 49.7402C59.2402 49.7402 49.3702 53.8802 48.0602 65.5702C46.9402 74.2802 44.6502 80.9702 39.9302 87.3602C35.9302 92.9402 34.8102 98.7202 36.4202 102.71C36.6692 103.283 37.0822 103.769 37.6073 104.107C38.1323 104.445 38.7458 104.62 39.3702 104.61H96.2502C96.8831 104.631 97.5074 104.46 98.0424 104.121C98.5773 103.783 98.9981 103.291 99.2502 102.71C100.86 98.7102 99.6802 92.9402 95.7402 87.3602C91.0002 81.0002 88.6802 74.2802 87.5702 65.5702Z"
                                          fill="#D7D7D7"
                                        ></path>
                                        <path
                                          d="M99.2101 102.71C100.82 98.7101 99.6401 92.9401 95.7001 87.3601C91.0001 81.0001 88.6801 74.2801 87.5701 65.5701C87.3182 62.3646 86.134 59.3027 84.1635 56.7618C82.193 54.2209 79.5221 52.3119 76.4801 51.2701C74.579 50.5286 72.5005 50.3684 70.5083 50.8099C68.516 51.2515 66.6999 52.2748 65.2901 53.7501C62.3755 56.9524 60.5972 61.0257 60.2301 65.3401C58.9201 75.5501 56.1401 82.0001 50.6001 89.5001C47.2401 94.2501 45.3701 101.63 48.2901 104.61H96.2901C96.9095 104.614 97.5164 104.437 98.0356 104.099C98.5547 103.761 98.9632 103.278 99.2101 102.71Z"
                                          fill="white"
                                        ></path>
                                        <path
                                          d="M86.3002 60.4702C82.0002 51.7802 73.8702 49.7402 67.8102 49.7402C59.2402 49.7402 49.3702 53.8802 48.0602 65.5702C46.9402 74.2802 44.6502 80.9702 39.9302 87.3602C35.9302 92.9402 34.8102 98.7202 36.4202 102.71C36.6692 103.283 37.0822 103.769 37.6073 104.107C38.1323 104.445 38.7458 104.62 39.3702 104.61H96.2502C96.8831 104.631 97.5074 104.46 98.0424 104.121C98.5773 103.783 98.9981 103.291 99.2502 102.71C100.86 98.7102 99.6802 92.9402 95.7402 87.3602C91.5766 81.5452 88.8894 74.8049 87.9102 67.7202"
                                          stroke="#63666A"
                                          strokeWidth="1.5"
                                          strokeMiterlimit="10"
                                          strokeLinecap="round"
                                        ></path>
                                      </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                      Không có thông báo nào
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                      Chúng tôi sẽ thông báo khi có cập nhật mới
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Transition>
                      </div>
                    </div>

                    {/* THÊM NOTIFICATION - Desktop Notification */}
                    <div className="hidden lg:block">
                      <div className="relative" ref={desktopNotificationRef}>
                        <button
                          onClick={() =>
                            setShowNotificationPopup(!showNotificationPopup)
                          }
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative cursor-pointer"
                          title="Thông báo"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-gray-600 group-hover:text-blue-500 transition-colors duration-200"
                          >
                            <path
                              d="M14.7999 18.2998C14.7999 19.8298 13.6299 20.9998 12.0999 20.9998C10.5699 20.9998 9.3999 19.8298 9.3999 18.2998"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              stroke="currentColor"
                            />
                            <path
                              d="M18.2222 12.6632C18.2222 10.65 18.2222 8.63684 18.2222 8.63684C18.2222 5.49632 15.4667 3 12 3C8.53333 3 5.77778 5.49632 5.77778 8.63684C5.77778 8.63684 5.77778 10.65 5.77778 12.6632C5.77778 15.8842 4 18.3 4 18.3H20C20 18.3 18.2222 15.8842 18.2222 12.6632Z"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              stroke="currentColor"
                            />
                          </svg>
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              3
                            </span>
                          </span>
                        </button>

                        {/* Desktop Notification Popup */}
                        <Transition
                          show={showNotificationPopup}
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-150"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                            <div
                              className="container scroll-bar"
                              style={{ maxHeight: "calc(100vh - 60px - 48px)" }}
                            >
                              {/* Header */}
                              <div className="header">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                      Thông báo
                                    </h3>
                                    <button className="text-xs text-gray-500 hover:text-gray-700">
                                      Đánh dấu tất cả đã đọc
                                    </button>
                                  </div>

                                  {/* Notification Tabs */}
                                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                    {["ALL", "UNREAD", "SYSTEM"].map((tab) => (
                                      <button
                                        key={tab}
                                        onClick={() =>
                                          setActiveNotificationTab(tab)
                                        }
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                          activeNotificationTab === tab
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                      >
                                        {tab === "ALL"
                                          ? "Tất cả"
                                          : tab === "UNREAD"
                                          ? "Chưa đọc"
                                          : "Hệ thống"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Tab Body */}
                              <div
                                className="tab-body"
                                style={{ overflow: "auto" }}
                              >
                                {/* Empty State */}
                                <div className="px-4 py-8">
                                  <div className="text-center">
                                    <div className="mb-4 flex items-center justify-center">
                                      <svg
                                        width="130"
                                        height="130"
                                        viewBox="0 0 130 130"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M118.42 75.84C118.43 83.2392 116.894 90.5589 113.91 97.33H16.0901C12.8945 90.0546 11.3623 82.1579 11.605 74.2154C11.8478 66.2728 13.8594 58.4844 17.4933 51.4177C21.1272 44.3511 26.2919 38.1841 32.6109 33.3662C38.93 28.5483 46.2444 25.2008 54.021 23.5676C61.7976 21.9345 69.8407 22.0568 77.564 23.9257C85.2874 25.7946 92.4966 29.363 98.6662 34.3709C104.836 39.3787 109.811 45.6999 113.228 52.8739C116.645 60.0478 118.419 67.8937 118.42 75.84Z"
                                          fill="#F2F2F2"
                                        ></path>
                                        <path
                                          d="M4.58008 97.3301H125.42"
                                          stroke="#63666A"
                                          strokeWidth="1.5"
                                          strokeMiterlimit="10"
                                          strokeLinecap="round"
                                        ></path>
                                        <path
                                          d="M67.8105 114.8C73.1014 114.8 77.3905 110.511 77.3905 105.22C77.3905 99.9293 73.1014 95.6401 67.8105 95.6401C62.5196 95.6401 58.2305 99.9293 58.2305 105.22C58.2305 110.511 62.5196 114.8 67.8105 114.8Z"
                                          fill="#A7A7A7"
                                          stroke="#63666A"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        ></path>
                                        <path
                                          d="M87.5702 65.5702C86.2602 53.8802 76.3802 49.7402 67.8102 49.7402C59.2402 49.7402 49.3702 53.8802 48.0602 65.5702C46.9402 74.2802 44.6502 80.9702 39.9302 87.3602C35.9302 92.9402 34.8102 98.7202 36.4202 102.71C36.6692 103.283 37.0822 103.769 37.6073 104.107C38.1323 104.445 38.7458 104.62 39.3702 104.61H96.2502C96.8831 104.631 97.5074 104.46 98.0424 104.121C98.5773 103.783 98.9981 103.291 99.2502 102.71C100.86 98.7102 99.6802 92.9402 95.7402 87.3602C91.0002 81.0002 88.6802 74.2802 87.5702 65.5702Z"
                                          fill="#D7D7D7"
                                        ></path>
                                        <path
                                          d="M99.2101 102.71C100.82 98.7101 99.6401 92.9401 95.7001 87.3601C91.0001 81.0001 88.6801 74.2801 87.5701 65.5701C87.3182 62.3646 86.134 59.3027 84.1635 56.7618C82.193 54.2209 79.5221 52.3119 76.4801 51.2701C74.579 50.5286 72.5005 50.3684 70.5083 50.8099C68.516 51.2515 66.6999 52.2748 65.2901 53.7501C62.3755 56.9524 60.5972 61.0257 60.2301 65.3401C58.9201 75.5501 56.1401 82.0001 50.6001 89.5001C47.2401 94.2501 45.3701 101.63 48.2901 104.61H96.2901C96.9095 104.614 97.5164 104.437 98.0356 104.099C98.5547 103.761 98.9632 103.278 99.2101 102.71Z"
                                          fill="white"
                                        ></path>
                                        <path
                                          d="M86.3002 60.4702C82.0002 51.7802 73.8702 49.7402 67.8102 49.7402C59.2402 49.7402 49.3702 53.8802 48.0602 65.5702C46.9402 74.2802 44.6502 80.9702 39.9302 87.3602C35.9302 92.9402 34.8102 98.7202 36.4202 102.71C36.6692 103.283 37.0822 103.769 37.6073 104.107C38.1323 104.445 38.7458 104.62 39.3702 104.61H96.2502C96.8831 104.631 97.5074 104.46 98.0424 104.121C98.5773 103.783 98.9981 103.291 99.2502 102.71C100.86 98.7102 99.6802 92.9402 95.7402 87.3602C91.5766 81.5452 88.8894 74.8049 87.9102 67.7202"
                                          stroke="#63666A"
                                          strokeWidth="1.5"
                                          strokeMiterlimit="10"
                                          strokeLinecap="round"
                                        ></path>
                                      </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                      Không có thông báo nào
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                      Chúng tôi sẽ thông báo khi có cập nhật mới
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Transition>
                      </div>
                    </div>
                  </div>
                </div>
                {/* End Search and Filter Section */}

                {/* Tin đăng list */}

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

                  {filteredPosts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => {
                        const statusInfo = getStatusInfo(post.status);
                        return (
                          <div
                            key={post.id}
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
                                      Mã tin: {post.id}
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
                                {post.status === "5" &&
                                  post.rejectionReason && (
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
                                    <span className="font-medium">
                                      Diện tích:
                                    </span>{" "}
                                    {post.area}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Lượt xem:
                                    </span>{" "}
                                    {post.views}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Hết hạn:
                                    </span>{" "}
                                    {new Date(
                                      post.expiryDate
                                    ).toLocaleDateString("vi-VN")}
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">
                                      Địa chỉ:
                                    </span>{" "}
                                    {post.location}
                                  </p>

                                  <div className="flex gap-2">
                                    {post.status === "5" ? (
                                      <>
                                        <button
                                          onClick={() => handleEditPost(post)}
                                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                          Chỉnh sửa & Đăng lại
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeletePost(
                                              post.id,
                                              post.title
                                            )
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
                                            handleDeletePost(
                                              post.id,
                                              post.title
                                            )
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
                                    setSelectedImages={
                                      editModal.setSelectedImages
                                    }
                                    setSelectedPackage={
                                      editModal.setSelectedPackage
                                    }
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
                        {searchValue ||
                        activeFilter !== "0" ||
                        filterType !== "all"
                          ? "Không tìm thấy kết quả"
                          : "Chưa có tin đăng nào"}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchValue ||
                        activeFilter !== "0" ||
                        filterType !== "all"
                          ? "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                          : "Bạn chưa có tin đăng nào. Hãy tạo tin đăng đầu tiên để bắt đầu bán hoặc cho thuê bất động sản."}
                      </p>
                      <Link href="/dang-tin">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Đăng tin ngay
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
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

      <div className="lg:pl-24">
        <Footer />
      </div>
    </>
  );
}
