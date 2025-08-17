"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import AdminGuard from "@/components/auth/AdminGuard";
import PermissionGuard from "@/components/auth/PermissionGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { newsService, NewsCategory } from "@/services/newsService";
import { UploadService } from "@/services/uploadService";
import dynamic from "next/dynamic";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PERMISSIONS } from "@/constants/permissions";
import { toast } from "sonner";

// Dynamically import Quill editor to avoid SSR issues
const EditorWrapper = dynamic(() => import("@/components/EditorWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-100 rounded border flex items-center justify-center">
      Đang tải editor...
    </div>
  ),
});

/**
 * News Lifecycle:
 * - pending: Chờ duyệt (bài đang chờ quản trị viên duyệt)
 * - published: Đã xuất bản (đang hiển thị cho người dùng)
 * - rejected: Đã hạ (không hiển thị cho người dùng, sẽ tự động xóa sau 30 ngày)
 */
interface NewsData {
  _id: string;
  title: string;
  content: string;
  featuredImage?: string;
  category: string; // Thay đổi từ union types thành string
  status: "draft" | "pending" | "published" | "rejected"; // Keep draft for now for compatibility
  isHot: boolean;
  isFeatured: boolean;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { can } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [news, setNews] = useState<NewsData | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // State cho categories dynamic
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featuredImage: "",
    category: "" as string, // Thay đổi từ union types
    status: "pending" as "draft" | "pending" | "published" | "rejected", // Default to pending now
    isHot: false,
    isFeatured: false,
  });

  const newsId = params.id as string;

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await newsService.getNewsCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch {
        toast.error("Có lỗi xảy ra khi tải danh mục");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching news with ID:", newsId); // Debug log
      const response = await newsService.getNewsById(newsId);
      console.log("API Response:", response); // Debug log
      if (response.success) {
        const newsData = response.data;
        console.log("News data:", newsData); // Debug log
        setNews(newsData);

        // Update form data with the fetched news data
        // Log the content specifically to debug
        console.log("Content from API:", newsData.content);

        setFormData({
          title: newsData.title || "",
          content: newsData.content || "",
          featuredImage: newsData.featuredImage || "",
          category: newsData.category || "tong-hop",
          status: newsData.status || "draft",
          isHot: newsData.isHot || false,
          isFeatured: newsData.isFeatured || false,
        });

        console.log("Form data updated:", {
          title: newsData.title,
          category: newsData.category,
          status: newsData.status,
          isHot: newsData.isHot,
          isFeatured: newsData.isFeatured,
        });
      } else {
        toast.error("Không tìm thấy tin tức");
        router.push("/admin/quan-ly-tin-tuc");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải tin tức");
      router.push("/admin/quan-ly-tin-tuc");
    } finally {
      setLoading(false);
    }
  }, [newsId, router]);

  useEffect(() => {
    if (isAuthenticated && newsId) {
      fetchNews();
    }
  }, [isAuthenticated, newsId, fetchNews]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (
        formData.featuredImage &&
        formData.featuredImage.startsWith("blob:")
      ) {
        URL.revokeObjectURL(formData.featuredImage);
      }
    };
  }, [formData.featuredImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setSaving(true);

      // Prepare data để gửi lên server
      // Ensure we have the correct type for the API
      const updateData = {
        ...formData,
        // Make sure status is compatible with the API
        status: formData.status === "draft" ? "pending" : formData.status,
      };

      // Nếu có file ảnh mới được chọn, upload trước
      if (selectedImageFile) {
        console.log("Uploading new image:", selectedImageFile.name);
        const uploadResult = await UploadService.uploadImage(selectedImageFile);

        if (uploadResult.success && uploadResult.data?.url) {
          updateData.featuredImage = uploadResult.data.url;
          console.log("Image uploaded successfully:", uploadResult.data.url);

          // Clear selected file sau khi upload thành công
          setSelectedImageFile(null);
        } else {
          alert("Không thể upload ảnh. Vui lòng thử lại.");
          return;
        }
      } else if (formData.featuredImage.startsWith("blob:")) {
        // Nếu vẫn còn blob URL mà không có file mới, không gửi ảnh
        updateData.featuredImage = news?.featuredImage || "";
      }

      console.log("Sending update data:", updateData);
      const response = await newsService.updateNews(newsId, updateData);

      if (response.success) {
        alert("Cập nhật tin tức thành công!");
        router.push("/admin/quan-ly-tin-tuc");
      } else {
        alert(response.message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật tin tức");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin tức "${news?.title}"?`)) return;

    try {
      const response = await newsService.deleteNews(newsId);
      if (response.success) {
        alert("Đã xóa tin tức thành công!");
        router.push("/admin/quan-ly-tin-tuc");
      } else {
        alert(response.message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa tin tức");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }

      // Clean up previous blob URL to prevent memory leaks
      if (
        formData.featuredImage &&
        formData.featuredImage.startsWith("blob:")
      ) {
        URL.revokeObjectURL(formData.featuredImage);
      }

      // Lưu file để upload sau và tạo blob URL cho preview
      setSelectedImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, featuredImage: imageUrl });

      console.log(
        "New image selected:",
        file.name,
        "Size:",
        (file.size / 1024 / 1024).toFixed(2) + "MB"
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <button
            onClick={() => router.push("/dang-nhap")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/admin/quan-ly-tin-tuc")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Quay lại
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Chỉnh sửa tin tức
                  </h1>
                </div>
                <PermissionGuard permission={PERMISSIONS.NEWS.DELETE}>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Xóa tin tức
                  </button>
                </PermissionGuard>
              </div>
            </div>

            {/* News Info */}
            {news && (
              <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tác giả:</span>
                    <p className="font-medium">
                      {news.author?.username || "Không có tác giả"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngày tạo:</span>
                    <p className="font-medium">
                      {new Date(news.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngày cập nhật:</span>
                    <p className="font-medium">
                      {new Date(news.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <p className="font-medium text-xs">{news._id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề tin tức..."
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  {categoriesLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      Đang tải danh mục...
                    </div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh đại diện
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedImageFile && (
                    <p className="text-sm text-blue-600 mt-1">
                      ✓ Đã chọn ảnh mới: {selectedImageFile.name} - Sẽ được
                      upload khi lưu
                    </p>
                  )}
                  {formData.featuredImage && (
                    <div className="mt-2">
                      {formData.featuredImage.startsWith("blob:") ? (
                        // Hiển thị blob URL cho ảnh mới upload
                        <div>
                          <Image
                            src={formData.featuredImage}
                            alt="Preview ảnh mới"
                            width={128}
                            height={80}
                            className="w-32 h-20 object-cover rounded border"
                            onError={() => {
                              toast.error("Không thể hiển thị ảnh mới");
                            }}
                          />
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              Preview ảnh mới
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  formData.featuredImage.startsWith("blob:")
                                ) {
                                  URL.revokeObjectURL(formData.featuredImage);
                                }
                                setFormData({
                                  ...formData,
                                  featuredImage: news?.featuredImage || "",
                                });
                                setSelectedImageFile(null);
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Hủy chọn
                            </button>
                          </div>
                        </div>
                      ) : formData.featuredImage.startsWith("http") ? (
                        // Hiển thị URL thông thường từ server
                        <div>
                          <Image
                            src={formData.featuredImage}
                            alt="Ảnh hiện tại"
                            width={128}
                            height={80}
                            className="w-32 h-20 object-cover rounded border"
                            onError={() => {
                              toast.error("Không thể tải ảnh từ URL");
                            }}
                          />
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              Ảnh hiện tại từ server
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, featuredImage: "" });
                                setSelectedImageFile(null);
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Placeholder cho các trường hợp khác (local path, relative path, etc.)
                        <div className="w-32 h-20 bg-gray-200 rounded border flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-xs text-gray-500 block">
                              Ảnh hiện tại
                            </span>
                            <span className="text-xs text-gray-400">
                              {formData.featuredImage.length > 20
                                ? formData.featuredImage.slice(0, 20) + "..."
                                : formData.featuredImage}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <EditorWrapper
                      value={formData.content}
                      onChange={(content: string) =>
                        setFormData({ ...formData, content })
                      }
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as
                            | "draft"
                            | "pending"
                            | "published"
                            | "rejected",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Chờ duyệt</option>
                      <option value="draft">Bản nháp</option>

                      {/* Admin có thể thay đổi sang published và rejected */}
                      {user?.role === "admin" && (
                        <>
                          <option value="published">Đã xuất bản</option>
                          <option value="rejected">Đã từ chối</option>
                        </>
                      )}

                      {/* Employee có quyền publish_news có thể xuất bản trực tiếp */}
                      {user?.role === "employee" &&
                        can(PERMISSIONS.NEWS.PUBLISH) && (
                          <option value="published">Đã xuất bản</option>
                        )}
                    </select>

                    {/* Hiển thị thông báo về quyền hạn */}
                    {user?.role === "employee" &&
                      !can(PERMISSIONS.NEWS.PUBLISH) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Bạn chỉ có thể lưu bản nháp hoặc gửi để chờ duyệt.
                          Liên hệ admin để được cấp quyền xuất bản.
                        </p>
                      )}

                    {user?.role === "employee" &&
                      can(PERMISSIONS.NEWS.PUBLISH) && (
                        <p className="text-xs text-green-600 mt-1">
                          Bạn có quyền xuất bản bài viết trực tiếp.
                        </p>
                      )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isHot"
                      checked={formData.isHot}
                      onChange={(e) =>
                        setFormData({ ...formData, isHot: e.target.checked })
                      }
                      disabled={
                        !can(PERMISSIONS.NEWS.FEATURE) && user?.role !== "admin"
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label
                      htmlFor="isHot"
                      className={`ml-2 text-sm ${
                        !can(PERMISSIONS.NEWS.FEATURE) && user?.role !== "admin"
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      Tin nóng
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFeatured: e.target.checked,
                        })
                      }
                      disabled={
                        !can(PERMISSIONS.NEWS.FEATURE) && user?.role !== "admin"
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label
                      htmlFor="isFeatured"
                      className={`ml-2 text-sm ${
                        !can(PERMISSIONS.NEWS.FEATURE) && user?.role !== "admin"
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      Tin nổi bật
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/quan-ly-tin-tuc")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Cập nhật tin tức"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrap component with AdminGuard
export default function ProtectedEditNewsPage() {
  return (
    <AdminGuard permissions={[PERMISSIONS.NEWS.VIEW]}>
      <EditNewsPage />
    </AdminGuard>
  );
}
