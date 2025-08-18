"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import QuillEditor from "@/components/QuillEditor";
import {
  PencilIcon,
  EyeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { ProjectService } from "@/services/projectService";
import { UploadService } from "@/services/uploadService";
import { DeveloperService } from "@/services/developerService";
import AdminGuard from "@/components/auth/AdminGuard";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { Project } from "@/types/project";
import { DeveloperForSelection } from "@/types/developer";
import { showErrorToast, showSuccessToast } from "@/utils/errorHandler";

function AdminProjectEditPageInternal() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Developer selection states
  const [developers, setDevelopers] = useState<DeveloperForSelection[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<
    DeveloperForSelection[]
  >([]);
  const [developerSearch, setDeveloperSearch] = useState("");
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string>("");
  const [developersLoading, setDevelopersLoading] = useState(false);

  // Pagination for dropdown
  const [dropdownPage, setDropdownPage] = useState(0);
  const DROPDOWN_PAGE_SIZE = 10; // Show 10 items per "page"
  const MAX_DROPDOWN_ITEMS = 50; // Maximum items to show initially

  useEffect(() => {
    if (id) {
      ProjectService.getProjectById(id).then((data) => {
        setProject(data);
        // Set selected developer if project has one
        if (data && data.developer) {
          if (typeof data.developer === "string") {
            setSelectedDeveloperId(data.developer);
          } else if (typeof data.developer === "object") {
            // Find developer by name or other properties
            const foundDeveloper = developers.find(
              (dev) =>
                dev.name === data.developer.name ||
                dev.phone === data.developer.phone ||
                dev.email === data.developer.email
            );
            if (foundDeveloper) {
              setSelectedDeveloperId(foundDeveloper._id);
            }
          }
        }
        setLoading(false);
      });
    }
  }, [id, developers]);

  // Fetch developers for selection
  useEffect(() => {
    const fetchDevelopers = async () => {
      setDevelopersLoading(true);
      try {
        const developersData =
          await DeveloperService.getDevelopersForSelection();
        setDevelopers(developersData);
        setFilteredDevelopers(developersData);
      } catch {
        showErrorToast("Có lỗi xảy ra khi lấy danh sách nhà phát triển");
      } finally {
        setDevelopersLoading(false);
      }
    };
    fetchDevelopers();
  }, []);

  // Filter developers based on search
  useEffect(() => {
    const searchTermNormalized = removeVietnameseAccents(developerSearch);
    const filtered = developers.filter((developer) => {
      const nameNormalized = removeVietnameseAccents(developer.name);
      const phoneNormalized = removeVietnameseAccents(developer.phone);
      const emailNormalized = removeVietnameseAccents(developer.email);

      return (
        nameNormalized.includes(searchTermNormalized) ||
        phoneNormalized.includes(searchTermNormalized) ||
        emailNormalized.includes(searchTermNormalized)
      );
    });
    setFilteredDevelopers(filtered);
    setDropdownPage(0); // Reset pagination when search changes
  }, [developerSearch, developers]);

  // Update search field when developer is selected
  useEffect(() => {
    if (selectedDeveloperId && developers.length > 0) {
      const selectedDev = developers.find(
        (dev) => dev._id === selectedDeveloperId
      );
      if (selectedDev && developerSearch !== selectedDev.name) {
        setDeveloperSearch(selectedDev.name);
      }
    }
  }, [selectedDeveloperId, developers, developerSearch]);

  // Reset developer selection when search term changes (unless it matches selected developer)
  useEffect(() => {
    if (selectedDeveloperId && developers.length > 0) {
      const selectedDev = developers.find(
        (dev) => dev._id === selectedDeveloperId
      );
      // If search term doesn't match selected developer name, reset selection
      if (
        selectedDev &&
        developerSearch !== selectedDev.name &&
        developerSearch.trim() !== ""
      ) {
        setSelectedDeveloperId("");
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            developer: {
              name: "",
              logo: "",
              phone: "",
              email: "",
            },
          };
        });
      }
    }
  }, [developerSearch, selectedDeveloperId, developers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".developer-dropdown-container")) {
        setShowDeveloperDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Utility function to remove Vietnamese accents for search
  const removeVietnameseAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  // Utility function to highlight search term in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const searchTermNormalized = removeVietnameseAccents(searchTerm);
    const textNormalized = removeVietnameseAccents(text);

    // Find the position where the search term appears
    const index = textNormalized.indexOf(searchTermNormalized);
    if (index === -1) return text;

    // Calculate the actual length to highlight based on original search term
    const highlightLength = searchTermNormalized.length;

    // Get the original text parts
    const beforeMatch = text.substring(0, index);
    const match = text.substring(index, index + highlightLength);
    const afterMatch = text.substring(index + highlightLength);

    return (
      <>
        {beforeMatch}
        <span className="bg-yellow-200 font-medium">{match}</span>
        {afterMatch}
      </>
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === "number" ? (value ? parseFloat(value) : 0) : value,
      };
    });
  };

  // Handler for developer selection from dropdown
  const handleDeveloperSelect = (developer: DeveloperForSelection) => {
    setSelectedDeveloperId(developer._id);
    setDeveloperSearch(developer.name);
    setShowDeveloperDropdown(false);

    // Update project with selected developer info
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        developer: {
          name: developer.name,
          logo: developer.logo,
          phone: developer.phone,
          email: developer.email,
        },
      };
    });
  };

  const handleDescriptionChange = (value: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      return { ...prev, description: value };
    });
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          [key]: value,
        },
      };
    });
  };

  const handleFacilityChange = (index: number, value: string) => {
    setProject((prev) => {
      if (!prev || !prev.facilities) return prev;
      return {
        ...prev,
        facilities: prev.facilities.map((facility, i) =>
          i === index ? value : facility
        ),
      };
    });
  };

  const addFacility = () => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        facilities: [...(prev.facilities || []), ""],
      };
    });
  };

  const removeFacility = (index: number) => {
    setProject((prev) => {
      if (!prev || !prev.facilities) return prev;
      return {
        ...prev,
        facilities: prev.facilities.filter((_, i) => i !== index),
      };
    });
  };

  const handleLocationInsightChange = (
    category: keyof Project["locationInsights"],
    index: number,
    field: "name" | "distance",
    value: string
  ) => {
    setProject((prev) => {
      if (!prev || !prev.locationInsights || !prev.locationInsights[category])
        return prev;
      return {
        ...prev,
        locationInsights: {
          ...(prev.locationInsights || {}),
          [category]: prev.locationInsights[category].map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          ),
        },
      };
    });
  };

  const addLocationInsight = (category: keyof Project["locationInsights"]) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        locationInsights: {
          ...(prev.locationInsights || {}),
          [category]: [
            ...(prev.locationInsights?.[category] || []),
            { name: "", distance: "" },
          ],
        },
      };
    });
  };

  const removeLocationInsight = (
    category: keyof Project["locationInsights"],
    index: number
  ) => {
    setProject((prev) => {
      if (!prev || !prev.locationInsights || !prev.locationInsights[category])
        return prev;
      return {
        ...prev,
        locationInsights: {
          ...(prev.locationInsights || {}),
          [category]: prev.locationInsights[category].filter(
            (_, i) => i !== index
          ),
        },
      };
    });
  };

  const handleFaqChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    setProject((prev) => {
      if (!prev || !prev.faqs) return prev;
      return {
        ...prev,
        faqs: prev.faqs.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      };
    });
  };

  const addFaq = () => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        faqs: [...(prev.faqs || []), { question: "", answer: "" }],
      };
    });
  };

  const removeFaq = (index: number) => {
    setProject((prev) => {
      if (!prev || !prev.faqs) return prev;
      return {
        ...prev,
        faqs: prev.faqs.filter((_, i) => i !== index),
      };
    });
  };

  // Handle specifications
  const addSpecification = () => {
    const timestamp = Date.now();
    const newKey = `Thông số ${timestamp}`;
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          [newKey]: "",
        },
      };
    });
  };

  const removeSpecification = (key: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const newSpecs = { ...(prev.specifications || {}) };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
  };

  const handleSpecificationKeyChange = (oldKey: string, newKey: string) => {
    if (newKey.trim() === oldKey) return;

    setProject((prev) => {
      if (!prev) return prev;
      const specs = { ...(prev.specifications || {}) };
      const value = specs[oldKey] || "";
      delete specs[oldKey];
      specs[newKey.trim()] = value;
      return {
        ...prev,
        specifications: specs,
      };
    });
  };

  // Handle images and videos
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadResults = await UploadService.uploadImages(files);
      const successfulUploads = uploadResults
        .filter((result) => result.success)
        .map((result) => result.data?.url)
        .filter(Boolean) as string[];

      if (successfulUploads.length > 0) {
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            images: [...(prev.images || []), ...successfulUploads],
          };
        });
      }
    } catch {
      showErrorToast("Có lỗi xảy ra khi upload hình ảnh");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setProject((prev) => {
      if (!prev || !prev.images) return prev;
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  };

  const handleVideoChange = (index: number, value: string) => {
    setProject((prev) => {
      if (!prev || !prev.videos) return prev;
      return {
        ...prev,
        videos: prev.videos.map((video, i) => (i === index ? value : video)),
      };
    });
  };

  const addVideo = () => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        videos: [...(prev.videos || []), ""],
      };
    });
  };

  const removeVideo = (index: number) => {
    setProject((prev) => {
      if (!prev || !prev.videos) return prev;
      return {
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index),
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !id) return;

    // Validate that a developer is selected
    if (!selectedDeveloperId) {
      alert("Vui lòng chọn chủ đầu tư!");
      return;
    }

    setSaving(true);
    try {
      await ProjectService.updateProject({
        ...project,
        id,
        developer: selectedDeveloperId, // Send developer ID instead of object
        category:
          typeof project.category === "object"
            ? project.category._id
            : project.category, // Send category ID
      });
      showSuccessToast("Đã lưu thay đổi!");
    } catch {
      showErrorToast("Có lỗi xảy ra khi lưu!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu dự án...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="text-center py-12">
              <p className="text-red-600">Không tìm thấy dự án</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/quan-ly-du-an")}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Quay lại danh sách dự án"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
              <div className="flex items-center gap-2">
                <PencilIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold">
                  Quản lý dự án: {project.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <EyeIcon className="w-4 h-4" />
                {previewMode ? "Chỉnh sửa" : "Xem trước"}
              </button>
              <PermissionGuard permission={PERMISSIONS.PROJECT.EDIT}>
                <button
                  type="submit"
                  form="project-form"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </PermissionGuard>
            </div>
          </div>

          {previewMode ? (
            /* Chế độ xem trước */
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
                <p className="text-gray-600 mb-4">
                  {project.address}, {project.fullLocation}
                </p>

                {/* Featured badge */}
                {project.isFeatured && (
                  <div className="mb-4">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                      <i className="fas fa-star mr-2"></i>
                      Dự án nổi bật
                    </span>
                  </div>
                )}

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.totalUnits}
                    </div>
                    <div className="text-sm text-gray-500">căn hộ</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.area}
                    </div>
                    <div className="text-sm text-gray-500">diện tích</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.numberOfTowers}
                    </div>
                    <div className="text-sm text-gray-500">tòa</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {project.density}
                    </div>
                    <div className="text-sm text-gray-500">mật độ xây dựng</div>
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Mô tả dự án</h3>
                <div
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Tiện ích */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Tiện ích</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(project.facilities || []).map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <i className="fas fa-check-circle text-green-500 text-sm"></i>
                      <span className="text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thông số kỹ thuật */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  Thông số kỹ thuật
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(project.specifications || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b"
                      >
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Hình ảnh dự án */}
              {(project.images || []).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Hình ảnh dự án</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {project.images.map((image, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={image}
                          alt={`Project image ${index + 1}`}
                          width={300}
                          height={200}
                          className="w-full h-40 object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video dự án */}
              {(project.videos || []).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Video dự án</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(project.videos || [])
                      .filter((video) => video.trim())
                      .map((video, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <i className="fas fa-video text-blue-500"></i>
                            <span className="font-medium">
                              Video {index + 1}
                            </span>
                          </div>
                          <a
                            href={video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all"
                          >
                            {video}
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Chế độ chỉnh sửa */
            <form id="project-form" onSubmit={handleSave} className="space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b">
                  <nav className="flex space-x-8 px-6">
                    {[
                      {
                        key: "basic",
                        label: "Thông tin cơ bản",
                        icon: "fas fa-info-circle",
                      },
                      {
                        key: "description",
                        label: "Mô tả chi tiết",
                        icon: "fas fa-file-text",
                      },
                      {
                        key: "media",
                        label: "Hình ảnh & Video",
                        icon: "fas fa-images",
                      },
                      {
                        key: "specifications",
                        label: "Thông số kỹ thuật",
                        icon: "fas fa-cogs",
                      },
                      {
                        key: "facilities",
                        label: "Tiện ích",
                        icon: "fas fa-star",
                      },
                      {
                        key: "location",
                        label: "Vị trí & Tiện ích xung quanh",
                        icon: "fas fa-map-marker-alt",
                      },
                      {
                        key: "faq",
                        label: "FAQ",
                        icon: "fas fa-question-circle",
                      },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === tab.key
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        <i className={tab.icon}></i>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Tab: Thông tin cơ bản */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên dự án *
                          </label>
                          <input
                            name="name"
                            value={project.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug *
                          </label>
                          <input
                            name="slug"
                            value={project.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ
                          </label>
                          <input
                            name="address"
                            value={project.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Dự án nổi bật
                          </label>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="isFeatured"
                                checked={project.isFeatured === true}
                                onChange={() =>
                                  setProject((prev) => {
                                    if (!prev) return prev;
                                    return { ...prev, isFeatured: true };
                                  })
                                }
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Có
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="isFeatured"
                                checked={project.isFeatured === false}
                                onChange={() =>
                                  setProject((prev) => {
                                    if (!prev) return prev;
                                    return { ...prev, isFeatured: false };
                                  })
                                }
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Không
                              </span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Dự án nổi bật sẽ được hiển thị trong danh sách nổi
                            bật trên trang chủ
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                          </label>
                          <select
                            name="status"
                            value={project.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Đang cập nhật">Đang cập nhật</option>
                            <option value="Sắp mở bán">Sắp mở bán</option>
                            <option value="Đang bán">Đang bán</option>
                            <option value="Đã bàn giao">Đã bàn giao</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Khoảng giá
                          </label>
                          <input
                            name="priceRange"
                            value={project.priceRange}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tổng số căn
                          </label>
                          <input
                            name="totalUnits"
                            value={project.totalUnits}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Diện tích
                          </label>
                          <input
                            name="area"
                            value={project.area}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số tòa nhà
                          </label>
                          <input
                            name="numberOfTowers"
                            value={project.numberOfTowers}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật độ xây dựng
                          </label>
                          <input
                            name="density"
                            value={project.density}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Latitude
                          </label>
                          <input
                            name="latitude"
                            value={project.latitude}
                            onChange={handleChange}
                            type="number"
                            step="any"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Longitude
                          </label>
                          <input
                            name="longitude"
                            value={project.longitude}
                            onChange={handleChange}
                            type="number"
                            step="any"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Thông tin chủ đầu tư */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Thông tin chủ đầu tư
                        </h3>
                        <div className="space-y-6">
                          {/* Developer Selection Dropdown */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chọn chủ đầu tư *
                            </label>
                            <div className="relative developer-dropdown-container">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  value={developerSearch}
                                  onChange={(e) => {
                                    setDeveloperSearch(e.target.value);
                                    setShowDeveloperDropdown(true);
                                  }}
                                  onFocus={() => setShowDeveloperDropdown(true)}
                                  placeholder="Tìm kiếm chủ đầu tư..."
                                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                                {developerSearch && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeveloperSearch("");
                                      setSelectedDeveloperId("");
                                      setShowDeveloperDropdown(true); // Show dropdown to select new developer
                                      setProject((prev) => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          developer: {
                                            name: "",
                                            logo: "",
                                            phone: "",
                                            email: "",
                                          },
                                        };
                                      });
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    title="Xóa để tìm kiếm chủ đầu tư khác"
                                  >
                                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  </button>
                                )}
                              </div>

                              {/* Dropdown */}
                              {showDeveloperDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                  {developersLoading ? (
                                    <div className="p-3 text-center">
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                      <p className="mt-2 text-sm text-gray-500">
                                        Đang tải chủ đầu tư...
                                      </p>
                                    </div>
                                  ) : filteredDevelopers.length > 0 ? (
                                    <>
                                      {/* Info header */}
                                      {filteredDevelopers.length >
                                        DROPDOWN_PAGE_SIZE && (
                                        <div className="p-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                                          Hiển thị{" "}
                                          {Math.min(
                                            (dropdownPage + 1) *
                                              DROPDOWN_PAGE_SIZE,
                                            filteredDevelopers.length
                                          )}
                                          /{filteredDevelopers.length} kết quả
                                          {filteredDevelopers.length >
                                            MAX_DROPDOWN_ITEMS && (
                                            <span className="block">
                                              Sử dụng tìm kiếm để thu hẹp kết
                                              quả
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {/* Developer list */}
                                      {filteredDevelopers
                                        .slice(
                                          0,
                                          (dropdownPage + 1) *
                                            DROPDOWN_PAGE_SIZE
                                        )
                                        .map((developer) => (
                                          <div
                                            key={developer._id}
                                            onClick={() =>
                                              handleDeveloperSelect(developer)
                                            }
                                            className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                              selectedDeveloperId ===
                                              developer._id
                                                ? "bg-blue-50"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              {developer.logo && (
                                                <Image
                                                  src={developer.logo}
                                                  alt={developer.name}
                                                  width={32}
                                                  height={32}
                                                  className="w-8 h-8 object-contain rounded"
                                                  unoptimized
                                                />
                                              )}
                                              <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                  {highlightSearchTerm(
                                                    developer.name,
                                                    developerSearch
                                                  )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  {highlightSearchTerm(
                                                    developer.phone,
                                                    developerSearch
                                                  )}{" "}
                                                  •{" "}
                                                  {highlightSearchTerm(
                                                    developer.email,
                                                    developerSearch
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}

                                      {/* Load more button */}
                                      {filteredDevelopers.length >
                                        (dropdownPage + 1) *
                                          DROPDOWN_PAGE_SIZE && (
                                        <div className="p-2 border-t border-gray-100">
                                          <button
                                            onClick={() =>
                                              setDropdownPage(
                                                (prev) => prev + 1
                                              )
                                            }
                                            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 hover:bg-gray-50 py-2 rounded"
                                          >
                                            Xem thêm (
                                            {filteredDevelopers.length -
                                              (dropdownPage + 1) *
                                                DROPDOWN_PAGE_SIZE}{" "}
                                            còn lại)
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="p-3 text-gray-500 text-center">
                                      {developers.length === 0
                                        ? "Chưa có chủ đầu tư nào"
                                        : "Không tìm thấy chủ đầu tư nào"}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Selected Developer Preview */}
                          {selectedDeveloperId && project.developer && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Thông tin chủ đầu tư đã chọn:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                  {project.developer.logo && (
                                    <Image
                                      src={project.developer.logo}
                                      alt={project.developer.name}
                                      width={48}
                                      height={48}
                                      className="w-12 h-12 object-contain rounded border"
                                      unoptimized
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {project.developer.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {project.developer.phone}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {project.developer.email}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Mô tả chi tiết */}
                  {activeTab === "description" && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả dự án
                        </label>
                        <QuillEditor
                          value={project.description}
                          onChange={handleDescriptionChange}
                        />
                      </div>

                      {/* Preview Section - Sửa class name */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Xem trước mô tả:
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          {project.description ? (
                            <div
                              className="description-preview"
                              dangerouslySetInnerHTML={{
                                __html: project.description,
                              }}
                            />
                          ) : (
                            <p className="text-gray-400 italic">
                              Chưa có mô tả. Hãy nhập nội dung ở trên để xem
                              trước.
                            </p>
                          )}
                        </div>
                      </div>
                      {/* CSS cho preview */}
                      <style jsx global>{`
                        .description-preview {
                          line-height: 1.7;
                          color: #374151;
                        }

                        .description-preview h1 {
                          font-size: 2rem !important;
                          font-weight: 700 !important;
                          margin-bottom: 1.5rem !important;
                          color: #1f2937 !important;
                          line-height: 1.2 !important;
                        }

                        .description-preview h2 {
                          font-size: 1.5rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 1.25rem !important;
                          margin-top: 2rem !important;
                          color: #1f2937 !important;
                          line-height: 1.3 !important;
                        }

                        .description-preview h3 {
                          font-size: 1.25rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 1rem !important;
                          margin-top: 1.5rem !important;
                          color: #1f2937 !important;
                          line-height: 1.4 !important;
                        }

                        .description-preview h4 {
                          font-size: 1.125rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 0.75rem !important;
                          margin-top: 1.25rem !important;
                          color: #1f2937 !important;
                          line-height: 1.4 !important;
                        }

                        .description-preview h5 {
                          font-size: 1rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 0.5rem !important;
                          margin-top: 1rem !important;
                          color: #1f2937 !important;
                          line-height: 1.5 !important;
                        }

                        .description-preview h6 {
                          font-size: 0.875rem !important;
                          font-weight: 600 !important;
                          margin-bottom: 0.5rem !important;
                          margin-top: 1rem !important;
                          color: #1f2937 !important;
                          line-height: 1.5 !important;
                        }

                        .description-preview p {
                          margin-bottom: 1rem !important;
                          line-height: 1.7 !important;
                          color: #374151 !important;
                        }

                        .description-preview strong,
                        .description-preview b {
                          font-weight: 700 !important;
                          color: #1f2937 !important;
                        }

                        .description-preview em,
                        .description-preview i {
                          font-style: italic !important;
                          color: #4b5563 !important;
                        }

                        .description-preview u {
                          text-decoration: underline !important;
                        }

                        .description-preview ul {
                          margin-bottom: 1rem !important;
                          padding-left: 1.5rem !important;
                          list-style-type: disc !important;
                        }

                        .description-preview ol {
                          margin-bottom: 1rem !important;
                          padding-left: 1.5rem !important;
                          list-style-type: decimal !important;
                        }

                        .description-preview li {
                          margin-bottom: 0.5rem !important;
                          line-height: 1.6 !important;
                          color: #374151 !important;
                        }

                        .description-preview blockquote {
                          border-left: 4px solid #3b82f6 !important;
                          padding-left: 1rem !important;
                          margin: 1.5rem 0 !important;
                          color: #6b7280 !important;
                          font-style: italic !important;
                          background-color: #f8fafc !important;
                          padding: 1rem !important;
                          border-radius: 0.375rem !important;
                        }

                        .description-preview a {
                          color: #2563eb !important;
                          text-decoration: underline !important;
                          font-weight: 500 !important;
                        }

                        .description-preview a:hover {
                          color: #1d4ed8 !important;
                          text-decoration: none !important;
                        }

                        .description-preview img {
                          max-width: 100% !important;
                          height: auto !important;
                          margin: 1.5rem 0 !important;
                          border-radius: 0.5rem !important;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                        }

                        .description-preview pre {
                          background-color: #1f2937 !important;
                          color: #f9fafb !important;
                          padding: 1rem !important;
                          border-radius: 0.5rem !important;
                          font-family: "Courier New", monospace !important;
                          font-size: 0.875rem !important;
                          margin: 1.5rem 0 !important;
                          overflow-x: auto !important;
                          line-height: 1.5 !important;
                        }

                        .description-preview hr {
                          border: none !important;
                          border-top: 2px solid #e5e7eb !important;
                          margin: 2rem 0 !important;
                        }

                        .description-preview table {
                          width: 100% !important;
                          border-collapse: collapse !important;
                          margin: 1.5rem 0 !important;
                        }

                        .description-preview th,
                        .description-preview td {
                          border: 1px solid #e5e7eb !important;
                          padding: 0.75rem !important;
                          text-align: left !important;
                        }

                        .description-preview th {
                          background-color: #f9fafb !important;
                          font-weight: 600 !important;
                          color: #1f2937 !important;
                        }

                        .description-preview code {
                          background-color: #f3f4f6 !important;
                          color: #dc2626 !important;
                          padding: 0.125rem 0.25rem !important;
                          border-radius: 0.25rem !important;
                          font-family: "Courier New", monospace !important;
                          font-size: 0.875rem !important;
                        }

                        /* Đảm bảo text alignment */
                        .description-preview * {
                          direction: ltr !important;
                          text-align: left !important;
                        }

                        .description-preview [style*="text-align: center"] {
                          text-align: center !important;
                        }

                        .description-preview [style*="text-align: right"] {
                          text-align: right !important;
                        }

                        .description-preview [style*="text-align: justify"] {
                          text-align: justify !important;
                        }
                      `}</style>
                    </div>
                  )}

                  {/* Tab: Hình ảnh & Video */}
                  {activeTab === "media" && (
                    <div className="space-y-6">
                      {/* Images Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">
                            Hình ảnh dự án
                          </h3>
                          <div>
                            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                              <i className="fas fa-upload mr-2"></i>
                              {uploading ? "Đang upload..." : "Upload hình ảnh"}
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                disabled={uploading}
                                onChange={(e) =>
                                  handleImageUpload(e.target.files)
                                }
                              />
                            </label>
                          </div>
                        </div>

                        {/* Images Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {(project.images || []).map((image, index) => (
                            <div
                              key={index}
                              className="relative group border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <Image
                                src={image}
                                alt={`Project image ${index + 1}`}
                                width={300}
                                height={200}
                                className="w-full h-40 object-cover"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Xóa hình ảnh"
                              >
                                <i className="fas fa-times text-xs"></i>
                              </button>
                            </div>
                          ))}
                        </div>

                        {(project.images || []).length === 0 && (
                          <div className="text-center py-8 border border-gray-200 rounded-lg border-dashed">
                            <i className="fas fa-images text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">
                              Chưa có hình ảnh nào
                            </p>
                            <p className="text-sm text-gray-400">
                              Sử dụng nút &quot;Upload hình ảnh&quot; để thêm
                              hình ảnh
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Videos Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">
                            Video dự án (Link YouTube/Vimeo)
                          </h3>
                          <button
                            type="button"
                            onClick={addVideo}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <i className="fas fa-plus mr-2"></i>
                            Thêm video
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(project.videos || []).map((video, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <input
                                placeholder="Nhập link video (YouTube, Vimeo, etc.)"
                                value={video}
                                onChange={(e) =>
                                  handleVideoChange(index, e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => removeVideo(index)}
                                className="p-2 text-red-600 hover:text-red-800"
                                title="Xóa video"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ))}
                        </div>

                        {(project.videos || []).length === 0 && (
                          <div className="text-center py-8 border border-gray-200 rounded-lg border-dashed">
                            <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">Chưa có video nào</p>
                            <p className="text-sm text-gray-400">
                              Sử dụng nút &quot;Thêm video&quot; để thêm link
                              video
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab: Thông số kỹ thuật */}
                  {activeTab === "specifications" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Thông số kỹ thuật
                        </h3>
                      </div>

                      {/* Add new specification form */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">
                            Thêm thông số kỹ thuật mới
                          </h4>
                          <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => addSpecification()}
                          >
                            <i className="fas fa-plus mr-2"></i>
                            Thêm thông số
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(project.specifications || {}).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Tên thông số
                                  </label>
                                  <input
                                    placeholder="Tên thông số"
                                    value={key}
                                    onChange={(e) =>
                                      handleSpecificationKeyChange(
                                        key,
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Giá trị
                                    </label>
                                    <input
                                      placeholder="Giá trị"
                                      value={value}
                                      onChange={(e) =>
                                        handleSpecificationChange(
                                          key,
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <button
                                      type="button"
                                      onClick={() => removeSpecification(key)}
                                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                      title="Xóa thông số"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}

                        {Object.keys(project.specifications || {}).length ===
                          0 && (
                          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                            <i className="fas fa-cogs text-3xl mb-2"></i>
                            <p className="font-medium">
                              Chưa có thông số kỹ thuật nào
                            </p>
                            <p className="text-sm">
                              Sử dụng form bên trên để thêm thông số mới
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab: Tiện ích */}
                  {activeTab === "facilities" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Tiện ích dự án
                        </h3>
                        <button
                          type="button"
                          onClick={addFacility}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Thêm tiện ích
                        </button>
                      </div>
                      <div className="space-y-3">
                        {project.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              placeholder="Tên tiện ích"
                              value={facility}
                              onChange={(e) =>
                                handleFacilityChange(index, e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeFacility(index)}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab: Vị trí & Tiện ích xung quanh */}
                  {activeTab === "location" && (
                    <div className="space-y-6">
                      {Object.entries(project.locationInsights || {}).map(
                        ([category, items]) => (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold capitalize">
                                {category === "schools"
                                  ? "Trường học"
                                  : category === "hospitals"
                                  ? "Bệnh viện"
                                  : category === "supermarkets"
                                  ? "Siêu thị"
                                  : category === "parks"
                                  ? "Công viên"
                                  : "Nhà hàng"}
                              </h3>
                              <button
                                type="button"
                                onClick={() =>
                                  addLocationInsight(
                                    category as keyof Project["locationInsights"]
                                  )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                Thêm
                              </button>
                            </div>
                            <div className="space-y-3">
                              {items.map(
                                (
                                  item: { name: string; distance: string },
                                  index: number
                                ) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-2 gap-2"
                                  >
                                    <input
                                      placeholder="Tên địa điểm"
                                      value={item.name}
                                      onChange={(e) =>
                                        handleLocationInsightChange(
                                          category as keyof Project["locationInsights"],
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex gap-2">
                                      <input
                                        placeholder="Khoảng cách"
                                        value={item.distance}
                                        onChange={(e) =>
                                          handleLocationInsightChange(
                                            category as keyof Project["locationInsights"],
                                            index,
                                            "distance",
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeLocationInsight(
                                            category as keyof Project["locationInsights"],
                                            index
                                          )
                                        }
                                        className="p-2 text-red-600 hover:text-red-800"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Tab: FAQ */}
                  {activeTab === "faq" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Câu hỏi thường gặp
                        </h3>
                        <button
                          type="button"
                          onClick={addFaq}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Thêm câu hỏi
                        </button>
                      </div>
                      <div className="space-y-4">
                        {project.faqs.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">
                                Câu hỏi {index + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeFaq(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                placeholder="Nhập câu hỏi..."
                                value={item.question}
                                onChange={(e) =>
                                  handleFaqChange(
                                    index,
                                    "question",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <textarea
                                placeholder="Nhập câu trả lời..."
                                value={item.answer}
                                onChange={(e) =>
                                  handleFaqChange(
                                    index,
                                    "answer",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

// Wrap component with AdminGuard
export default function AdminProjectEditPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.PROJECT.VIEW]}>
      <AdminProjectEditPageInternal />
    </AdminGuard>
  );
}
