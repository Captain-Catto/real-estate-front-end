import { useState, useEffect, useRef, useCallback } from "react";
import { Combobox } from "@headlessui/react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ProjectService } from "@/services/projectService";
import { toast } from "sonner";

// Project selection type - matching what API returns for selection
interface ProjectSelection {
  _id: string;
  name: string;
  address: string;
  fullLocation: string;
  location: {
    provinceCode: string;
    wardCode?: string;
  };
}

interface SearchableProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  categoryId?: string; // Add categoryId prop to filter projects by category
}

export default function SearchableProjectSelect({
  value,
  onChange,
  disabled = false,
  categoryId, // Add categoryId prop
}: SearchableProjectSelectProps) {
  const [projects, setProjects] = useState<ProjectSelection[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSelection[]>(
    []
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Manual control of dropdown state
  const [preventClose, setPreventClose] = useState(false); // Prevent immediate closing
  const [justFocused, setJustFocused] = useState(false); // Track if just focused to prevent immediate click toggle

  const observerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const PROJECT_LIMIT = 50; // Limit to maximum 50 projects per load

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !preventClose
      ) {
        console.log("🌍 Click outside detected - closing dropdown");
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Add a small delay before enabling outside click detection
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, preventClose]);

  // Fetch initial projects
  useEffect(() => {
    const fetchInitialProjects = async () => {
      console.log("🔄 Fetching initial projects with categoryId:", categoryId);
      setLoading(true);
      try {
        const response = await ProjectService.getProjectsForSelection(
          undefined, // provinceCode
          undefined, // wardCode
          1, // page
          PROJECT_LIMIT, // limit
          undefined, // search
          true, // includePagination
          "all", // status - get all projects regardless of status
          categoryId // categoryId - filter by category if provided
        );

        if (
          response &&
          typeof response === "object" &&
          "projects" in response
        ) {
          const projectList = response.projects;
          const pagination = response.pagination;

          console.log("📊 Initial fetch result:", {
            projectsCount: projectList.length,
            pagination: pagination,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
          });

          setProjects(projectList);
          setFilteredProjects(projectList);
          setPage(pagination.currentPage);
          // Calculate hasMore from pagination data if hasMore field is not provided
          const hasMore =
            pagination.hasMore !== undefined
              ? pagination.hasMore
              : pagination.currentPage < pagination.totalPages;
          setHasMoreProjects(hasMore);

          console.log("✅ Set hasMoreProjects:", hasMore);
        } else {
          const projectList = Array.isArray(response) ? response : [];
          setProjects(projectList);
          setFilteredProjects(projectList);
          setHasMoreProjects(false);
        }
      } catch {
        toast.error("Lỗi không tải được dự án");
        setHasMoreProjects(false);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProjects();
  }, [categoryId]);

  // Filter projects based on query
  useEffect(() => {
    const filterProjects = async () => {
      if (!query.trim()) {
        // No search query, show all loaded projects
        setFilteredProjects(projects);
      } else {
        // Search from API with higher limit to get more results
        try {
          const response = await ProjectService.getProjectsForSelection(
            undefined, // provinceCode
            undefined, // wardCode
            1, // page
            50, // limit - maximum 50 projects for search
            query, // search term
            true, // includePagination
            "all", // status - get all projects regardless of status
            categoryId // categoryId - filter by category if provided
          );

          if (
            response &&
            typeof response === "object" &&
            "projects" in response
          ) {
            const searchResults = response.projects;
            setFilteredProjects(searchResults);
          }
        } catch {
          toast.error("Lỗi không tải được dự án");
          // Fallback to local search
          const localFiltered = projects.filter(
            (project) =>
              project.name.toLowerCase().includes(query.toLowerCase()) ||
              project.address.toLowerCase().includes(query.toLowerCase()) ||
              (project.fullLocation &&
                project.fullLocation
                  .toLowerCase()
                  .includes(query.toLowerCase()))
          );
          setFilteredProjects(localFiltered);
        }
      }
    };

    const timeoutId = setTimeout(filterProjects, 300);
    return () => clearTimeout(timeoutId);
  }, [query, projects, categoryId]);

  // Load more projects
  const loadMoreProjects = useCallback(async () => {
    console.log("🔄 loadMoreProjects called:", {
      loadingMore,
      hasMoreProjects,
      page,
      query: query.trim(),
    });

    if (loadingMore || !hasMoreProjects) {
      console.log("⏹️ Skipping load more:", { loadingMore, hasMoreProjects });
      return;
    }

    setLoadingMore(true);
    try {
      console.log("📡 Fetching page:", page + 1);
      const response = await ProjectService.getProjectsForSelection(
        undefined, // provinceCode
        undefined, // wardCode
        page + 1, // page
        PROJECT_LIMIT, // limit
        query || undefined, // search
        true, // includePagination
        "all", // status - get all projects regardless of status
        categoryId // categoryId - filter by category if provided
      );

      if (response && typeof response === "object" && "projects" in response) {
        const newProjects = response.projects;
        const pagination = response.pagination;

        console.log("✅ Loaded more projects:", {
          newProjectsCount: newProjects.length,
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
        });

        // Merge new projects with existing ones
        const updatedProjects = [...projects, ...newProjects];
        setProjects(updatedProjects);

        // Update filtered projects if no search query
        if (!query.trim()) {
          setFilteredProjects(updatedProjects);
        }

        setPage(pagination.currentPage);
        // Calculate hasMore from pagination data if hasMore field is not provided
        const hasMore =
          pagination.hasMore !== undefined
            ? pagination.hasMore
            : pagination.currentPage < pagination.totalPages;
        setHasMoreProjects(hasMore);

        console.log("📊 Updated state:", {
          totalProjects: updatedProjects.length,
          hasMore,
          newPage: pagination.currentPage,
        });
      }
    } catch {
      toast.error("Lỗi không tải được dự án");
    } finally {
      setLoadingMore(false);
    }
  }, [
    loadingMore,
    hasMoreProjects,
    page,
    query,
    projects,
    PROJECT_LIMIT,
    categoryId,
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Add a small delay to ensure the dropdown is fully rendered
    const setupObserver = () => {
      const observerElement = observerRef.current;
      console.log("🔧 Setting up observer:", {
        element: !!observerElement,
        hasMoreProjects,
        loadingMore,
        loading,
        query: query.trim(),
      });

      if (!observerElement) {
        console.log("❌ No observer element found, will retry...");
        return null;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          console.log("🔍 Intersection observed:", {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            boundingClientRect: entry.boundingClientRect,
            hasMoreProjects,
            loadingMore,
            loading,
            query: query.trim(),
          });

          if (
            entry.isIntersecting &&
            hasMoreProjects &&
            !loadingMore &&
            !loading &&
            !query.trim() // Only auto-load when not searching
          ) {
            console.log("📥 Auto-loading more projects...");
            loadMoreProjects();
          } else {
            console.log("⏸️ Not triggering load:", {
              isIntersecting: entry.isIntersecting,
              hasMoreProjects,
              loadingMore,
              loading,
              hasQuery: !!query.trim(),
            });
          }
        },
        {
          threshold: 0.1, // Trigger when 10% of element is visible
          rootMargin: "20px", // Trigger 20px before element is fully visible
          root: null, // Use viewport as root
        }
      );

      console.log("👀 Starting to observe element");
      observer.observe(observerElement);
      return { observer, element: observerElement };
    };

    // Try to setup observer immediately
    let observerData = setupObserver();

    // If failed, retry after a short delay
    let retryTimeout: NodeJS.Timeout | null = null;
    if (!observerData) {
      retryTimeout = setTimeout(() => {
        observerData = setupObserver();
      }, 100);
    }

    return () => {
      console.log("🧹 Cleaning up observer");
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (observerData) {
        observerData.observer.unobserve(observerData.element);
        observerData.observer.disconnect();
      }
    };
  }, [hasMoreProjects, loadingMore, loading, loadMoreProjects, query]);

  return (
    <Combobox
      value={value}
      onChange={(newValue: string) => {
        console.log("🔄 Combobox onChange:", { from: value, to: newValue });
        onChange(newValue);
        // Clear search query when user selects a project
        setQuery("");
        // Close dropdown after selection
        setIsOpen(false);
      }}
      disabled={disabled}
    >
      {({ open }) => {
        console.log(
          "🔍 Combobox render - open state:",
          open,
          "manual isOpen:",
          isOpen
        );

        // Use manual state to control dropdown
        const actualOpen = isOpen;

        return (
          <div className="relative" ref={dropdownRef}>
            <div
              className="relative w-full overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={(e) => {
                console.log(
                  "🖱️ Container clicked - current open state:",
                  actualOpen
                );
                // Don't trigger if clicking on button or input directly
                if (
                  e.target === buttonRef.current ||
                  buttonRef.current?.contains(e.target as Node) ||
                  e.target === inputRef.current ||
                  inputRef.current?.contains(e.target as Node)
                ) {
                  return;
                }
                e.preventDefault();
                e.stopPropagation();

                // Always toggle the state
                const newState = !actualOpen;
                console.log("🔄 Toggling dropdown:", {
                  from: actualOpen,
                  to: newState,
                });

                if (newState) {
                  // Opening dropdown - prevent immediate close
                  setPreventClose(true);
                  setIsOpen(true);
                  setTimeout(() => setPreventClose(false), 100);
                } else {
                  // Closing dropdown - close immediately
                  setIsOpen(false);
                }
              }}
            >
              <Combobox.Input
                ref={inputRef}
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none cursor-pointer"
                displayValue={(projectId: string) => {
                  console.log("📝 DisplayValue called with:", {
                    projectId,
                    currentValue: value,
                    isOpen: actualOpen,
                  });

                  // Always show selected project name, not the search query
                  if (projectId === "" || projectId === "all") {
                    return "";
                  }
                  const project = projects.find((p) => p._id === projectId);
                  const displayText = project
                    ? `${project.name} - ${project.fullLocation}`
                    : "";
                  console.log("📝 Display text:", displayText);
                  return displayText;
                }}
                onChange={(event) => {
                  // Don't update query from main input
                  console.log(
                    "🔄 Input onChange (ignored):",
                    event.target.value
                  );
                }}
                onFocus={(e) => {
                  console.log("🎯 Input focused - opening dropdown");
                  e.preventDefault();
                  e.stopPropagation();

                  // Only open if not already open
                  if (!actualOpen) {
                    setJustFocused(true);
                    setPreventClose(true);
                    setIsOpen(true);
                    setTimeout(() => {
                      setPreventClose(false);
                      setJustFocused(false);
                    }, 200);
                  }
                }}
                onClick={(e) => {
                  console.log(
                    "🖱️ Input clicked - current state:",
                    actualOpen,
                    "justFocused:",
                    justFocused
                  );
                  e.preventDefault();
                  e.stopPropagation();

                  // Don't toggle if we just focused (which opened the dropdown)
                  if (justFocused) {
                    console.log("🚫 Skipping click because just focused");
                    return;
                  }

                  // Toggle state on input click
                  const newState = !actualOpen;
                  console.log("🔄 Input toggling dropdown:", {
                    from: actualOpen,
                    to: newState,
                  });

                  if (newState) {
                    setPreventClose(true);
                    setIsOpen(true);
                    setTimeout(() => setPreventClose(false), 100);
                  } else {
                    setIsOpen(false);
                  }
                }}
                onKeyDown={(event) => {
                  console.log("⌨️ Input keyDown:", event.key);
                }}
                placeholder="Chọn dự án..."
                title="Click để chọn dự án"
                readOnly={true}
              />
              <Combobox.Button
                ref={buttonRef}
                className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer hover:bg-gray-50"
                onClick={(e) => {
                  console.log("🔘 Button clicked - current state:", actualOpen);
                  e.preventDefault();
                  e.stopPropagation();

                  // Always toggle state on button click
                  const newState = !actualOpen;
                  console.log("🔄 Button toggling dropdown:", {
                    from: actualOpen,
                    to: newState,
                  });

                  if (newState) {
                    setPreventClose(true);
                    setIsOpen(true);
                    setTimeout(() => setPreventClose(false), 100);
                  } else {
                    setIsOpen(false);
                  }
                }}
              >
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    actualOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>

            {actualOpen && (
              <Combobox.Options
                className="absolute z-10 mt-1 max-h-96 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                static
                onScroll={(e) => {
                  const element = e.currentTarget;
                  const isNearBottom =
                    element.scrollTop + element.clientHeight >=
                    element.scrollHeight - 20;

                  console.log("📜 Scroll event:", {
                    scrollTop: element.scrollTop,
                    clientHeight: element.clientHeight,
                    scrollHeight: element.scrollHeight,
                    isNearBottom,
                    hasMoreProjects,
                    loadingMore,
                    loading,
                    query: query.trim(),
                  });

                  if (
                    isNearBottom &&
                    hasMoreProjects &&
                    !loadingMore &&
                    !loading &&
                    !query.trim()
                  ) {
                    console.log("📥 Scroll-triggered load more...");
                    loadMoreProjects();
                  }
                }}
              >
                {/* Search input */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm dự án..."
                      value={query}
                      onChange={(e) => {
                        e.stopPropagation();
                        setQuery(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation(); // Prevent Combobox from handling key events
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent dropdown from closing on click
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent dropdown from closing
                      }}
                      onFocus={(e) => {
                        e.stopPropagation(); // Prevent focus conflicts
                      }}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {query && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setQuery("");
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 flex items-center justify-center cursor-pointer"
                        title="Xóa tìm kiếm"
                        type="button"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {query && (
                    <div className="mt-2 text-xs text-blue-600">
                      🔍 Đang tìm kiếm: &ldquo;{query}&rdquo;
                    </div>
                  )}
                  {/* Category filter indicator */}
                  {categoryId && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      🏷️ Lọc theo loại dự án đã chọn
                    </div>
                  )}
                </div>

                <div className="py-1">
                  {/* Loading state */}
                  {loading && (
                    <div className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-700">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Đang tải dự án...
                      </div>
                    </div>
                  )}

                  {/* Show option to load all projects if limited results */}
                  {/* Removed - no longer showing load all option */}

                  {/* Project options */}
                  {filteredProjects.map((project) => (
                    <Combobox.Option
                      key={project._id}
                      value={project._id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? "bg-blue-600 text-white" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected, active }) => {
                        console.log("🎯 Project option render:", {
                          projectId: project._id,
                          projectName: project.name,
                          selected,
                          active,
                          currentValue: value,
                        });
                        return (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {project.name} - {project.fullLocation}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? "text-white" : "text-blue-600"
                                }`}
                              >
                                ✓
                              </span>
                            ) : null}
                          </>
                        );
                      }}
                    </Combobox.Option>
                  ))}

                  {/* No results */}
                  {!loading && filteredProjects.length === 0 && query && (
                    <div className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-700">
                      Không tìm thấy dự án nào phù hợp với &ldquo;{query}&rdquo;
                    </div>
                  )}

                  {/* Search result actions */}
                  {query && filteredProjects.length > 0 && (
                    <div className="relative cursor-default select-none py-3 pl-10 pr-4 text-center border-t border-gray-200 bg-gray-50">
                      <div className="space-y-2">
                        <div className="text-gray-600 text-sm">
                          Tìm thấy {filteredProjects.length} dự án cho &ldquo;
                          {query}
                          &rdquo;
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setQuery("");
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                          type="button"
                        >
                          Xóa tìm kiếm và xem tất cả dự án
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Load more trigger */}
                  {hasMoreProjects && !loading && !query && (
                    <div
                      ref={observerRef}
                      className="relative cursor-default select-none py-3 pl-10 pr-4 text-center border-t border-gray-200 min-h-[60px] flex flex-col justify-center bg-blue-50"
                      style={{ border: "2px dashed #3b82f6" }} // Debug: make element visible
                    >
                      {loadingMore ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-gray-600">
                            Đang tải thêm dự án...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-blue-600 text-sm font-medium">
                            Hiển thị {filteredProjects.length} dự án • Cuộn
                            xuống để tải thêm (Observer Active)
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log("🔄 Manual load more clicked");
                              loadMoreProjects();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            type="button"
                          >
                            Tải thêm dự án
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show total when no more projects */}
                  {!hasMoreProjects &&
                    filteredProjects.length > 0 &&
                    !loading &&
                    !query && (
                      <div className="relative cursor-default select-none py-2 pl-10 pr-4 text-center border-t border-gray-200">
                        <div className="text-gray-500 text-sm">
                          Đã hiển thị tất cả {filteredProjects.length} dự án
                        </div>
                      </div>
                    )}
                </div>
              </Combobox.Options>
            )}
          </div>
        );
      }}
    </Combobox>
  );
}
