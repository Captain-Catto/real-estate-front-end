"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import dynamic from "next/dynamic";
import { newsService, CreateNewsData } from "@/services/newsService";
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

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
interface NewsFormData {
  title: string;
  content: string;
  featuredImage: string;
  category: "mua-ban" | "cho-thue" | "tai-chinh" | "phong-thuy" | "tong-hop";
  status: "pending" | "published" | "rejected";
  isHot: boolean;
  isFeatured: boolean;
}

const categories = [
  { value: "mua-ban", label: "Mua bán" },
  { value: "cho-thue", label: "Cho thuê" },
  { value: "tai-chinh", label: "Tài chính" },
  { value: "phong-thuy", label: "Phong thủy" },
  { value: "tong-hop", label: "Tổng hợp" },
];

export default function CreateNewsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    featuredImage: "",
    category: "tong-hop",
    status: "pending", // Default to pending status
    isHot: false,
    isFeatured: false,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleContentChange = (content: string) => {
    console.log("Content changed, length:", content.length);
    // Sử dụng setFormData để cập nhật state mà không làm mất các giá trị khác
    setFormData((prev) => {
      // Đảm bảo các giá trị khác được giữ nguyên
      const updatedFormData = {
        ...prev,
        content: content,
      };

      // Log giá trị content mới để debug
      console.log("Content updated to:", content);
      return updatedFormData;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Sử dụng UploadService để tải ảnh lên server
      const { UploadService } = await import("@/services/uploadService");
      const response = await UploadService.uploadImage(file);

      if (response.success && response.data?.url) {
        setFormData((prev) => {
          console.log("Updating image URL. Previous state:", prev);
          // Đảm bảo tất cả các trường khác được giữ nguyên
          const updatedState = {
            ...prev,
            featuredImage: response.data!.url,
          };
          console.log("State after image upload:", updatedState);
          return updatedState;
        });
        console.log("Uploaded image successfully:", response.data.url);
      } else {
        console.error("Upload failed:", response);
        alert("Lỗi khi tải ảnh lên");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status?: "pending" | "published" | "rejected"
  ) => {
    e.preventDefault();

    // Kiểm tra dữ liệu đầu vào
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    // Kiểm tra nếu nội dung có thực sự trống
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = formData.content;

    // Lấy text content (chỉ nội dung văn bản, không có HTML)
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Log chi tiết để debug
    console.log("HTML Content:", formData.content);
    console.log("Text Content:", textContent);
    console.log("Content Length:", formData.content.length);
    console.log("Text Length:", textContent.length);

    // Kiểm tra nếu nội dung chỉ chứa khoảng trắng hoặc những thẻ HTML trống
    if (
      !textContent.trim() &&
      (!formData.content ||
        formData.content === "<p></p>" ||
        formData.content === "<p><br></p>" ||
        formData.content === "<p><br/></p>")
    ) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }

    // Đảm bảo status mặc định là "pending" (chờ duyệt)
    const finalStatus = status || "pending";

    setSaving(true);
    try {
      console.log("Submitting form data:", formData);

      // Tạo một bản sao hoàn toàn mới của formData để tránh tham chiếu
      const formDataCopy = JSON.parse(JSON.stringify(formData));

      // Debug để xác nhận dữ liệu trước khi gửi
      console.log("Form data copy:", formDataCopy);
      console.log("Content length:", formDataCopy.content.length);

      // Loại bỏ các thẻ HTML không cần thiết nếu cần
      // Lưu ý: Chỉ thực hiện nếu bạn muốn làm sạch HTML trước khi gửi
      /* 
      const sanitizedContent = formDataCopy.content
        .replace(/(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>)+$/g, '') // Loại bỏ các đoạn trống ở cuối
        .trim();
      */

      const createData: CreateNewsData = {
        ...formDataCopy,
        status: finalStatus,
      };

      console.log("Final data to submit:", createData);
      const response = await newsService.createNews(createData);

      if (response.success) {
        const message =
          finalStatus === "pending"
            ? "Đã tạo tin tức thành công! Tin tức của bạn sẽ được kiểm duyệt trước khi xuất bản."
            : "Đã xuất bản tin tức thành công!";
        alert(message);
        router.push("/admin/quan-ly-tin-tuc");
      } else {
        alert(response.message || "Có lỗi xảy ra khi tạo tin tức");
      }
    } catch (error) {
      console.error("Error creating news:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi không xác định xảy ra";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  console.log("Current form state:", formData);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 mb-4 text-blue-600 hover:underline"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Quay lại
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo tin tức mới
              </h1>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề tin tức"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh đại diện
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    {formData.featuredImage ? (
                      <div className="space-y-2">
                        <Image
                          src={formData.featuredImage}
                          alt="Preview"
                          width={300}
                          height={200}
                          className="max-h-48 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              featuredImage: "",
                            }))
                          }
                          className="text-red-600 text-sm hover:underline block"
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Tải ảnh lên</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo thả</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF tối đa 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <EditorWrapper
                      value={formData.content}
                      onChange={handleContentChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Chờ duyệt</option>
                      {user?.role === "admin" && (
                        <>
                          <option value="published">Đã xuất bản</option>
                          <option value="rejected">Đã hạ</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isHot"
                        checked={formData.isHot}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Tin nóng
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Tin nổi bật
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "pending")}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Đang đăng tin..." : "Đăng tin"}
                  </button>

                  {user?.role === "admin" && (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, "published")}
                      disabled={saving}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? "Đang xuất bản..." : "Xuất bản ngay"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => router.push("/admin/quan-ly-tin-tuc")}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
