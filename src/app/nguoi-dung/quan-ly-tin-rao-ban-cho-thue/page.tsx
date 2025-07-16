"use client";
import { useState, Fragment, useRef, useEffect, useCallback } from "react";
import { Transition, Dialog } from "@headlessui/react";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import Image from "next/image";
import UserSidebar from "@/components/user/UserSidebar";
import { useEditPostModal } from "@/hooks/useEditPostModal";
import EditPostModal from "@/components/modals/EditPostModal/EditPostModal";
import UserHeader from "@/components/user/UserHeader";
import { postService } from "@/services/postsService";
import { ProjectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth"; // Changed from @/store/hooks to @/hooks/useAuth
import { useRouter as useNextRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/common/Pagination";

// Skeleton Component
function Skeleton({
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

// Posts Loading Skeleton Component
function PostsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Image Skeleton */}
            <div className="w-full lg:w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0">
              <Skeleton className="w-full h-full" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1">
              {/* Title and Status */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-sm mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>

              {/* Address and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Initial Loading Skeleton Component for the entire page
function InitialLoadingSkeleton() {
  return (
    <div className="flex">
      {/* Sidebar Skeleton - Hidden on mobile */}
      <div className="w-24 min-h-screen p-4 hidden lg:block">
        <div className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-white rounded-lg shadow w-full">
        {/* Header Section Skeleton */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="p-6">
          {/* Page Title Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Search and Filter Section Skeleton */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-24" />
            </div>
          </div>

          {/* Filter Tags Skeleton */}
          <div className="mb-6 hidden sm:block">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>

          {/* Posts Loading Skeleton */}
          <PostsLoadingSkeleton />
        </div>
      </div>
    </div>
  );
}

export default function QuanLyTinPage() {
  const router = useNextRouter();
  const searchParams = useSearchParams();
  // Use the enhanced auth hook from the hooks directory
  const {
    user,
    isAuthenticated,
    loading: userLoading,
    isInitialized,
  } = useAuth();

  // Định nghĩa fetchPosts function sẽ được dùng trong hook và useEffect
  const [refreshTrigger] = useState(0);

  const editModal = useEditPostModal();

  // Get user data from the authenticated user instead of using mock data
  const userData = user
    ? {
        name: user.username || user.email?.split("@")[0] || "User",
        avatar:
          user.avatar ||
          user.username?.charAt(0).toUpperCase() ||
          user.email?.charAt(0).toUpperCase() ||
          "U",
        greeting: getGreeting(),
      }
    : {
        name: "User",
        avatar: "U",
        greeting: getGreeting(),
      };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng 🌅";
    if (hour < 18) return "Chào buổi chiều ☀️";
    return "Chào buổi tối 🌙";
  }

  // Helper function to format package information
  const getPackageDisplayInfo = (post: any) => {
    if (!post.package) return null;

    const packageName =
      typeof post.package === "string"
        ? post.package
        : post.package.name || "Gói tin";
    const packageDuration =
      typeof post.package === "string" ? null : post.package.duration;
    const packagePrice =
      typeof post.package === "string" ? null : post.package.price;

    return {
      name: packageName,
      duration: packageDuration,
      price: packagePrice,
    };
  };

  // Helper function to get project name
  const getProjectName = (post: any) => {
    if (!post.project) return null;

    // If project is a string, return it
    if (typeof post.project === "string") {
      return post.project;
    }

    // If project is an object, get name or title
    if (typeof post.project === "object") {
      return (
        post.project.name ||
        post.project.title ||
        post.project.projectName ||
        "Dự án"
      );
    }

    return null;
  };

  // State để cache thông tin project
  const [projectsCache, setProjectsCache] = useState<Record<string, any>>({});

  // Helper function to get project details
  const getProjectDetails = async (post: any) => {
    if (!post.project) return null;

    let projectId: string | null = null;

    // If project is a string, it might be the ID
    if (typeof post.project === "string") {
      projectId = post.project;
    }

    // If project is an object, get the ID
    if (typeof post.project === "object" && post.project._id) {
      projectId = post.project._id;
    }

    if (!projectId) return null;

    // Check cache first
    if (projectsCache[projectId]) {
      return projectsCache[projectId];
    }

    try {
      const projectData = await ProjectService.getProjectById(projectId);
      if (projectData) {
        // Update cache
        setProjectsCache((prev) => ({
          ...prev,
          [projectId]: projectData,
        }));
        return projectData;
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }

    return null;
  };

  // Helper function to create project URL
  const createProjectUrl = (project: any) => {
    if (!project) return "#";

    // Create slug from project name
    const createSlug = (text: string) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    };

    const slug = project.slug || createSlug(project.name);
    return `/du-an/${slug}`;
  };

  // Project Badge Component
  const ProjectBadge = ({ post }: { post: any }) => {
    const [projectInfo, setProjectInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const loadProject = async () => {
        if (!post.project) return;

        let projectId: string | null = null;

        // If project is a string, it might be the ID
        if (typeof post.project === "string") {
          projectId = post.project;
        }

        // If project is an object, get the ID
        if (typeof post.project === "object" && post.project._id) {
          projectId = post.project._id;
        }

        if (!projectId) return;

        // Check cache first
        if (projectsCache[projectId]) {
          setProjectInfo(projectsCache[projectId]);
          return;
        }

        try {
          setLoading(true);
          const startTime = Date.now();
          const minLoadingTime = 300; // Shorter delay for individual components

          const projectData = await ProjectService.getProjectById(projectId);
          if (projectData) {
            // Update cache
            setProjectsCache((prev) => ({
              ...prev,
              [projectId]: projectData,
            }));
            setProjectInfo(projectData);
          }

          // Ensure minimum loading time for smooth skeleton display
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

          setTimeout(() => {
            setLoading(false);
          }, remainingTime);
        } catch (error) {
          console.error("Error fetching project details:", error);
          // For errors, still respect minimum loading time to avoid flashing
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }
      };

      loadProject();
    }, [post.project]);

    if (!post.project) return null;

    // Show loading state with skeleton
    if (loading) {
      return <Skeleton className="h-6 w-24 rounded-full" />;
    }

    // If we have project info, show with link
    if (projectInfo) {
      const projectUrl = createProjectUrl(projectInfo);
      return (
        <Link
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors cursor-pointer"
          title={`Xem thông tin dự án ${projectInfo.name}`}
        >
          {projectInfo.name}
        </Link>
      );
    }

    // Fallback to simple name display
    const projectName = getProjectName(post);
    if (projectName) {
      return (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {projectName}
        </span>
      );
    }

    return null;
  };

  // State cho post
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);

  // State cho notification popup
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);
  const desktopNotificationRef = useRef<HTMLDivElement>(null);

  // State cho search và filter
  const [searchValue, setSearchValue] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
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
    if (isInitialized && !isAuthenticated) {
      router.push("/dang-nhap");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchValue);
    }, 500); // Đợi 500ms sau khi user ngừng gõ

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Handle edit post
  const handleEditPost = (post: any) => {
    editModal.open(post);
  };

  // Create a wrapper to handle the type mismatch between hook and modal
  const handleUpdateFormData = (
    field: string | number | symbol,
    value: string | number | undefined
  ) => {
    editModal.updateFormData(field as any, value);
  };

  // Handle view post
  const handleViewPost = (post: any) => {
    if (post.status === "active") {
      const viewUrl = createSeoUrl(post);
      window.open(viewUrl, "_blank");
    } else if (post.status === "pending" || post.status === "waiting_display") {
      // Tin đăng chờ duyệt - xem preview
      alert(
        "Tin đăng đang chờ duyệt. Bạn có thể xem trước thông tin trong phần chỉnh sửa."
      );
    } else if (post.status === "rejected") {
      // Tin đăng bị từ chối - chỉ có thể chỉnh sửa
      alert("Tin đăng đã bị từ chối. Vui lòng chỉnh sửa và gửi lại.");
    } else {
      // Các trạng thái khác
      alert("Tin đăng này không thể xem được ở trạng thái hiện tại.");
    }
  };

  // Helper function to create SEO URL for posts
  const createSeoUrl = (postData: any) => {
    const transactionType = postData.type === "ban" ? "mua-ban" : "cho-thue";

    // Tạo slug từ location
    const createLocationSlug = (text: string) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    };

    // Tạo slug từ title
    const createTitleSlug = (title: string) => {
      if (!title) return "tin-dang";
      return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    };

    if (
      postData.location?.province &&
      postData.location?.district &&
      postData.location?.ward
    ) {
      const provinceSlug = createLocationSlug(postData.location.province);
      const districtSlug = createLocationSlug(postData.location.district);
      const wardSlug = createLocationSlug(postData.location.ward);
      const titleSlug = createTitleSlug(postData.title);

      return `/${transactionType}/${provinceSlug}/${districtSlug}/${wardSlug}/${postData._id}-${titleSlug}`;
    } else {
      // Fallback nếu không có đủ thông tin location
      const titleSlug = createTitleSlug(postData.title);
      return `/${transactionType}/chi-tiet/${postData._id}-${titleSlug}`;
    }
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
      id: "expired",
      label: "Hết hạn",
      count: posts.filter((p) => p.status === "expired").length,
    },
    {
      id: "rejected",
      label: "Không duyệt",
      count: posts.filter((p) => p.status === "rejected").length,
    },
    {
      id: "removed",
      label: "Đã hạ",
      count: posts.filter((p) => p.status === "removed").length,
    },
  ];

  // Không cần lọc trên client-side nữa vì server đã lọc
  // Chỉ sử dụng dữ liệu từ API trực tiếp
  const filteredPosts = posts;

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

  // Posts per page options
  const postsPerPageOptions = [
    { id: 5, label: "5 bài" },
    { id: 10, label: "10 bài" },
    { id: 20, label: "20 bài" },
    { id: 50, label: "50 bài" },
  ];

  // Lấy bài viết từ API khi load trang
  const fetchPosts = useCallback(() => {
    setLoading(true);
    setError(null);

    // Minimum loading time để skeleton hiển thị đủ lâu
    const startTime = Date.now();
    const minLoadingTime = 500; // 500ms

    // Tạo tham số tìm kiếm và lọc để gửi đến API
    const params = {
      page: currentPage,
      limit: postsPerPage,
      status: activeFilter !== "all" ? activeFilter : undefined,
      type: filterType !== "all" ? filterType : undefined,
      search: searchDebounced || undefined,
      dateRange: filterDateRange,
      startDate: customStartDate || undefined,
      endDate: customEndDate || undefined,
    };

    postService
      .getUserPosts(params)
      .then((res) => {
        console.log("API Response:", res);
        const apiPosts = res.data?.posts || [];
        const pagination = res.data?.pagination || {};
        const total = pagination.totalPages || 1;

        setPosts(apiPosts);
        setTotalPages(total);

        console.log("Đã tải bài viết với filter:", params);
        console.log("Total pages:", total, "Posts count:", apiPosts.length);
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi tải bài viết");
      })
      .finally(() => {
        // Đảm bảo skeleton hiển thị ít nhất minLoadingTime
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      });
  }, [
    currentPage,
    postsPerPage,
    activeFilter,
    filterType,
    searchDebounced,
    filterDateRange,
    customStartDate,
    customEndDate,
  ]);

  // Effect để tải bài viết ban đầu và khi các tham số thay đổi
  useEffect(() => {
    let ignore = false;

    if (isAuthenticated && !userLoading && !ignore) {
      fetchPosts();
    }

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, userLoading, fetchPosts, refreshTrigger]);

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

  // Handle reset filters
  const handleResetFilters = () => {
    setActiveFilter("all");
    setFilterType("all");
    setFilterDateRange("7");
    setCustomStartDate("");
    setCustomEndDate("");
    setPostsPerPage(10);
    setCurrentPage(1); // Đặt lại trang về 1 khi đặt lại bộ lọc
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll lên đầu danh sách bài viết
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    // Không cần gọi fetchPosts() vì useEffect sẽ tự động trigger khi currentPage thay đổi
  };

  // Helper để cập nhật URL với filters
  const updateUrlWithFilters = useCallback(
    (paramsObj: Record<string, string | number | undefined>) => {
      const url = new URL(window.location.href);

      // Xóa tất cả params cũ trước
      url.search = "";

      // Thêm params mới
      Object.entries(paramsObj).forEach(([key, value]) => {
        if (
          value &&
          value !== "all" &&
          value !== "" &&
          (key !== "page" || value !== 1) &&
          (key !== "dateRange" || value !== "7") &&
          (key !== "limit" || value !== 10)
        ) {
          url.searchParams.set(key, String(value));
        }
      });

      // Cập nhật URL mà không reload trang
      window.history.replaceState({}, "", url.toString());
    },
    []
  );

  // Đọc filters từ URL khi component mount
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";
    const dateRange = searchParams.get("dateRange") || "7";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Set state từ URL
    setCurrentPage(page);
    setActiveFilter(status);
    setFilterType(type);
    setSearchValue(search);
    setSearchDebounced(search); // Đồng bộ cả searchDebounced
    setFilterDateRange(dateRange);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setPostsPerPage(limit);
  }, [searchParams]);

  // Cập nhật URL khi filters thay đổi
  useEffect(() => {
    updateUrlWithFilters({
      page: currentPage,
      status: activeFilter,
      type: filterType,
      search: searchDebounced,
      dateRange: filterDateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      limit: postsPerPage !== 10 ? postsPerPage : undefined, // Chỉ lưu nếu khác default
    });
  }, [
    currentPage,
    activeFilter,
    filterType,
    searchDebounced,
    filterDateRange,
    customStartDate,
    customEndDate,
    postsPerPage,
    updateUrlWithFilters,
  ]);

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
      rejected: { label: "Không duyệt", colorClass: "bg-red-100 text-red-800" },
      expired: { label: "Hết hạn", colorClass: "bg-gray-100 text-gray-800" },
      inactive: { label: "Đã hạ", colorClass: "bg-gray-100 text-gray-600" },
    };
    return (
      statusMap[statusId] || {
        label: "Không xác định",
        colorClass: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Show loading state when checking authentication or fetching user data
  if (userLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100">
        <InitialLoadingSkeleton />
      </div>
    );
  }

  // Redirect is handled by the useEffect above
  if (!isAuthenticated) {
    return null;
  }

  // Filter Content Component
  const FilterContent = ({ isModal = false }: { isModal?: boolean }) => (
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
                  onChange={(e) => {
                    setActiveFilter(e.target.value);
                    setCurrentPage(1); // Đặt lại trang về 1 khi thay đổi filter
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Số bài viết mỗi trang */}
        <div className={`${isModal ? "mb-0" : "mb-6"}`}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Số bài viết mỗi trang
          </h4>
          <div className="space-y-2">
            {postsPerPageOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="postsPerPage"
                  value={option.id}
                  checked={postsPerPage === option.id}
                  onChange={(e) => {
                    setPostsPerPage(parseInt(e.target.value));
                    setCurrentPage(1); // Đặt lại trang về 1 khi thay đổi số items
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
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
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        setCurrentPage(1); // Đặt lại trang về 1 khi thay đổi tìm kiếm
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          // Không cần gọi fetchPosts() vì useEffect sẽ tự động trigger khi searchValue thay đổi
                          e.currentTarget.blur(); // Bỏ focus khỏi input
                        }
                      }}
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

                {/* Reset Button */}
                <button
                  onClick={handleResetFilters}
                  type="button"
                  className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center text-gray-700"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-600"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>

            {/* Filter Tags - Hidden on mobile */}
            <div className="mb-6 hidden sm:block">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setActiveFilter(option.id);
                      setCurrentPage(1); // Đặt lại trang về 1 khi thay đổi filter
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === option.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <PostsLoadingSkeleton />
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
                            <Image
                              src={post.images[0] || "/placeholder-image.png"}
                              alt={post.title}
                              width={192}
                              height={128}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div>
                              <Link
                                href={
                                  post.status === "active"
                                    ? createSeoUrl(post)
                                    : "#"
                                }
                                className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer block"
                                onClick={(e) => {
                                  if (post.status !== "active") {
                                    e.preventDefault();
                                    handleViewPost(post);
                                  }
                                }}
                                target={
                                  post.status === "active"
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  post.status === "active"
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              >
                                {post.title}
                              </Link>
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
                              {(() => {
                                return <ProjectBadge post={post} />;
                              })()}
                              {post.featured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  Nổi bật
                                </span>
                              )}
                            </div>
                          </div>

                          {/* THÊM PHẦN HIỂN THỊ LÝ DO KHÔNG DUYỆT */}
                          {post.status === "rejected" &&
                            (post.rejectedReason || post.rejectionReason) && (
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
                                      {post.rejectedReason ||
                                        post.rejectionReason}
                                    </p>
                                    {post.rejectedAt && (
                                      <p className="text-xs text-red-600 mt-1">
                                        Ngày từ chối:{" "}
                                        {new Date(
                                          post.rejectedAt
                                        ).toLocaleDateString("vi-VN")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
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
                              {new Date(post.expiredAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>

                            {/* Package Information */}
                            {(() => {
                              const packageInfo = getPackageDisplayInfo(post);
                              return packageInfo ? (
                                <div>
                                  <span className="font-medium">Gói tin:</span>{" "}
                                  <span className="text-blue-600">
                                    {packageInfo.name}
                                  </span>
                                  {packageInfo.duration && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({packageInfo.duration} ngày)
                                    </span>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>

                          {/* Additional Package Details - Show only if package exists */}
                          {(() => {
                            const packageInfo = getPackageDisplayInfo(post);
                            return packageInfo && packageInfo.price ? (
                              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-blue-600"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
                                    />
                                  </svg>
                                  <span className="font-medium text-blue-800">
                                    Gói {packageInfo.name}
                                  </span>
                                  <span className="text-blue-600">
                                    -{" "}
                                    {new Intl.NumberFormat("vi-VN").format(
                                      packageInfo.price
                                    )}
                                    đ
                                  </span>
                                  {packageInfo.duration && (
                                    <span className="text-blue-600">
                                      / {packageInfo.duration} ngày
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : null;
                          })()}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Địa chỉ:</span>{" "}
                                {post.location.street}, {post.location.ward},{" "}
                                {post.location.district},{" "}
                                {post.location.province}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {post.status === "rejected" ? (
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
                                  {post.status === "active" && (
                                    <button
                                      onClick={() => handleViewPost(post)}
                                      className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                      Xem tin đăng
                                    </button>
                                  )}
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
                              onClose={editModal.close}
                              currentStep={editModal.currentStep}
                              editingPost={editModal.editingPost}
                              formData={editModal.formData}
                              selectedImages={editModal.selectedImages}
                              selectedPackage={editModal.selectedPackage}
                              nextStep={editModal.nextStep}
                              prevStep={editModal.prevStep}
                              updateFormData={handleUpdateFormData}
                              setSelectedImages={editModal.setSelectedImages}
                              setSelectedPackage={editModal.setSelectedPackage}
                              handleBasicSubmit={editModal.handleBasicSubmit}
                              handleImageSubmit={editModal.handleImageSubmit}
                              handlePackageSubmit={
                                editModal.handlePackageSubmit
                              }
                              existingImages={editModal.existingImages}
                              updateExistingImages={
                                editModal.updateExistingImages
                              }
                              categories={editModal.categories}
                              projects={editModal.projects}
                              provinces={editModal.provinces}
                              districts={editModal.districts}
                              wards={editModal.wards}
                              locationLoading={editModal.locationLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Debug info */}
                <div className="text-xs text-gray-500 mt-2">
                  Debug: Total pages = {totalPages}, Current page ={" "}
                  {currentPage}, Posts = {posts.length}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      className="mt-4"
                    />
                  </div>
                )}

                {/* Show pagination even if totalPages = 1 for testing */}
                {totalPages === 1 && posts.length > 0 && (
                  <div className="pt-6 text-center text-sm text-gray-500">
                    Chỉ có 1 trang (tổng cộng {posts.length} bài viết)
                  </div>
                )}
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
                  {searchDebounced ||
                  activeFilter !== "all" ||
                  filterType !== "all"
                    ? "Không tìm thấy kết quả"
                    : "Chưa có tin đăng nào"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchDebounced ||
                  activeFilter !== "all" ||
                  filterType !== "all"
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
              <FilterContent isModal={true} />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
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
                &quot;{deletePostTitle}&quot;
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
            href="/nguoi-dung/vi-tien"
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
